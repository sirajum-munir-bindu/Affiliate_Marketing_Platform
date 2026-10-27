"use client";

import { useState } from "react";
import { formatCurrencyBDT } from "@/lib/bkash";
import { Copy, Check, ExternalLink, Share2, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  price: any;
  commissionRate: any;
  category: string;
}

interface MarketerCourseLinksProps {
  courses: CourseItem[];
  referralCode: string;
  baseUrl: string;
}

export function MarketerCourseLinks({ courses, referralCode, baseUrl }: MarketerCourseLinksProps) {
  const [copiedSlug, setCopiedSlug] = useState<string | null>(null);

  const handleCopy = (link: string, slug: string) => {
    navigator.clipboard.writeText(link);
    setCopiedSlug(slug);
    toast.success("Affiliate tracking link copied!");
    setTimeout(() => setCopiedSlug(null), 2500);
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#172033] flex items-center gap-2">
            <Share2 className="w-5 h-5 text-[#2563EB]" />
            <span>Eligible Courses & Your Unique Affiliate Links</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Share these links on Facebook, YouTube, Telegram, or blogs. 30-day tracking cookie is attached automatically.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {courses.map((c) => {
          const priceNum = Number(c.price);
          const commRate = Number(c.commissionRate);
          const estimatedComm = (priceNum * commRate) / 100;
          const affiliateUrl = `${baseUrl}/courses/${c.slug}?ref=${referralCode}`;

          return (
            <div
              key={c.id}
              className="p-4 sm:p-5 rounded-xl border border-[#E2E8F0] bg-[#F8FAFC] flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-[#2563EB] transition-colors"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    {c.category}
                  </span>
                  <h3 className="text-sm font-bold text-[#172033]">{c.title}</h3>
                </div>
                <div className="flex items-center gap-4 text-xs text-[#64748B]">
                  <span>Fee: <strong className="text-[#172033]">{formatCurrencyBDT(priceNum)}</strong></span>
                  <span>Commission: <strong className="text-emerald-600">{commRate}% ({formatCurrencyBDT(estimatedComm)})</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  readOnly
                  value={affiliateUrl}
                  className="text-xs font-mono bg-white border border-[#E2E8F0] px-3 py-2 rounded-xl text-[#172033] select-all w-full md:w-72"
                />
                <button
                  type="button"
                  onClick={() => handleCopy(affiliateUrl, c.slug)}
                  className="px-3.5 py-2 text-xs font-bold bg-[#2563EB] hover:bg-[#1D4ED8] text-white rounded-xl transition-all flex items-center gap-1.5 shrink-0"
                >
                  {copiedSlug === c.slug ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
