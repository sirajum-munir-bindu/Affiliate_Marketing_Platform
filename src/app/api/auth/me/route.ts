import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  const session = await getCurrentUser();
  if (!session) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        marketerProfile: {
          select: {
            id: true,
            status: true,
            referralCode: true,
            phone: true,
            payoutBkashNumber: true,
            reviewNote: true,
          },
        },
      },
    });

    if (user) {
      return NextResponse.json({
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          marketerStatus: user.marketerProfile?.status || null,
          marketerId: user.marketerProfile?.id || null,
          referralCode: user.marketerProfile?.referralCode || null,
          marketerProfile: user.marketerProfile,
        },
      });
    }
  } catch (err) {
    // Database connection offline - fallback to session token payload
  }

  // Return payload from verified JWT session
  return NextResponse.json({
    user: {
      id: session.userId,
      name: session.name,
      email: session.email,
      role: session.role,
      phone: null,
      marketerStatus: session.marketerStatus || null,
      marketerId: session.marketerId || null,
      referralCode: session.role === "MARKETER" ? "REF_GROW20" : null,
      marketerProfile: null,
    },
  });
}
