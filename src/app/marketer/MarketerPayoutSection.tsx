"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrencyBDT } from "@/lib/bkash";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { Wallet, Loader2, ArrowRight, ShieldCheck, AlertCircle } from "lucide-react";

interface PayoutItem {
  id: string;
  payoutNumber: string;
  requestedAmount: any;
  status: string;
  recipientPhone: string;
  transactionReference: string | null;
  createdAt: any;
}

interface MarketerPayoutSectionProps {
  availableBalance: number;
  minimumPayout: number;
  payouts: PayoutItem[];
  defaultBkashNumber: string;
}

export function MarketerPayoutSection({
  availableBalance,
  minimumPayout,
  payouts,
  defaultBkashNumber,
}: MarketerPayoutSectionProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(availableBalance >= minimumPayout ? availableBalance : minimumPayout);
  const [recipientPhone, setRecipientPhone] = useState(defaultBkashNumber);
  const [submitting, setSubmitting] = useState(false);

  const canRequest = availableBalance >= minimumPayout;

  const handleRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (amount < minimumPayout) {
      toast.error(`Minimum payout is ${formatCurrencyBDT(minimumPayout)}.`);
      return;
    }
    if (amount > availableBalance) {
      toast.error("Requested amount exceeds your available balance.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/marketer/payouts/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestedAmount: amount,
          recipientPhone,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to request payout");
      }

      toast.success(json.message || "Payout request submitted successfully!");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to submit payout request");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-lg font-bold text-[#172033] flex items-center gap-2">
            <Wallet className="w-5 h-5 text-emerald-600" />
            <span>Request bKash Commission Payout</span>
          </h2>
          <p className="text-xs text-[#64748B] mt-0.5">
            Withdraw your earned commissions directly into your personal or merchant bKash wallet.
          </p>
        </div>
      </div>

      {/* Form Card */}
      <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl p-5 mb-8">
        <form onSubmit={handleRequest} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              Withdrawal Amount (BDT)
            </label>
            <input
              type="number"
              min={minimumPayout}
              max={availableBalance}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              disabled={!canRequest}
              className="w-full px-4 py-2.5 text-xs font-bold bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#172033] mb-1.5">
              Recipient bKash Mobile Number
            </label>
            <input
              type="text"
              value={recipientPhone}
              onChange={(e) => setRecipientPhone(e.target.value)}
              disabled={!canRequest}
              placeholder="017XXXXXXXX"
              className="w-full px-4 py-2.5 text-xs bg-white border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={!canRequest || submitting}
              className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] disabled:opacity-40 disabled:hover:bg-[#E53945] rounded-xl shadow-sm transition-all h-[42px]"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <span>Request Payout</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {!canRequest && (
          <div className="mt-3 flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>
              Your available balance ({formatCurrencyBDT(availableBalance)}) is below the minimum threshold of {formatCurrencyBDT(minimumPayout)}. Continue promoting courses to request a payout!
            </span>
          </div>
        )}
      </div>

      {/* Payout History Table */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] mb-3">
          Payout Request History
        </h3>

        {payouts.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#64748B] border border-dashed rounded-xl">
            No payout requests made yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
                  <th className="pb-3">Payout Ref</th>
                  <th className="pb-3">Amount</th>
                  <th className="pb-3">bKash Recipient</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Disbursement TrxID</th>
                  <th className="pb-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8F0]">
                {payouts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#F8FAFC]">
                    <td className="py-3 font-mono font-bold text-[#172033]">{p.payoutNumber}</td>
                    <td className="py-3 font-black text-[#172033]">
                      {formatCurrencyBDT(Number(p.requestedAmount))}
                    </td>
                    <td className="py-3 font-mono text-[#64748B]">{p.recipientPhone}</td>
                    <td className="py-3">
                      <StatusBadge status={p.status} size="sm" />
                    </td>
                    <td className="py-3 font-mono text-[#2563EB]">
                      {p.transactionReference || "Pending manual transfer"}
                    </td>
                    <td className="py-3 text-right text-slate-500">
                      {new Date(p.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
