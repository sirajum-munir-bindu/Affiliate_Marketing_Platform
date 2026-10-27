import prisma from "@/lib/prisma";
import { CommissionStatus, PayoutStatus, PaymentMethod, Prisma } from "@prisma/client";
import { nanoid } from "nanoid";
import { getPlatformSettings } from "./settingsService";

export interface RequestPayoutInput {
  marketerId: string;
  requestedAmount: number;
  recipientPhone: string;
  paymentMethod?: PaymentMethod;
}

export async function getMarketerFinancialSummary(marketerId: string) {
  const commissions = await prisma.commission.findMany({
    where: { marketerId },
  });

  let totalPending = 0;
  let totalApproved = 0;
  let totalPaid = 0;
  let totalAvailableForPayout = 0;

  for (const c of commissions) {
    const amount = Number(c.commissionAmount);
    if (c.status === CommissionStatus.PENDING) {
      totalPending += amount;
    } else if (c.status === CommissionStatus.APPROVED) {
      totalApproved += amount;
      if (!c.payoutId) {
        // Available for withdrawal
        totalAvailableForPayout += amount;
      }
    } else if (c.status === CommissionStatus.PAID) {
      totalPaid += amount;
    }
  }

  return {
    totalPending,
    totalApproved,
    totalPaid,
    totalAvailableForPayout: Math.round(totalAvailableForPayout * 100) / 100,
  };
}

export async function requestPayout(input: RequestPayoutInput) {
  const { marketerId, requestedAmount, recipientPhone } = input;
  const paymentMethod = input.paymentMethod || PaymentMethod.BKASH_SEND_MONEY;

  // 1. Fetch platform settings for minimum payout threshold
  const settings = await getPlatformSettings();
  const minPayout = Number(settings.minimumPayoutAmount);

  if (requestedAmount < minPayout) {
    throw new Error(`Minimum payout request amount is ৳${minPayout}.`);
  }

  // 2. Fetch available unreserved approved commissions
  const availableCommissions = await prisma.commission.findMany({
    where: {
      marketerId,
      status: CommissionStatus.APPROVED,
      payoutId: null,
    },
    orderBy: { createdAt: "asc" },
  });

  const availableTotal = availableCommissions.reduce(
    (sum, c) => sum + Number(c.commissionAmount),
    0
  );

  if (requestedAmount > availableTotal) {
    throw new Error(
      `Requested amount (৳${requestedAmount}) exceeds your available balance (৳${availableTotal.toFixed(2)}).`
    );
  }

  // 3. Atomically reserve commissions and create payout request
  return prisma.$transaction(async (tx) => {
    const payoutNumber = `PAY-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${nanoid(6).toUpperCase()}`;

    const payout = await tx.payout.create({
      data: {
        payoutNumber,
        marketerId,
        requestedAmount: new Prisma.Decimal(requestedAmount),
        paymentMethod,
        recipientPhone: recipientPhone.trim(),
        status: PayoutStatus.REQUESTED,
      },
    });

    // Select enough commissions to cover the requested amount
    let accumulated = 0;
    const commissionsToReserve: string[] = [];

    for (const c of availableCommissions) {
      if (accumulated < requestedAmount) {
        commissionsToReserve.push(c.id);
        accumulated += Number(c.commissionAmount);
      } else {
        break;
      }
    }

    if (commissionsToReserve.length > 0) {
      await tx.commission.updateMany({
        where: { id: { in: commissionsToReserve } },
        data: { payoutId: payout.id },
      });
    }

    // Write Audit Log
    await tx.auditLog.create({
      data: {
        action: "PAYOUT_REQUESTED",
        entityType: "PAYOUT",
        entityId: payout.id,
        details: JSON.stringify({
          marketerId,
          payoutNumber,
          requestedAmount,
          reservedCommissionCount: commissionsToReserve.length,
        }),
      },
    });

    return payout;
  });
}

export async function settlePayout(params: {
  payoutId: string;
  adminId: string;
  transactionReference: string;
  adminNote?: string;
}) {
  const { payoutId, adminId, transactionReference, adminNote } = params;

  if (!transactionReference || !transactionReference.trim()) {
    throw new Error("A payment reference or bKash TrxID is required to settle a payout.");
  }

  return prisma.$transaction(async (tx) => {
    const payout = await tx.payout.findUnique({
      where: { id: payoutId },
      include: { items: true },
    });

    if (!payout) {
      throw new Error("Payout record not found");
    }

    if (payout.status === PayoutStatus.PAID) {
      throw new Error("This payout is already marked as paid.");
    }

    // Update payout status
    const updated = await tx.payout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.PAID,
        settledAmount: payout.requestedAmount,
        transactionReference: transactionReference.trim(),
        reviewedById: adminId,
        reviewedAt: new Date(),
        adminNote: adminNote ? adminNote.trim() : null,
      },
    });

    // Mark all linked commissions as PAID
    await tx.commission.updateMany({
      where: { payoutId: payout.id },
      data: {
        status: CommissionStatus.PAID,
      },
    });

    // Write Audit Log
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "PAYOUT_SETTLED",
        entityType: "PAYOUT",
        entityId: payout.id,
        details: JSON.stringify({
          payoutNumber: payout.payoutNumber,
          settledAmount: Number(payout.requestedAmount),
          transactionReference,
        }),
      },
    });

    return updated;
  });
}

export async function rejectPayout(params: {
  payoutId: string;
  adminId: string;
  rejectionReason: string;
  adminNote?: string;
}) {
  const { payoutId, adminId, rejectionReason, adminNote } = params;

  if (!rejectionReason || !rejectionReason.trim()) {
    throw new Error("Rejection reason is required.");
  }

  return prisma.$transaction(async (tx) => {
    const payout = await tx.payout.findUnique({
      where: { id: payoutId },
    });

    if (!payout) {
      throw new Error("Payout record not found");
    }

    if (payout.status === PayoutStatus.PAID) {
      throw new Error("Cannot reject an already settled payout.");
    }

    // Release linked commissions back to available status
    await tx.commission.updateMany({
      where: { payoutId: payout.id },
      data: {
        payoutId: null,
      },
    });

    const updated = await tx.payout.update({
      where: { id: payoutId },
      data: {
        status: PayoutStatus.REJECTED,
        rejectionReason: rejectionReason.trim(),
        reviewedById: adminId,
        reviewedAt: new Date(),
        adminNote: adminNote ? adminNote.trim() : null,
      },
    });

    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: "PAYOUT_REJECTED",
        entityType: "PAYOUT",
        entityId: payout.id,
        details: JSON.stringify({
          payoutNumber: payout.payoutNumber,
          rejectionReason,
        }),
      },
    });

    return updated;
  });
}
