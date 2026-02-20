import { motion } from "framer-motion";
import {
  MapPin, Mail, Briefcase, Calendar, Star, Shield, User,
  Edit, Github, Linkedin, Globe
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { userData } from "@/data/sampleData";
import AppLayout from "@/components/layout/AppLayout";

const skillCategories = [
  {
    label: "Frontend",
    color: "text-primary",
    bg: "bg-primary/10 text-primary border-primary/20",
    skills: ["javascript", "typescript", "react.js", "next.js", "redux", "tailwind css", "html5", "css3"],
  },
  {
    label: "Backend",
    color: "text-accent",
    bg: "bg-accent/10 text-accent border-accent/20",
    skills: ["node.js", "express.js", "rest apis", "graphql", "prisma", "drizzle orm", "jwt", "oauth 2.0"],
  },
  {
    label: "Databases",
    color: "text-primary",
    bg: "bg-secondary text-secondary-foreground border-border",
    skills: ["postgresql", "mongodb", "neo4j", "redis", "bullmq", "rabbitmq"],
  },
  {
    label: "DevOps & Cloud",
    color: "text-accent",
    bg: "bg-accent/10 text-accent border-accent/20",
    skills: ["docker", "github actions", "aws", "linux", "shell scripting", "terraform", "ansible"],
  },
  {
    label: "AI & Scraping",
    color: "text-primary",
    bg: "bg-primary/10 text-primary border-primary/20",
    skills: ["playwright", "cheerio", "puppeteer", "proxy management", "rag pipelines", "vector databases", "llm apis", "prompt engineering", "openai", "anthropic"],
  },
];

const stats = [
  { label: "Total Skills", value: userData.skills.length, icon: Star },
  { label: "Years Experience", value: userData.experience, icon: Briefcase },
  { label: "Applications", value: 5, icon: Globe },
  { label: "Match Rate", value: "100%", icon: Shield },
];

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: (i) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.1 } }),
};

const ProfilePage = () => {
  const initials = userData.name.split(" ").map((n) => n[0]).join("").slice(0, 2);
  const memberSince = new Date(userData.createdAt).toLocaleDateString("en-IN", { month: "long", year: "numeric" });

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Card */}
        <motion.div custom={0} variants={cardVariants} initial="hidden" animate="visible">
          <Card className="overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5 relative">
              <div className="absolute inset-0 bg-grid opacity-20" />
            </div>
            <CardContent className="pt-0 pb-6 px-6">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 -mt-10">
                <div className="flex items-end gap-4">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-glow">
                    <AvatarFallback className="text-xl font-bold bg-primary/20 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pb-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h1 className="text-xl font-bold text-foreground">{userData.name}</h1>
                      <Badge variant="secondary" className="capitalize text-xs">{userData.tier} plan</Badge>
                    </div>
                    <p className="text-muted-foreground text-sm mt-0.5">Senior Software Engineer</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="gap-2 self-start sm:self-auto">
                  <Edit className="h-3.5 w-3.5" />
                  Edit Profile
                </Button>
              </div>

              <Separator className="my-4" />

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary" />{userData.location}</span>
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4 text-primary" />{userData.email}</span>
                <span className="flex items-center gap-1.5"><Briefcase className="h-4 w-4 text-primary" />{userData.experience} months experience</span>
                <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4 text-primary" />Member since {memberSince}</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-1">
            {/* Stats */}
            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Overview</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.map(({ label, value, icon: Icon }) => (
                    <div key={label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className="h-4 w-4 text-primary" />
                        {label}
                      </div>
                      <span className="font-semibold text-foreground text-sm">{value}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Completion */}
            <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Profile Strength</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {[
                    { label: "Basic Info", pct: 100 },
                    { label: "Skills Added", pct: 100 },
                    { label: "Bio Written", pct: 100 },
                    { label: "Resume Linked", pct: 0 },
                  ].map(({ label, pct }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span className={pct === 100 ? "text-primary" : "text-muted-foreground"}>{pct}%</span>
                      </div>
                      <Progress value={pct} className="h-1.5" />
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          {/* Right column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            <motion.div custom={1} variants={cardVariants} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm leading-relaxed">{userData.bio}</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills by category */}
            <motion.div custom={2} variants={cardVariants} initial="hidden" animate="visible">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Skills
                    <Badge variant="secondary" className="ml-auto text-xs">{userData.skills.length} total</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  {skillCategories.map(({ label, bg, skills }) => (
                    <div key={label}>
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{label}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {skills.map((skill) => (
                          <span
                            key={skill}
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize ${bg}`}
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default ProfilePage;
