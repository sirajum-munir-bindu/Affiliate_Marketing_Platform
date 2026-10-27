import React from "react";
import { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  subtext?: string;
  icon: LucideIcon;
  variant?: "blue" | "red" | "green" | "amber";
}

export function StatsCard({
  title,
  value,
  subtext,
  icon: Icon,
  variant = "blue",
}: StatsCardProps) {
  const iconBgMap = {
    blue: "bg-blue-50 text-[#2563EB]",
    red: "bg-red-50 text-[#E53945]",
    green: "bg-green-50 text-emerald-600",
    amber: "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white border border-[#E2E8F0] rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-[#172033] mt-1.5">{value}</p>
        </div>
        <div className={`p-3 rounded-xl ${iconBgMap[variant]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      {subtext && (
        <p className="text-xs text-[#64748B] mt-3 border-t border-[#E2E8F0] pt-2">
          {subtext}
        </p>
      )}
    </div>
  );
}
