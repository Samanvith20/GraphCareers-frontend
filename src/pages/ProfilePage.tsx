import { motion } from "framer-motion";
import {
  MapPin,
  Mail,
  Briefcase,
  Calendar,
  Star,
  Shield,
  User,
  Edit,
  Github,
  Linkedin,
  Globe,
  Loader2,
  Upload,
  Clock,
  FileText,
  Plus,
  Check,
  X,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useProfile } from "@/hooks/useProfile";
import AppLayout from "@/components/layout/AppLayout";
import { useEffect, useState } from "react";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useUploadResume } from "@/hooks/useUploadResume";
import { toast } from "sonner";
import { logoutUser } from "@/lib/logout";
import { normalizeSkill } from "@/lib/utils";

const skillCategories = [
  {
    label: "Frontend",
    color: "text-primary",
    bg: "bg-primary/10 text-primary border-primary/20",
    skills: [
      "javascript",
      "typescript",
      "react.js",
      "next.js",
      "redux",
      "tailwind css",
      "html5",
      "css3",
    ],
  },
  {
    label: "Backend",
    color: "text-accent",
    bg: "bg-accent/10 text-accent border-accent/20",
    skills: [
      "node.js",
      "express.js",
      "rest apis",
      "graphql",
      "prisma",
      "drizzle orm",
      "jwt",
      "oauth 2.0",
    ],
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
    skills: [
      "docker",
      "github actions",
      "aws",
      "linux",
      "shell scripting",
      "terraform",
      "ansible",
    ],
  },
  {
    label: "AI & Scraping",
    color: "text-primary",
    bg: "bg-primary/10 text-primary border-primary/20",
    skills: [
      "playwright",
      "cheerio",
      "puppeteer",
      "proxy management",
      "rag pipelines",
      "vector databases",
      "llm apis",
      "prompt engineering",
      "openai",
      "anthropic",
    ],
  },
];

const ProfilePage = () => {
  // All hooks must be called at the top of the component
  const { data: userData, isLoading, isError } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadResume = useUploadResume();
type ResumeStatus =
  | "idle"
  | "uploading"
  | "extracting"
  | "parsing"
  | "completed"
  | "error";

   const [resumeStatus, setResumeStatus] = useState<ResumeStatus>("idle");
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: userData?.name || "",
    bio: userData?.bio || "",
    location: userData?.location || "Add Your Location",
    experience: userData?.experience || 0,
    skills: userData?.skills || [],
    role: userData?.role || "",
  });

  const [newSkill, setNewSkill] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [extracting, setExtracting] = useState(false);
  const [extracted, setExtracted] = useState(false);
  useEffect(() => {
    if (!userData) return;
    setForm({
      name: userData.name || "",
      bio: userData.bio || "",
      location: userData.location || "",
      experience: userData.experience || 0,
      skills: (userData.skills ?? []).map(normalizeSkill),
      role: userData.role || "",
    });
  }, [userData]);
  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            <p className="text-sm text-muted-foreground">Loading profile…</p>
          </div>
        </div>
      </AppLayout>
    );
  }
  

  if (isError || !userData) {
    return (
      <AppLayout>
        <div className="p-6 text-center text-destructive">
          Failed to load profile
        </div>
      </AppLayout>
    );
  }
  const stats = [
    { label: "Total Skills", value: userData.skills.length || 0, icon: Star },
    {
      label: "Experience",
      value: userData.experience
        ? `${userData.experience} months`
        : "Not added",
      icon: Briefcase,
    },
    { label: "Applications", value: 0, icon: Globe },
  ];

  const basicInfoFields = [
    userData.name,
    userData.email,
    userData.location,
    userData?.role,
  ];

  const handleSave = () => {
    const updatedFields = {};
    Object.keys(form).forEach((key) => {
      if (
        form[key] !== userData[key] &&
        (Array.isArray(form[key]) ? form[key].length > 0 : form[key] !== "")
      ) {
        updatedFields[key] = form[key];
      }
    });
    if (Object.keys(updatedFields).length > 0) {
      updateProfile.mutate(updatedFields as any, {
        onSuccess: () => {
          setEditing(false);
          toast.success("Profile updated successfully");
        },
        onError: () => {
          toast.error("Failed to update profile");
        },
      });
    } else {
      setEditing(false);
    }
  };
  const isBusy =
  resumeStatus === "uploading" ||
  resumeStatus === "extracting" ||
  resumeStatus === "parsing";
const handleResumeUpload = async (
  e: React.ChangeEvent<HTMLInputElement>
) => {
  const file = e.target.files?.[0];
  if (!file) return;

  setResumeFile(file);
  setResumeStatus("uploading");

  try {
    // Step 1: Upload + text extraction
    await uploadResume.mutateAsync(file);
    setResumeStatus("extracting");

    // Step 2: AI parsing
    setResumeStatus("parsing");
    const res = await fetch("/api/user/resume-parse", {
      method: "POST",
    });

    if (!res.ok) {
      throw new Error("AI parsing failed");
    }

    setResumeStatus("completed");
    toast.success("Resume processed and profile updated 🎉");
  } catch (err: any) {
    console.error(err);
    setResumeStatus("idle");
    toast.error(err.message || "Resume processing failed");
  }
};
  const filledBasicInfo = basicInfoFields.filter(Boolean).length;
  const totalBasicInfo = basicInfoFields.length;

  const basicInfoPct = Math.round((filledBasicInfo / totalBasicInfo) * 100);
  const profileCompletion = {
    basicInfo: basicInfoPct,

    experience: userData.experience > 0 ? 100 : 0,
    skills:
      userData.skills.length >= 6 ? 100 : userData.skills.length > 3 ? 50 : 0,
    bio: userData.bio.length >= 50 ? 100 : 0,
  };

  const totalCompletion = Object.values(profileCompletion).reduce(
    (sum, v) => sum + v,
    0,
  );
  const profileStrengthItems = [
    { label: "Basic Info", pct: profileCompletion.basicInfo },
    { label: "Experience Added", pct: profileCompletion.experience },
    { label: "Skills Added", pct: profileCompletion.skills },
    { label: "Bio Written", pct: profileCompletion.bio },
  ];

  const cardVariants = {
    hidden: { opacity: 0, y: 24 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, delay: i * 0.1 },
    }),
  };
  const initials = userData.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2);
  const memberSince = new Date(userData.createdAt).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
  const addSkill = () => {
    const raw = newSkill;
    if (!raw.trim()) return;

    const normalizedNew = normalizeSkill(raw);

    const normalizedExisting = form.skills.map(normalizeSkill);

    if (normalizedExisting.includes(normalizedNew)) {
      toast.error("Skill already added");
      return;
    }

    setForm((f) => ({
      ...f,
      skills: [...f.skills, normalizedNew],
    }));

    setNewSkill("");
  };
  const handleCancel = () => {
    setEditing(false);
    setForm({
      name: userData.name ?? "",
      bio: userData.bio ?? "",
      location: userData.location ?? "",
      experience: userData.experience ?? 0,
      skills: userData.skills ?? [],
      role: userData.role ?? "",
    });
  };
  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success("Logged out successfully");
      // Redirect to login page or clear user session
      window.location.href = "/login";
    } catch (error) {
      toast.error("Failed to log out");
    }
  };

  return (
    <AppLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Header Card */}
        <motion.div
          custom={0}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          <Card className="overflow-hidden">
            <div className="h-28 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5 relative">
              <div className="absolute inset-0 bg-grid opacity-20" />
            </div>
            <CardContent className="pt-0 pb-6 px-6">
              <div className="flex flex-col sm:flex-row relative z-10  sm:items-end sm:justify-between gap-4 -mt-10">
                <div className="flex items-end gap-4">
                  <Avatar className="h-20 w-20 border-4 border-background shadow-glow">
                    <AvatarFallback className="text-xl font-bold bg-primary/20 text-primary">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="pb-1">
                    {editing ? (
                      <Input
                        value={form.name}
                        onChange={(e) =>
                          setForm({ ...form, name: e.target.value })
                        }
                        className="text-lg font-bold h-8 mb-1"
                      />
                    ) : (
                      <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-xl font-bold text-foreground">
                          {userData.name || "Unnamed User"}
                        </h1>
                        <Badge
                          variant="secondary"
                          className="capitalize text-xs"
                        >
                          {userData.tier} plan
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {editing ? (
                        <>
                          <span className="text-muted-foreground text-sm">
                            Role:
                          </span>
                          <Input
                            value={form.role ?? ""}
                            onChange={(e) =>
                              setForm((f) => ({ ...f, role: e.target.value }))
                            }
                            placeholder="Add your role"
                            className="w-40"
                          />
                        </>
                      ) : (
                        userData.role && (
                          <>
                            <span className="text-muted-foreground text-sm">
                              Role:
                            </span>
                            <span className="text-muted-foreground text-sm">
                              {userData.role}
                            </span>
                          </>
                        )
                      )}
                    </div>
                  </div>
                </div>
                {editing ? (
                  <div className="flex gap-2 self-start sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleCancel}
                    >
                      <X className="h-3.5 w-3.5" /> Cancel
                    </Button>
                    <Button
                      variant="hero"
                      size="sm"
                      className="gap-2"
                      onClick={handleSave}
                      disabled={isBusy}
                    >
                      <Check className="h-3.5 w-3.5" />  {isBusy ? "Please wait…" : "Save"}
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2 self-start sm:self-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 self-start sm:self-auto"
                      onClick={() => setEditing(true)}
                    >
                      <Edit className="h-3.5 w-3.5" /> Edit Profile
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleLogout}
                    >
                      Logout
                    </Button>
                  </div>
                )}
              </div>

              <Separator className="my-4" />

              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {editing ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      <Input
                        value={form.location ?? "Add Your Location"}
                        onChange={(e) =>
                          setForm({ ...form, location: e.target.value })
                        }
                        className="h-7 w-36 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <Input
                        value={form.experience ?? ""}
                        onChange={(e) =>
                          setForm({ ...form, experience: e.target.value })
                        }
                        className="h-7 w-20 text-sm"
                        type="number"
                      />
                      <span className="text-xs">months</span>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-primary" />
                      {userData.location || "Location not added"}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Mail className="h-4 w-4 text-primary" />
                      {userData.email}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Briefcase className="h-4 w-4 text-primary" />
                      {userData.experience || 0} months experience
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-primary" />
                      Member since {memberSince}
                    </span>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left column */}
          <div className="space-y-6 lg:col-span-1">
            {/* Stats */}
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {stats.map(({ label, value, icon: Icon }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Icon className="h-4 w-4 text-primary" />
                        {label}
                      </div>
                      <span className="font-semibold text-foreground text-sm">
                        {value}
                      </span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </motion.div>
            {/* Resume Upload / Extraction */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Resume
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground">
                    Upload your resume and we'll extract your details
                    automatically.
                  </p>

                   <label
  htmlFor="resume-upload"
  className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-lg p-5 cursor-pointer transition-colors"
>
  {resumeStatus === "uploading" && (
    <>
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-sm font-medium">Uploading resume…</p>
      <p className="text-xs text-muted-foreground">
        Sending file securely
      </p>
    </>
  )}

  {resumeStatus === "extracting" && (
    <>
      <Clock className="h-8 w-8 text-primary" />
      <p className="text-sm font-medium">Extracting text…</p>
      <p className="text-xs text-muted-foreground">
        Reading resume contents
      </p>
      <Progress value={40} className="h-1.5 w-full" />
    </>
  )}

  {resumeStatus === "parsing" && (
    <>
      <Loader2 className="h-8 w-8 text-primary animate-spin" />
      <p className="text-sm font-medium">Analyzing resume with AI…</p>
      <p className="text-xs text-muted-foreground">
        Skills · Experience · Bio
      </p>
      <Progress value={70} className="h-1.5 w-full" />
    </>
  )}

  {resumeStatus === "completed" && resumeFile && (
    <>
      <FileText className="h-8 w-8 text-primary" />
      <p className="text-sm font-medium">{resumeFile.name}</p>
      <p className="text-xs text-primary">✓ Resume processed</p>
      <Progress value={100} className="h-1.5 w-full" />
    </>
  )}

  {resumeStatus === "idle" && (
    <>
      <Upload className="h-8 w-8 text-muted-foreground" />
      <p className="text-sm font-medium">Drop your resume here</p>
      <p className="text-xs text-muted-foreground">
        PDF, DOCX · max 500KB
      </p>
    </>
  )}

  <input
    id="resume-upload"
    type="file"
    accept=".pdf,.doc,.docx"
    className="hidden"
    onChange={handleResumeUpload}
    disabled={resumeStatus !== "idle" && resumeStatus !== "completed"}
  />
</label>
                </CardContent>
              </Card>
            </motion.div>
            {/* Profile Completion */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Profile Strength
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {profileStrengthItems.map(({ label, pct }) => (
                    <div key={label} className="space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">{label}</span>
                        <span
                          className={
                            pct > 0 ? "text-primary" : "text-muted-foreground"
                          }
                        >
                          {pct}%
                        </span>
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
            {userData.skills.length === 0 && !userData.bio && (
              <Card className="border-dashed bg-accent/10">
                <CardContent className="p-6 text-center flex flex-col items-center">
                  <p className="text-lg text-primary font-semibold mb-2">
                    🚀 Welcome! Let's build your profile
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Add your bio and skills to get better job matches and
                    recommendations.
                  </p>
                  <Button
                    variant="hero"
                    size="sm"
                    onClick={() => setEditing(true)}
                  >
                    Start Editing
                  </Button>
                </CardContent>
              </Card>
            )}
            {/* Bio */}
            <motion.div
              custom={1}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4 text-primary" />
                    About
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {editing ? (
                    <Textarea
                      value={form.bio}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, bio: e.target.value }))
                      }
                    />
                  ) : (
                    <p className="text-muted-foreground text-sm">
                      {userData.bio || "Tell us about yourself…"}
                    </p>
                  )}
                </CardContent>
              </Card>
            </motion.div>

            {/* Skills - editable and show all */}
            <motion.div
              custom={2}
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Star className="h-4 w-4 text-primary" />
                    Skills
                    <Badge variant="secondary" className="ml-auto text-xs">
                      {form.skills.length} total
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-5 ">
                  {editing && (
                    <div className="flex gap-2">
                      <Input
                        value={newSkill}
                        onChange={(e) => setNewSkill(e.target.value)}
                        placeholder="Add a skill..."
                        className="text-sm"
                        onKeyDown={(e) =>
                          e.key === "Enter" && (e.preventDefault(), addSkill())
                        }
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (newSkill.trim()) {
                            setForm((f) => ({
                              ...f,
                              skills: [...f.skills, newSkill.trim()],
                            }));
                            setNewSkill("");
                          }
                        }}
                        className="gap-1.5 shrink-0"
                      >
                        <Plus className="h-3.5 w-3.5" /> Add
                      </Button>
                    </div>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {form.skills.length === 0 && !editing ? (
                      <span className="text-muted-foreground text-sm">
                        No skills added yet.
                      </span>
                    ) : (
                      form.skills.map((skill: string, idx) => (
                        <span
                          key={skill + idx}
                          className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize bg-primary/10 text-primary border-primary/20 group"
                        >
                          {skill}
                          {editing && (
                            <button
                              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-xs font-medium border capitalize bg-primary/10 text-primary border-primary/20 group"
                              type="button"
                              onClick={() =>
                                setForm((f) => ({
                                  ...f,
                                  skills: f.skills.filter((s, i) => i !== idx),
                                }))
                              }
                            >
                              ×
                            </button>
                          )}
                        </span>
                      ))
                    )}
                  </div>
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
