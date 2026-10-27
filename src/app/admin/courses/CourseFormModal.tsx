"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { CourseStatus, CommissionType } from "@prisma/client";
import { X, Loader2 } from "lucide-react";

const courseFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  shortDescription: z.string().min(10, "Short description required"),
  description: z.string().min(20, "Detailed description required"),
  thumbnailUrl: z.string().optional().nullable(),
  price: z.number().positive("Price must be greater than 0"),
  commissionRate: z.number().min(1).max(100),
  category: z.string().min(2, "Category is required"),
  instructorName: z.string().min(2, "Instructor name is required"),
  status: z.nativeEnum(CourseStatus),
});

type CourseFormValues = z.infer<typeof courseFormSchema>;

interface CourseFormModalProps {
  course?: any | null;
  onClose: () => void;
}

export function CourseFormModal({ course, onClose }: CourseFormModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const isEditing = !!course;

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: {
      title: course?.title || "",
      slug: course?.slug || "",
      shortDescription: course?.shortDescription || "",
      description: course?.description || "",
      thumbnailUrl: course?.thumbnailUrl || "",
      price: course ? Number(course.price) : 2500,
      commissionRate: course ? Number(course.commissionRate) : 20,
      category: course?.category || "Software Development",
      instructorName: course?.instructorName || "Lead Instructor",
      status: course?.status || CourseStatus.PUBLISHED,
    },
  });

  const onSubmit = async (data: CourseFormValues) => {
    setLoading(true);
    try {
      const url = isEditing ? `/api/admin/courses/${course.id}` : "/api/admin/courses";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save course");
      }

      toast.success(isEditing ? "Course updated!" : "Course published!");
      onClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to save course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 sm:p-8 shadow-xl border border-[#E2E8F0] my-8">
        <div className="flex items-center justify-between pb-4 border-b border-[#E2E8F0] mb-5">
          <h2 className="font-black text-lg text-[#172033]">
            {isEditing ? "Edit Course" : "Create New Course"}
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Course Title <span className="text-[#E53945]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Next.js App Router Mastery"
                {...register("title")}
                onChange={(e) => {
                  setValue("title", e.target.value);
                  if (!isEditing) {
                    setValue(
                      "slug",
                      e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-")
                    );
                  }
                }}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
              {errors.title && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                URL Slug <span className="text-[#E53945]">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. nextjs-app-router-mastery"
                {...register("slug")}
                className="w-full px-3 py-2 text-xs font-mono border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
              {errors.slug && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.slug.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Course Price (BDT) <span className="text-[#E53945]">*</span>
              </label>
              <input
                type="number"
                {...register("price", { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs font-bold border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
              {errors.price && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.price.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Commission Rate (%) <span className="text-[#E53945]">*</span>
              </label>
              <input
                type="number"
                step="0.5"
                {...register("commissionRate", { valueAsNumber: true })}
                className="w-full px-3 py-2 text-xs font-bold border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
              {errors.commissionRate && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.commissionRate.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:border-[#2563EB]"
              >
                <option value={CourseStatus.PUBLISHED}>PUBLISHED</option>
                <option value={CourseStatus.DRAFT}>DRAFT</option>
                <option value={CourseStatus.ARCHIVED}>ARCHIVED</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Category
              </label>
              <input
                type="text"
                placeholder="Software Development, Marketing, etc."
                {...register("category")}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Instructor Name
              </label>
              <input
                type="text"
                placeholder="Lead Instructor"
                {...register("instructorName")}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">
              Thumbnail Image URL (Unsplash or CDN)
            </label>
            <input
              type="text"
              placeholder="https://images.unsplash.com/..."
              {...register("thumbnailUrl")}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">
              Short Description <span className="text-[#E53945]">*</span>
            </label>
            <input
              type="text"
              placeholder="Catchy single sentence overview..."
              {...register("shortDescription")}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
            />
            {errors.shortDescription && (
              <p className="text-[11px] text-[#DC2626] mt-1">{errors.shortDescription.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1">
              Comprehensive Course Description <span className="text-[#E53945]">*</span>
            </label>
            <textarea
              rows={4}
              placeholder="Full details on what students will learn, project deliverables, and prerequisites..."
              {...register("description")}
              className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
            />
            {errors.description && (
              <p className="text-[11px] text-[#DC2626] mt-1">{errors.description.message}</p>
            )}
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#172033]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-xl shadow-xs transition-all inline-flex items-center gap-1.5"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{isEditing ? "Save Changes" : "Create Course"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
