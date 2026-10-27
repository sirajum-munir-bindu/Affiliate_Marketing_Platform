"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { Check, X, ShieldAlert, RotateCcw, Loader2 } from "lucide-react";

interface MarketerRecord {
  id: string;
  userId: string;
  referralCode: string;
  phone: string;
  socialLinks: string | null;
  applicationReason: string;
  status: string;
  reviewNote: string | null;
  createdAt: any;
  user: {
    name: string;
    email: string;
  };
  _count: {
    affiliateClicks: number;
    attributedOrders: number;
    commissions: number;
    payouts: number;
  };
}

interface MarketerManagementTableProps {
  marketers: MarketerRecord[];
}

export function MarketerManagementTable({ marketers }: MarketerManagementTableProps) {
  const router = useRouter();
  const [selectedMarketer, setSelectedMarketer] = useState<MarketerRecord | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE" | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOpen = (m: MarketerRecord, act: "APPROVE" | "REJECT" | "SUSPEND" | "REACTIVATE") => {
    setSelectedMarketer(m);
    setActionType(act);
    setReviewNote("");
  };

  const handleClose = () => {
    setSelectedMarketer(null);
    setActionType(null);
    setReviewNote("");
  };

  const handleConfirm = async () => {
    if (!selectedMarketer || !actionType) return;

    setLoading(true);
    try {
      const res = await fetch("/api/admin/marketers/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketerId: selectedMarketer.id,
          action: actionType,
          reviewNote: reviewNote.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Failed to update marketer");
      }

      toast.success(json.message || "Marketer status updated!");
      handleClose();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to process review");
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
              <th className="pb-3">Marketer Name</th>
              <th className="pb-3">Referral Code</th>
              <th className="pb-3">Phone & Social</th>
              <th className="pb-3">Reason / Pitch</th>
              <th className="pb-3">Stats</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {marketers.map((m) => (
              <tr key={m.id} className="hover:bg-[#F8FAFC] transition-colors">
                <td className="py-4">
                  <p className="font-bold text-[#172033]">{m.user.name}</p>
                  <p className="text-[11px] text-[#64748B]">{m.user.email}</p>
                </td>

                <td className="py-4 font-mono font-bold text-[#2563EB]">
                  {m.referralCode}
                </td>

                <td className="py-4 text-[#172033]">
                  <p className="font-medium">{m.phone}</p>
                  {m.socialLinks && (
                    <p className="text-[11px] text-slate-500 truncate max-w-xs">{m.socialLinks}</p>
                  )}
                </td>

                <td className="py-4 text-[#64748B] max-w-xs truncate" title={m.applicationReason}>
                  {m.applicationReason}
                </td>

                <td className="py-4 text-[#172033]">
                  <div className="text-[11px] space-y-0.5">
                    <p>Clicks: <strong>{m._count.affiliateClicks}</strong></p>
                    <p>Orders: <strong>{m._count.attributedOrders}</strong></p>
                    <p>Commissions: <strong>{m._count.commissions}</strong></p>
                  </div>
                </td>

                <td className="py-4">
                  <StatusBadge status={m.status} size="sm" />
                </td>

                <td className="py-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {m.status === "PENDING" && (
                      <>
                        <button
                          type="button"
                          onClick={() => handleOpen(m, "APPROVE")}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpen(m, "REJECT")}
                          className="px-2.5 py-1 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-lg transition-colors"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {m.status === "APPROVED" && (
                      <button
                        type="button"
                        onClick={() => handleOpen(m, "SUSPEND")}
                        className="px-2.5 py-1 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors"
                      >
                        Suspend
                      </button>
                    )}

                    {m.status === "SUSPENDED" && (
                      <button
                        type="button"
                        onClick={() => handleOpen(m, "REACTIVATE")}
                        className="px-2.5 py-1 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
                      >
                        Reactivate
                      </button>
                    )}

                    {m.status === "REJECTED" && (
                      <button
                        type="button"
                        onClick={() => handleOpen(m, "APPROVE")}
                        className="px-2.5 py-1 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                      >
                        Re-evaluate
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Action Dialog */}
      {selectedMarketer && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <h3 className="font-bold text-base text-[#172033]">
              Confirm Marketer Action: {actionType}
            </h3>

            <p className="text-xs text-[#64748B]">
              You are modifying the status of <strong>{selectedMarketer.user.name}</strong> ({selectedMarketer.user.email}).
            </p>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1">
                Admin Review Note (Optional)
              </label>
              <textarea
                rows={2}
                placeholder="Reason or feedback for this decision..."
                value={reviewNote}
                onChange={(e) => setReviewNote(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
              />
            </div>

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
                className="px-5 py-2 text-xs font-bold text-white bg-[#2563EB] hover:bg-[#1D4ED8] rounded-xl transition-colors inline-flex items-center gap-1.5"
              >
                {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                <span>Confirm {actionType}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
