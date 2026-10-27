"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrencyBDT } from "@/lib/bkash";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { Check, X, Loader2, Wallet } from "lucide-react";

interface PayoutRecord {
  id: string;
  payoutNumber: string;
  requestedAmount: any;
  status: string;
  recipientPhone: string;
  transactionReference: string | null;
  rejectionReason: string | null;
  createdAt: any;
  marketer: {
    referralCode: string;
    user: {
      name: string;
      email: string;
    };
  };
}

interface PayoutSettlementTableProps {
  payouts: PayoutRecord[];
}

export function PayoutSettlementTable({ payouts }: PayoutSettlementTableProps) {
  const router = useRouter();
  const [selectedPayout, setSelectedPayout] = useState<PayoutRecord | null>(null);
  const [actionType, setActionType] = useState<"SETTLE" | "REJECT" | null>(null);
  const [trxRef, setTrxRef] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpen = (p: PayoutRecord, act: "SETTLE" | "REJECT") => {
    setSelectedPayout(p);
    setActionType(act);
    setTrxRef("");
    setRejectionReason("");
    setAdminNote("");
  };

  const handleClose = () => {
    setSelectedPayout(null);
    setActionType(null);
  };

  const handleConfirm = async () => {
    if (!selectedPayout || !actionType) return;

    if (actionType === "SETTLE" && !trxRef.trim()) {
      toast.error("Please enter the bKash TrxID of your transfer to the marketer.");
      return;
    }

    if (actionType === "REJECT" && !rejectionReason.trim()) {
      toast.error("Please enter a reason for rejecting this payout.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/admin/payouts/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payoutId: selectedPayout.id,
          action: actionType,
          transactionReference: trxRef.trim(),
          rejectionReason: rejectionReason.trim(),
          adminNote: adminNote.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to process payout");
      }

      toast.success(json.message || "Payout processed successfully!");
      handleClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to process payout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
              <th className="pb-3">Payout Ref</th>
              <th className="pb-3">Marketer</th>
              <th className="pb-3">Recipient bKash</th>
              <th className="pb-3">Amount</th>
              <th className="pb-3">Settlement TrxID</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {payouts.map((p) => {
              const isRequested = p.status === "REQUESTED";
              return (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4 font-mono font-bold text-[#172033]">
                    {p.payoutNumber}
                  </td>

                  <td className="py-4">
                    <p className="font-bold text-[#172033]">{p.marketer.user.name}</p>
                    <p className="text-[11px] text-[#2563EB] font-mono">
                      {p.marketer.referralCode}
                    </p>
                  </td>

                  <td className="py-4 font-mono font-medium text-[#172033]">
                    {p.recipientPhone}
                  </td>

                  <td className="py-4 font-black text-[#172033]">
                    {formatCurrencyBDT(Number(p.requestedAmount))}
                  </td>

                  <td className="py-4 font-mono text-emerald-700">
                    {p.transactionReference || "Pending"}
                  </td>

                  <td className="py-4">
                    <StatusBadge status={p.status} size="sm" />
                  </td>

                  <td className="py-4 text-right">
                    {isRequested ? (
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpen(p, "SETTLE")}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Mark Paid</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpen(p, "REJECT")}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-lg transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">Completed</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {selectedPayout && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="font-bold text-base text-[#172033]">
              {actionType === "SETTLE" ? "Confirm Payout Settlement" : "Reject Payout Request"}
            </h3>

            <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] text-xs space-y-1">
              <p><strong>Payout Number:</strong> {selectedPayout.payoutNumber}</p>
              <p><strong>Marketer:</strong> {selectedPayout.marketer.user.name}</p>
              <p><strong>Recipient bKash:</strong> <span className="font-mono font-bold text-[#E53945]">{selectedPayout.recipientPhone}</span></p>
              <p><strong>Amount Payable:</strong> {formatCurrencyBDT(Number(selectedPayout.requestedAmount))}</p>
            </div>

            {actionType === "SETTLE" ? (
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  bKash Payment TrxID (From your transfer to the marketer) <span className="text-[#E53945]">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. BL99XX1122"
                  value={trxRef}
                  onChange={(e) => setTrxRef(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 text-xs font-mono uppercase border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
                />
              </div>
            ) : (
              <div>
                <label className="block text-xs font-bold text-[#172033] mb-1">
                  Rejection Reason <span className="text-[#E53945]">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. Invalid recipient bKash account number..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#DC2626]"
                />
              </div>
            )}

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#172033]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={loading}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl transition-colors inline-flex items-center gap-1.5 ${
                  actionType === "SETTLE"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-[#E53945] hover:bg-[#CC2B37]"
                }`}
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm {actionType === "SETTLE" ? "Payment Settlement" : "Rejection"}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
