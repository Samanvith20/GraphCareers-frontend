import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin, Briefcase, ExternalLink, CheckCircle, AlertCircle,
  Search, SlidersHorizontal, Zap, Building2, Star
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { jobsData, userData } from "@/data/sampleData";
import AppLayout from "@/components/layout/AppLayout";

const levelConfig = {
  junior: "bg-primary/10 text-primary border-primary/20",
  mid: "bg-accent/10 text-accent border-accent/20",
  senior: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
};

const sourceColors = {
  naukri: "bg-secondary text-secondary-foreground border-border",
  foundit: "bg-accent/10 text-accent border-accent/20",
};

const roles = ["All Roles", "Backend Developer", "DevOps Engineer", "Software Engineer / Developer"];

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.45, delay: i * 0.06 } }),
  exit: { opacity: 0, scale: 0.97, transition: { duration: 0.2 } },
};

const JobsPage = () => {
  const [search, setSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState("All Roles");

  const filtered = jobsData.filter((job) => {
    const matchSearch =
      !search ||
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.company.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    const matchRole = selectedRole === "All Roles" || job.role === selectedRole;
    return matchSearch && matchRole;
  });

  const avgMatch = Math.round(filtered.reduce((a, j) => a + j.matchPercent, 0) / (filtered.length || 1));

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
                Roles matched to your {userData.skills.length} skills — sorted by best fit
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

        {/* Filter bar */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by title, company, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
            {roles.map((role) => (
              <button
                key={role}
                onClick={() => setSelectedRole(role)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium border transition-all ${
                  selectedRole === role
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-secondary text-secondary-foreground border-border hover:border-primary/30"
                }`}
              >
                {role === "All Roles" ? role : role.split(" / ")[0]}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Results count */}
        <p className="text-xs text-muted-foreground">
          Showing <span className="text-foreground font-medium">{filtered.length}</span> of {jobsData.length} jobs
        </p>

        {/* Job Cards Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          <AnimatePresence mode="popLayout">
            {filtered.map((job, i) => {
              const expText =
                job.minExp === 0 && job.maxExp === 0
                  ? "Any experience"
                  : `${job.minExp}–${job.maxExp} yrs`;
              const postedDate = new Date(job.postedAt).toLocaleDateString("en-IN", {
                day: "numeric", month: "short",
              });

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
                  <Card className="card-hover group h-full flex flex-col">
                    <CardContent className="p-5 flex flex-col gap-4 h-full">
                      {/* Top row */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${
                                levelConfig[job.level] || levelConfig.mid
                              }`}
                            >
                              {job.level}
                            </span>
                            <span
                              className={`text-xs px-2 py-0.5 rounded border font-medium capitalize ${
                                sourceColors[job.source] || "bg-secondary text-secondary-foreground border-border"
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
                            <span className="text-muted-foreground text-sm">{job.company}</span>
                          </div>
                        </div>

                        {/* Match Ring */}
                        <div className="shrink-0 flex flex-col items-center">
                          <div className="relative h-14 w-14">
                            <svg className="h-14 w-14 -rotate-90" viewBox="0 0 48 48">
                              <circle cx="24" cy="24" r="20" fill="none" stroke="hsl(var(--border))" strokeWidth="4" />
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
                          <span className="text-[10px] text-muted-foreground mt-0.5">match</span>
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
                      <div className="flex items-center justify-between mt-auto pt-1 border-t border-border">
                        <Badge variant="secondary" className="text-xs">{job.role}</Badge>
                        <a href={job.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="hero" size="sm" className="gap-1.5 text-xs h-8">
                            Apply
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filtered.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-20">
            <Search className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-40" />
            <p className="text-muted-foreground">No jobs match your search</p>
            <Button variant="ghost" size="sm" className="mt-3" onClick={() => { setSearch(""); setSelectedRole("All Roles"); }}>
              Clear filters
            </Button>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
};

export default JobsPage;
