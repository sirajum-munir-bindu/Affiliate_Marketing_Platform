import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import Link from "next/link";
import { ShieldCheck, HelpCircle, ArrowRight, Smartphone, TrendingUp, DollarSign } from "lucide-react";

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC]">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full flex-1">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-[#2563EB]">
            Transparency & Policies
          </span>
          <h1 className="text-3xl font-black text-[#172033] mt-1">
            How Skill.jobs Affiliation Works
          </h1>
          <p className="text-sm text-[#64748B] mt-2 max-w-xl mx-auto">
            Everything you need to know about our manual bKash verification, affiliate tracking, and payout policies.
          </p>
        </div>

        {/* Section 1: Manual bKash Verification */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-50 text-[#E53945] flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#172033]">Manual bKash Verification Process</h2>
              <p className="text-xs text-[#64748B]">Zero automated gateway risks, 100% human-verified security</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#172033] leading-relaxed">
            <p>
              1. <strong>Direct bKash Transfer:</strong> When enrolling in a course, students send the exact course fee directly to our official receiving bKash account (displayed on the checkout screen).
            </p>
            <p>
              2. <strong>Transaction Submission:</strong> The student inputs their 10-character Transaction ID (TrxID) and sender mobile number.
            </p>
            <p>
              3. <strong>Admin Reconciliation:</strong> Our verification team checks the TrxID directly against our official bKash merchant statements.
            </p>
            <p>
              4. <strong>Instant Activation:</strong> Once confirmed, course access is granted and the attributed affiliate commission is locked into the system.
            </p>
          </div>
        </div>

        {/* Section 2: Affiliate Attribution Window */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#172033]">30-Day Referral Attribution Rules</h2>
              <p className="text-xs text-[#64748B]">Fair, predictable, and transparent tracking</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#172033] leading-relaxed">
            <p>
              • <strong>Cookie Lifetime:</strong> Every referral link places a secure, 30-day tracking cookie. Even if a visitor registers or returns weeks later, the sale is credited to you.
            </p>
            <p>
              • <strong>Last-Click Attribution:</strong> The last eligible affiliate link clicked prior to order creation receives 100% of the commission snapshot.
            </p>
            <p>
              • <strong>Anti-Self-Referral:</strong> Marketers cannot refer their own student accounts.
            </p>
            <p>
              • <strong>Commission Snapshot:</strong> Commissions are calculated on the actual paid course price and frozen on order approval.
            </p>
          </div>
        </div>

        {/* Section 3: Payout Policy */}
        <div id="payouts" className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 mb-8 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#172033]">Marketer Payout Policy</h2>
              <p className="text-xs text-[#64748B]">Prompt bKash disbursement rules</p>
            </div>
          </div>

          <div className="space-y-3 text-xs text-[#172033] leading-relaxed">
            <p>
              • <strong>Minimum Threshold:</strong> Marketers can request a payout as soon as their available balance reaches <strong>৳1,000</strong>.
            </p>
            <p>
              • <strong>Balance Reservation:</strong> Commissions attached to a pending payout are reserved atomically to prevent duplicate payments.
            </p>
            <p>
              • <strong>Disbursement Timeframe:</strong> Payouts are manually transferred via bKash and recorded with the transaction reference within 24 to 48 business hours.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center pt-6">
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-xl shadow-sm transition-all"
          >
            <span>Browse Available Courses</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
