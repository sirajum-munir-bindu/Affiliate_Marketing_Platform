"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowRight, Loader2, Lock, Mail, User, Phone } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address").toLowerCase(),
  phone: z.string().min(11, "Valid phone number required"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const json = await res.json();
      if (!res.ok) {
        throw new Error(json.error || "Registration failed");
      }

      toast.success("Account created successfully!");
      router.push("/courses");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-[#F8FAFC] px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <BrandLogo size="lg" href="/" />
          </div>
          <h2 className="text-xl font-bold text-[#172033]">Create your student account</h2>
          <p className="text-xs text-[#64748B] mt-1">
            Enroll in top courses and learn from verified practitioners.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white border border-[#E2E8F0] rounded-2xl p-6 sm:p-8 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. Ayesha Siddiqua"
                  {...register("name")}
                  className={`w-full pl-9 pr-4 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-1 ${
                    errors.name
                      ? "border-[#DC2626] focus:ring-[#DC2626]"
                      : "border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
                  }`}
                />
                <User className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
              </div>
              {errors.name && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.name.message}</p>
              )}
            </div>

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
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                bKash Mobile Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="017XXXXXXXX"
                  {...register("phone")}
                  className={`w-full pl-9 pr-4 py-2.5 text-xs border rounded-xl focus:outline-none focus:ring-1 ${
                    errors.phone
                      ? "border-[#DC2626] focus:ring-[#DC2626]"
                      : "border-[#E2E8F0] focus:border-[#2563EB] focus:ring-[#2563EB]"
                  }`}
                />
                <Phone className="w-4 h-4 text-[#64748B] absolute left-3 top-3" />
              </div>
              {errors.phone && (
                <p className="text-[11px] text-[#DC2626] mt-1">{errors.phone.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#172033] mb-1.5">
                Create Password
              </label>
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
                  <span>Creating Account...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-[#64748B]">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-[#2563EB] hover:underline">
              Log in instead
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
