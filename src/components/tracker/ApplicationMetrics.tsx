import { motion } from "framer-motion";
import { LayoutDashboard, CheckCircle, Clock, XCircle, Bookmark, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ApplicationMetricsProps {
  counts: Record<string, number>;
}

export function ApplicationMetrics({ counts }: ApplicationMetricsProps) {
  const metrics = [
    { label: "Applied", value: counts.applied || 0, icon: Send, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Interview", value: counts.interviewing || 0, icon: Clock, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Offer", value: counts.offer || 0, icon: CheckCircle, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Rejected", value: counts.rejected || 0, icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" },
    { label: "Saved", value: counts.saved || 0, icon: Bookmark, color: "text-zinc-400", bg: "bg-zinc-500/10" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3 py-4">
      {metrics.map((m, i) => {
        const Icon = m.icon;
        return (
          <motion.div
            key={m.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: i * 0.05 }}
          >
            <Card className="bg-[#111113] border-white/5 shadow-none hover:bg-white/[0.02] transition-colors group cursor-default">
              <CardContent className="p-4 flex flex-col justify-between h-full">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-medium text-zinc-400">{m.label}</span>
                  <div className={cn("p-1.5 rounded-md", m.bg)}>
                    <Icon className={cn("h-3.5 w-3.5", m.color)} />
                  </div>
                </div>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-semibold tracking-tight text-white group-hover:scale-105 transition-transform origin-left">
                    {m.value}
                  </span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
}
