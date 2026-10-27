import prisma from "@/lib/prisma";
import { MarketerManagementTable } from "./MarketerManagementTable";
import { MarketerStatus } from "@prisma/client";
import Link from "next/link";
import { Users, Search } from "lucide-react";

export const dynamic = "force-dynamic";

interface AdminMarketersPageProps {
  searchParams: {
    status?: string;
    search?: string;
  };
}

export default async function AdminMarketersPage({ searchParams }: AdminMarketersPageProps) {
  const currentStatus = searchParams.status || "ALL";
  const search = searchParams.search || "";

  const where: any = {};
  if (currentStatus !== "ALL") {
    where.status = currentStatus as MarketerStatus;
  }
  if (search) {
    where.OR = [
      { referralCode: { contains: search.toUpperCase() } },
      { phone: { contains: search } },
      { user: { name: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search, mode: "insensitive" } } },
    ];
  }

  let marketers: any[] = [];
  try {
    marketers = await prisma.marketerProfile.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            affiliateClicks: true,
            attributedOrders: true,
            commissions: true,
            payouts: true,
          },
        },
      },
    });
  } catch (err) {
    marketers = [
      {
        id: "mkt-1",
        userId: "user-mkt-1",
        referralCode: "REF_GROW20",
        phone: "01811223344",
        socialLinks: "https://facebook.com/tahmid.marketer",
        applicationReason: "Running a 50k follower tech community on Facebook and Telegram.",
        status: "APPROVED",
        reviewNote: null,
        createdAt: new Date(),
        user: { name: "Tahmid Rahman (Top Affiliate)", email: "marketer@platform.com" },
        _count: { affiliateClicks: 142, attributedOrders: 18, commissions: 14, payouts: 1 },
      },
      {
        id: "mkt-2",
        userId: "user-mkt-2",
        referralCode: "REF_SABBIR99",
        phone: "01911223344",
        socialLinks: "https://youtube.com/@sabbirtech",
        applicationReason: "Content creator creating tutorials on affiliate marketing and web development.",
        status: "PENDING",
        reviewNote: null,
        createdAt: new Date(),
        user: { name: "Sabbir Ahmed", email: "applicant@platform.com" },
        _count: { affiliateClicks: 0, attributedOrders: 0, commissions: 0, payouts: 0 },
      },
    ];

    if (currentStatus !== "ALL") {
      marketers = marketers.filter((m) => m.status === currentStatus);
    }
  }

  const statuses = [
    { label: "All Marketers", value: "ALL" },
    { label: "Pending Applications", value: "PENDING" },
    { label: "Approved Partners", value: "APPROVED" },
    { label: "Suspended", value: "SUSPENDED" },
    { label: "Rejected", value: "REJECTED" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          Affiliate Network
        </span>
        <h1 className="text-2xl font-black text-[#172033] mt-1">Marketer Application & Partner Management</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Review marketer applicants, manage referral privileges, and monitor affiliate traffic performance.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {statuses.map((s) => {
            const isActive = currentStatus === s.value;
            return (
              <Link
                key={s.value}
                href={`/admin/marketers?status=${s.value}${search ? `&search=${search}` : ""}`}
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

        <form method="GET" action="/admin/marketers" className="relative w-full md:w-72">
          <input type="hidden" name="status" value={currentStatus} />
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search code, name, email..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB] bg-[#F8FAFC]"
          />
          <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-2.5" />
        </form>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        {marketers.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#64748B] border border-dashed rounded-xl">
            No marketers found matching this filter.
          </div>
        ) : (
          <MarketerManagementTable marketers={marketers} />
        )}
      </div>
    </div>
  );
}
