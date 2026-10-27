"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Loader2, Lock, Mail } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Login failed");
      }

      toast.success(`Welcome back, ${json.user.name}!`);

      if (redirectUrl && redirectUrl !== "/") {
        router.push(redirectUrl);
      } else if (json.user.role === "ADMIN") {
        router.push("/admin");
      } else if (json.user.role === "MARKETER" || json.user.marketerStatus) {
        router.push("/marketer");
      } else {
        router.push("/student");
      }

      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-[#172033] mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <input
            type="email"
            placeholder="name@example.com"
            {...register("email")}
            className={`w-full pl-9 pr-4 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-1 ${
              errors.email
                ? "border-[#DC2626] focus:ring-[#DC2626]"
                : "border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
            }`}
          />
          <Mail className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
        </div>
        {errors.email && (
          <p className="text-[11px] text-[#DC2626] mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold text-[#172033]">
            Password
          </label>
        </div>
        <div className="relative">
          <input
            type="password"
            placeholder="••••••••"
            {...register("password")}
            className={`w-full pl-9 pr-4 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-1 ${
              errors.password
                ? "border-[#DC2626] focus:ring-[#DC2626]"
                : "border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
            }`}
          />
          <Lock className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
        </div>
        {errors.password && (
          <p className="text-[11px] text-[#DC2626] mt-1">{errors.password.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-[#E53945] hover:bg-[#CC2B37] disabled:opacity-50 rounded-xl shadow-sm transition-all"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Signing In...</span>
          </>
        ) : (
          <>
            <span>Sign In</span>
            <ArrowRight className="w-4 h-4" />
          </>
        )}
      </button>
    </form>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo size="lg" href="/" />
          </div>
          <h2 className="text-xl font-bold text-[#172033]">Sign in to your account</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Access your courses, affiliate tracking links, and commissions.
          </p>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
          <Suspense fallback={<div className="h-40 flex items-center justify-center text-xs text-slate-400">Loading form...</div>}>
            <LoginForm />
          </Suspense>

          <div className="mt-6 pt-5 border-t border-[#E2E8F0] text-xs text-[#64748B] bg-[#F8FAFC] p-3 rounded-xl space-y-1">
            <p className="font-bold text-[#172033] text-[11px] uppercase tracking-wider">
              Platform Demo Logins:
            </p>
            <p className="text-[11px]">Admin: <code className="text-[#2563EB] font-bold">admin@platform.com</code> / <code className="text-slate-600">AdminSecurePassword123!</code></p>
            <p className="text-[11px]">Marketer: <code className="text-[#2563EB] font-bold">marketer@platform.com</code> / <code className="text-slate-600">Marketer123!</code></p>
            <p className="text-[11px]">Student: <code className="text-[#2563EB] font-bold">student@platform.com</code> / <code className="text-slate-600">Student123!</code></p>
          </div>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-bold text-[#2563EB] hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
