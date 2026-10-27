import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "Skill.jobs Affiliation | Course Affiliate Marketing Platform",
  description: "Learn premium in-demand skills and earn industry-leading affiliate commissions with manual bKash verification.",
  icons: {
    icon: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col bg-white text-[#172033] antialiased">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
