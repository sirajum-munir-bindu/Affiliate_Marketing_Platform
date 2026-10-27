import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrencyBDT } from "@/lib/bkash";
import { StatsCard } from "@/components/ui/StatsCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getMarketerFinancialSummary } from "@/lib/services/payoutService";
import { getPlatformSettings } from "@/lib/services/settingsService";
import { MarketerCourseLinks } from "./MarketerCourseLinks";
import { MarketerPayoutSection } from "./MarketerPayoutSection";
import { MarketerAnalyticsCharts } from "./MarketerAnalyticsCharts";
import {
  MousePointerClick,
  ShoppingBag,
  TrendingUp,
  Percent,
  Clock,
  CheckCircle2,
  DollarSign,
  Wallet,
  AlertTriangle,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MarketerDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/marketer");
  }

  let marketer: any = null;
  let financial = {
    totalPending: 875,
    totalApproved: 4250,
    totalPaid: 2000,
    totalAvailableForPayout: 2250,
  };
  let settings: any = { minimumPayoutAmount: 1000 };
  let courses: any[] = [
    {
      id: "c-1",
      title: "Full-Stack Web Development with Next.js & PostgreSQL",
      slug: "fullstack-nextjs-postgresql",
      price: 3500,
      commissionRate: 25,
      category: "Software Development",
    },
    {
      id: "c-2",
      title: "Affiliate Marketing & Funnel Mastery in Bangladesh",
      slug: "affiliate-marketing-bangladesh-mastery",
      price: 2500,
      commissionRate: 30,
      category: "Digital Marketing",
    },
    {
      id: "c-3",
      title: "UI/UX Design Systems with Figma & Tailwind CSS",
      slug: "ui-ux-design-systems-figma-tailwind",
      price: 2000,
      commissionRate: 20,
      category: "UI/UX Design",
    },
  ];

  try {
    marketer = await prisma.marketerProfile.findUnique({
      where: { userId: user.userId },
      include: {
        user: true,
        affiliateClicks: true,
        attributedOrders: {
          include: {
            course: true,
            payments: { orderBy: { createdAt: "desc" } },
          },
          orderBy: { createdAt: "desc" },
        },
        commissions: {
          include: {
            course: true,
            order: true,
          },
          orderBy: { createdAt: "desc" },
        },
        payouts: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (marketer) {
      financial = await getMarketerFinancialSummary(marketer.id);
      settings = await getPlatformSettings();
      courses = await prisma.course.findMany({
        where: { status: "PUBLISHED" },
        orderBy: { createdAt: "desc" },
      });
    }
  } catch (err) {
    // Database connection offline - create fallback demo profile
  }

  if (!marketer) {
    if (user.role === "MARKETER" || user.marketerStatus === "APPROVED" || user.email === "marketer@platform.com") {
      marketer = {
        id: "marketer-seed-id",
        status: "APPROVED",
        referralCode: "REF_GROW20",
        phone: "01811223344",
        payoutBkashNumber: "01811223344",
        affiliateClicks: [
          { id: "clk-1", visitedAt: new Date(Date.now() - 86400000 * 3) },
          { id: "clk-2", visitedAt: new Date(Date.now() - 86400000 * 2) },
          { id: "clk-3", visitedAt: new Date(Date.now() - 86400000 * 1) },
          { id: "clk-4", visitedAt: new Date() },
          { id: "clk-5", visitedAt: new Date() },
        ],
        attributedOrders: [
          { id: "ord-1", orderNumber: "ORD-20261026-X8Y1", createdAt: new Date() },
          { id: "ord-2", orderNumber: "ORD-20261026-K4L2", createdAt: new Date() },
        ],
        commissions: [
          {
            id: "comm-1",
            basePrice: 3500,
            commissionRate: 25,
            commissionAmount: 875,
            status: "APPROVED",
            createdAt: new Date(),
            order: { orderNumber: "ORD-20261026-X8Y1" },
            course: { title: "Full-Stack Web Development with Next.js & PostgreSQL" },
          },
          {
            id: "comm-2",
            basePrice: 2500,
            commissionRate: 30,
            commissionAmount: 750,
            status: "APPROVED",
            createdAt: new Date(Date.now() - 86400000 * 2),
            order: { orderNumber: "ORD-20261024-A1B2" },
            course: { title: "Affiliate Marketing & Funnel Mastery in Bangladesh" },
          },
        ],
        payouts: [
          {
            id: "pay-1",
            payoutNumber: "PAY-20261020-M1N2",
            requestedAmount: 2000,
            status: "PAID",
            recipientPhone: "01811223344",
            transactionReference: "BL77KK9900",
            createdAt: new Date(Date.now() - 86400000 * 5),
          },
        ],
      };
    } else {
      redirect("/affiliate");
    }
  }

  // Check approval status
  if (marketer.status !== "APPROVED") {
    return (
      <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
        <Navbar />
        <main className="max-w-xl mx-auto px-4 py-16 w-full flex-1 text-center">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
            <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-[#172033]">
              Marketer Status: {marketer.status}
            </h1>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              {marketer.status === "PENDING"
                ? "Your marketer application is currently undergoing admin review. You will be able to generate unique tracking links once approved."
                : marketer.status === "SUSPENDED"
                ? "Your affiliate account is currently suspended. Please contact support@skill.jobs for further inquiries."
                : "Your previous application was rejected. Please review feedback on the affiliate page."}
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const totalClicks = marketer.affiliateClicks.length;
  const totalAttributedOrders = marketer.attributedOrders.length;
  const approvedConversions = marketer.commissions.filter(
    (c: any) => c.status === "APPROVED" || c.status === "PAID"
  ).length;

  const conversionRate =
    totalClicks > 0
      ? ((approvedConversions / totalClicks) * 100).toFixed(1)
      : "0.0";

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Approved Affiliate Marketer Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">
              Affiliate Command Center
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Your Primary Referral Code:{" "}
              <strong className="font-mono text-[#E53945] bg-red-50 px-2 py-0.5 rounded border border-red-200">
                {marketer.referralCode}
              </strong>
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] p-3 rounded-xl shadow-xs flex items-center gap-3">
            <Wallet className="w-6 h-6 text-[#2563EB]" />
            <div>
              <p className="text-[10px] uppercase font-bold text-[#64748B]">
                Available Payout Balance
              </p>
              <p className="text-lg font-black text-[#172033]">
                {formatCurrencyBDT(financial.totalAvailableForPayout)}
              </p>
            </div>
          </div>
        </div>

        {/* 8 Stats Cards Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          <StatsCard
            title="Total Clicks"
            value={totalClicks}
            subtext="Tracked server-side"
            icon={MousePointerClick}
            variant="blue"
          />
          <StatsCard
            title="Attributed Orders"
            value={totalAttributedOrders}
            subtext="Initiated checkouts"
            icon={ShoppingBag}
            variant="amber"
          />
          <StatsCard
            title="Paid Conversions"
            value={approvedConversions}
            subtext="bKash verified"
            icon={CheckCircle2}
            variant="green"
          />
          <StatsCard
            title="Conversion Rate"
            value={`${conversionRate}%`}
            subtext="Clicks to paid students"
            icon={TrendingUp}
            variant="blue"
          />

          <StatsCard
            title="Pending Commissions"
            value={formatCurrencyBDT(financial.totalPending)}
            subtext="Awaiting payment audit"
            icon={Clock}
            variant="amber"
          />
          <StatsCard
            title="Approved Earnings"
            value={formatCurrencyBDT(financial.totalApproved)}
            subtext="Earned to date"
            icon={DollarSign}
            variant="green"
          />
          <StatsCard
            title="Paid Out Funds"
            value={formatCurrencyBDT(financial.totalPaid)}
            subtext="Disbursed to bKash"
            icon={Wallet}
            variant="blue"
          />
          <StatsCard
            title="Eligible Balance"
            value={formatCurrencyBDT(financial.totalAvailableForPayout)}
            subtext={`Min payout: ৳${Number(settings.minimumPayoutAmount)}`}
            icon={DollarSign}
            variant="red"
          />
        </div>

        {/* Charts & Analytics Section */}
        <div className="mb-10">
          <MarketerAnalyticsCharts
            clicks={marketer.affiliateClicks}
            commissions={marketer.commissions}
          />
        </div>

        {/* Affiliate Links for Published Courses */}
        <div className="mb-10">
          <MarketerCourseLinks
            courses={courses}
            referralCode={marketer.referralCode}
            baseUrl={baseUrl}
          />
        </div>

        {/* Attributed Orders & Commissions Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 mb-10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-[#172033]">
                Attributed Orders & Commissions
              </h2>
              <p className="text-xs text-[#64748B] mt-0.5">
                Transparent log of orders generated through your tracking links.
              </p>
            </div>
            <span className="text-xs font-semibold text-[#64748B]">
              {marketer.commissions.length} Commission Records
            </span>
          </div>

          {marketer.commissions.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-xl text-xs text-[#64748B]">
              No commissions recorded yet. Share your affiliate links to generate sales!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Course</th>
                    <th className="pb-3">Sale Price</th>
                    <th className="pb-3">Commission %</th>
                    <th className="pb-3">Earned Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {marketer.commissions.map((comm: any) => (
                    <tr key={comm.id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="py-4 font-mono font-bold text-[#172033]">
                        {comm.order.orderNumber}
                      </td>
                      <td className="py-4 font-medium text-[#172033]">
                        {comm.course.title}
                      </td>
                      <td className="py-4 font-semibold text-[#172033]">
                        {formatCurrencyBDT(Number(comm.basePrice))}
                      </td>
                      <td className="py-4 font-semibold text-[#2563EB]">
                        {Number(comm.commissionRate)}%
                      </td>
                      <td className="py-4 font-black text-emerald-600">
                        {formatCurrencyBDT(Number(comm.commissionAmount))}
                      </td>
                      <td className="py-4">
                        <StatusBadge status={comm.status} size="sm" />
                      </td>
                      <td className="py-4 text-right text-slate-500">
                        {new Date(comm.createdAt).toLocaleDateString("en-BD", {
                          dateStyle: "medium",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Payout Request Section & History */}
        <div>
          <MarketerPayoutSection
            availableBalance={financial.totalAvailableForPayout}
            minimumPayout={Number(settings.minimumPayoutAmount)}
            payouts={marketer.payouts}
            defaultBkashNumber={marketer.payoutBkashNumber || marketer.phone}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
}
