import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Briefcase,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Search,
  SlidersHorizontal,
  Zap,
  Building2,
  Star,
  Bookmark,
  Send,
  EyeOff,
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
import { match } from "assert";
import { set } from "date-fns";
const statusConfig = {
  saved: { label: "Saved", icon: Bookmark, class: "text-blue-400" },
  applied: { label: "Applied", icon: Send, class: "text-emerald-400" },
  ignored: { label: "Ignored", icon: EyeOff, class: "text-muted-foreground" },
} as const;

type JobStatus = keyof typeof statusConfig;

const levelConfig = {
  junior: "bg-primary/10 text-primary border-primary/20",
  mid: "bg-accent/10 text-accent border-accent/20",
  senior: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const sourceColors = {
  naukri: "bg-secondary text-secondary-foreground border-border",
  foundit: "bg-accent/10 text-accent border-accent/20",
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.06 },
  }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2 } },
};
const getExperienceText = (minExp, maxExp) => {
  if (minExp == null && maxExp == null) {
    return "Any experience";
  }

  if (minExp == null) {
    return `Up to ${maxExp} yrs`;
  }

  if (maxExp == null) {
    return `${minExp}+ yrs`;
  }

  if (minExp === 0 && maxExp === 0) {
    return "Any experience";
  }

  return `${minExp}–${maxExp} yrs`;
};
function calculateLevel(minExp) {
  if (typeof minExp !== "number") return "mid"; // safe fallback

  if (minExp <= 2) return "entry";
  if (minExp <= 6) return "mid";
  return "senior";
}

const JobsPage = () => {
  const [search, setSearch] = useState("");
  const [selectedWorkMode, setSelectedWorkMode] = useState("all");
  const [selectedJobType, setSelectedJobType] = useState("all");
  const [selectedExpRange, setSelectedExpRange] = useState("all");
  const [selectedMatchFilter, setSelectedMatchFilter] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  const { data: profile } = useProfile();
  const { data: jobApplications = [] } = useUserJobApplications();

  const jobStatusMap = Object.fromEntries(
    jobApplications.map((j) => [j.jobUrl, j.status]),
  );
  const upsertStatus = useUpsertJobStatus();

  // jobs query (7 min stale)
  const { data, isLoading, isError } = useMatchedJobs();
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading Jobs ..</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <ErrorPage />
      </AppLayout>
    );
  }
  const jobs = data?.jobs ?? [];
  const hasJobs = jobs.length > 0;

  if (!hasJobs) {
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

          <h2 className="text-xl font-bold text-foreground">No jobs yet</h2>

          <p className="text-muted-foreground text-sm max-w-sm mx-auto">
            We couldn’t find any jobs that match your skills right now. Update
            your profile with more skills to get better matches.
          </p>
          <Link to="/profile">
            <Button variant="hero" size="sm" className="mt-3">
              Update Profile
            </Button>
          </Link>
        </motion.div>
      </AppLayout>
    );
  }
  function mapJobExperience(minExp: number | null, maxExp: number | null) {
  if (minExp == null && maxExp == null) return "entry";

  const min = minExp ?? 0;
  const max = maxExp ?? min;

  if (max <= 2) return "entry";
  if (min <= 2 && max <= 5) return "mid";
  if (min >= 5) return "senior";

  return "mid"; // safe default
}

  const filtered = jobs
    .filter((job) => {
      const normalize = (v) =>
        (v ?? "").toString().toLowerCase().replace(/[\s-]/g, "");
const jobStatus = jobStatusMap[job.url]; // undefined | saved | applied | ignored

const matchStatus =
  selectedStatus === "all" ||
  (selectedStatus === "none" && !jobStatus) ||
  jobStatus === selectedStatus;
      const matchSearch =
        !search ||
        job.title?.toLowerCase().includes(search.toLowerCase()) ||
        job.company?.toLowerCase().includes(search.toLowerCase()) ||
        job.location?.toLowerCase().includes(search.toLowerCase());

      const matchWorkMode =
        selectedWorkMode === "all" ||
        normalize(job.workMode).includes(normalize(selectedWorkMode)) ||
        normalize(job.location).includes(normalize(selectedWorkMode));

      const matchJobType =
        selectedJobType === "all" ||
        normalize(job.jobType) === normalize(selectedJobType);

    const matchExperience =
  selectedExpRange === "all" ||
  mapJobExperience(job.minExp, job.maxExp) === selectedExpRange;

      const matchQuality =
        selectedMatchFilter === "all" ||
        (selectedMatchFilter === "high" && job.matchPercent >= 70) ||
        (selectedMatchFilter === "perfect" && job.matchPercent >= 90);

      const matchRole =
        selectedRole === "all" ||
        job.role?.toLowerCase() === selectedRole.toLowerCase();

      return (
        matchSearch &&
        matchWorkMode &&
        matchJobType &&
        matchExperience &&
        matchQuality &&
        matchRole&&
        matchStatus
      );
    })
    .sort(
      (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
    );

  const avgMatch = Math.round(
    filtered.reduce((a, j) => a + j.matchPercent, 0) / (filtered.length || 1),
  );
  const roles = Array.from(
    new Set(jobs.map((job) => job.role).filter(Boolean)),
  );

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Zap className="h-6 w-6 text-primary" />
                Matched Jobs
              </h1>
              <p className="text-muted-foreground text-sm mt-1">
                Jobs matched to your {profile?.skills?.length ?? 0} skills —
                sorted by date
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="glow" className="gap-1.5 px-3 py-1">
                <Star className="h-3.5 w-3.5 text-primary" />
                Avg match: {avgMatch}%
              </Badge>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-wrap items-center gap-3"
        >
          {/* 🔍 Search */}
          <div className="relative flex-1 min-w-[260px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, company, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-10"
            />
          </div>
          {/* 🎯 Role */}
          <Select value={selectedRole} onValueChange={setSelectedRole}>
            <SelectTrigger className="h-10 w-[180px]">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {roles.map((role, index) => (
                <SelectItem key={index} value={role}>
                  {role}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* 🧭 Work Mode */}
          <Select value={selectedWorkMode} onValueChange={setSelectedWorkMode}>
            <SelectTrigger className="h-10 w-[130px]">
              <SelectValue placeholder="All Modes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modes</SelectItem>
              <SelectItem value="Remote">Remote</SelectItem>
              <SelectItem value="Hybrid">Hybrid</SelectItem>
              <SelectItem value="On-site">On-site</SelectItem>
            </SelectContent>
          </Select>


          {/* 🧾 Job Type */}
          {/* <Select value={selectedJobType} onValueChange={setSelectedJobType}>
            <SelectTrigger className="h-10 w-[130px]">
              <SelectValue placeholder="Job Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Full-time">Full-time</SelectItem>
              <SelectItem value="Part-time">Part-time</SelectItem>
              <SelectItem value="Contract">Contract</SelectItem>
            </SelectContent>
          </Select> */}

          {/* 🧠 Experience */}
          <Select value={selectedExpRange} onValueChange={setSelectedExpRange}>
  <SelectTrigger className="h-10 w-[140px]">
    <SelectValue placeholder="Experience" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Levels</SelectItem>
    <SelectItem value="entry">Entry (0–2 yrs)</SelectItem>
    <SelectItem value="mid">Mid (2–5 yrs)</SelectItem>
    <SelectItem value="senior">Senior (5+ yrs)</SelectItem>
  </SelectContent>
</Select>

          {/* ⭐ Match Quality */}
          {/* <Select
            value={selectedMatchFilter}
            onValueChange={setSelectedMatchFilter}
          >
            <SelectTrigger className="h-10 w-[140px]">
              <SelectValue placeholder="Match Quality" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Matches</SelectItem>
              <SelectItem value="perfect">90%+ Perfect</SelectItem>
              <SelectItem value="high">70%+ High</SelectItem>
            </SelectContent>
          </Select> */}
        <Select value={selectedStatus} onValueChange={setSelectedStatus}>
  <SelectTrigger className="h-10 w-[150px]">
    <SelectValue placeholder="Status" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="all">All Status</SelectItem>
    <SelectItem value="applied">Applied</SelectItem>
    <SelectItem value="saved">Saved</SelectItem>
    <SelectItem value="ignored">Ignored</SelectItem>
    <SelectItem value="none">Not tracked</SelectItem>
  </SelectContent>
</Select>


          {/* ❌ Clear */}
          <Button
            variant="ghost"
            size="sm"
            className="h-10 border border-white/50 "
            onClick={() => {
              setSelectedWorkMode("all");
              setSelectedJobType("all");
              setSelectedExpRange("all");
              setSelectedMatchFilter("all");
              setSearch("");
              setSelectedRole("all");
              setSelectedStatus("all");
            }}
          >
            Clear
          </Button>
        </motion.div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <span className="text-foreground font-medium">{filtered.length}</span>{" "}
          of {jobs.length} jobs
        </p>

        {/* Job Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((job, i) => {
              const expText = getExperienceText(job.minExp, job.maxExp);
              const postedDate = new Date(job.postedAt).toLocaleDateString(
                "en-IN",
                {
                  day: "numeric",
                  month: "short",
                },
              );
              const level= calculateLevel(job.minExp);
              const currentStatus = jobStatusMap[job.url] ?? "none";

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
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${
                                levelConfig[level] || levelConfig.mid
                              }`}
                            >
                              {level}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${
                                sourceColors[job.source] ||
                                "bg-secondary text-secondary-foreground border-border"
                              }`}
                            >
                              {job.source}
                            </span>
                          </div>
                          <h3 className="font-semibold text-foreground text-sm leading-snug mt-1">
                            {job.title}
                          </h3>
                          <div className="flex items-center gap-1 mt-1">
                            <Building2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span className="text-muted-foreground text-sm">
                              {job.company}
                            </span>
                          </div>
                        </div>

                        {/* Match Ring */}
                        <div className="shrink-0 flex flex-col items-center">
                          <div className="relative h-14 w-14">
                            <svg
                              className="h-14 w-14 -rotate-90"
                              viewBox="0 0 48 48"
                            >
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                fill="none"
                                stroke="hsl(var(--border))"
                                strokeWidth="4"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                fill="none"
                                stroke="hsl(var(--primary))"
                                strokeWidth="4"
                                strokeDasharray={`${(job.matchPercent / 100) * 125.6} 125.6`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">
                              {job.matchPercent}%
                            </span>
                          </div>
                          <span className="text-[10px] text-muted-foreground mt-0.5">
                            match
                          </span>
                        </div>
                      </div>

                      {/* Meta row */}
                      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3.5 w-3.5 text-primary" />
                          {job.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3.5 w-3.5 text-primary" />
                          {expText}
                        </span>
                        <span className="ml-auto">{postedDate}</span>
                      </div>

                      {/* Matched Skills */}
                      <div>
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
                          Matched Skills
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {job.matchedSkills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 capitalize"
                            >
                              <CheckCircle className="h-2.5 w-2.5" />
                              {skill}
                            </span>
                          ))}
                          {job.missingSkills.map((skill) => (
                            <span
                              key={skill}
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-muted text-muted-foreground border border-border capitalize"
                            >
                              <AlertCircle className="h-2.5 w-2.5" />
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Role badge + CTA */}

                      <div className="flex flex-col gap-2 mt-auto pt-2 border-t border-border">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant="secondary"
                            className="text-xs shrink-0"
                          >
                            {job.role}
                          </Badge>

                          {(() => {
                            const status = jobStatusMap[job.url] as
                              | JobStatus
                              | undefined;
                            const cfg = status ? statusConfig[status] : null;

                            if (!cfg) return null; // 🔑 prevents rendering undefined components

                            return (
                              <span
                                className={`inline-flex items-center gap-1 text-[11px] font-medium ${cfg.class}`}
                              >
                                <cfg.icon className="h-3 w-3" />
                                {cfg.label}
                              </span>
                            );
                          })()}
                        </div>
                        <div className="flex items-center gap-2">
                         
                         <Select
  value={currentStatus}
  disabled={upsertStatus.isPending}
  onValueChange={(val) => {
    if (val === "none") return;

    upsertStatus.mutate(
      {
        jobUrl: job.url,
        jobTitle: job.title,
        company: job.company,
        source: job.source,
        status: val as JobStatus,
      },
      {
        onSuccess: () => {
          toast.success(`Job marked as ${val}`);
        },
        onError: () => {
          toast.error("Failed to update job status. Please try again.");
        },
      }
    );
  }}
>
                            <SelectTrigger className="h-8 flex-1 min-w-0 text-xs gap-1 bg-secondary border-border">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="none">Select status</SelectItem>
                              <SelectItem value="saved">
                                <span className="flex items-center gap-1.5">
                                  <Bookmark className="h-3 w-3" /> Saved
                                </span>
                              </SelectItem>
                              <SelectItem value="applied">
                                <span className="flex items-center gap-1.5">
                                  <Send className="h-3 w-3" /> Applied
                                </span>
                              </SelectItem>
                              <SelectItem value="ignored">
                                <span className="flex items-center gap-1.5">
                                  <EyeOff className="h-3 w-3" /> Ignored
                                </span>
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <a
                            href={job.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shrink-0"
                          >
                            <Button
                              variant="hero"
                              size="sm"
                              className="gap-1.5 text-xs h-8"
                            >
                              Apply
                              <ExternalLink className="h-3 w-3" />
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

        {filtered.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20"
          >
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No jobs match your search</p>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3"
              onClick={() => {
                setSelectedWorkMode("all");
                setSelectedJobType("all");
                setSelectedExpRange("all");
                setSelectedMatchFilter("all");
                setSearch("");
                setSelectedStatus("all");
              }}
            >
              Clear filters
            </Button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default JobsPage;
