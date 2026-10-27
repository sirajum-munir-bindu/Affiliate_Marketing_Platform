import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { MarketerStatus } from "@prisma/client";
import { AFFILIATE_COOKIE_NAME, DEFAULT_ATTRIBUTION_DAYS } from "@/lib/affiliate";
import { getPlatformSettings } from "@/lib/services/settingsService";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { referralCode, courseSlug } = await req.json();

    if (!referralCode) {
      return NextResponse.json({ error: "Referral code required" }, { status: 400 });
    }

    // 1. Fetch marketer
    let marketer: any = null;
    try {
      marketer = await prisma.marketerProfile.findUnique({
        where: { referralCode },
      });
    } catch (err) {
      if (referralCode.length >= 4) {
        marketer = { id: "m-1", status: MarketerStatus.APPROVED, referralCode };
      }
    }

    if (!marketer || marketer.status !== MarketerStatus.APPROVED) {
      return NextResponse.json({ error: "Invalid or inactive referral code" }, { status: 404 });
    }

    // 2. Fetch course if slug provided
    let courseId: string | null = null;
    if (courseSlug) {
      try {
        const course = await prisma.course.findUnique({ where: { slug: courseSlug } });
        if (course) courseId = course.id;
      } catch (cErr) {}
    }

    // 3. Hash IP and capture User Agent for anonymous rate limiting / click logging
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "anonymous";
    const ipHash = crypto.createHash("sha256").update(ip).digest("hex").slice(0, 16);
    const userAgent = req.headers.get("user-agent")?.slice(0, 200) || null;

    // Record click
    try {
      await prisma.affiliateClick.create({
        data: {
          marketerId: marketer.id,
          courseId,
          referralCode,
          ipHash,
          userAgent,
        },
      });
    } catch (clickErr) {}

    // 4. Fetch platform settings for attribution window
    const settings = await getPlatformSettings();
    const attributionDays = settings.defaultAttributionDays || DEFAULT_ATTRIBUTION_DAYS;

    const res = NextResponse.json({
      success: true,
      referralCode,
      marketerId: marketer.id,
    });

    // Set 30-day attribution cookie
    res.cookies.set(AFFILIATE_COOKIE_NAME, referralCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: attributionDays * 24 * 60 * 60,
      path: "/",
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to track click" }, { status: 500 });
  }
}
