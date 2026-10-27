import React from "react";

interface StatusBadgeProps {
  status: string;
  size?: "sm" | "md";
}

export function StatusBadge({ status, size = "md" }: StatusBadgeProps) {
  const normalized = status.toUpperCase();

  let colorClasses = "bg-slate-100 text-slate-700 border-slate-200";

  switch (normalized) {
    case "APPROVED":
    case "PAID":
    case "PUBLISHED":
    case "ACTIVE":
      colorClasses = "bg-green-50 text-green-700 border-green-200";
      break;

    case "SUBMITTED":
    case "PENDING":
    case "PENDING_PAYMENT":
    case "PAYMENT_REVIEW":
    case "REQUESTED":
    case "PROCESSING":
      colorClasses = "bg-amber-50 text-amber-700 border-amber-200";
      break;

    case "REJECTED":
    case "CANCELLED":
    case "SUSPENDED":
    case "REVERSED":
      colorClasses = "bg-red-50 text-red-700 border-red-200";
      break;

    case "DRAFT":
    case "ARCHIVED":
      colorClasses = "bg-slate-100 text-slate-600 border-slate-200";
      break;
  }

  const sizeClasses = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs font-semibold";

  return (
    <span
      className={`inline-flex items-center rounded-full border tracking-wide uppercase font-medium ${sizeClasses} ${colorClasses}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {normalized.replace(/_/g, " ")}
    </span>
  );
}
