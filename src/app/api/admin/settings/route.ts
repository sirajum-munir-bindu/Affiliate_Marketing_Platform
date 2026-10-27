import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserRole, PaymentMethod } from "@prisma/client";
import { getPlatformSettings, updatePlatformSettings } from "@/lib/services/settingsService";
import { z } from "zod";

const settingsSchema = z.object({
  organizationName: z.string().optional(),
  supportEmail: z.string().email().optional(),
  contactPhone: z.string().optional(),
  bkashNumber: z.string().min(11, "bKash number must be at least 11 digits").optional(),
  bkashType: z.nativeEnum(PaymentMethod).optional(),
  bkashInstructions: z.string().optional(),
  defaultAttributionDays: z.number().int().min(1).max(365).optional(),
  minimumPayoutAmount: z.number().positive().optional(),
});

export async function GET() {
  const settings = await getPlatformSettings();
  return NextResponse.json({ settings });
}

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Access denied. Admin authorization required." }, { status: 403 });
    }

    const body = await req.json();
    const validated = settingsSchema.parse(body);

    const updated = await updatePlatformSettings(validated, user.userId);

    return NextResponse.json({
      success: true,
      settings: updated,
      message: "Platform settings updated successfully.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to update settings" }, { status: 500 });
  }
}
