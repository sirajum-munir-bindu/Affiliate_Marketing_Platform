import Link from "next/link";
import Image from "next/image";
import { formatCurrencyBDT } from "@/lib/bkash";
import { ArrowUpRight, BookOpen, Percent } from "lucide-react";

export interface CourseCardData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  thumbnailUrl?: string | null;
  price: number | string;
  commissionRate?: number | string;
  category: string;
  instructorName?: string;
}

interface CourseCardProps {
  course: CourseCardData;
  referralCode?: string;
  showCommission?: boolean;
}

export function CourseCard({ course, referralCode, showCommission = false }: CourseCardProps) {
  const priceNum = Number(course.price);
  const commRate = Number(course.commissionRate || 20);
  const estimatedCommission = (priceNum * commRate) / 100;

  const courseUrl = referralCode
    ? `/courses/${course.slug}?ref=${referralCode}`
    : `/courses/${course.slug}`;

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col group">
      {/* Thumbnail */}
      <div className="relative aspect-video bg-slate-100 overflow-hidden">
        {course.thumbnailUrl ? (
          <img
            src={course.thumbnailUrl}
            alt={course.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
            <BookOpen className="w-10 h-10" />
          </div>
        )}
        <span className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm text-xs font-semibold px-2.5 py-1 rounded-full text-[#172033] shadow-sm">
          {course.category}
        </span>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-[#172033] text-base group-hover:text-[#2563EB] transition-colors line-clamp-2">
            {course.title}
          </h3>
          <p className="text-xs text-[#64748B] mt-2 line-clamp-2 leading-relaxed">
            {course.shortDescription}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
          <div>
            <p className="text-[10px] uppercase font-bold text-[#64748B] tracking-wider">
              Course Fee
            </p>
            <p className="text-lg font-black text-[#172033]">
              {formatCurrencyBDT(priceNum)}
            </p>
          </div>

          {showCommission && (
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <Percent className="w-3 h-3" />
                {commRate}% (৳{estimatedCommission.toFixed(0)})
              </span>
            </div>
          )}

          <Link
            href={courseUrl}
            className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-[#1D4ED8] bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-xl transition-colors"
          >
            <span>Details</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
