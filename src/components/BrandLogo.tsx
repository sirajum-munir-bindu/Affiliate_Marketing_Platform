import Image from "next/image";
import Link from "next/link";

interface BrandLogoProps {
  className?: string;
  variant?: "default" | "dark-bg";
  size?: "sm" | "md" | "lg";
  href?: string;
}

export function BrandLogo({
  className = "",
  variant = "default",
  size = "md",
  href = "/",
}: BrandLogoProps) {
  // Dimension presets based on size (original logo aspect ratio is approx 3:1 ~ 2.8:1)
  const sizeMap = {
    sm: { width: 140, height: 48, imgClass: "h-9 w-auto" },
    md: { width: 180, height: 62, imgClass: "h-11 w-auto" },
    lg: { width: 220, height: 76, imgClass: "h-14 w-auto" },
  };

  const { width, height, imgClass } = sizeMap[size];

  const content = (
    <div
      className={`inline-flex items-center transition-transform hover:scale-[1.02] ${
        variant === "dark-bg"
          ? "bg-white/95 px-3 py-1.5 rounded-xl shadow-xs border border-white/20"
          : ""
      } ${className}`}
    >
      <img
        src="/logo.png"
        alt="Skill.jobs Affiliation"
        className={`object-contain ${imgClass}`}
      />
    </div>
  );

  if (href) {
    return <Link href={href} className="inline-block">{content}</Link>;
  }

  return content;
}
