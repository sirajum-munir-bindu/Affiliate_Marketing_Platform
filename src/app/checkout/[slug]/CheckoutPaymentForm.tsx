"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { PaymentMethod } from "@prisma/client";
import { isValidTransactionId, isValidBdPhoneNumber } from "@/lib/bkash";
import { Loader2, ArrowRight } from "lucide-react";

const paymentFormSchema = z.object({
  senderNumber: z
    .string()
    .min(11, "Must be an 11-digit Bangladeshi mobile number")
    .refine((val) => isValidBdPhoneNumber(val), "Invalid Bangladeshi bKash number (e.g. 01712345678)"),
  transactionId: z
    .string()
    .min(8, "Transaction ID must be at least 8 characters")
    .refine((val) => isValidTransactionId(val), "Invalid bKash TrxID. Must be 8-15 alphanumeric characters."),
  amount: z.number().positive(),
  paymentMethod: z.nativeEnum(PaymentMethod),
  note: z.string().optional(),
});

type PaymentFormValues = z.infer<typeof paymentFormSchema>;

interface CheckoutPaymentFormProps {
  orderId: string;
  orderNumber: string;
  courseFee: number;
  defaultPaymentMethod: PaymentMethod;
}

export function CheckoutPaymentForm({
  orderId,
  orderNumber,
  courseFee,
  defaultPaymentMethod,
}: CheckoutPaymentFormProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      senderNumber: "",
      transactionId: "",
      amount: courseFee,
      paymentMethod: defaultPaymentMethod || PaymentMethod.BKASH_SEND_MONEY,
      note: "",
    },
  });

  const onSubmit = async (data: PaymentFormValues) => {
    setSubmitting(true);
    try {
      const res = await fetch("/api/payments/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId,
          senderNumber: data.senderNumber,
          transactionId: data.transactionId,
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          note: data.note,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Payment submission failed");
      }

      toast.success("Payment submitted successfully!");
      router.push(`/orders/${orderNumber}`);
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payment details");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Sender bKash Number */}
      <div>
        <label className="block text-xs font-bold text-[#172033] mb-1.5">
          Your Sender bKash Mobile Number <span className="text-[#E53945]">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. 01712345678"
          {...register("senderNumber")}
          className={`w-full px-4 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-1 ${
            errors.senderNumber
              ? "border-[#DC2626] focus:ring-[#DC2626]"
              : "border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
          }`}
        />
        {errors.senderNumber && (
          <p className="text-[11px] text-[#DC2626] mt-1 font-medium">
            {errors.senderNumber.message}
          </p>
        )}
      </div>

      {/* Transaction ID */}
      <div>
        <label className="block text-xs font-bold text-[#172033] mb-1.5">
          bKash Transaction ID (TrxID) <span className="text-[#E53945]">*</span>
        </label>
        <input
          type="text"
          placeholder="e.g. BL12A34B5C"
          {...register("transactionId")}
          onChange={(e) => {
            // Auto uppercase
            setValue("transactionId", e.target.value.toUpperCase());
          }}
          className={`w-full px-4 py-2.5 text-xs font-mono tracking-wider border rounded-xl focus:outline-none focus:ring-1 ${
            errors.transactionId
              ? "border-[#DC2626] focus:ring-[#DC2626]"
              : "border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
          }`}
        />
        {errors.transactionId && (
          <p className="text-[11px] text-[#DC2626] mt-1 font-medium">
            {errors.transactionId.message}
          </p>
        )}
        <p className="text-[11px] text-[#64748B] mt-1">
          Found in your bKash SMS confirmation or the bKash app transaction history.
        </p>
      </div>

      {/* Amount Sent (Read-only / verified) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1.5">
            Amount Sent (BDT)
          </label>
          <input
            type="number"
            readOnly
            value={courseFee}
            className="w-full px-4 py-2.5 text-xs bg-slate-50 border border-[#E2E8F0] rounded-xl text-[#172033] font-bold"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-[#172033] mb-1.5">
            bKash Payment Method Used
          </label>
          <select
            {...register("paymentMethod")}
            className="w-full px-4 py-2.5 text-xs border border-[#E2E8F0] rounded-xl bg-white focus:outline-none focus:border-[#2563EB]"
          >
            <option value={PaymentMethod.BKASH_SEND_MONEY}>Send Money (Personal)</option>
            <option value={PaymentMethod.BKASH_MERCHANT}>Make Payment (Merchant)</option>
          </select>
        </div>
      </div>

      {/* Optional Note / Reference */}
      <div>
        <label className="block text-xs font-bold text-[#172033] mb-1.5">
          Payment Reference / Note (Optional)
        </label>
        <input
          type="text"
          placeholder="e.g. Paid from personal account"
          {...register("note")}
          className="w-full px-4 py-2.5 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
        />
      </div>

      {/* Submit Button */}
      <div className="pt-4 border-t border-[#E2E8F0]">
        <button
          type="submit"
          disabled={submitting}
          className="w-full inline-flex items-center justify-center gap-2 py-3 px-6 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] disabled:opacity-50 rounded-xl shadow-md transition-all"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying Submission...</span>
            </>
          ) : (
            <>
              <span>Submit Payment for Verification</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
