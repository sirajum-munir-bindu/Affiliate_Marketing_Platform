import prisma from "@/lib/prisma";
import { PayoutSettlementTable } from "./PayoutSettlementTable";
import { PayoutStatus, Prisma } from "@prisma/client";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface AdminPayoutsPageProps {
  searchParams: {
    status?: string;
  };
}

const DEMO_PAYOUTS = [
  {
    id: "payout-demo-1",
    payoutNumber: "PAY-20261026-M8K2",
    marketerId: "m-1",
    requestedAmount: new Prisma.Decimal(2500.0),
    settledAmount: null,
    paymentMethod: "BKASH_SEND_MONEY" as const,
    recipientPhone: "01711998877",
    status: "REQUESTED" as const,
    transactionReference: null,
    reviewedById: null,
    reviewedAt: null,
    rejectionReason: null,
    adminNote: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    marketer: {
      id: "m-1",
      referralCode: "MKTR2026",
      user: {
        id: "u-m1",
        name: "Demo Marketer",
        email: "marketer@platform.com",
      },
    },
  },
];

export default async function AdminPayoutsPage({ searchParams }: AdminPayoutsPageProps) {
  const currentStatus = searchParams.status || "REQUESTED";

  const where: any = {};
  if (currentStatus !== "ALL") {
    where.status = currentStatus as PayoutStatus;
  }

  let payouts: any[] = [];
  try {
    payouts = await prisma.payout.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: {
        marketer: {
          include: { user: true },
        },
      },
    });
  } catch (err) {
    payouts = currentStatus === "ALL" || currentStatus === "REQUESTED" ? DEMO_PAYOUTS : [];
  }

  const statuses = [
    { label: "Pending Requests", value: "REQUESTED" },
    { label: "Paid Out", value: "PAID" },
    { label: "Rejected", value: "REJECTED" },
    { label: "All Payouts", value: "ALL" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
          Disbursement Management
        </span>
        <h1 className="text-2xl font-black text-[#172033] mt-1">Marketer Commission Payouts</h1>
        <p className="text-xs text-[#64748B] mt-0.5">
          Review withdrawal requests from approved affiliates and record manual bKash settlement references.
        </p>
      </div>

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-2">
        {statuses.map((s) => {
          const isActive = currentStatus === s.value;
          return (
            <Link
              key={s.value}
              href={`/admin/payouts?status=${s.value}`}
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

      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        {payouts.length === 0 ? (
          <div className="text-center py-12 text-xs text-[#64748B] border border-dashed rounded-xl">
            No payouts found.
          </div>
        ) : (
          <PayoutSettlementTable payouts={payouts as any} />
        )}
      </div>
    </div>
  );
}
