"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ArrowRight, LogOut, LayoutDashboard, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { BrandLogo } from "@/components/BrandLogo";

interface UserState {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "MARKETER" | "STUDENT";
  marketerStatus?: string | null;
}

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<UserState | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  const getDashboardHref = () => {
    if (!user) return "/login";
    if (user.role === "ADMIN") return "/admin";
    if (user.role === "MARKETER" || user.marketerStatus) return "/marketer";
    return "/student";
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#E2E8F0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <BrandLogo size="md" href="/" />

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-[#64748B]">
            <Link
              href="/"
              className={`hover:text-[#E53945] transition-colors ${
                pathname === "/" ? "text-[#E53945]" : ""
              }`}
            >
              Home
            </Link>
            <Link
              href="/courses"
              className={`hover:text-[#E53945] transition-colors ${
                pathname.startsWith("/courses") ? "text-[#E53945]" : ""
              }`}
            >
              All Courses
            </Link>
            <Link
              href="/affiliate"
              className={`hover:text-[#2563EB] transition-colors flex items-center gap-1.5 ${
                pathname === "/affiliate" ? "text-[#2563EB]" : ""
              }`}
            >
              <UserCheck className="w-4 h-4 text-[#2563EB]" />
              Marketer Program
            </Link>
            <Link
              href="/how-it-works"
              className={`hover:text-[#172033] transition-colors ${
                pathname === "/how-it-works" ? "text-[#172033]" : ""
              }`}
            >
              How It Works
            </Link>
          </nav>

          {/* Right Action / Auth */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="w-20 h-8 bg-slate-100 rounded-lg animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <Link
                  href={getDashboardHref()}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold bg-[#F8FAFC] border border-[#E2E8F0] hover:border-[#2563EB] text-[#172033] rounded-lg transition-colors"
                >
                  <LayoutDashboard className="w-3.5 h-3.5 text-[#2563EB]" />
                  <span>
                    {user.role === "ADMIN"
                      ? "Admin Panel"
                      : user.role === "MARKETER"
                      ? "Marketer Portal"
                      : "Student Portal"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-[#64748B] hover:text-[#E53945] hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="text-sm font-semibold text-[#172033] hover:text-[#2563EB] px-3 py-1.5 transition-colors"
                >
                  Log In
                </Link>
                <Link
                  href="/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] rounded-lg shadow-sm transition-all"
                >
                  Get Started
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
