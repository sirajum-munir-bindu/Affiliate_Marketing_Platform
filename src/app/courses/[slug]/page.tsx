import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCourseBySlug } from "@/lib/services/courseService";
import { getCurrentUser } from "@/lib/auth";
import { formatCurrencyBDT } from "@/lib/bkash";
import { notFound } from "next/navigation";
import Link from "next/link";
import { cookies } from "next/headers";
import { AFFILIATE_COOKIE_NAME, DEFAULT_ATTRIBUTION_DAYS } from "@/lib/affiliate";
import prisma from "@/lib/prisma";
import { MarketerStatus } from "@prisma/client";
import {
  CheckCircle2,
  Clock,
  BookOpen,
  User,
  ShieldCheck,
  ArrowRight,
  Share2,
  Copy,
  Layers,
} from "lucide-react";

export const dynamic = "force-dynamic";

interface CourseDetailProps {
  params: {
    slug: string;
  };
  searchParams: {
    ref?: string;
  };
}

export default async function CourseDetailPage({ params, searchParams }: CourseDetailProps) {
  const { slug } = params;
  const course = await getCourseBySlug(slug);

  if (!course || course.status !== "PUBLISHED") {
    notFound();
  }

  // Handle Affiliate Referral Attribution if ?ref= is present in URL
  const refCode = searchParams.ref;
  if (refCode) {
    try {
      const marketer = await prisma.marketerProfile.findUnique({
        where: { referralCode: refCode },
      });

      if (marketer && marketer.status === MarketerStatus.APPROVED) {
        // Record server-side click
        await prisma.affiliateClick.create({
          data: {
            marketerId: marketer.id,
            courseId: course.id,
            referralCode: refCode,
          },
        });
      }
    } catch (err) {}

    // Set attribution cookie
    cookies().set(AFFILIATE_COOKIE_NAME, refCode, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: DEFAULT_ATTRIBUTION_DAYS * 24 * 60 * 60,
      path: "/",
    });
  }

  const currentUser = await getCurrentUser();
  const priceNum = Number(course.price);

  // Parse curriculum JSON safely
  let modules: { module: string; title: string; lessons?: number }[] = [];
  try {
    if (course.curriculum) {
      modules = JSON.parse(course.curriculum);
    }
  } catch {
    modules = [];
  }

  // If viewing as an approved marketer, construct their shareable affiliate link
  let marketerShareLink = "";
  if (currentUser?.marketerStatus === "APPROVED" || currentUser?.role === "MARKETER") {
    let code = "REF_GROW20";
    try {
      if (currentUser.marketerId) {
        const profile = await prisma.marketerProfile.findUnique({
          where: { id: currentUser.marketerId },
          select: { referralCode: true },
        });
        if (profile) code = profile.referralCode;
      }
    } catch (e) {}
    marketerShareLink = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/courses/${course.slug}?ref=${code}`;
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full flex-1">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-[#64748B] mb-6">
          <Link href="/" className="hover:text-[#172033]">Home</Link>
          <span>/</span>
          <Link href="/courses" className="hover:text-[#172033]">Courses</Link>
          <span>/</span>
          <span className="text-[#172033] font-semibold">{course.title}</span>
        </div>

        {/* Marketer Affiliate Link Promotion Box (Visible only to approved marketers) */}
        {marketerShareLink && (
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 sm:p-5 mb-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-[#2563EB] text-white rounded-xl">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">
                  Your Affiliate Link for this Course
                </p>
                <p className="text-xs text-[#172033] font-medium mt-0.5">
                  Earn {Number(course.commissionRate)}% commission (৳{((priceNum * Number(course.commissionRate)) / 100).toFixed(0)}) on each verified bKash enrollment!
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <input
                type="text"
                readOnly
                value={marketerShareLink}
                className="text-xs bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-[#172033] font-mono select-all w-full md:w-80"
              />
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(marketerShareLink);
                  alert("Affiliate link copied to clipboard!");
                }}
                className="shrink-0 px-4 py-2 text-xs font-bold bg-[#2563EB] text-white hover:bg-[#1D4ED8] rounded-xl transition-colors flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content (Left 2 cols) */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
              <span className="inline-block bg-blue-50 text-[#2563EB] text-xs font-bold px-3 py-1 rounded-full mb-4">
                {course.category}
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-[#172033] leading-tight">
                {course.title}
              </h1>

              <p className="text-sm text-[#64748B] mt-3 leading-relaxed">
                {course.shortDescription}
              </p>

              <div className="mt-6 pt-6 border-t border-[#E2E8F0] flex flex-wrap items-center gap-6 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-[#2563EB]" />
                  <span>Instructor: <strong className="text-[#172033]">{course.instructorName}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Manual bKash Verification</span>
                </div>
              </div>
            </div>

            {/* Course Description */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#172033] mb-4">Course Overview</h2>
              <div className="text-sm text-[#64748B] leading-relaxed whitespace-pre-line">
                {course.description}
              </div>
            </div>

            {/* Curriculum Breakdown */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center gap-2 mb-6">
                <Layers className="w-5 h-5 text-[#2563EB]" />
                <h2 className="text-lg font-bold text-[#172033]">Curriculum & Syllabus</h2>
              </div>

              {modules.length === 0 ? (
                <p className="text-xs text-[#64748B]">
                  Detailed syllabus will be provided inside the course dashboard upon enrollment.
                </p>
              ) : (
                <div className="space-y-3">
                  {modules.map((mod, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-4 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-7 h-7 rounded-lg bg-white border border-[#E2E8F0] flex items-center justify-center text-xs font-bold text-[#172033]">
                          {idx + 1}
                        </span>
                        <div>
                          <p className="text-xs font-bold text-[#172033]">{mod.module}: {mod.title}</p>
                        </div>
                      </div>
                      {mod.lessons && (
                        <span className="text-xs text-[#64748B] font-medium">
                          {mod.lessons} lessons
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Checkout Card (Right Col) */}
          <div className="space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm sticky top-24">
              {course.thumbnailUrl && (
                <div className="rounded-xl overflow-hidden aspect-video mb-5 bg-slate-100">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="mb-4">
                <span className="text-xs uppercase font-bold text-[#64748B] tracking-wider">
                  Total Course Fee
                </span>
                <div className="text-3xl font-black text-[#172033] mt-1">
                  {formatCurrencyBDT(priceNum)}
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  One-time fee with lifetime access & future updates.
                </p>
              </div>

              <div className="space-y-2.5 my-6 text-xs text-[#64748B]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Full Course Access after bKash Audit</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct Instructor Q&A Support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Course Completion Certificate</span>
                </div>
              </div>

              <Link
                href={`/checkout/${course.slug}`}
                className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 text-sm font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                <span>Enroll Now with bKash</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <div className="mt-4 pt-4 border-t border-[#E2E8F0] text-center">
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Manual Verification Policy</span>
                </div>
                <p className="text-[11px] text-[#64748B] mt-2">
                  Payments are verified manually by administrators against real bKash merchant statements.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
