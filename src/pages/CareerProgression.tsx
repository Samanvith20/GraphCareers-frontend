import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  TrendingUp,
  ArrowRightLeft,
  Briefcase,
  GraduationCap,
  Building2,
  ChevronRight,
  Target,
  AlertTriangle,
  Sparkles,
  Users,
} from "lucide-react";
import { careerProgressionData, type CareerRole } from "@/data/careerData";

const data = careerProgressionData;

function readinessColor(r: number) {
  if (r >= 70) return "text-emerald-400";
  if (r >= 50) return "text-amber-400";
  return "text-rose-400";
}

function readinessBg(r: number) {
  if (r >= 70) return "bg-emerald-400";
  if (r >= 50) return "bg-amber-400";
  return "bg-rose-400";
}

function RoleCard({ role, index }: { role: CareerRole; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card className="card-hover border-border/60 bg-card/80">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <CardTitle className="text-lg">{role.title}</CardTitle>
              <Badge variant="outline" className="text-xs font-normal">
                {role.level}
              </Badge>
            </div>
            <div className="text-right shrink-0">
              <span className={`text-2xl font-bold ${readinessColor(role.readiness)}`}>
                {role.readiness}%
              </span>
              <p className="text-[11px] text-muted-foreground">readiness</p>
            </div>
          </div>
          <Progress
            value={role.readiness}
            className="h-1.5 mt-2"
            style={
              {
                "--progress-color": role.readiness >= 70 ? "hsl(160 60% 45%)" : role.readiness >= 50 ? "hsl(45 93% 47%)" : "hsl(0 72% 51%)",
              } as React.CSSProperties
            }
          />
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Market Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-muted-foreground">
                <span className="text-foreground font-medium">{role.market.totalJobs}</span> jobs
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground">💰</span>
              <span className="text-foreground font-medium text-xs">{role.market.avgSalary}</span>
            </div>
          </div>

          {/* Top Companies */}
          {role.market.topCompanies.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Building2 className="h-3 w-3" />
                Hiring
              </div>
              <div className="flex flex-wrap gap-1">
                {role.market.topCompanies.map((c) => (
                  <Badge key={c} variant="secondary" className="text-[11px] font-normal">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Matched Skills */}
          <div className="space-y-1.5">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="h-3 w-3" />
              Skills you have ({role.matchedSkills.length})
            </div>
            <div className="flex flex-wrap gap-1">
              {role.matchedSkills.map((s) => (
                <Badge key={s} className="text-[11px] font-normal bg-primary/15 text-primary border-primary/20 hover:bg-primary/20">
                  {s}
                </Badge>
              ))}
            </div>
          </div>

          {/* Skills to Learn */}
          {role.learnThese.length > 0 && (
            <div className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <GraduationCap className="h-3 w-3" />
                Learn these ({role.learnThese.length})
              </div>
              <div className="flex flex-wrap gap-1">
                {role.learnThese.slice(0, 6).map((s) => (
                  <Badge key={s} variant="outline" className="text-[11px] font-normal border-amber-500/30 text-amber-400/80">
                    {s}
                  </Badge>
                ))}
                {role.learnThese.length > 6 && (
                  <Badge variant="outline" className="text-[11px] font-normal text-muted-foreground">
                    +{role.learnThese.length - 6} more
                  </Badge>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      <div className="h-16 w-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        <AlertTriangle className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">No matching paths found</h3>
      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
        We couldn't find career paths that align with your current skills in this direction.
        Try updating your profile with more skills or check back later as we add more roles.
      </p>
    </motion.div>
  );
}

function BothEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-20 px-6 text-center"
    >
      <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mb-5">
        <Sparkles className="h-10 w-10 text-muted-foreground" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-3">
        Not enough data to map your career paths
      </h2>
      <p className="text-muted-foreground text-sm max-w-md leading-relaxed mb-6">
        Your skill profile doesn't have enough overlap with roles in our database yet. 
        Add more skills to your profile or upload your resume for better analysis.
      </p>
      <div className="flex gap-3">
        <a
          href="/profile"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          Update Skills
          <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}

 const CareerProgressionPage = () => {
  const hasVertical = data.vertical.length > 0;
  const hasHorizontal = data.horizontal.length > 0;
  const hasBoth = hasVertical && hasHorizontal;
  const hasNone = !hasVertical && !hasHorizontal;

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-1"
        >
          <h1 className="text-2xl font-bold text-foreground">Career Progression</h1>
          <p className="text-muted-foreground text-sm">
            Discover where your skills can take you — grow deeper or branch out.
          </p>
        </motion.div>

        {/* Profile Summary */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/60 bg-card/80">
            <CardContent className="p-5">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/15 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Your Profile</p>
                    <p className="text-xs text-muted-foreground">
                      {data.userProfile.experience} exp · {data.userProfile.skillsCount} skills · Target: {data.userProfile.targetLevel}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs text-muted-foreground">Best match:</span>
                  <Badge className="bg-primary/15 text-primary border-primary/20 hover:bg-primary/20 text-xs">
                    {data.currentRole}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        {hasNone ? (
          <BothEmptyState />
        ) : hasBoth ? (
          <Tabs defaultValue="vertical" className="space-y-6">
            <TabsList className="bg-secondary/50">
              <TabsTrigger value="vertical" className="gap-1.5 text-sm">
                <TrendingUp className="h-3.5 w-3.5" />
                Grow Deeper ({data.vertical.length})
              </TabsTrigger>
              <TabsTrigger value="horizontal" className="gap-1.5 text-sm">
                <ArrowRightLeft className="h-3.5 w-3.5" />
                Branch Out ({data.horizontal.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="vertical" className="space-y-1">
              <p className="text-xs text-muted-foreground mb-4">
                Progress within your current field — higher seniority, deeper expertise.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.vertical.map((role, i) => (
                  <RoleCard key={role.title} role={role} index={i} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="horizontal" className="space-y-1">
              <p className="text-xs text-muted-foreground mb-4">
                Shift into a different role leveraging your transferable skills.
              </p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {data.horizontal.map((role, i) => (
                  <RoleCard key={role.title} role={role} index={i} />
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          // Only one direction available
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              {hasVertical ? (
                <>
                  <TrendingUp className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-semibold">Grow Deeper</h2>
                </>
              ) : (
                <>
                  <ArrowRightLeft className="h-4 w-4 text-primary" />
                  <h2 className="text-lg font-semibold">Branch Out</h2>
                </>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {hasVertical
                ? "Progress within your current field — no horizontal paths found for your skills."
                : "Explore new roles — no vertical progression paths found for your current skills."}
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {(hasVertical ? data.vertical : data.horizontal).map((role, i) => (
                <RoleCard key={role.title} role={role} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default CareerProgressionPage;
