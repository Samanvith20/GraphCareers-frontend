import { cn } from "@/lib/utils";

export const PLATFORM_CONFIG = {
  linkedin: { label: "LinkedIn", bg: "bg-[#0A66C2]/10", text: "text-[#0A66C2]", border: "border-[#0A66C2]/20" },
  instahyre: { label: "Instahyre", bg: "bg-[#1da1f2]/10", text: "text-[#1da1f2]", border: "border-[#1da1f2]/20" },
  naukri: { label: "Naukri", bg: "bg-[#FF7A59]/10", text: "text-[#FF7A59]", border: "border-[#FF7A59]/20" },
  foundit: { label: "Foundit", bg: "bg-[#6c63ff]/10", text: "text-[#6c63ff]", border: "border-[#6c63ff]/20" },
  wellfound: { label: "Wellfound", bg: "bg-red-500/10", text: "text-red-400", border: "border-red-500/20" },
  indeed: { label: "Indeed", bg: "bg-[#003A9B]/10", text: "text-[#4b7deb]", border: "border-[#003A9B]/20" },
  greenhouse: { label: "Greenhouse", bg: "bg-emerald-500/10", text: "text-emerald-400", border: "border-emerald-500/20" },
  lever: { label: "Lever", bg: "bg-zinc-500/10", text: "text-zinc-300", border: "border-zinc-500/20" },
  other: { label: "Other", bg: "bg-zinc-700/20", text: "text-zinc-400", border: "border-zinc-600/30" }
};

interface PlatformBadgeProps {
  platform: string;
}

export function PlatformBadge({ platform }: PlatformBadgeProps) {
  const p = platform?.toLowerCase() || "other";
  const cfg = PLATFORM_CONFIG[p] || PLATFORM_CONFIG.other;

  return (
    <div className={cn(
      "inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border",
      cfg.bg, cfg.text, cfg.border
    )}>
      {cfg.label}
    </div>
  );
}
