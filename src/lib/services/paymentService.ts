import prisma from "@/lib/prisma";
import { OrderStatus, PaymentMethod, PaymentStatus, Prisma } from "@prisma/client";
import { normalizeBdPhoneNumber, normalizeTransactionId, isValidTransactionId, isValidBdPhoneNumber } from "@/lib/bkash";

export interface SubmitPaymentInput {
  orderId: string;
  customerId: string;
  senderNumber: string;
  transactionId: string;
  paymentMethod?: PaymentMethod;
  amount: number;
  note?: string;
}

export async function submitPayment(input: SubmitPaymentInput) {
  const { orderId, customerId, note } = input;
  const paymentMethod = input.paymentMethod || PaymentMethod.BKASH_SEND_MONEY;

  // 1. Normalize and validate Transaction ID
  const normalizedTrxId = normalizeTransactionId(input.transactionId);
  if (!isValidTransactionId(normalizedTrxId)) {
    throw new Error("Invalid bKash Transaction ID. Must be 8-15 alphanumeric characters.");
  }

  // 2. Normalize and validate Sender Phone Number
  const normalizedSenderPhone = normalizeBdPhoneNumber(input.senderNumber);
  if (!isValidBdPhoneNumber(normalizedSenderPhone)) {
    throw new Error("Invalid Bangladeshi sender bKash phone number (e.g. 01712345678).");
  }

  // 3. Fetch and verify Order ownership and eligibility
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { course: true },
  });

  if (!order) {
    throw new Error("Order not found.");
  }

  if (order.customerId !== customerId) {
    throw new Error("Unauthorized: Order does not belong to your account.");
  }

  if (order.status === OrderStatus.PAID) {
    throw new Error("This order has already been verified and paid.");
  }

  if (order.status === OrderStatus.CANCELLED) {
    throw new Error("This order has been cancelled.");
  }

  // 4. Validate Amount
  const orderAmount = Number(order.amount);
  if (Math.abs(Number(input.amount) - orderAmount) > 0.01) {
    throw new Error(`Submitted amount (${input.amount} BDT) does not match order fee (${orderAmount} BDT).`);
  }

  // 5. Check if Transaction ID has already been used (Global uniqueness check)
  const existingTx = await prisma.payment.findUnique({
    where: { transactionId: normalizedTrxId },
  });

  if (existingTx) {
    throw new Error("This bKash Transaction ID has already been submitted or processed.");
  }

  // 6. Submit Payment and update Order in a Transaction
  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.create({
      data: {
        orderId,
        paymentMethod,
        senderNumber: normalizedSenderPhone,
        transactionId: normalizedTrxId,
        amount: new Prisma.Decimal(input.amount),
        note: note ? note.trim() : null,
        status: PaymentStatus.SUBMITTED,
      },
    });

    await tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.PAYMENT_REVIEW,
      },
    });

    return payment;
  });
}

export async function getPaymentsForAdmin(options?: {
  status?: PaymentStatus;
  search?: string;
  take?: number;
  skip?: number;
}) {
  const where: Prisma.PaymentWhereInput = {};

  if (options?.status) {
    where.status = options.status;
  }

  if (options?.search) {
    where.OR = [
      { transactionId: { contains: options.search.toUpperCase() } },
      { senderNumber: { contains: options.search } },
      { order: { orderNumber: { contains: options.search } } },
    ];
  }

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: options?.take || 20,
      skip: options?.skip || 0,
      include: {
        order: {
          include: {
            customer: {
              select: {
                id: true,
                name: true,
                email: true,
                phone: true,
              },
            },
            course: {
              select: {
                id: true,
                title: true,
                price: true,
                commissionRate: true,
              },
            },
            affiliate: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
        reviewedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return { payments, total };
}
