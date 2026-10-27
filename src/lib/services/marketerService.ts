import prisma from "@/lib/prisma";
import { MarketerStatus, PaymentMethod, UserRole } from "@prisma/client";
import { generateReferralCode } from "@/lib/affiliate";

export interface ApplyMarketerInput {
  userId: string;
  phone: string;
  socialLinks?: string;
  applicationReason: string;
  payoutBkashNumber?: string;
  payoutMethod?: PaymentMethod;
}

export async function applyMarketer(input: ApplyMarketerInput) {
  // Check if profile already exists
  const existing = await prisma.marketerProfile.findUnique({
    where: { userId: input.userId },
  });

  if (existing) {
    if (existing.status === MarketerStatus.REJECTED) {
      // Allow re-applying if previously rejected
      return prisma.marketerProfile.update({
        where: { id: existing.id },
        data: {
          phone: input.phone,
          socialLinks: input.socialLinks,
          applicationReason: input.applicationReason,
          status: MarketerStatus.PENDING,
          reviewNote: null,
          reviewedAt: null,
          reviewedById: null,
          payoutBkashNumber: input.payoutBkashNumber || input.phone,
        },
      });
    }
    throw new Error("You already have an active or pending marketer application.");
  }

  // Create unique referral code
  let referralCode = generateReferralCode();
  let codeExists = await prisma.marketerProfile.findUnique({ where: { referralCode } });
  while (codeExists) {
    referralCode = generateReferralCode();
    codeExists = await prisma.marketerProfile.findUnique({ where: { referralCode } });
  }

  return prisma.marketerProfile.create({
    data: {
      userId: input.userId,
      referralCode,
      phone: input.phone,
      socialLinks: input.socialLinks,
      applicationReason: input.applicationReason,
      status: MarketerStatus.PENDING,
      payoutBkashNumber: input.payoutBkashNumber || input.phone,
      payoutMethod: input.payoutMethod || PaymentMethod.BKASH_SEND_MONEY,
    },
  });
}

export async function reviewMarketerApplication(params: {
  marketerId: string;
  adminId: string;
  action: "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE";
  reviewNote?: string;
}) {
  const { marketerId, adminId, action, reviewNote } = params;

  const marketer = await prisma.marketerProfile.findUnique({
    where: { id: marketerId },
    include: { user: true },
  });

  if (!marketer) {
    throw new Error("Marketer profile not found");
  }

  let newStatus: MarketerStatus;
  switch (action) {
    case "APPROVE":
      newStatus = MarketerStatus.APPROVED;
      break;
    case "REJECT":
      newStatus = MarketerStatus.REJECTED;
      break;
    case "SUSPEND":
      newStatus = MarketerStatus.SUSPENDED;
      break;
    case "REACTIVATE":
      newStatus = MarketerStatus.APPROVED;
      break;
  }

  return prisma.$transaction(async (tx) => {
    const updated = await tx.marketerProfile.update({
      where: { id: marketerId },
      data: {
        status: newStatus,
        reviewedById: adminId,
        reviewedAt: new Date(),
        reviewNote: reviewNote || null,
      },
    });

    // If approved or reactivated, update user role to MARKETER if not admin
    if (newStatus === MarketerStatus.APPROVED && marketer.user.role !== UserRole.ADMIN) {
      await tx.user.update({
        where: { id: marketer.userId },
        data: { role: UserRole.MARKETER },
      });
    }

    // Write audit log
    await tx.auditLog.create({
      data: {
        actorId: adminId,
        action: `MARKETER_${action}`,
        entityType: "MARKETER_PROFILE",
        entityId: marketerId,
        details: JSON.stringify({
          previousStatus: marketer.status,
          newStatus,
          reviewNote,
          marketerEmail: marketer.user.email,
        }),
      },
    });

    return updated;
  });
}

export async function getMarketerByUserId(userId: string) {
  return prisma.marketerProfile.findUnique({
    where: { userId },
    include: { user: true },
  });
}

export async function getAllMarketersAdmin() {
  return prisma.marketerProfile.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          role: true,
        },
      },
      _count: {
        select: {
          affiliateClicks: true,
          attributedOrders: true,
          commissions: true,
          payouts: true,
        },
      },
    },
  });
}
