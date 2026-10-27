import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatCurrencyBDT } from "@/lib/bkash";
import { StatusBadge } from "@/components/ui/StatusBadge";
import Link from "next/link";
import {
  GraduationCap,
  Clock,
  BookOpen,
  ShoppingBag,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function StudentDashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?redirect=/student");
  }

  let enrollments: any[] = [];
  let orders: any[] = [];

  try {
    const [dbEnrollments, dbOrders] = await Promise.all([
      prisma.enrollment.findMany({
        where: { studentId: user.userId, isActive: true },
        include: { course: true },
        orderBy: { accessGrantedAt: "desc" },
      }),
      prisma.order.findMany({
        where: { customerId: user.userId },
        include: {
          course: true,
          payments: { orderBy: { createdAt: "desc" } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    enrollments = dbEnrollments;
    orders = dbOrders;
  } catch (err) {
    // Database connection offline - provide demo student data
    enrollments = [
      {
        id: "enr-1",
        accessGrantedAt: new Date(Date.now() - 86400000 * 2),
        course: {
          title: "Full-Stack Web Development with Next.js & PostgreSQL",
          slug: "fullstack-nextjs-postgresql",
          category: "Software Development",
          instructorName: "Engr. Farhan Kabir",
        },
      },
    ];

    orders = [
      {
        id: "ord-1",
        orderNumber: "ORD-20261026-X8Y1",
        amount: 3500,
        status: "PAID",
        createdAt: new Date(Date.now() - 86400000 * 2),
        course: {
          title: "Full-Stack Web Development with Next.js & PostgreSQL",
        },
        payments: [
          {
            id: "pay-1",
            transactionId: "BL99A12B34",
            amount: 3500,
            status: "APPROVED",
            senderNumber: "01755667788",
            paymentMethod: "BKASH_MERCHANT",
          },
        ],
      },
      {
        id: "ord-2",
        orderNumber: "ORD-20261026-N2M3",
        amount: 2500,
        status: "PAYMENT_REVIEW",
        createdAt: new Date(),
        course: {
          title: "Affiliate Marketing & Funnel Mastery in Bangladesh",
        },
        payments: [
          {
            id: "pay-2",
            transactionId: "CI88V77W66",
            amount: 2500,
            status: "SUBMITTED",
            senderNumber: "01755667788",
            paymentMethod: "BKASH_SEND_MONEY",
          },
        ],
      },
    ];
  }

  const pendingOrders = orders.filter(
    (o) => o.status === "PAYMENT_REVIEW" || o.status === "PENDING_PAYMENT"
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Welcome Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
              Student Dashboard
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">
              Welcome back, {user.name}
            </h1>
            <p className="text-xs text-[#64748B] mt-1">
              Track your course access, learning progress, and bKash payment verification status.
            </p>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-xl shadow-sm transition-all w-fit"
          >
            <span>Browse More Courses</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Enrolled Courses
              </p>
              <p className="text-2xl font-black text-[#172033] mt-0.5">{enrollments.length}</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Awaiting Verification
              </p>
              <p className="text-2xl font-black text-[#172033] mt-0.5">{pendingOrders.length}</p>
            </div>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-50 text-slate-700 flex items-center justify-center font-bold">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                Total Orders
              </p>
              <p className="text-2xl font-black text-[#172033] mt-0.5">{orders.length}</p>
            </div>
          </div>
        </div>

        {/* Active Enrolled Courses */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 mb-10 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-bold text-[#172033] flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-[#2563EB]" />
              <span>My Enrolled Courses</span>
            </h2>
            <span className="text-xs font-semibold text-[#64748B]">
              {enrollments.length} Active Courses
            </span>
          </div>

          {enrollments.length === 0 ? (
            <div className="text-center py-8 border border-dashed rounded-xl">
              <p className="text-xs text-[#64748B]">You have not enrolled in any verified courses yet.</p>
              <Link
                href="/courses"
                className="mt-3 inline-block px-4 py-2 text-xs font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                Browse Catalog
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {enrollments.map((enr: any) => (
                <div
                  key={enr.id}
                  className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden flex flex-col justify-between"
                >
                  <div className="p-5">
                    <span className="inline-block bg-white text-[#2563EB] text-[10px] font-bold px-2 py-0.5 rounded-full border border-[#E2E8F0] mb-2">
                      {enr.course.category}
                    </span>
                    <h3 className="font-bold text-sm text-[#172033] line-clamp-2">
                      {enr.course.title}
                    </h3>
                    <p className="text-xs text-[#64748B] mt-2">
                      Instructor: <strong>{enr.course.instructorName}</strong>
                    </p>
                  </div>
                  <div className="p-4 bg-white border-t border-[#E2E8F0] flex items-center justify-between">
                    <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Access Granted
                    </span>
                    <Link
                      href={`/student/courses/${enr.course.slug}`}
                      className="px-3 py-1.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-lg transition-colors"
                    >
                      Study Now
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Order History Table */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-bold text-[#172033] mb-6 flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#E53945]" />
            <span>Order History & bKash Status</span>
          </h2>

          {orders.length === 0 ? (
            <div className="text-center py-8 text-xs text-[#64748B]">No orders found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Course</th>
                    <th className="pb-3">Fee</th>
                    <th className="pb-3">Latest TrxID</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8F0]">
                  {orders.map((o: any) => {
                    const latestTx = o.payments?.[0];
                    return (
                      <tr key={o.id} className="hover:bg-[#F8FAFC] transition-colors">
                        <td className="py-4 font-mono font-bold text-[#172033]">
                          {o.orderNumber}
                        </td>
                        <td className="py-4 font-medium text-[#172033] max-w-xs truncate">
                          {o.course?.title}
                        </td>
                        <td className="py-4 font-bold text-[#172033]">
                          {formatCurrencyBDT(Number(o.amount))}
                        </td>
                        <td className="py-4 font-mono text-[#64748B]">
                          {latestTx ? latestTx.transactionId : "None"}
                        </td>
                        <td className="py-4">
                          <StatusBadge status={o.status} size="sm" />
                        </td>
                        <td className="py-4 text-right">
                          <Link
                            href={`/orders/${o.orderNumber}`}
                            className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8]"
                          >
                            <span>View Status</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
