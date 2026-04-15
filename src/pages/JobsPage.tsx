import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Briefcase,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Search,
  Zap,
  Building2,
  Star,
  Bookmark,
  Send,
  EyeOff,
  Crown,
  Lock,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMatchedJobs } from "@/hooks/useMatchedJobs";
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
import { useUserJobApplications } from "@/hooks/useUserjobapplications";
import { useUpsertJobStatus } from "@/hooks/useUpdateJobStatus";
import { toast } from "sonner";
import { ResumeScoreModal }    from "@/components/resume/ResumeScoreModal";
import { ResumeOptimizeModal } from "@/components/resume/ResumeOptimizeModal";

// ─── Config ───────────────────────────────────────────────────────────────────

const statusConfig = {
  saved:   { label: "Saved",   icon: Bookmark, class: "text-blue-400" },
  applied: { label: "Applied", icon: Send,     class: "text-emerald-400" },
  ignored: { label: "Ignored", icon: EyeOff,   class: "text-muted-foreground" },
} as const;

type JobStatus = keyof typeof statusConfig;

const levelConfig = {
  entry:  "bg-primary/10 text-primary border-primary/20",
  mid:    "bg-accent/10 text-accent border-accent/20",
  senior: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const sourceColors = {
  naukri:  "bg-secondary text-secondary-foreground border-border",
  foundit: "bg-accent/10 text-accent border-accent/20",
};

const cardVariants = {
  hidden:  { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.4, delay: Math.min(i * 0.05, 0.4) }, // cap delay at 0.4s
  }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2 } },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getExperienceText = (minExp: number | null, maxExp: number | null) => {
  if (minExp == null && maxExp == null) return "Any experience";
  if (minExp == null)                   return `Up to ${maxExp} yrs`;
  if (maxExp == null)                   return `${minExp}+ yrs`;
  if (minExp === 0 && maxExp === 0)     return "Fresher";
  return `${minExp}–${maxExp} yrs`;
};

function mapJobExperience(minExp: number | null, maxExp: number | null) {
  if (minExp == null && maxExp == null) return "entry";
  const min = minExp ?? 0;
  const max = maxExp ?? min;
  if (max <= 2)             return "entry";
  if (min <= 2 && max <= 5) return "mid";
  if (min >= 5)             return "senior";
  return "mid";
}

function calculateLevel(minExp: number | null) {
  if (typeof minExp !== "number") return "mid";
  if (minExp <= 2) return "entry";
  if (minExp <= 6) return "mid";
  return "senior";
}

// ─── Upgrade nudge (shown in header for free users) ───────────────────────────

const FreeUpgradeStrip = () => (
  <Link to="/pricing">
    <div className="flex items-center justify-between gap-3 mt-6 rounded-xl border border-primary/25 bg-primary/5 px-4 py-3 cursor-pointer hover:bg-primary/10 transition-colors">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <Lock className="h-3.5 w-3.5 text-primary shrink-0" />
        <p className="text-xs text-muted-foreground">
  You're on the <span className="text-foreground font-medium">Free plan</span>. Upgrade now to unlock unlimited matches.
</p>
      </div>
      <span className="text-xs font-medium text-primary whitespace-nowrap flex items-center gap-1">
        Upgrade for ₹99/mo <ArrowRight className="h-3 w-3" />
      </span>
    </div>
  </Link>
);

// ─── Main page ────────────────────────────────────────────────────────────────

const JobsPage = () => {
  const [search,           setSearch]           = useState("");
  const [selectedWorkMode, setSelectedWorkMode] = useState("all");
  const [selectedJobType,  setSelectedJobType]  = useState("all");
  const [selectedExpRange, setSelectedExpRange] = useState("all");
  const [selectedRole,     setSelectedRole]     = useState("all");
  const [selectedStatus,   setSelectedStatus]   = useState("all");
  const [selectedDate, setSelectedDate]         = useState("all");
  const [scoreModalJob,    setScoreModalJob]    = useState<{ jobSourceId: string; title: string; company: string } | null>(null);
const [optimizeModalJob, setOptimizeModalJob] = useState<{ jobSourceId: string; title: string; company: string } | null>(null);

  const { data: profile }              = useProfile();
  const { data: jobApplications = [] } = useUserJobApplications();
  const upsertStatus                   = useUpsertJobStatus();

  const jobStatusMap = Object.fromEntries(
    jobApplications.map((j) => [j.jobUrl, j.status]),
  );

  const { data, isLoading, isError } = useMatchedJobs();

  // ── Loading ────────────────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <p className="text-sm text-muted-foreground">Finding your best matches…</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError) return <AppLayout><ErrorPage /></AppLayout>;

  const jobs  = data?.jobs  ?? [];
  const isPro = data?.isPro ?? false;

  // ── Empty state ────────────────────────────────────────────────────────────
  if (!jobs.length) {
    return (
      <AppLayout>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center py-28 space-y-4"
        >
          <div className="h-16 w-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto">
            <Briefcase className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-foreground">No matches yet</h2>
          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            We couldn't find jobs matching your current skills and experience.
            Add more skills to your profile for better results.
          </p>
          <Link to="/profile">
            <Button variant="hero" size="sm" className="mt-3">Update Profile</Button>
          </Link>
        </motion.div>
      </AppLayout>
    );
  }

  // ── Filter (client-side within what backend already gated) ────────────────
  const normalize = (v: unknown) =>
    String(v ?? "").toLowerCase().replace(/[\s-]/g, "");

  const filtered = jobs.filter((job) => {
    const jobStatus = jobStatusMap[job.url];

    return (
      (selectedStatus === "all" ||
        (selectedStatus === "none" && !jobStatus) ||
        jobStatus === selectedStatus) &&

      (!search ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase())) &&

      (selectedWorkMode === "all" ||
        normalize(job.workMode).includes(normalize(selectedWorkMode)) ||
        normalize(job.location).includes(normalize(selectedWorkMode))) &&

      (selectedJobType === "all" ||
        normalize(job.jobType) === normalize(selectedJobType)) &&

      (selectedExpRange === "all" ||
        mapJobExperience(job.minExp, job.maxExp) === selectedExpRange) &&

      (selectedRole === "all" ||
        job.role?.toLowerCase() === selectedRole.toLowerCase()) &&
         (selectedDate === "all" ||
      (selectedDate === "today" && job.daysAgo === 0) ||
      (selectedDate === "yesterday" && job.daysAgo === 1) ||
      (selectedDate === "older" && job.daysAgo >= 2)
    )
    );

  });
  // No re-sort needed — backend already sorted by qualityScore DESC → matchPercent DESC → hoursOld ASC

  const avgMatch = Math.round(
    filtered.reduce((a, j) => a + j.matchPercent, 0) / (filtered.length || 1),
  );
  const roles = Array.from(new Set(jobs.map((j) => j.role).filter(Boolean)));

  const clearFilters = () => {
    setSearch("");
    setSelectedWorkMode("all");
    setSelectedJobType("all");
    setSelectedExpRange("all");
    setSelectedRole("all");
    setSelectedStatus("all");
    setSelectedDate("all")
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Matched Jobs
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Sorted by match quality · {profile?.skills?.length ?? 0} skills in your profile
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <Badge variant="glow" className="gap-1.5 px-3 py-1">
                <Star className="h-3.5 w-3.5 text-primary" />
                Avg {avgMatch}% match
              </Badge>
              {isPro ? (
                <Badge className="gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-400 border-yellow-500/20">
                  <Crown className="h-3 w-3" /> Pro
                </Badge>
              ) : (
                <Link to="/pricing">
                  <Badge variant="outline" className="gap-1 px-3 py-1 cursor-pointer hover:bg-primary/5">
                    <Lock className="h-3 w-3" /> Free
                  </Badge>
                </Link>
              )}
            </div>
          </div>
        </motion.div>

        {/* Free plan nudge strip */}
        {/* {!isPro && <FreeUpgradeStrip />} */}

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 md:flex md:flex-wrap items-stretch gap-3"
        >
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search title, company, location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>

          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="h-10 w-full sm:w-auto"><SelectValue placeholder="Role" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role, i) => <SelectItem key={i} value={role}>{role}</SelectItem>)}
            </SelectContent>
          </Select>

          <Select value={selectedWorkMode} onValueChange={setSelectedWorkMode}>
            <SelectTrigger className="h-10 w-full sm:w-auto"><SelectValue placeholder="All Modes" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="On-site">On-site</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedExpRange} onValueChange={setSelectedExpRange}>
            <SelectTrigger className="h-10 w-full sm:w-auto"><SelectValue placeholder="Experience" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="entry">Entry (0–2 yrs)</SelectItem>
              <SelectItem value="mid">Mid (2–5 yrs)</SelectItem>
              <SelectItem value="senior">Senior (5+ yrs)</SelectItem>
            </SelectContent>
          </Select>

          {/* <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="h-10 w-[150px]"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="saved">Saved</SelectItem>
              <SelectItem value="ignored">Ignored</SelectItem>
              <SelectItem value="none">Not tracked</SelectItem>
            </SelectContent>
          </Select> */}
          <Select value={selectedDate} onValueChange={setSelectedDate}>
  <SelectTrigger className="h-10 w-full sm:w-auto">
    <SelectValue placeholder="Date" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Dates</SelectItem>
    <SelectItem value="today">Today</SelectItem>
    <SelectItem value="yesterday">Yesterday</SelectItem>
    <SelectItem value="older">2+ Days</SelectItem>
  </SelectContent>
</Select>

          <Button variant="ghost" size="sm" className="h-10 border border-white/50" onClick={clearFilters}>
            Clear
          </Button>
        </motion.div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filtered.length}</span> jobs
          {!isPro && (
            <span className="text-muted-foreground"> · free plan</span>
          )}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((job, i) => {
              const level         = calculateLevel(job.minExp);
              const currentStatus = (jobStatusMap[job.url] ?? "none") as JobStatus | "none";

              return (
                <motion.div
                  key={job.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                >
                  <Card className="card-hover group border border-white/20 h-full flex flex-col">
                    <CardContent className="p-5 flex flex-col gap-4 h-full">

                      {/* Top row */}
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${levelConfig[level] ?? levelConfig.mid}`}>
                              {level}
                            </span>
                            <span className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${sourceColors[job.source] ?? "bg-secondary text-secondary-foreground border-border"}`}>
                              {job.source}
                            </span>
                            {job.isNew && (
                              <span className="text-xs px-2 py-0.5 rounded-full border font-medium bg-emerald-500/10 text-emerald-400 border-emerald-500/20">
                                New
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-foreground text-sm leading-snug mt-1 line-clamp-2">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-sm truncate">{job.company}</span>
                          </div>
                        </div>
                 
                        {/* Match ring */}
                       <div className="flex flex-col items-center shrink-0 sm:shrink-0">
                          <div className="relative h-14 w-14">
                            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
                              <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
                              <circle
                                cx="24" cy="24" r="20" fill="none"
                                stroke={job.matchPercent >= 90 ? "hsl(142 70% 50%)" : "hsl(var(--primary))"}
                                strokeWidth="4"
                                strokeDasharray={`${(job.matchPercent / 100) * 125.6} 125.6`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
                              {job.matchPercent}%
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-0.5">match</span>
                        </div>
                      </div>

                      {/* Meta */}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-primary" />
                          {getExperienceText(job.minExp, job.maxExp)}
                        </span>
                        {/* Show BOTH match quality signal and recency */}
                        <span className="ml-auto flex items-center gap-1.5">
                          <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                            job.matchPercent >= 90 ? "bg-emerald-400"
                            : job.matchPercent >= 70 ? "bg-primary"
                            : "bg-muted-foreground"
                          }`} />
                          {job.timeText}
                        </span>
                      </div>

                      {/* Skills */}
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Skills ({job.matchedCount}/{job.totalRequired} matched)
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.matchedSkills.map((skill) => (
                            <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 capitalize">
                              <CheckCircle className="h-2.5 w-2.5" />{skill}
                            </span>
                          ))}
                          {job.missingSkills.map((skill) => (
                            <span key={skill} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border capitalize">
                              <AlertCircle className="h-2.5 w-2.5" />{skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Footer */}
                      <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-border">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs shrink-0">{job.role}</Badge>
                          {(() => {
                            const cfg = currentStatus !== "none" ? statusConfig[currentStatus] : null;
                            if (!cfg) return null;
                            return (
                              <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${cfg.class}`}>
                                <cfg.icon className="h-3 w-3" />{cfg.label}
                              </span>
                            );
                          })()}
                        </div>

                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
  {/* Track status select — unchanged */}
  <Select
    value={currentStatus}
    disabled={upsertStatus.isPending}
    onValueChange={(val) => {
      if (val === "none") return;
      upsertStatus.mutate(
        { jobUrl: job.url, jobTitle: job.title, company: job.company, source: job.source, status: val as JobStatus, notes: job.notes },
        { onSuccess: () => toast.success(`Marked as ${val}`), onError: () => toast.error("Failed to update. Try again.") }
      );
    }}
  >
    <SelectTrigger className="h-8 flex-1 min-w-0 text-xs gap-1 bg-secondary border-border">
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="none">Track this job</SelectItem>
      <SelectItem value="saved"><span className="flex items-center gap-1.5"><Bookmark className="h-3 w-3" />Saved</span></SelectItem>
      <SelectItem value="applied"><span className="flex items-center gap-1.5"><Send className="h-3 w-3" />Applied</span></SelectItem>
      <SelectItem value="ignored"><span className="flex items-center gap-1.5"><EyeOff className="h-3 w-3" />Ignored</span></SelectItem>
    </SelectContent>
  </Select>
 
  {/* NEW: ATS Score check button */}
  {/* <Button
    variant="outline"
    size="sm"
    className="gap-1.5 text-xs h-8 shrink-0"
    onClick={() => setScoreModalJob({
      jobSourceId: job.id,   // ← the Neo4j string ID, NOT job.id
      title:       job.title,
      company:     job.company ?? "",
    })}
  >
    Check Score
  </Button> */}
 
  {/* Apply — unchanged */}
  <a href={job.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
    <Button variant="hero" size="sm" className="gap-1.5 text-xs h-8">
      Apply <ExternalLink className="h-3 w-3" />
    </Button>
  </a>
</div>
                      </div>

                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Empty filter state */}
        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No jobs match your filters</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={clearFilters}>
              Clear filters
            </Button>
          </motion.div>
        )}
        

      </div>
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