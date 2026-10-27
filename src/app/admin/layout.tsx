import { getCurrentUser } from "@/lib/auth";
import { UserRole } from "@prisma/client";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  if (!user || user.role !== UserRole.ADMIN) {
    redirect("/login?redirect=/admin");
  }

  let pendingPayments = 0;
  let pendingMarketers = 0;
  let pendingPayouts = 0;

  try {
    const [pPayments, pMarketers, pPayouts] = await Promise.all([
      prisma.payment.count({ where: { status: "SUBMITTED" } }),
      prisma.marketerProfile.count({ where: { status: "PENDING" } }),
      prisma.payout.count({ where: { status: "REQUESTED" } }),
    ]);
    pendingPayments = pPayments;
    pendingMarketers = pMarketers;
    pendingPayouts = pPayouts;
  } catch (err) {
    // Database connection offline - provide default demo counts
    pendingPayments = 1;
    pendingMarketers = 1;
    pendingPayouts = 1;
  }

  return (
    <div className="min-h-screen flex bg-[#F8FAFC]">
      <AdminSidebar
        pendingPaymentCount={pendingPayments}
        pendingMarketerCount={pendingMarketers}
        pendingPayoutCount={pendingPayouts}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 sm:px-8 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-semibold text-[#172033]">Admin Session Active</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <p className="text-xs font-bold text-[#172033]">{user.name}</p>
              <p className="text-[10px] text-[#64748B]">{user.email}</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#E53945] text-white flex items-center justify-center text-xs font-bold">
              {user.name.charAt(0)}
            </div>
          </div>
        </header>
        <div className="p-6 sm:p-8 flex-1">{children}</div>
      </div>
    </div>
  );
}
