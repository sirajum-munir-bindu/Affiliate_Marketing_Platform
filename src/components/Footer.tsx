import Link from "next/link";
import { ShieldCheck, Phone, Mail, MapPin } from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";

export function Footer() {
  return (
    <footer className="bg-[#172033] text-white border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4">
            <BrandLogo size="md" variant="dark-bg" href="/" />
            <p className="text-xs text-slate-400 leading-relaxed">
              Bangladesh’s premier course publishing & affiliate marketing ecosystem.
              Empowering students with industry skills and rewarding affiliates with transparent bKash payouts.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-3 py-1.5 rounded-lg w-fit">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Manual bKash Verification Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Explore Courses
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/courses?category=Software+Development" className="hover:text-white transition-colors">
                  Web & Software Engineering
                </Link>
              </li>
              <li>
                <Link href="/courses?category=Digital+Marketing" className="hover:text-white transition-colors">
                  Affiliate Marketing & Funnels
                </Link>
              </li>
              <li>
                <Link href="/courses?category=UI/UX+Design" className="hover:text-white transition-colors">
                  UI/UX & Product Design
                </Link>
              </li>
              <li>
                <Link href="/courses" className="hover:text-white transition-colors">
                  View All Courses
                </Link>
              </li>
            </ul>
          </div>

          {/* Affiliate Program */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Affiliate Program
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li>
                <Link href="/affiliate" className="hover:text-[#2563EB] transition-colors">
                  Become an Approved Marketer
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-[#2563EB] transition-colors">
                  30-Day Attribution Rules
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-white transition-colors">
                  Marketer Dashboard Login
                </Link>
              </li>
              <li>
                <Link href="/how-it-works#payouts" className="hover:text-white transition-colors">
                  bKash Payout Policy
                </Link>
              </li>
            </ul>
          </div>

          {/* Support & Contact */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300 mb-4">
              Support & Verification
            </h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>support@coursecraft.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#E53945]" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-slate-500" />
                <span>Dhaka, Bangladesh</span>
              </li>
            </ul>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-500">
              Manual verification operates 9:00 AM – 11:00 PM BST daily.
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} Skill.jobs Affiliation. All rights reserved.</p>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-slate-400">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-slate-400">Privacy Policy</Link>
            <Link href="/how-it-works" className="hover:text-slate-400">Affiliate Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
