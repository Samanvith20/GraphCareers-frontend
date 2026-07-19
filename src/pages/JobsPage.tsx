import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Briefcase,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Building2,
  ArrowRight,
  Sparkles,
  Clock,
  BarChart3,
  Star,
  Users,
  ChevronDown,
  Search,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMatchedJobs, type JobDaysFilter } from "@/hooks/useMatchedJobs";
import { useProfile } from "@/hooks/useProfile";
import AppLayout from "@/components/layout/AppLayout";
import ErrorPage from "./ErrorPage";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Link } from "react-router-dom";
import { ResumeScoreModal } from "@/components/resume/ResumeScoreModal";
import { ResumeOptimizeModal } from "@/components/resume/ResumeOptimizeModal";
import { useRequestReferrals } from "@/hooks/useReferrals";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// ─── Date filter options ──────────────────────────────────────────────────────

const DATE_OPTIONS: { label: string; value: JobDaysFilter }[] = [
  { label: "Today",      value: 1 },
  { label: "Yesterday",  value: 2 },
  { label: "3 days ago", value: 3 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getExperienceText = (minExp: number | null, maxExp: number | null) => {
  if (minExp == null && maxExp == null) return "Any exp.";
  if (minExp == null) return `Up to ${maxExp} yrs`;
  if (maxExp == null) return `${minExp}+ yrs`;
  if (minExp === 0 && maxExp === 0) return "Fresher";
  return `${minExp}–${maxExp} yrs`;
};

function mapJobExperience(minExp: number | null, maxExp: number | null) {
  if (minExp == null && maxExp == null) return "entry";
  const min = minExp ?? 0;
  const max = maxExp ?? min;
  if (max <= 2) return "entry";
  if (min <= 2 && max <= 5) return "mid";
  if (min >= 5) return "senior";
  return "mid";
}

function calculateLevel(minExp: number | null) {
  if (typeof minExp !== "number") return "mid";
  if (minExp <= 2) return "entry";
  if (minExp <= 6) return "mid";
  return "senior";
}

function getMatchColor(pct: number) {
  if (pct >= 85)
    return {
      ring: "#00D084",
      text: "text-[#00D084]",
      bg: "bg-[#00D084]/10",
      label: "Excellent",
    };
  if (pct >= 65)
    return {
      ring: "#facc15",
      text: "text-yellow-400",
      bg: "bg-yellow-400/10",
      label: "Good",
    };
  return {
    ring: "#f87171",
    text: "text-red-400",
    bg: "bg-red-400/10",
    label: "Fair",
  };
}

const levelStyles: Record<string, string> = {
  entry: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  mid: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  senior: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

const sourceStyles: Record<string, string> = {
  Naukri: "bg-white/[0.05] text-[#9ca3af] border-white/[0.08]",
  Foundit: "bg-[#00D084]/8 text-[#00D084] border-[#00D084]/15",
  Instahyre: "bg-[#00D084]/8 text-[#00D084] border-[#00D084]/15",
};

// ─── Animated Counter ─────────────────────────────────────────────────────────

const AnimatedNumber = ({ value }: { value: number }) => {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(value / 30);
    const timer = setInterval(() => {
      start += step;
      if (start >= value) {
        setDisplay(value);
        clearInterval(timer);
      } else setDisplay(start);
    }, 20);
    return () => clearInterval(timer);
  }, [value]);
  return <>{display}</>;
};

// ─── Match Circle ─────────────────────────────────────────────────────────────

const MatchCircle = ({ pct }: { pct: number }) => {
  const { ring, text, label } = getMatchColor(pct);
  const r = 20;
  const circ = 2 * Math.PI * r;
  const dash = (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-1 shrink-0">
      <div className="relative h-[52px] w-[52px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 44 44">
          <circle
            cx="22"
            cy="22"
            r={r}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="3.2"
          />
          <motion.circle
            cx="22"
            cy="22"
            r={r}
            fill="none"
            stroke={ring}
            strokeWidth="3.2"
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            initial={{ strokeDasharray: `0 ${circ}` }}
            animate={{ strokeDasharray: `${dash} ${circ}` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span
            className={cn(
              "text-[12px] font-bold tabular-nums leading-none",
              text,
            )}
          >
            {pct}%
          </span>
        </div>
      </div>
      <span className={cn("text-[10px] font-semibold", text)}>{label}</span>
    </div>
  );
};

// ─── Skill Chip ───────────────────────────────────────────────────────────────

const SkillChip = ({
  skill,
  variant,
}: {
  skill: string;
  variant: "matched" | "missing" | "extra";
}) => {
  const styles = {
    matched: "pill-green",
    missing: "pill-red",
    extra: "pill-gray",
  };
  const icons = {
    matched: <CheckCircle className="h-2.5 w-2.5" />,
    missing: <AlertCircle className="h-2.5 w-2.5" />,
    extra: null,
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium capitalize",
        styles[variant],
      )}
    >
      {icons[variant]}
      {skill}
    </span>
  );
};

// ─── Job Card Skeleton (reusable) ─────────────────────────────────────────────

export const JobCardSkeleton = () => (
  <div className="bg-[#111113] border border-white/[0.06] rounded-2xl p-5 shadow-card">
    <div className="flex items-start gap-4">
      <Skeleton className="h-10 w-10 rounded-xl shrink-0 bg-white/[0.05]" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-1/2 bg-white/[0.05]" />
        <Skeleton className="h-3.5 w-1/3 bg-white/[0.04]" />
        <Skeleton className="h-3 w-2/3 bg-white/[0.03]" />
      </div>
      <Skeleton className="h-[60px] w-[60px] rounded-full bg-white/[0.05]" />
    </div>
    <div className="mt-4 flex gap-2">
      <Skeleton className="h-5 w-16 rounded-full bg-white/[0.04]" />
      <Skeleton className="h-5 w-16 rounded-full bg-white/[0.04]" />
      <Skeleton className="h-5 w-16 rounded-full bg-white/[0.04]" />
    </div>
    <div className="mt-4 pt-4 border-t border-white/[0.05] flex gap-2">
      <Skeleton className="h-8 flex-1 rounded-xl bg-white/[0.04]" />
      <Skeleton className="h-8 w-20 rounded-xl bg-white/[0.04]" />
    </div>
  </div>
);

// ─── Job Card ─────────────────────────────────────────────────────────────────

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  url: string;
  matchPercent: number;
  matchedSkills: string[];
  missingSkills: string[];
  matchedCount: number;
  totalRequired: number;
  minExp: number | null;
  maxExp: number | null;
  source: string;
  role: string;
  isNew: boolean;
  timeText: string;
  daysAgo: number;
  workMode: string;
  jobType: string;
  notes?: string;
}

interface JobCardProps {
  job: Job;
  index: number;
  onReferralClick: () => void;
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: Math.min(i * 0.04, 0.3),
      ease: "easeOut",
    },
  }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.15 } },
};

const JobCard = ({ job, index, onReferralClick }: JobCardProps) => {
  const level = calculateLevel(job.minExp);

  return (
    <motion.div
      custom={index}
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      layout
    >
      <div className="group glass-card border border-border/20 rounded-2xl shadow-card card-hover overflow-hidden">
        <div className="p-4 sm:px-6">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-full border font-medium capitalize",
                    levelStyles[level] ?? levelStyles.mid,
                  )}
                >
                  {level}
                </span>
                <span
                  className={cn(
                    "text-[10px] px-2 py-0.5 rounded-md border font-medium capitalize",
                    sourceStyles[job.source] ?? sourceStyles.naukri,
                  )}
                >
                  {job.source}
                </span>
                {job.isNew && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold bg-[#00D084]/10 text-[#00D084] border border-[#00D084]/20 flex items-center gap-1">
                    <span className="h-1 w-1 rounded-full bg-[#00D084] animate-pulse" />
                    New
                  </span>
                )}
              </div>

              <h3 className="font-semibold text-white text-[14px] sm:text-[15px] leading-5 tracking-[-0.01em] line-clamp-1">
                {job.title}
              </h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] sm:text-[13px] text-[#6b7280] leading-4">
                <span className="flex items-center gap-1.5">
                  <Building2 className="h-3.5 w-3.5 shrink-0" />
                  {job.company}
                </span>
                <span className="flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 shrink-0" />
                  {job.location}
                </span>
                <span className="flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 shrink-0" />
                  {getExperienceText(job.minExp, job.maxExp)}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end gap-1.5 shrink-0">
              <MatchCircle pct={job.matchPercent} />
              <span className="flex items-center gap-1 text-[10px] sm:text-[11px] font-medium text-[#6b7280]">
                <Clock className="h-3 w-3" />
                {job.timeText}
              </span>
            </div>
          </div>

          <div className="mt-1 bg-[r] sm:mt-1">
            <span className="mb-1.5 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[#4b5563]">
              Skills · {job.matchedCount}/{job.totalRequired} matched
            </span>
            <div className="flex flex-wrap gap-1.5">
              {job.matchedSkills.slice(0, 5).map((s) => (
                <SkillChip key={s} skill={s} variant="matched" />
              ))}
              {job.missingSkills.slice(0, 3).map((s) => (
                <SkillChip key={s} skill={s} variant="missing" />
              ))}
              {job.matchedSkills.length + job.missingSkills.length > 8 && (
                <span className="px-2 py-0.5 text-[10px] text-[#4b5563]">
                  +{job.matchedSkills.length + job.missingSkills.length - 8}{" "}
                  more
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2 border-t border-white/[0.05] px-4 pb-4 pt-3 sm:px-5">
          <Button
            variant="outline"
            size="sm"
            onClick={onReferralClick}
            className="h-8 flex-1 rounded-xl border-white/[0.08] bg-white/[0.03] text-[11px] font-medium text-[#9ca3af] transition-all hover:bg-white/[0.07] hover:text-white gap-1.5"
          >
            <Users className="h-3.5 w-3.5" />
            Find Referral
          </Button>

          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1"
          >
            <Button
              size="sm"
              className="h-8 w-full rounded-xl bg-[#00D084] text-[11px] font-semibold text-[#09090B] transition-all hover:bg-[#00c07a] hover:shadow-[0_0_16px_-4px_rgba(0,208,132,0.5)] gap-1.5"
            >
              Apply <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>
      </div>
    </motion.div>
  );
};

// ─── Page Header ──────────────────────────────────────────────────────────────

const PageHeader = ({
  total,
  days,
  onDaysChange,
}: {
  total: number;
  days: JobDaysFilter;
  onDaysChange: (d: JobDaysFilter) => void;
}) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="flex items-start justify-between gap-4 flex-wrap"
  >
    <div>
      <h1 className="text-[28px] font-bold text-white tracking-tight">Jobs For You</h1>
      <p className="text-[14px] text-[#6b7280] mt-0.5">
        AI-curated opportunities matched to your profile
      </p>
    </div>

    <Select
      value={String(days)}
      onValueChange={(v) => onDaysChange(Number(v) as JobDaysFilter)}
    >
      <SelectTrigger className="h-9 w-auto gap-2 rounded-xl border border-white/[0.08] bg-white/[0.04] text-white text-[13px] font-medium px-3 hover:border-white/20 hover:bg-white/[0.08] transition-all focus:ring-white/20">
        <Clock className="h-3.5 w-3.5 text-[#9ca3af]" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-[#111113] border-white/[0.08] rounded-xl">
        {DATE_OPTIONS.map((opt) => (
          <SelectItem key={opt.value} value={String(opt.value)}>
            {opt.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  </motion.div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

const JobsPage = () => {
  const [days, setDays] = useState<JobDaysFilter>(3);
  const [scoreModalJob,    setScoreModalJob]    = useState<{ jobSourceId: string; title: string; company: string } | null>(null);
  const [optimizeModalJob, setOptimizeModalJob] = useState<{ jobSourceId: string; title: string; company: string } | null>(null);

  const requestReferralsMutation = useRequestReferrals();

  const handleReferralRequest = (job: Job) => {
    if (!job.company) return;
    toast.loading("Finding the best localized referrals...", { id: `ref-${job.id}` });
    requestReferralsMutation.mutate(
      { companyName: job.company, jobSourceId: job.id },
      {
        onSuccess: (res) => {
          if (res.status === "completed") {
            toast.success(`Referrals for ${job.company} added to your Dashboard!`, { id: `ref-${job.id}` });
          } else {
            toast.error(`Couldn't find contacts for ${job.company}.`, { id: `ref-${job.id}` });
          }
        },
        onError: () => {
          toast.error(`Failed to request referrals.`, { id: `ref-${job.id}` });
        }
      }
    );
  };

  const { data: profile } = useProfile();

  const {
    data,
    isLoading,
    isError,
    hasNextPage,
    fetchNextPage,
    isFetchingNextPage,
  } = useMatchedJobs(days);

  const observerTarget = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { threshold: 0.1 },
    );
    if (observerTarget.current) observer.observe(observerTarget.current);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <Skeleton className="h-8 w-52 bg-white/[0.05]" />
              <Skeleton className="h-4 w-72 bg-white/[0.04]" />
            </div>
            <Skeleton className="h-9 w-32 rounded-xl bg-white/[0.05]" />
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[...Array(4)].map((_, i) => (
              <JobCardSkeleton key={i} />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError)
    return (
      <AppLayout>
        <ErrorPage />
      </AppLayout>
    );

  const jobs = data?.pages.flatMap((page) => page.jobs) ?? [];
  const total = data?.pages[0]?.filters?.total ?? 0;
  const filtered = jobs;

  const filters = data?.pages[0]?.filters;

  return (
    <AppLayout>
      <div className="max-w-[1100px] mx-auto px-6 py-8 space-y-7">
        <PageHeader total={total} days={days} onDaysChange={setDays} />

        <div className="flex items-center justify-between">
          <p className="text-[13px] text-[#6b7280]">
            Showing <span className="text-white font-semibold">{filtered.length}</span> of{" "}
            <span className="text-white font-semibold">{total}</span> jobs
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xl:gap-6">
          <AnimatePresence mode="popLayout">
            {filtered.map((job, i) => (
              <JobCard 
                key={job.id} 
                job={job} 
                index={i} 
                onReferralClick={() => handleReferralRequest(job)}
              />
            ))}
          </AnimatePresence>

          {/* Shimmer for loading next pages */}
          {isFetchingNextPage &&
            Array.from({ length: 2 }).map((_, i) => (
              <JobCardSkeleton key={`skel-${i}`} />
            ))}
        </div>

        {/* Infinite scroll sentinel */}
        {hasNextPage && <div ref={observerTarget} className="h-8 w-full" />}

        {/* End of results */}
        {!hasNextPage && jobs.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-[13px] text-[#6b7280]">
              <CheckCircle className="h-4 w-4 text-[#00D084]" />
              You've seen all {total} matched jobs
            </div>
          </motion.div>
        )}

        {/* Empty filter state */}
        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <div className="h-12 w-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mx-auto mb-4">
              <Search className="h-6 w-6 text-[#4b5563]" />
            </div>
            <p className="text-white font-medium mb-1">
              No jobs match your filters
            </p>
            <p className="text-[13px] text-[#6b7280] mb-4">
              Try adjusting or clearing your filters
            </p>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl border-white/[0.08] bg-white/[0.03] text-[#9ca3af] hover:text-white"
              onClick={() => setDays(3)}
            >
              Reset filters
            </Button>
          </motion.div>
        )}
      </div>

      {/* Modals */}
      {scoreModalJob && (
        <ResumeScoreModal
          open
          jobSourceId={scoreModalJob.jobSourceId}
          jobTitle={scoreModalJob.title}
          company={scoreModalJob.company}
          onClose={() => setScoreModalJob(null)}
          onOptimize={() => {
            setOptimizeModalJob(scoreModalJob);
            setScoreModalJob(null);
          }}
        />
      )}
      {optimizeModalJob && (
        <ResumeOptimizeModal
          open
          jobSourceId={optimizeModalJob.jobSourceId}
          jobTitle={optimizeModalJob.title}
          company={optimizeModalJob.company}
          userCredits={profile?.credits ?? 0}
          onClose={() => setOptimizeModalJob(null)}
        />
      )}
    </AppLayout>
  );
};

export default JobsPage;
