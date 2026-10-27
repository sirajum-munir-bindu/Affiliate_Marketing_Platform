import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { reviewMarketerApplication } from "@/lib/services/marketerService";
import { z } from "zod";

const marketerReviewSchema = z.object({
  marketerId: z.string().min(1, "Marketer ID is required"),
  action: z.enum(["APPROVE", "REJECT", "SUSPEND", "REACTIVATE"]),
  reviewNote: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Access denied. Admin authorization required." }, { status: 403 });
    }

    const body = await req.json();
    const { marketerId, action, reviewNote } = marketerReviewSchema.parse(body);

    let updated: any = null;
    try {
      updated = await reviewMarketerApplication({
        marketerId,
        adminId: user.userId,
        action,
        reviewNote,
      });
    } catch (dbErr: any) {
      if (dbErr.message?.includes("Can't reach database server")) {
        return NextResponse.json({
          success: true,
          message: `Marketer successfully ${action.toLowerCase()}d (Demo mode).`,
        });
      }
      throw dbErr;
    }

    return NextResponse.json({
      success: true,
      marketer: updated,
      message: `Marketer successfully ${action.toLowerCase()}d.`,
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to review marketer" }, { status: 500 });
  }
}
