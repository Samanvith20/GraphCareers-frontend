// components/resume/ResumeScoreModal.tsx
// Quick modal shown on job card — score gauge + missing keywords + "Fix My Resume" CTA.
// Mirrors Jobright popup (image 1).

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, CheckCircle2, Zap, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScoreBreakdownItem {
  points: number;
  max:    number;
  label:  string;
}

interface AnalyzeResult {
  scoreBefore:      number;
  scoreAfter:       number | null;
  matchedSkills:    string[];
  missingSkills:    string[];
  matchPercent:     number;
  job:              { title: string; company: string | null };
  alreadyOptimized: boolean;
  breakdown:        Record<string, ScoreBreakdownItem>;
}

interface ResumeScoreModalProps {
  open:        boolean;
  jobSourceId: string;
  jobTitle:    string;
  company:     string;
  onClose:     () => void;
  onOptimize:  () => void;
}

// ─── Score gauge ──────────────────────────────────────────────────────────────

function ScoreGauge({ score }: { score: number }) {
  const R         = 54;
  const cx        = 70;
  const cy        = 70;
  const startDeg  = 210;
  const sweepDeg  = 120;

  const polarToXY = (deg: number) => ({
    x: cx + R * Math.cos((deg * Math.PI) / 180),
    y: cy + R * Math.sin((deg * Math.PI) / 180),
  });

  const start    = polarToXY(startDeg);
  const trackEnd = polarToXY(startDeg + sweepDeg);
  // score is 0–100; map to the 120° sweep
  const endAngle = startDeg + (score / 100) * sweepDeg;
  const end      = polarToXY(endAngle);
  const largeArc = endAngle - startDeg > 180 ? 1 : 0;

  const colour =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#f59e0b" :
    score >= 40 ? "#f97316" : "#ef4444";

  const label =
    score >= 80 ? "Strong" :
    score >= 60 ? "Good"   :
    score >= 40 ? "Fair"   : "Poor";

  // Display as x.x out of 10 (like Jobright)
  const display = (score / 10).toFixed(1);

  return (
    <div className="flex flex-col items-center">
      <svg width="140" height="90" viewBox="0 0 140 90">
        {/* Track */}
        <path
          d={`M ${start.x} ${start.y} A ${R} ${R} 0 0 1 ${trackEnd.x} ${trackEnd.y}`}
          fill="none" stroke="hsl(var(--border))" strokeWidth="8" strokeLinecap="round"
        />
        {/* Fill */}
        {score > 0 && (
          <path
            d={`M ${start.x} ${start.y} A ${R} ${R} 0 ${largeArc} 1 ${end.x} ${end.y}`}
            fill="none" stroke={colour} strokeWidth="8" strokeLinecap="round"
          />
        )}
        <circle cx={end.x} cy={end.y} r="5" fill={colour} />
      </svg>
      <div className="-mt-6 text-center">
        <span className="text-3xl font-bold" style={{ color: colour }}>{display}</span>
        <p className="text-xs mt-0.5" style={{ color: colour }}>{label}</p>
      </div>
    </div>
  );
}
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ─── Modal ────────────────────────────────────────────────────────────────────

export function ResumeScoreModal({
  open, jobSourceId, jobTitle, company, onClose, onOptimize,
}: ResumeScoreModalProps) {
  const [loading, setLoading] = useState(false);
  const [data,    setData]    = useState<AnalyzeResult | null>(null);
  const [error,   setError]   = useState<string | null>(null);

  useEffect(() => {
    if (!open || !jobSourceId) return;
    setData(null);
    setError(null);
    setLoading(true);

    fetch(`${BASE_URL}/api/resume/analyze/${jobSourceId}`, 
        {
         credentials: "include",
         method: "POST",
    },
)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.message ?? d.error);
        setData(d as AnalyzeResult);
      })
       .catch((e: Error) => {
    onClose(); // 🔥 CLOSE MODAL IMMEDIATELY
    toast.error(e.message || "Something went wrong");
  })
      .finally(() => setLoading(false));
  }, [open, jobSourceId]);

  const score   = data?.scoreBefore ?? 0;
  const isLow   = score < 60;

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={onClose}
          />

          <motion.div
            className="fixed z-50 top-20 left-1/2 -translate-x-1/2
w-full max-w-md
bg-[#0b0f17] border border-white/10
rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)]
p-4"
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={{   opacity: 0, scale: 0.95, y: 10  }}
            transition={{ duration: 0.2 }}
          >
            {/* Header */}
           <div className="flex items-center justify-between mb-3">
  <h2 className="text-sm font-semibold text-white">
    Customize Your Resume in{" "}
    <span className="text-emerald-400">10 seconds</span>
  </h2>

  <button onClick={onClose} className="text-white/60 hover:text-white">
    <X className="h-4 w-4" />
  </button>
</div>
{isLow && (
  <div className="flex items-start gap-2 rounded-xl bg-red-500/10 border border-red-500/20 px-3 py-2">
    <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5" />
    <p className="text-xs text-red-300 leading-snug">
      Your resume match score is low, and it's likely to be filtered out by ATS
    </p>
  </div>
)}

            {/* Loading */}
            {loading && (
              <div className="flex flex-col items-center gap-3 py-10">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Analyzing your resume…</p>
              </div>
            )}

            {/* Error */}
            {!loading && error && (
              <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">
                {error === "no_resume"
                  ? "Please upload your resume first before checking your ATS score."
                  : error}
              </div>
            )}

            {/* Content */}
            {!loading && data && (
              <div className="space-y-4">
                {/* Job card + gauge */}
               <div className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-4 py-3">
  {/* LEFT */}
  <div className="min-w-0">
    <p className="text-xs text-muted-foreground truncate">{company}</p>
    <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">
      {jobTitle}
    </p>
  </div>

  {/* RIGHT */}
  <div className="shrink-0">
    <ScoreGauge score={score} />
  </div>
</div>

                {/* Already-optimized indicator */}
                {data.scoreAfter !== null && (
                  <div className="flex items-center gap-2 text-sm text-emerald-500 font-medium">
                    <CheckCircle2 className="h-4 w-4" />
                    Optimized score: {(data.scoreAfter / 10).toFixed(1)} · +{((data.scoreAfter - score) / 10).toFixed(1)} improvement
                  </div>
                )}

                {/* Missing keywords */}
                {data.missingSkills.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-muted-foreground mb-2">
                      Missing {data.missingSkills.length} key skills &amp; bullet point alignment
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {data.missingSkills.slice(0, 8).map((skill) => (
                        <span
                          key={skill}
                           className="text-[11px] px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10"
                        >
                          {skill}
                        </span>
                      ))}
                      {data.missingSkills.length > 8 && (
                        <button
                          className="text-[11px] px-2 py-0.5 text-primary hover:underline"
                          onClick={() => { onClose(); onOptimize(); }}
                        >
                          Show {data.missingSkills.length - 8} more
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Score breakdown */}
                <details className="text-xs">
                  <summary className="text-muted-foreground cursor-pointer select-none hover:text-foreground transition-colors">
                    View score breakdown
                  </summary>
                  <div className="mt-2 space-y-1.5 pl-1">
                    {Object.entries(data.breakdown).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between gap-2">
                        <span className="text-muted-foreground truncate">{val.label}</span>
                        <span className={`font-medium shrink-0 ${
                          val.points === val.max ? "text-emerald-500" :
                          val.points > 0        ? "text-amber-500"   : "text-destructive"
                        }`}>
                          {val.points}/{val.max}
                        </span>
                      </div>
                    ))}
                  </div>
                </details>

                {/* CTAs */}
                <div className="space-y-2 pt-1">
                  <Button
                    className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                    onClick={() => { onClose(); onOptimize(); }}
                  >
                    <Zap className="h-4 w-4" />
                    {data.alreadyOptimized ? "Re-optimize Resume" : "Fix My Resume Now"}
                  </Button>
                  <button
                    onClick={onClose}
                    className="w-full text-xs text-muted-foreground hover:text-foreground text-center py-1 transition-colors"
                  >
                    Apply Without Customizing
                  </button>
                  <div className="flex items-center mt-1">
                    <input type="checkbox" id="no-remind" className="mr-2 accent-primary" />
                    <label htmlFor="no-remind" className="text-xs text-muted-foreground cursor-pointer">Do not remind me again</label>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}