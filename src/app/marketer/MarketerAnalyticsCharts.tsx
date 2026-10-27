"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import { formatCurrencyBDT } from "@/lib/bkash";

interface MarketerAnalyticsChartsProps {
  clicks: any[];
  commissions: any[];
}

export function MarketerAnalyticsCharts({
  clicks,
  commissions,
}: MarketerAnalyticsChartsProps) {
  // Aggregate data by last 7 days
  const chartData = useMemo(() => {
    const days: { [key: string]: { date: string; clicks: number; earnings: number } } = {};

    // Seed last 7 days
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(5, 10); // MM-DD
      days[key] = { date: key, clicks: 0, earnings: 0 };
    }

    // Tally clicks
    for (const c of clicks) {
      const key = new Date(c.visitedAt).toISOString().slice(5, 10);
      if (days[key]) {
        days[key].clicks += 1;
      }
    }

    // Tally earnings
    for (const comm of commissions) {
      if (comm.status === "APPROVED" || comm.status === "PAID") {
        const key = new Date(comm.createdAt).toISOString().slice(5, 10);
        if (days[key]) {
          days[key].earnings += Number(comm.commissionAmount);
        }
      }
    }

    return Object.values(days);
  }, [clicks, commissions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Clicks Chart */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#172033] mb-1">
          Recent Referral Clicks (Last 7 Days)
        </h3>
        <p className="text-xs text-[#64748B] mb-4">
          Daily traffic arriving through your tracking links.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#64748B" }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Bar dataKey="clicks" name="Clicks" fill="#2563EB" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Commission Earnings Chart */}
      <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-bold text-[#172033] mb-1">
          Commission Earnings (BDT)
        </h3>
        <p className="text-xs text-[#64748B] mb-4">
          Daily verified affiliate revenue generated.
        </p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="earningsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#E53945" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#E53945" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} />
              <YAxis
                tick={{ fontSize: 11, fill: "#64748B" }}
                tickFormatter={(v) => `৳${v}`}
              />
              <Tooltip
                formatter={(v: any) => [formatCurrencyBDT(v), "Earnings"]}
                contentStyle={{
                  backgroundColor: "#FFFFFF",
                  border: "1px solid #E2E8F0",
                  borderRadius: "12px",
                  fontSize: "12px",
                }}
              />
              <Area
                type="monotone"
                dataKey="earnings"
                stroke="#E53945"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#earningsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
