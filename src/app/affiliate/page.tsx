import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { MarketerApplicationForm } from "./MarketerApplicationForm";
import Link from "next/link";
import {
  TrendingUp,
  DollarSign,
  Share2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AffiliateLandingPage() {
  const user = await getCurrentUser();

  let existingProfile = null;
  if (user) {
    existingProfile = await prisma.marketerProfile.findUnique({
      where: { userId: user.userId },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-[#F8FAFC] py-16 border-b border-[#E2E8F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-[#2563EB] text-xs font-bold uppercase tracking-wider mb-4">
            <TrendingUp className="w-3.5 h-3.5" />
            Official Marketer Partnership
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-[#172033] tracking-tight">
            Earn up to <span className="text-[#E53945]">30% Commission</span> on Every Verified Course Sale
          </h1>
          <p className="mt-4 text-sm sm:text-base text-[#64748B] max-w-2xl mx-auto leading-relaxed">
            Partner with Skill.jobs Affiliation to monetize your audience, social media, or student network.
            Enjoy 30-day cookie attribution and fast manual bKash wallet payouts.
          </p>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E53945] flex items-center justify-center font-bold mb-4">
              <DollarSign className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#172033]">High Commission Rates</h3>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Earn between 20% and 30% per enrollment. Average commissions range from ৳500 to ৳1,050 per student.
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold mb-4">
              <Share2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#172033]">30-Day Cookie Tracking</h3>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              When a visitor clicks your unique referral link, you receive attribution even if they purchase weeks later.
            </p>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#172033]">Direct bKash Payouts</h3>
            <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
              Withdraw funds once your balance reaches ৳1,000. Admin verifies and disburses directly to your bKash.
            </p>
          </div>
        </div>

        {/* Application Form or Status */}
        <div className="max-w-2xl mx-auto bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
          {!user ? (
            <div className="text-center py-6">
              <h3 className="text-lg font-bold text-[#172033]">Ready to Apply?</h3>
              <p className="text-xs text-[#64748B] mt-1.5 max-w-sm mx-auto">
                Please log in or register a free Skill.jobs account first before submitting your marketer application.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link
                  href="/login?redirect=/affiliate"
                  className="px-5 py-2.5 text-xs font-bold text-[#172033] bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB] rounded-xl transition-colors"
                >
                  Log In to Apply
                </Link>
                <Link
                  href="/register"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-xl shadow-sm transition-colors"
                >
                  Register New Account
                </Link>
              </div>
            </div>
          ) : existingProfile ? (
            <div>
              <div className="text-center mb-6">
                <span className="text-xs font-bold uppercase tracking-wider text-[#64748B]">
                  Your Marketer Application
                </span>
                <h3 className="text-xl font-bold text-[#172033] mt-1">
                  Status: {existingProfile.status}
                </h3>
              </div>

              {existingProfile.status === "APPROVED" ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-5 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-emerald-900">You are an Approved Marketer!</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    Your unique referral code is: <strong className="font-mono">{existingProfile.referralCode}</strong>
                  </p>
                  <Link
                    href="/marketer"
                    className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl shadow-sm transition-all"
                  >
                    <span>Open Marketer Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ) : existingProfile.status === "PENDING" ? (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 text-center">
                  <Clock className="w-8 h-8 text-amber-600 mx-auto mb-2" />
                  <h4 className="font-bold text-sm text-amber-900">Application Under Review</h4>
                  <p className="text-xs text-amber-700 mt-1">
                    Our admin team is currently reviewing your application channels.
                    You will receive access to generate tracking links as soon as approved!
                  </p>
                </div>
              ) : existingProfile.status === "SUSPENDED" ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                  <h4 className="font-bold text-sm text-red-900">Account Suspended</h4>
                  <p className="text-xs text-red-700 mt-1">
                    Your affiliate account has been suspended by administration.
                  </p>
                </div>
              ) : (
                <div className="bg-red-50 border border-red-200 rounded-xl p-5 text-center">
                  <h4 className="font-bold text-sm text-red-900">Application Declined</h4>
                  <p className="text-xs text-red-700 mt-1">
                    {existingProfile.reviewNote || "Application did not meet promotional guidelines."}
                  </p>
                  <p className="text-xs text-slate-600 mt-3">You may re-apply below with updated channel details.</p>
                  <div className="mt-4">
                    <MarketerApplicationForm />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-bold text-[#172033]">Submit Marketer Application</h3>
                <p className="text-xs text-[#64748B] mt-1">
                  Tell us about your channels, audience, and promotional methods.
                </p>
              </div>
              <MarketerApplicationForm />
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
