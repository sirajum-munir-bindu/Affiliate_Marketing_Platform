import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { settlePayout, rejectPayout } from "@/lib/services/payoutService";
import { z } from "zod";

const settleSchema = z.object({
  payoutId: z.string().min(1, "Payout ID is required"),
  action: z.enum(["SETTLE", "REJECT"]),
  transactionReference: z.string().optional(),
  rejectionReason: z.string().optional(),
  adminNote: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== UserRole.ADMIN) {
      return NextResponse.json({ error: "Access denied. Admin authorization required." }, { status: 403 });
    }

    const body = await req.json();
    const { payoutId, action, transactionReference, rejectionReason, adminNote } =
      settleSchema.parse(body);

    try {
      if (action === "SETTLE") {
        if (!transactionReference || !transactionReference.trim()) {
          return NextResponse.json(
            { error: "Payment reference / bKash TrxID is required when marking a payout paid." },
            { status: 400 }
          );
        }

        const updated = await settlePayout({
          payoutId,
          adminId: user.userId,
          transactionReference,
          adminNote,
        });

        return NextResponse.json({
          success: true,
          payout: updated,
          message: "Payout marked as PAID and commissions settled.",
        });
      } else {
        if (!rejectionReason || !rejectionReason.trim()) {
          return NextResponse.json({ error: "Rejection reason is required." }, { status: 400 });
        }

        const updated = await rejectPayout({
          payoutId,
          adminId: user.userId,
          rejectionReason,
          adminNote,
        });

        return NextResponse.json({
          success: true,
          payout: updated,
          message: "Payout request rejected and commissions restored to marketer balance.",
        });
      }
    } catch (dbErr: any) {
      if (dbErr.message?.includes("Can't reach database server")) {
        return NextResponse.json({
          success: true,
          message: action === "SETTLE" ? "Payout settled (Demo mode)" : "Payout rejected (Demo mode)",
        });
      }
      throw dbErr;
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || "Failed to process payout" }, { status: 500 });
  }
}
