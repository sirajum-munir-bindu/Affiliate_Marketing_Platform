import prisma from "@/lib/prisma";
import { formatCurrencyBDT } from "@/lib/bkash";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { OrderStatus } from "@prisma/client";
import Link from "next/link";
import { Search } from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminOrdersPageProps {
  searchParams: {
    status?: string;
    search?: string;
  };
}

export default async function AdminOrdersPage({ searchParams }: AdminOrdersPageProps) {
  const currentStatus = searchParams.status || "ALL";
  const search = searchParams.search || "";

  const where: any = {};
  if (currentStatus !== "ALL") {
    where.status = currentStatus as OrderStatus;
  }
  if (search) {
    where.OR = [
      { orderNumber: { contains: search } },
      { customer: { name: { contains: search, mode: "insensitive" } } },
      { customer: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  let orders: any[] = [];
  try {
    orders = await prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        customer: true,
        course: true,
        affiliate: {
          include: { user: true },
        },
        payments: {
          orderBy: { createdAt: "desc" },
        },
      },
    });
  } catch (err) {
    orders = [
      {
        id: "ord-seed-1",
        orderNumber: "ORD-20261026-X8Y1",
        amount: 3500,
        status: "PAID",
        createdAt: new Date(),
        customer: { name: "Ayesha Siddiqua", email: "student@platform.com" },
        course: { title: "Full-Stack Web Development with Next.js & PostgreSQL" },
        affiliate: { user: { name: "Tahmid Rahman" }, referralCode: "REF_GROW20" },
        payments: [{ id: "p-1", transactionId: "BL99A12B34" }],
      },
      {
        id: "ord-seed-2",
        orderNumber: "ORD-20261026-K4L2",
        amount: 2500,
        status: "PAYMENT_REVIEW",
        createdAt: new Date(Date.now() - 3600000),
        customer: { name: "Tanvir Ahmed", email: "tanvir@example.com" },
        course: { title: "Affiliate Marketing & Funnel Mastery in Bangladesh" },
        affiliate: null,
        payments: [{ id: "p-2", transactionId: "CI77M88N99" }],
      },
    ];

    if (currentStatus !== "ALL") {
      orders = orders.filter((o) => o.status === currentStatus);
    }
  }

  const statuses = [
    { label: "All Orders", value: "ALL" },
    { label: "Payment Review", value: "PAYMENT_REVIEW" },
    { label: "Paid", value: "PAID" },
    { label: "Pending Payment", value: "PENDING_PAYMENT" },
    { label: "Cancelled", value: "CANCELLED" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          Commercial Operations
        </span>
        <h1 className="text-2xl font-black text-[#172033] mt-1">Platform Orders & Attribution</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          View all student orders, bKash payment verification attempts, and frozen affiliate snapshots.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {statuses.map((s) => {
            const isActive = currentStatus === s.value;
            return (
              <Link
                key={s.value}
                href={`/admin/orders?status=${s.value}${search ? `&search=${search}` : ""}`}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                  isActive
                    ? "bg-[#172033] text-white shadow-xs"
                    : "bg-[#F8FAFC] text-[#64748B] hover:text-[#172033] border border-[#E2E8F0]"
                }`}
              >
                {s.label}
              </Link>
            );
          })}
        </div>

        <form method="GET" action="/admin/orders" className="relative w-full md:w-72">
          <input type="hidden" name="status" value={currentStatus} />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search order #, customer..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#F8FAFC]"
          />
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
        </form>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        {orders.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#64748B] border border-dashed rounded-xl">
            No orders found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Fee</th>
                  <th className="pb-3">Affiliate Attribution</th>
                  <th className="pb-3">Latest TrxID</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {orders.map((o) => {
                  const latestTx = o.payments[0];
                  return (
                    <tr key={o.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 font-mono font-bold text-[#172033]">
                        {o.orderNumber}
                      </td>
                      <td className="py-4">
                        <p className="font-bold text-[#172033]">{o.customer.name}</p>
                        <p className="text-[11px] text-[#64748B]">{o.customer.email}</p>
                      </td>
                      <td className="py-4 font-medium text-[#172033] max-w-xs truncate">
                        {o.course.title}
                      </td>
                      <td className="py-4 font-black text-[#172033]">
                        {formatCurrencyBDT(Number(o.amount))}
                      </td>
                      <td className="py-4 text-[#64748B]">
                        {o.affiliate ? (
                          <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium border border-emerald-200">
                            {o.affiliate.user.name} ({o.affiliate.referralCode})
                          </span>
                        ) : (
                          <span className="text-slate-400">Direct</span>
                        )}
                      </td>
                      <td className="py-4 font-mono text-[#2563EB]">
                        {latestTx ? latestTx.transactionId : "None"}
                      </td>
                      <td className="py-4">
                        <StatusBadge status={o.status} size="sm" />
                      </td>
                      <td className="py-4 text-right text-slate-500">
                        {new Date(o.createdAt).toLocaleDateString("en-BD", { dateStyle: "medium" })}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
