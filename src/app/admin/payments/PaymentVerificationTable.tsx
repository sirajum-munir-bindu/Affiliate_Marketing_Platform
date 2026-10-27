"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatCurrencyBDT } from "@/lib/bkash";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { toast } from "sonner";
import { Check, X, Loader2, AlertCircle, FileText } from "lucide-react";

interface PaymentRecord {
  id: string;
  transactionId: string;
  senderNumber: string;
  amount: any;
  status: string;
  paymentMethod: string;
  note: string | null;
  rejectionReason: string | null;
  createdAt: any;
  order: {
    id: string;
    orderNumber: string;
    amount: any;
    customer: {
      id: string;
      name: string;
      email: string;
      phone: string | null;
    };
    course: {
      id: string;
      title: string;
      price: any;
      commissionRate: any;
    };
    affiliate?: {
      user: {
        name: string;
        email: string;
      };
    } | null;
  };
  reviewedBy?: {
    name: string;
  } | null;
}

interface PaymentVerificationTableProps {
  payments: PaymentRecord[];
}

export function PaymentVerificationTable({ payments }: PaymentVerificationTableProps) {
  const router = useRouter();
  const [selectedPayment, setSelectedPayment] = useState<PaymentRecord | null>(null);
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [internalNote, setInternalNote] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleOpenAction = (payment: PaymentRecord, action: "APPROVE" | "REJECT") => {
    setSelectedPayment(payment);
    setActionType(action);
    setRejectionReason("");
    setInternalNote("");
  };

  const handleCloseModal = () => {
    setSelectedPayment(null);
    setActionType(null);
    setRejectionReason("");
    setInternalNote("");
  };

  const handleConfirmAction = async () => {
    if (!selectedPayment || !actionType) return;

    if (actionType === "REJECT" && !rejectionReason.trim()) {
      toast.error("Please enter a reason for rejecting the payment.");
      return;
    }

    setProcessing(true);
    try {
      const res = await fetch("/api/admin/payments/review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId: selectedPayment.id,
          action: actionType,
          rejectionReason: rejectionReason.trim(),
          internalNote: internalNote.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Payment verification failed");
      }

      toast.success(
        actionType === "APPROVE"
          ? "Payment approved! Enrollment and commission generated."
          : "Payment rejected and customer notified."
      );

      handleCloseModal();
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to process payment review");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E2E8F0] text-[#64748B] uppercase tracking-wider font-bold">
              <th className="pb-3">TrxID & Method</th>
              <th className="pb-3">Order Ref</th>
              <th className="pb-3">Customer</th>
              <th className="pb-3">Course</th>
              <th className="pb-3">Submitted Fee</th>
              <th className="pb-3">Attributed Marketer</th>
              <th className="pb-3">Status</th>
              <th className="pb-3 text-right">Verification Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E2E8F0]">
            {payments.map((p) => {
              const isSubmitted = p.status === "SUBMITTED";
              return (
                <tr key={p.id} className="hover:bg-[#F8FAFC] transition-colors">
                  <td className="py-4">
                    <span className="font-mono font-bold text-[#172033] block">
                      {p.transactionId}
                    </span>
                    <span className="text-[11px] text-[#64748B]">
                      {p.senderNumber} • {p.paymentMethod.replace("_", " ")}
                    </span>
                  </td>

                  <td className="py-4 font-mono font-semibold text-[#172033]">
                    {p.order.orderNumber}
                  </td>

                  <td className="py-4">
                    <p className="font-bold text-[#172033]">{p.order.customer.name}</p>
                    <p className="text-[11px] text-[#64748B]">{p.order.customer.email}</p>
                  </td>

                  <td className="py-4 font-medium text-[#172033] max-w-xs truncate">
                    {p.order.course.title}
                  </td>

                  <td className="py-4">
                    <span className="font-black text-[#172033]">
                      {formatCurrencyBDT(Number(p.amount))}
                    </span>
                  </td>

                  <td className="py-4 text-[#64748B]">
                    {p.order.affiliate ? (
                      <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        {p.order.affiliate.user.name} ({Number(p.order.course.commissionRate)}%)
                      </span>
                    ) : (
                      <span className="text-slate-400">Direct (None)</span>
                    )}
                  </td>

                  <td className="py-4">
                    <StatusBadge status={p.status} size="sm" />
                  </td>

                  <td className="py-4 text-right">
                    {isSubmitted ? (
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => handleOpenAction(p, "APPROVE")}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenAction(p, "REJECT")}
                          className="px-3 py-1.5 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-lg shadow-xs transition-colors flex items-center gap-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Processed
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Approval / Rejection Modal */}
      {selectedPayment && actionType && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-[#E2E8F0] space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
              <h3 className="font-black text-base text-[#172033]">
                {actionType === "APPROVE" ? "Confirm Payment Approval" : "Reject Payment Submission"}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[#F8FAFC] p-4 rounded-xl border border-[#E2E8F0] text-xs space-y-1">
              <p><strong>Order ID:</strong> {selectedPayment.order.orderNumber}</p>
              <p><strong>bKash TrxID:</strong> <span className="font-mono font-bold text-[#2563EB]">{selectedPayment.transactionId}</span></p>
              <p><strong>Sender Phone:</strong> {selectedPayment.senderNumber}</p>
              <p><strong>Amount:</strong> {formatCurrencyBDT(Number(selectedPayment.amount))}</p>
              <p><strong>Student:</strong> {selectedPayment.order.customer.name} ({selectedPayment.order.customer.email})</p>
            </div>

            {actionType === "APPROVE" ? (
              <div className="text-xs text-slate-600 space-y-2">
                <p>
                  Approving this bKash transaction will:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-slate-700 font-medium">
                  <li>Mark the order as PAID</li>
                  <li>Unlock course access immediately for the student</li>
                  {selectedPayment.order.affiliate && (
                    <li>Create an eligible affiliate commission snapshot</li>
                  )}
                  <li>Record your admin identity and timestamp in the immutable audit log</li>
                </ul>

                <div className="mt-4">
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    Internal Verification Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Verified on merchant statement at 2:45 PM"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    Rejection Reason (Visible to Customer) <span className="text-[#E53945]">*</span>
                  </label>
                  <textarea
                    rows={3}
                    placeholder="e.g. Transaction ID could not be found in our bKash statement. Please recheck your TrxID and resubmit."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#DC2626]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#172033] mb-1">
                    Internal Admin Note (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Checked statement between 1:00 PM and 3:00 PM - no match"
                    value={internalNote}
                    onChange={(e) => setInternalNote(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-[#E2E8F0] rounded-xl focus:outline-none focus:border-[#2563EB]"
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#E2E8F0] flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={processing}
                className="px-4 py-2 text-xs font-bold text-[#64748B] hover:text-[#172033]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                disabled={processing}
                className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-xs transition-colors inline-flex items-center gap-1.5 ${
                  actionType === "APPROVE"
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-[#E53945] hover:bg-[#CC2B37]"
                }`}
              >
                {processing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <span>Confirm {actionType === "APPROVE" ? "Approval" : "Rejection"}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
