"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { isValidBdPhoneNumber } from "@/lib/bkash";
import { Loader2, ArrowRight } from "lucide-react";

const applicationSchema = z.object({
  phone: z
    .string()
    .min(11, "Must be an 11-digit phone number")
    .refine((v) => isValidBdPhoneNumber(v), "Invalid Bangladeshi mobile number"),
  payoutBkashNumber: z
    .string()
    .min(11, "Must be an 11-digit phone number")
    .refine((v) => isValidBdPhoneNumber(v), "Invalid Bangladeshi bKash number"),
  socialLinks: z.string().optional(),
  applicationReason: z
    .string()
    .min(15, "Please explain your promotional audience/channels in at least 15 characters"),
});

type ApplicationFormValues = z.infer<typeof applicationSchema>;

export function MarketerApplicationForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ApplicationFormValues>({
    resolver: zodResolver(applicationSchema),
  });

  const onSubmit = async (data: ApplicationFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/marketer/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to submit application");
      }

      toast.success("Application submitted! Admin review in progress.");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 text-left">
      <div>
        <label className="block text-xs font-bold text-[#172033] mb-1.5">
          Contact Phone Number <span className="text-[#E53945]">*</span>
        </label>
        <input
          type="text"
          placeholder="01712345678"
          {...register("phone")}
          className="w-full px-4 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
        />
        {errors.phone && (
          <p className="text-[11px] text-[#DC2626] mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-[#172033] mb-1.5">
          bKash Number for Receiving Payouts <span className="text-[#E53945]">*</span>
        </label>
        <input
          type="text"
          placeholder="017XXXXXXXX"
          {...register("payoutBkashNumber")}
          className="w-full px-4 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
        />
        {errors.payoutBkashNumber && (
          <p className="text-[11px] text-[#DC2626] mt-1">{errors.payoutBkashNumber.message}</p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold text-[#172033] mb-1.5">
          Social Media, Portfolio, or Community Links (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. facebook.com/mypage, youtube.com/@mychannel, or website"
          {...register("socialLinks")}
          className="w-full px-4 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-[#172033] mb-1.5">
          How do you plan to promote our courses? <span className="text-[#E53945]">*</span>
        </label>
        <textarea
          rows={3}
          placeholder="Explain your audience size, advertising experience, Facebook groups, YouTube channels, or student networks..."
          {...register("applicationReason")}
          className="w-full px-4 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
        />
        {errors.applicationReason && (
          <p className="text-[11px] text-[#DC2626] mt-1">{errors.applicationReason.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] disabled:opacity-50 rounded-xl shadow-sm transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Submitting Application...</span>
          </>
        ) : (
          <>
            <span>Submit Application for Review</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}
