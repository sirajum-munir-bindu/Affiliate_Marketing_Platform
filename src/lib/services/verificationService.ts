import prisma from "@/lib/prisma";
import { OrderStatus, PaymentStatus, CommissionStatus, MarketerStatus, Prisma } from "@prisma/client";
import { calculateCommissionAmount } from "@/lib/affiliate";

export interface ApprovePaymentParams {
  paymentId: string;
  adminId: string;
  internalNote?: string;
}

export interface RejectPaymentParams {
  paymentId: string;
  adminId: string;
  rejectionReason: string;
  internalNote?: string;
}

/**
 * Idempotent, Atomic Payment Approval with Enrollment and Affiliate Commission Snapshot
 */
export async function approvePaymentTransaction(params: ApprovePaymentParams) {
  const { paymentId, adminId, internalNote } = params;

  return prisma.$transaction(async (tx) => {
    // 1. Fetch payment with order, course, customer, and affiliate details
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: {
        order: {
          include: {
            course: true,
            customer: true,
            affiliate: true,
            enrollment: true,
            commission: true,
          },
        },
      },
    });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    // 2. Verify payment status is awaiting review
    if (payment.status === PaymentStatus.APPROVED) {
      // Already approved! Return existing state safely (idempotent)
      return { success: true, message: "Payment was already approved.", paymentId };
    }

    if (payment.status === PaymentStatus.REJECTED || payment.status === PaymentStatus.CANCELLED) {
      throw new Error(`Cannot approve a ${payment.status} payment.`);
    }

    const order = payment.order;
    if (!order) {
      throw new Error("Payment has no associated order");
    }

    // 3. Update Payment record
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.APPROVED,
        reviewedById: adminId,
        reviewedAt: new Date(),
        internalNote: internalNote || payment.internalNote,
      },
    });

    // 4. Update Order record
    await tx.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.PAID,
      },
    });

    // 5. Create or verify Enrollment (Idempotent: studentId_courseId unique constraint)
    let enrollment = await tx.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: order.customerId,
          courseId: order.courseId,
        },
      },
    });

    if (!enrollment) {
      enrollment = await tx.enrollment.create({
        data: {
          studentId: order.customerId,
          courseId: order.courseId,
          orderId: order.id,
          isActive: true,
          accessGrantedAt: new Date(),
        },
      });
    }

    // 6. Calculate and create Affiliate Commission if eligible
    let commissionCreated = null;

    if (order.affiliateId && order.affiliate) {
      // Check if marketer is still approved
      const isMarketerActive = order.affiliate.status === MarketerStatus.APPROVED;

      if (isMarketerActive) {
        // Check if commission already exists for this order (Idempotent: orderId is unique)
        const existingCommission = await tx.commission.findUnique({
          where: { orderId: order.id },
        });

        if (!existingCommission) {
          const basePriceNum = Number(order.amount);
          const rateNum = Number(order.course.commissionRate);
          const commissionAmountNum = calculateCommissionAmount(
            basePriceNum,
            rateNum,
            order.course.commissionType
          );

          commissionCreated = await tx.commission.create({
            data: {
              orderId: order.id,
              marketerId: order.affiliateId,
              courseId: order.courseId,
              basePrice: new Prisma.Decimal(basePriceNum),
              commissionRate: new Prisma.Decimal(rateNum),
              commissionAmount: new Prisma.Decimal(commissionAmountNum),
              status: CommissionStatus.APPROVED,
            },
          });
        } else {
          commissionCreated = existingCommission;
        }
      }
    }

    // 7. Write Audit Log
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "PAYMENT_APPROVED",
        entityType: "PAYMENT",
        entityId: paymentId,
        details: JSON.stringify({
          orderId: order.id,
          orderNumber: order.orderNumber,
          transactionId: payment.transactionId,
          amount: Number(payment.amount),
          customerId: order.customerId,
          courseId: order.courseId,
          affiliateId: order.affiliateId,
          commissionAmount: commissionCreated ? Number(commissionCreated.commissionAmount) : null,
          enrollmentId: enrollment.id,
          internalNote,
        }),
      },
    });

    return {
      success: true,
      payment: updatedPayment,
      enrollment,
      commission: commissionCreated,
    };
  });
}

/**
 * Reject Payment Submission with Reason & Audit Log
 */
export async function rejectPaymentTransaction(params: RejectPaymentParams) {
  const { paymentId, adminId, rejectionReason, internalNote } = params;

  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error("A rejection reason is required.");
  }

  return prisma.$transaction(async (tx) => {
    const payment = await tx.payment.findUnique({
      where: { id: paymentId },
      include: { order: true },
    });

    if (!payment) {
      throw new Error("Payment record not found");
    }

    if (payment.status === PaymentStatus.APPROVED) {
      throw new Error("Cannot reject a payment that has already been approved.");
    }

    // Update Payment
    const updatedPayment = await tx.payment.update({
      where: { id: paymentId },
      data: {
        status: PaymentStatus.REJECTED,
        reviewedById: adminId,
        reviewedAt: new Date(),
        rejectionReason: rejectionReason.trim(),
        internalNote: internalNote ? internalNote.trim() : null,
      },
    });

    // Reset Order status back to PENDING_PAYMENT so customer can resubmit or cancel
    if (payment.order) {
      await tx.order.update({
        where: { id: payment.order.id },
        data: {
          status: OrderStatus.PENDING_PAYMENT,
        },
      });
    }

    // Write Audit Log
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "PAYMENT_REJECTED",
        entityType: "PAYMENT",
        entityId: paymentId,
        details: JSON.stringify({
          orderId: payment.orderId,
          transactionId: payment.transactionId,
          rejectionReason: rejectionReason.trim(),
          internalNote,
        }),
      },
    });

    return {
      success: true,
      payment: updatedPayment,
    };
  });
}
