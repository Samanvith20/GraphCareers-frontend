import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ExternalLink, Bookmark, CheckCircle, XCircle, Clock,
  Filter, LayoutDashboard, TrendingUp
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import AppLayout from "@/components/layout/AppLayout";
import { useUserJobApplications } from "@/hooks/useUserjobapplications";
import { Link } from "react-router-dom";
import ErrorPage from "./ErrorPage";

const statusConfig = {
  saved: {
    label: "Saved",
    icon: Bookmark,
    color: "bg-primary/10 text-primary border-primary/20",
    dot: "bg-primary",
  },
  applied: {
    label: "Applied",
    icon: CheckCircle,
    color: "bg-accent/10 text-accent border-accent/20",
    dot: "bg-accent",
  },
  ignored: {
    label: "Ignored",
    icon: XCircle,
    color: "bg-muted text-muted-foreground border-border",
    dot: "bg-muted-foreground",
  },
  interviewing: {
    label: "Interviewing",
    icon: Clock,
    color: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    dot: "bg-yellow-400",
  },
};

const sourceColors = {
  naukri: "bg-secondary text-secondary-foreground border-border",
  foundit: "bg-accent/10 text-accent border-accent/20",
};

const statuses = ["all", "saved", "applied", "ignored"];

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.4, delay: i * 0.07 } }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const JobTrackerPage = () => {
  const [activeTab, setActiveTab] = useState("all");
  const { data: jobs = [], isLoading, isError } = useUserJobApplications();
  if (isLoading) {
  return (
    <AppLayout>
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
      </div>
    </AppLayout>
  );
}
if (isError || !jobs) {
  return (
    <AppLayout>
     <ErrorPage />
    </AppLayout>
  );
}


  

const filtered =
  activeTab === "all"
    ? jobs
    : jobs.filter((j) => j.status === activeTab);

  const counts = {
  all: jobs.length,
  saved: jobs.filter((j) => j.status === "saved").length,
  applied: jobs.filter((j) => j.status === "applied").length,
  ignored: jobs.filter((j) => j.status === "ignored").length,
};

  const summaryStats = [
    { label: "Total Tracked", value: jobs.length, icon: LayoutDashboard, color: "text-primary" },
    { label: "Applied", value: counts.applied ||"-", icon: CheckCircle, color: "text-accent" },
    { label: "Saved", value: counts.saved ||"-", icon: Bookmark, color: "text-primary" },
    { label: "Ignored", value: counts.ignored ||"-", icon: XCircle, color: "text-muted-foreground" },
  ];

  return (
    <AppLayout>
    
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Page header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <LayoutDashboard className="h-6 w-6 text-primary" />
                Job Tracker
              </h1>
              <p className="text-muted-foreground text-sm mt-1">Monitor all your job applications in one place</p>
            </div>
            <Button variant="hero" size="sm" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              View Insights
            </Button>
          </div>
        </motion.div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {summaryStats.map(({ label, value, icon: Icon, color }, i) => (
            <motion.div
              key={label}
              custom={i}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card className="card-hover">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground font-medium">{label}</span>
                    <Icon className={`h-4 w-4 ${color}`} />
                  </div>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Tabs + Job Cards */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center gap-3 flex-wrap">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <TabsList className="bg-secondary">
              {statuses.map((s) => (
                <TabsTrigger key={s} value={s} className="capitalize text-xs gap-1.5">
                  {s}
                  <span className="bg-background/60 rounded-full px-1.5 py-0.5 text-[10px] font-mono">
                    {counts[s] ?? filtered.length}
                  </span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {statuses.map((s) => (
            <TabsContent key={s} value={s} className="mt-4 space-y-3">
              <AnimatePresence mode="popLayout">
                {filtered.map((job, i) => {
                  const cfg = statusConfig[job.status] || statusConfig.saved;
                  const Icon = cfg.icon;
                  const posted = new Date(job.createdAt).toLocaleDateString("en-IN", {
                    day: "numeric", month: "short", year: "numeric",
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
                      <Card className="card-hover group">
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap mb-1">
                                <h3 className="font-semibold text-foreground text-sm leading-snug truncate">
                                  {job.jobTitle}
                                </h3>
                                <span
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${cfg.color}`}
                                >
                                  <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                                  {cfg.label}
                                </span>
                              </div>
                              <p className="text-muted-foreground text-sm font-medium">{job.company}</p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span
                                  className={`text-xs px-2 py-0.5 rounded border capitalize font-medium ${
                                    sourceColors[job.source] || "bg-secondary text-secondary-foreground border-border"
                                  }`}
                                >
                                  {job.source}
                                </span>
                                <span className="text-xs text-muted-foreground">Added {posted}</span>
                              </div>
                            </div>
                            <a
                              href={job.jobUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
                                <ExternalLink className="h-3.5 w-3.5" />
                              </Button>
                            </a>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {jobs.length === 0 && (
  <motion.div
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex flex-col items-center justify-center py-20 text-center"
  >
    <LayoutDashboard className="h-12 w-12 text-muted-foreground opacity-40 mb-4" />
    <h3 className="text-lg font-semibold text-foreground mb-1">
      No jobs tracked yet
    </h3>
    <p className="text-sm text-muted-foreground max-w-sm mb-4">
      Start tracking jobs you’re interested in to manage applications and follow-ups easily.
    </p>
    <Link to="/jobs">
    <Button variant="hero" size="sm">
      Add your first job
    </Button>
    </Link>
  </motion.div>
)}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default JobTrackerPage;
