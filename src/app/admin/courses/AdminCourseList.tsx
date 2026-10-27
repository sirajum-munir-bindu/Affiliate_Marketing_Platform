"use client";

import { useState } from "react";
import { formatCurrencyBDT } from "@/lib/bkash";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { CourseFormModal } from "./CourseFormModal";
import { Edit2, Archive, ExternalLink, Plus } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface CourseItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string;
  description: string;
  thumbnailUrl: string | null;
  price: any;
  commissionRate: any;
  status: any;
  category: string;
  instructorName: string;
  _count: {
    enrollments: number;
    orders: number;
    commissions: number;
  };
}

interface AdminCourseListProps {
  courses: CourseItem[];
}

export function AdminCourseList({ courses }: AdminCourseListProps) {
  const router = useRouter();
  const [editingCourse, setEditingCourse] = useState<CourseItem | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const handleArchive = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to archive "${title}"?`)) return;

    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to archive course");
      toast.success("Course archived successfully");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to archive");
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-base font-bold text-[#172033]">Course Management</h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Configure course pricing in BDT, publication status, and affiliate commission percentages.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsCreating(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-xl shadow-xs transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>New Course</span>
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
              <th className="pb-3">Title & Category</th>
              <th className="pb-3">Price</th>
              <th className="pb-3">Commission Rate</th>
              <th className="pb-3">Enrollments</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {courses.map((c) => {
              const priceNum = Number(c.price);
              const commNum = Number(c.commissionRate);
              const commAmount = (priceNum * commNum) / 100;

              return (
                <tr key={c.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4">
                    <p className="font-bold text-[#172033]">{c.title}</p>
                    <p className="text-[11px] text-[#64748B]">
                      {c.category} • Instructor: {c.instructorName}
                    </p>
                  </td>

                  <td className="py-4 font-black text-[#172033]">
                    {formatCurrencyBDT(priceNum)}
                  </td>

                  <td className="py-4">
                    <span className="font-bold text-emerald-600">
                      {commNum}% ({formatCurrencyBDT(commAmount)})
                    </span>
                  </td>

                  <td className="py-4 font-bold text-[#172033]">
                    {c._count.enrollments} Students
                  </td>

                  <td className="py-4">
                    <StatusBadge status={c.status} size="sm" />
                  </td>

                  <td className="py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/courses/${c.slug}`}
                        target="_blank"
                        title="View Public Page"
                        className="p-1.5 text-slate-400 hover:text-[#2563EB] hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setEditingCourse(c)}
                        title="Edit Course"
                        className="p-1.5 text-slate-400 hover:text-[#172033] hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {c.status !== "ARCHIVED" && (
                        <button
                          type="button"
                          onClick={() => handleArchive(c.id, c.title)}
                          title="Archive Course"
                          className="p-1.5 text-slate-400 hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Archive className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {(isCreating || editingCourse) && (
        <CourseFormModal
          course={editingCourse}
          onClose={() => {
            setIsCreating(false);
            setEditingCourse(null);
          }}
        />
      )}
    </>
  );
}
