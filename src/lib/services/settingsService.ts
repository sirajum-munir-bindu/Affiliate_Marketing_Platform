import prisma from "@/lib/prisma";
import { PaymentMethod, Prisma } from "@prisma/client";

export interface UpdatePlatformSettingsInput {
  organizationName?: string;
  supportEmail?: string;
  contactPhone?: string;
  bkashNumber?: string;
  bkashType?: PaymentMethod;
  bkashInstructions?: string;
  defaultAttributionDays?: number;
  minimumPayoutAmount?: number;
}

const DEFAULT_SETTINGS = {
  id: "default",
  organizationName: "Skill.jobs Affiliation",
  supportEmail: "support@skill.jobs",
  contactPhone: "+880 1700-000000",
  bkashNumber: process.env.DEFAULT_BKASH_NUMBER || "01711223344",
  bkashType: (process.env.DEFAULT_BKASH_TYPE as PaymentMethod) || PaymentMethod.BKASH_MERCHANT,
  bkashInstructions:
    "1. Open your bKash App\n2. Select Make Payment (or Send Money as indicated)\n3. Enter the bKash Account Number shown above\n4. Enter the exact Course Fee\n5. Enter your Order ID as Reference\n6. Enter your PIN to confirm payment\n7. Copy the TrxID and submit it below.",
  defaultAttributionDays: 30,
  minimumPayoutAmount: new Prisma.Decimal(1000.0),
  updatedAt: new Date(),
};

export async function getPlatformSettings() {
  try {
    let settings = await prisma.platformSetting.findUnique({
      where: { id: "default" },
    });

    if (settings) return settings;

    // Create if missing
    settings = await prisma.platformSetting.create({
      data: DEFAULT_SETTINGS,
    });
    return settings;
  } catch (err) {
    // Database connection offline
    return DEFAULT_SETTINGS;
  }
}

export async function updatePlatformSettings(data: UpdatePlatformSettingsInput, adminId?: string) {
  try {
    const updateData: Prisma.PlatformSettingUpdateInput = {};
    if (data.organizationName !== undefined) updateData.organizationName = data.organizationName;
    if (data.supportEmail !== undefined) updateData.supportEmail = data.supportEmail;
    if (data.contactPhone !== undefined) updateData.contactPhone = data.contactPhone;
    if (data.bkashNumber !== undefined) updateData.bkashNumber = data.bkashNumber;
    if (data.bkashType !== undefined) updateData.bkashType = data.bkashType;
    if (data.bkashInstructions !== undefined) updateData.bkashInstructions = data.bkashInstructions;
    if (data.defaultAttributionDays !== undefined) updateData.defaultAttributionDays = data.defaultAttributionDays;
    if (data.minimumPayoutAmount !== undefined) {
      updateData.minimumPayoutAmount = new Prisma.Decimal(data.minimumPayoutAmount);
    }

    const updated = await prisma.platformSetting.upsert({
      where: { id: "default" },
      update: updateData,
      create: {
        id: "default",
        organizationName: data.organizationName || "Skill.jobs Affiliation",
        supportEmail: data.supportEmail || "support@skill.jobs",
        contactPhone: data.contactPhone || "+880 1700-000000",
        bkashNumber: data.bkashNumber || "01711223344",
        bkashType: data.bkashType || PaymentMethod.BKASH_MERCHANT,
        bkashInstructions: data.bkashInstructions || "1. Open bKash App...",
        defaultAttributionDays: data.defaultAttributionDays || 30,
        minimumPayoutAmount: new Prisma.Decimal(data.minimumPayoutAmount || 1000),
      },
    });

    if (adminId) {
      try {
        await prisma.auditLog.create({
          data: {
            actorId: adminId,
            action: "SETTINGS_UPDATED",
            entityType: "PLATFORM_SETTING",
            entityId: "default",
            details: JSON.stringify(data),
          },
        });
      } catch (logErr) {}
    }

    return updated;
  } catch (err) {
    return {
      ...DEFAULT_SETTINGS,
      ...data,
      minimumPayoutAmount: data.minimumPayoutAmount
        ? new Prisma.Decimal(data.minimumPayoutAmount)
        : DEFAULT_SETTINGS.minimumPayoutAmount,
    };
  }
}
