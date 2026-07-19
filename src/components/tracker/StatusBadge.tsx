import { useState } from "react";
import { 
  Bookmark, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Eye, 
  FileText,
  ChevronDown
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useUpsertJobStatus } from "@/hooks/useUpdateJobStatus";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export const STATUS_CONFIG = {
  saved: {
    label: "Saved",
    icon: Bookmark,
    bg: "bg-zinc-500/10",
    text: "text-zinc-400",
    border: "border-zinc-500/20",
    dot: "bg-zinc-400",
  },
  applied: {
    label: "Applied",
    icon: CheckCircle,
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    border: "border-blue-500/20",
    dot: "bg-blue-400",
  },
  viewed: {
    label: "Recruiter Viewed",
    icon: Eye,
    bg: "bg-indigo-500/10",
    text: "text-indigo-400",
    border: "border-indigo-500/20",
    dot: "bg-indigo-400",
  },
  assessment: {
    label: "Assessment",
    icon: FileText,
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    border: "border-purple-500/20",
    dot: "bg-purple-400",
  },
  interviewing: {
    label: "Interview",
    icon: Clock,
    bg: "bg-yellow-500/10",
    text: "text-yellow-400",
    border: "border-yellow-500/20",
    dot: "bg-yellow-400",
  },
  offer: {
    label: "Offer",
    icon: CheckCircle,
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    border: "border-emerald-500/20",
    dot: "bg-emerald-400",
  },
  rejected: {
    label: "Rejected",
    icon: XCircle,
    bg: "bg-red-500/10",
    text: "text-red-400",
    border: "border-red-500/20",
    dot: "bg-red-400",
  },
  ignored: {
    label: "Ignored",
    icon: XCircle,
    bg: "bg-zinc-800",
    text: "text-zinc-500",
    border: "border-zinc-700",
    dot: "bg-zinc-500",
  },
};

export const ALL_STATUSES = Object.keys(STATUS_CONFIG);

interface StatusBadgeProps {
  job: any;
  readonly?: boolean;
}

export function StatusBadge({ job, readonly = false }: StatusBadgeProps) {
  const { mutate } = useUpsertJobStatus();
  const [isOpen, setIsOpen] = useState(false);
  const statusKey = job.status || "saved";
  const cfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.saved;
  const Icon = cfg.icon;

  const handleStatusChange = (newStatus: string) => {
    if (newStatus === statusKey) return;
    mutate(
      { ...job, status: newStatus },
      {
        onSuccess: () => {
          toast.success(`Status updated to ${STATUS_CONFIG[newStatus].label}`);
        },
        onError: () => {
          toast.error("Failed to update status");
        }
      }
    );
  };

  const badgeContent = (
    <div className={cn(
      "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors",
      cfg.bg, cfg.text, cfg.border,
      !readonly && "hover:bg-white/5 cursor-pointer"
    )}>
      <Icon className="h-3.5 w-3.5" />
      {cfg.label}
      {!readonly && <ChevronDown className="h-3 w-3 ml-0.5 opacity-50" />}
    </div>
  );

  if (readonly) return badgeContent;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger className="outline-none">
        {badgeContent}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48 bg-[#111113] border-white/10">
        {ALL_STATUSES.map((s) => {
          const config = STATUS_CONFIG[s];
          const SIcon = config.icon;
          return (
            <DropdownMenuItem 
              key={s} 
              onClick={() => handleStatusChange(s)}
              className={cn(
                "flex items-center gap-2 cursor-pointer py-2",
                statusKey === s ? "bg-white/5" : ""
              )}
            >
              <SIcon className={cn("h-4 w-4", config.text)} />
              <span className="text-zinc-200 text-sm">{config.label}</span>
              {statusKey === s && <CheckCircle className="h-3 w-3 ml-auto text-primary" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
