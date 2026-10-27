"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  BookOpen,
  ShoppingBag,
  Wallet,
  Settings,
  ClipboardList,
  ExternalLink,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

interface AdminSidebarProps {
  pendingPaymentCount?: number;
  pendingMarketerCount?: number;
  pendingPayoutCount?: number;
}

export function AdminSidebar({
  pendingPaymentCount = 0,
  pendingMarketerCount = 0,
  pendingPayoutCount = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();

  const links = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    {
      href: "/admin/payments",
      label: "Payment Reviews",
      icon: CreditCard,
      badge: pendingPaymentCount > 0 ? pendingPaymentCount : null,
      badgeColor: "bg-amber-500",
    },
    {
      href: "/admin/marketers",
      label: "Marketers",
      icon: Users,
      badge: pendingMarketerCount > 0 ? pendingMarketerCount : null,
      badgeColor: "bg-blue-500",
    },
    { href: "/admin/courses", label: "Courses", icon: BookOpen },
    { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
    {
      href: "/admin/payouts",
      label: "Payouts",
      icon: Wallet,
      badge: pendingPayoutCount > 0 ? pendingPayoutCount : null,
      badgeColor: "bg-red-500",
    },
    { href: "/admin/settings", label: "Platform Settings", icon: Settings },
    { href: "/admin/audit", label: "Audit Logs", icon: ClipboardList },
  ];

  return (
    <aside className="w-64 bg-[#172033] text-white flex-shrink-0 flex flex-col justify-between p-5 min-h-screen">
      <div>
        {/* Brand */}
        <div className="mb-6 pb-5 border-b border-slate-800">
          <BrandLogo size="md" variant="dark-bg" href="/admin" />
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#2563EB] block mt-2 px-1">
            Admin Command Center
          </span>
        </div>

        {/* Links */}
        <nav className="space-y-1.5">
          {links.map((link) => {
            const isActive =
              link.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(link.href);
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? "bg-[#2563EB] text-white shadow-sm"
                    : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </div>
                {link.badge && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full text-white ${link.badgeColor}`}
                  >
                    {link.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="pt-6 border-t border-slate-800">
        <Link
          href="/"
          target="_blank"
          className="flex items-center gap-2 text-xs text-slate-400 hover:text-white transition-colors"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>View Public Website</span>
        </Link>
      </div>
    </aside>
  );
}
