import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createOrder } from "@/lib/services/orderService";
import { AFFILIATE_COOKIE_NAME } from "@/lib/affiliate";

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to purchase this course." }, { status: 401 });
    }

    const body = await req.json();
    const { courseId } = body;

    if (!courseId) {
      return NextResponse.json({ error: "Course ID is required." }, { status: 400 });
    }

    // Retrieve affiliate referral from cookie (secure server-side attribution)
    const cookieReferral = req.cookies.get(AFFILIATE_COOKIE_NAME)?.value || body.referralCode || null;

    const order = await createOrder({
      customerId: user.userId,
      courseId,
      referralCode: cookieReferral,
    });

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 400 });
  }
}
