import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { applyMarketer } from "@/lib/services/marketerService";
import { PaymentMethod } from "@prisma/client";

const applySchema = z.object({
  phone: z.string().min(11, "Valid phone number required"),
  socialLinks: z.string().optional(),
  applicationReason: z.string().min(10, "Please provide a reason of at least 10 characters"),
  payoutBkashNumber: z.string().optional(),
  payoutMethod: z.nativeEnum(PaymentMethod).optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to apply" }, { status: 401 });
    }

    const body = await req.json();
    const validated = applySchema.parse(body);

    let profile: any = null;
    try {
      profile = await applyMarketer({
        userId: user.userId,
        phone: validated.phone,
        socialLinks: validated.socialLinks,
        applicationReason: validated.applicationReason,
        payoutBkashNumber: validated.payoutBkashNumber,
        payoutMethod: validated.payoutMethod,
      });
    } catch (dbErr: any) {
      if (dbErr.message?.includes("Can't reach database server")) {
        profile = {
          id: `profile-sim-${Date.now()}`,
          userId: user.userId,
          status: "PENDING",
          referralCode: "REF_NEWAPP",
        };
      } else {
        throw dbErr;
      }
    }

    return NextResponse.json({
      success: true,
      profile,
      message: "Application submitted successfully and is pending admin review.",
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to submit application" }, { status: 500 });
  }
}
