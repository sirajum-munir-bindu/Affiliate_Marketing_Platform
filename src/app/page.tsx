import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { CourseCard } from "@/components/CourseCard";
import { getPublishedCourses } from "@/lib/services/courseService";
import {
  ArrowRight,
  ShieldCheck,
  TrendingUp,
  Award,
  Sparkles,
  Users,
  CheckCircle2,
  DollarSign,
  Share2,
  GraduationCap,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const { courses } = await getPublishedCourses({ take: 6 });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28 bg-gradient-to-b from-[#F8FAFC] via-white to-white">
        <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-red-100 rounded-full blur-3xl" />
          <div className="absolute top-60 -left-40 w-96 h-96 bg-blue-100 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold tracking-wide uppercase mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            Bangladesh’s Premier Course & Affiliate Hub
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-[#172033] tracking-tight max-w-4xl mx-auto leading-tight">
            Learn In-Demand Skills. <br />
            <span className="text-[#E53945]">Promote Courses.</span>{" "}
            <span className="text-[#2563EB]">Earn via bKash.</span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            A trusted platform where learners master real-world software, marketing, and design skills,
            and approved marketers earn high-converting commissions with transparent manual bKash verification.
          </p>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/courses"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <span>Explore All Courses</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/affiliate"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 text-sm font-bold text-[#2563EB] bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-xl transition-all"
            >
              <span>Become an Affiliate Marketer</span>
            </Link>
          </div>

          {/* Trust Highlights */}
          <div className="mt-12 pt-8 border-t border-[#E2E8F0] grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
              <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#172033]">Manual bKash Audit</p>
                <p className="text-[11px] text-[#64748B]">100% verified transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
              <TrendingUp className="w-6 h-6 text-[#2563EB] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#172033]">30-Day Cookie</p>
                <p className="text-[11px] text-[#64748B]">Last-click attribution</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
              <DollarSign className="w-6 h-6 text-[#E53945] shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#172033]">Up to 30% Payouts</p>
                <p className="text-[11px] text-[#64748B]">Guaranteed commission basis</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-white border border-[#E2E8F0] shadow-sm">
              <Award className="w-6 h-6 text-amber-500 shrink-0" />
              <div>
                <p className="text-xs font-bold text-[#172033]">Certified Curricula</p>
                <p className="text-[11px] text-[#64748B]">Hands-on projects</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      <section className="py-16 bg-white border-y border-[#E2E8F0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#E53945]">
                Curated Quality
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-[#172033] mt-1">
                Featured Career-Building Courses
              </h2>
              <p className="text-sm text-[#64748B] mt-2">
                Learn modern tech, marketing, and design practices with real project deliverables.
              </p>
            </div>
            <Link
              href="/courses"
              className="mt-4 md:mt-0 inline-flex items-center gap-1.5 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8]"
            >
              <span>View All Courses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={{
                  id: course.id,
                  title: course.title,
                  slug: course.slug,
                  shortDescription: course.shortDescription,
                  thumbnailUrl: course.thumbnailUrl,
                  price: Number(course.price),
                  commissionRate: Number(course.commissionRate),
                  category: course.category,
                  instructorName: course.instructorName,
                }}
                showCommission={true}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Dual How It Works Section */}
      <section className="py-20 bg-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-bold uppercase tracking-widest text-[#2563EB]">
              Seamless Workflow
            </span>
            <h2 className="text-3xl font-black text-[#172033] mt-2">
              How the Platform Works
            </h2>
            <p className="text-sm text-[#64748B] mt-2">
              A dual ecosystem designed for effortless student enrollment and transparent marketer earnings.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
            {/* For Students */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E53945] flex items-center justify-center font-bold">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#172033]">For Students</h3>
                  <p className="text-xs text-[#64748B]">Enroll in 3 simple steps</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-[#172033] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#172033]">Select Course & Checkout</h4>
                    <p className="text-xs text-[#64748B] mt-1">
                      Choose your course and initiate checkout to generate a unique Order ID.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-[#E53945] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#172033]">Send Money via bKash</h4>
                    <p className="text-xs text-[#64748B] mt-1">
                      Open your bKash app and pay the exact course fee to our configured receiving account.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#172033]">Submit TrxID & Get Verified</h4>
                    <p className="text-xs text-[#64748B] mt-1">
                      Submit your 10-digit TrxID. Our admin team verifies and immediately unlocks your course.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* For Marketers */}
            <div className="bg-white border border-[#E2E8F0] rounded-2xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#172033]">For Marketers</h3>
                  <p className="text-xs text-[#64748B]">Earn predictable commissions</p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-[#172033] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    1
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#172033]">Apply for Affiliate Access</h4>
                    <p className="text-xs text-[#64748B] mt-1">
                      Submit your application with your promotional channels for rapid admin review.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    2
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#172033]">Promote Unique Referral Links</h4>
                    <p className="text-xs text-[#64748B] mt-1">
                      Share your custom tracking links. Our system tracks clicks and cookies for 30 days.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <span className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    3
                  </span>
                  <div>
                    <h4 className="text-sm font-bold text-[#172033]">Request bKash Payouts</h4>
                    <p className="text-xs text-[#64748B] mt-1">
                      Whenever your approved balance reaches ৳1,000, request a payout straight to your bKash wallet.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="bg-gradient-to-r from-[#172033] via-[#1E293B] to-[#172033] text-white py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black tracking-tight">
            Ready to Accelerate Your Career or Affiliate Income?
          </h2>
          <p className="mt-4 text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Join thousands of active Bangladeshi learners and approved affiliates building sustainable digital wealth.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-xl shadow-lg transition-all"
            >
              <span>Create Free Account</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/affiliate"
              className="inline-flex items-center gap-2 px-8 py-3.5 text-sm font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-all"
            >
              <span>Apply as Marketer</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
