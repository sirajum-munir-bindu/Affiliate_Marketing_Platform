"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { PaymentMethod } from "@prisma/client";
import { toast } from "sonner";
import { Loader2, Save } from "lucide-react";

const settingsFormSchema = z.object({
  organizationName: z.string().min(2, "Organization name required"),
  supportEmail: z.string().email("Invalid support email"),
  contactPhone: z.string().min(5, "Contact phone required"),
  bkashNumber: z.string().min(11, "bKash number must be at least 11 digits"),
  bkashType: z.nativeEnum(PaymentMethod),
  bkashInstructions: z.string().min(10, "Instructions required"),
  defaultAttributionDays: z.number().int().min(1).max(365),
  minimumPayoutAmount: z.number().positive(),
});

type SettingsFormValues = z.infer<typeof settingsFormSchema>;

interface PlatformSettingsFormProps {
  initialSettings: any;
}

export function PlatformSettingsForm({ initialSettings }: PlatformSettingsFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsFormSchema),
    defaultValues: {
      organizationName: initialSettings.organizationName,
      supportEmail: initialSettings.supportEmail,
      contactPhone: initialSettings.contactPhone,
      bkashNumber: initialSettings.bkashNumber,
      bkashType: initialSettings.bkashType,
      bkashInstructions: initialSettings.bkashInstructions,
      defaultAttributionDays: initialSettings.defaultAttributionDays,
      minimumPayoutAmount: Number(initialSettings.minimumPayoutAmount),
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to save settings");
      }

      toast.success("Platform settings saved and audit logged!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1.5">
            Organization Name
          </label>
          <input
            type="text"
            {...register("organizationName")}
            className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
          />
          {errors.organizationName && (
            <p className="text-[11px] text-[#DC2626] mt-1">{errors.organizationName.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1.5">
            Support Email
          </label>
          <input
            type="email"
            {...register("supportEmail")}
            className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
          />
          {errors.supportEmail && (
            <p className="text-[11px] text-[#DC2626] mt-1">{errors.supportEmail.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1.5">
            bKash Receiving Account Number <span className="text-[#E53945]">*</span>
          </label>
          <input
            type="text"
            placeholder="017XXXXXXXX"
            {...register("bkashNumber")}
            className="w-full px-3.5 py-2.5 text-xs font-mono font-bold border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
          />
          {errors.bkashNumber && (
            <p className="text-[11px] text-[#DC2626] mt-1">{errors.bkashNumber.message}</p>
          )}
          <p className="text-[11px] text-[#64748B] mt-1">
            Displayed on the checkout screen for students. Not hardcoded.
          </p>
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1.5">
            bKash Account Type
          </label>
          <select
            {...register("bkashType")}
            className="w-full px-3.5 py-2.5 text-xs border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:border-[#2563EB]"
          >
            <option value={PaymentMethod.BKASH_MERCHANT}>Make Payment (Merchant)</option>
            <option value={PaymentMethod.BKASH_SEND_MONEY}>Send Money (Personal)</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-[#172033] mb-1.5">
          Step-by-Step bKash Payment Instructions
        </label>
        <textarea
          rows={5}
          {...register("bkashInstructions")}
          className="w-full px-3.5 py-2.5 text-xs font-mono border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
        />
        {errors.bkashInstructions && (
          <p className="text-[11px] text-[#DC2626] mt-1">{errors.bkashInstructions.message}</p>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1.5">
            Default Affiliate Cookie Attribution Window (Days)
          </label>
          <input
            type="number"
            {...register("defaultAttributionDays", { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 text-xs font-bold border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
          />
          {errors.defaultAttributionDays && (
            <p className="text-[11px] text-[#DC2626] mt-1">{errors.defaultAttributionDays.message}</p>
          )}
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1.5">
            Minimum Marketer Payout Amount (BDT)
          </label>
          <input
            type="number"
            {...register("minimumPayoutAmount", { valueAsNumber: true })}
            className="w-full px-3.5 py-2.5 text-xs font-bold border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
          />
          {errors.minimumPayoutAmount && (
            <p className="text-[11px] text-[#DC2626] mt-1">{errors.minimumPayoutAmount.message}</p>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-[#E2E8F0] flex items-center justify-end">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] disabled:opacity-50 rounded-xl shadow-xs transition-all"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Saving Changes...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Save Configuration</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
