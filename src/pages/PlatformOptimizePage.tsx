import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Briefcase, CheckCircle2, ChevronRight, Zap, Loader2, Download, AlertCircle, FileText, FileDown, ArrowLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import AppLayout from "@/components/layout/AppLayout";
import { useProfile } from "@/hooks/useProfile";
import { useAuth } from "@/hooks/useAuth";
import { useStartPlatformOptimize, usePlatformOptimizeStatus } from "@/hooks/usePlatformOptimize";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// --- Mock Document Renderer for Resume ---
function HighlightText({ text, keywords }: { text: string; keywords?: string[] }) {
  if (!keywords || keywords.length === 0 || !text || typeof text !== 'string') return <>{text}</>;
  
  // Create regex for exact word matching if possible, or just substring
  const escapedKeywords = keywords.map(kw => kw.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedKeywords.join('|')})`, 'gi');
  
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => {
        const isMatch = keywords.some(kw => kw.toLowerCase() === part.toLowerCase());
        if (isMatch) {
          return (
            <span key={i} style={{ 
              backgroundColor: "rgba(16, 185, 129, 0.15)", 
              color: "#059669", 
              fontWeight: "bold",
              padding: "0 2px",
              borderRadius: "3px",
              borderBottom: "1px dashed rgba(16, 185, 129, 0.5)",
              boxShadow: "0 0 8px rgba(16, 185, 129, 0.2)"
            }}>
              {part}
            </span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function ResumeDocument({ resume, keywordsAdded = [] }: { resume: any, keywordsAdded?: string[] }) {
  if (!resume) return null;
  const { contact, summary, experience, projects, skills, education, certifications } = resume;

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mt-4 mb-1.5">
      <span style={{ fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em", textTransform: "uppercase", color: "#1a1a1a" }}>
        {title}
      </span>
      <div style={{ flex: 1, height: "1px", background: "#c0c0c0" }} />
    </div>
  );

  const hasSkills = skills && Object.values(skills).some((arr: any) => arr?.length > 0);

  return (
    <div style={{
      fontFamily: "'Inter', 'Helvetica Neue', sans-serif", fontSize: "11px", lineHeight: "1.5",
      color: "#1a1a1a", padding: "32px 36px", background: "#fff", minHeight: "100%", textAlign: "left"
    }}>
      <div style={{ textAlign: "center", borderBottom: "1px solid #d0d0d0", paddingBottom: "10px", marginBottom: "2px" }}>
        <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "5px" }}>{contact?.name || "Your Name"}</div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 12px", fontSize: "10px", color: "#444" }}>
          {contact?.location && <span>{contact.location}</span>}
          {contact?.phone && <span>{contact.phone}</span>}
          {contact?.email && <span style={{ color: "#1a5fa8" }}>{contact.email}</span>}
          {contact?.linkedin && <span style={{ color: "#1a5fa8" }}>{contact.linkedin.replace(/^https?:\/\//i, "").replace("www.", "")}</span>}
          {contact?.github && <span style={{ color: "#1a5fa8" }}>{contact.github.replace(/^https?:\/\//i, "").replace("www.", "")}</span>}
        </div>
      </div>
      {summary && (
        <>
          <SectionHeader title="Summary" />
          <p style={{ color: "#2a2a2a", lineHeight: "1.55" }}>
            <HighlightText text={summary} keywords={keywordsAdded} />
          </p>
        </>
      )}
      {hasSkills && (
        <>
          <SectionHeader title="Technical Skills" />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {Object.entries(skills).map(([cat, items]: any) => items?.length > 0 ? (
              <div key={cat} style={{ display: "flex", gap: "4px" }}>
                <span style={{ fontWeight: "700", minWidth: "130px", flexShrink: 0 }}>{cat}:</span>
                <span style={{ color: "#2a2a2a" }}>
                  <HighlightText text={items.join(", ")} keywords={keywordsAdded} />
                </span>
              </div>
            ) : null)}
          </div>
        </>
      )}
      {projects?.length > 0 && (
        <>
          <SectionHeader title="Projects" />
          {projects.map((proj: any, i: number) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
                  <span style={{ fontWeight: "700" }}>{proj.name}</span>
                  {proj.url && <span style={{ color: "#1a5fa8", fontSize: "10px" }}>{proj.url.replace(/^https?:\/\//i, "").replace("www.", "")}</span>}
                </div>
                {proj.date && <span style={{ color: "#555", fontSize: "10px", whiteSpace: "nowrap" }}>{proj.date}</span>}
              </div>
              <ul style={{ margin: "2px 0 0 14px", paddingLeft: "0", listStyleType: "disc" }}>
                {proj.bullets?.map((b: string, j: number) => (
                  <li key={j} style={{ marginBottom: "1px", color: "#2a2a2a" }}>
                    <HighlightText text={b} keywords={keywordsAdded} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
      {experience?.length > 0 && (
        <>
          <SectionHeader title="Work Experience" />
          {experience.map((exp: any, i: number) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "4px" }}>
                <div>
                  <span style={{ fontWeight: "700" }}>{exp.company}</span>
                  <span style={{ color: "#555" }}> | </span>
                  <span style={{ fontStyle: "italic", color: "#333" }}>{exp.title}</span>
                </div>
                <span style={{ color: "#555", fontSize: "10px", whiteSpace: "nowrap" }}>
                  {exp.startDate} – {exp.endDate}{exp.location ? ` · ${exp.location}` : ""}
                </span>
              </div>
              <ul style={{ margin: "3px 0 0 14px", paddingLeft: "0", listStyleType: "disc" }}>
                {exp.bullets?.map((b: string, j: number) => (
                  <li key={j} style={{ marginBottom: "2px", color: "#2a2a2a" }}>
                    <HighlightText text={b} keywords={keywordsAdded} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
      {education?.length > 0 && (
        <>
          <SectionHeader title="Education" />
          {education.map((edu: any, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "2px", marginBottom: "4px" }}>
              <div>
                <span style={{ fontWeight: "700" }}>{edu.institution}</span>
                <span style={{ color: "#333" }}> · {edu.degree}{edu.field ? `, ${edu.field}` : ""}</span>
                {edu.gpa && <span style={{ color: "#555" }}> · GPA: {edu.gpa}</span>}
              </div>
              <span style={{ color: "#555", fontSize: "10px", whiteSpace: "nowrap" }}>{edu.startDate} – {edu.endDate}{edu.location ? ` · ${edu.location}` : ""}</span>
            </div>
          ))}
        </>
      )}
      {certifications?.length > 0 && (
        <>
          <SectionHeader title="Certifications" />
          <ul style={{ margin: "0 0 0 14px", paddingLeft: "0", listStyleType: "disc" }}>
            {certifications.map((c: string, i: number) => (
              <li key={i} style={{ color: "#2a2a2a" }}>{c}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

const PLATFORMS = [
  { id: "naukri", name: "Naukri", color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20", glow: "shadow-blue-500/20" },
  { id: "instahyre", name: "Instahyre", color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-emerald-500/20" },
  { id: "foundit", name: "Foundit", color: "text-purple-400", bg: "bg-purple-500/10", border: "border-purple-500/20", glow: "shadow-purple-500/20" },
];

const LOADING_MESSAGES = [
  "Fetching top matching jobs for your profile...",
  "Analyzing trending skills for your profile...",
  "Rephrasing resume bullets to match ATS algorithms...",
  "Formatting document structure...",
  "Finalizing optimization..."
];

export default function PlatformOptimizePage() {
  const { data: profile } = useProfile();
  const { data: authData } = useAuth();
  const startMutation = useStartPlatformOptimize();
  const [activePlatformStr, setActivePlatformStr] = useState<string | null>(null);
  const [timeoutError, setTimeoutError] = useState(false);
  
  const { data: statusData, isError } = usePlatformOptimizeStatus(activePlatformStr, timeoutError);
  const [selectedPlatform, setSelectedPlatform] = useState<typeof PLATFORMS[0] | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [downloading, setDownloading] = useState<"pdf" | "docx" | null>(null);
  
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userCredits = profile?.credits ?? 10;

  // Handle stuck worker timeout (90 seconds)
  useEffect(() => {
    if (activePlatformStr && (statusData?.status === "pending" || statusData?.status === "processing" || !statusData)) {
      if (!timeoutRef.current) {
        timeoutRef.current = setTimeout(() => {
          setTimeoutError(true);
        }, 90000);
      }
    } else {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [activePlatformStr, statusData?.status]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (statusData?.status === "processing") {
      interval = setInterval(() => {
        setLoadingMsgIdx((prev) => (prev + 1) % LOADING_MESSAGES.length);
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [statusData?.status]);

  const handleStart = async () => {
    if (!selectedPlatform) return;
    if (userCredits < 2) {
      toast.error("Not enough credits. You need 2 credits for Platform Optimization.");
      return;
    }
    setShowConfirm(false);
    try {
      setTimeoutError(false);
      const userId = authData?.user?.id || "unknown";
      const result = await startMutation.mutateAsync({ platform: selectedPlatform.id, userId });
      setActivePlatformStr(selectedPlatform.id);
      
      if (result.cached) {
        toast.success("Loaded from recent optimization cache!");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to start optimization.");
    }
  };

  const downloadFile = async (type: "pdf" | "docx") => {
    if (!activePlatformStr) return;
    setDownloading(type);
    try {
      const response = await fetch(`${BASE_URL}/api/resume-intelligence/${activePlatformStr}/download/${type}`, {
        credentials: "include",
      });
      if (!response.ok) throw new Error(`Failed to download ${type.toUpperCase()}`);
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Optimized_Resume_${activePlatformStr}.${type}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success(`Successfully downloaded ${type.toUpperCase()}!`);
    } catch (e: any) {
      toast.error(e.message || `Could not download ${type.toUpperCase()}`);
    } finally {
      setDownloading(null);
    }
  };

  // State: Selection
  if (!activePlatformStr) {
    return (
      <AppLayout>
        <div className="max-w-5xl mx-auto px-6 py-12 relative min-h-[80vh]">
          {/* Subtle gradient background element */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-primary/5 rounded-full blur-[120px] pointer-events-none -z-10" />

          <div className="mb-12 text-center">
            <h1 className="text-3xl font-bold tracking-tight text-foreground md:text-5xl bg-clip-text text-transparent bg-gradient-to-br from-foreground to-foreground/70">
              Platform-Wide Resume Optimization
            </h1>
            <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto font-medium">
              Select a target job platform. We'll aggregate the top matching jobs tailored to your profile, analyze trending skills, and optimize your resume specifically to beat their ATS algorithm.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLATFORMS.map((platform) => (
              <motion.div
                key={platform.id}
                whileHover={{ scale: 1.03, y: -4 }}
                className={`relative p-6 rounded-2xl border cursor-pointer backdrop-blur-sm transition-all duration-300 ${
                  selectedPlatform?.id === platform.id ? `ring-2 ring-primary border-primary bg-card/80 shadow-2xl ${platform.glow}` : "border-border/50 hover:border-primary/40 bg-card/40 hover:bg-card/60"
                }`}
                onClick={() => setSelectedPlatform(platform)}
              >
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-5 ${platform.bg} ${platform.border} border shadow-inner`}>
                  <Briefcase className={`h-6 w-6 ${platform.color}`} />
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1 tracking-tight">{platform.name}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">Optimize your profile to rank higher in {platform.name} recruiter searches.</p>
              </motion.div>
            ))}
          </div>

          {selectedPlatform && (
             <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mt-12 flex justify-center">
                <Button size="lg" className="px-8 h-12 text-base bg-primary text-primary-foreground gap-2 shadow-[0_0_40px_-10px_rgba(16,185,129,0.5)] hover:shadow-[0_0_60px_-15px_rgba(16,185,129,0.7)] transition-shadow rounded-xl" onClick={() => setShowConfirm(true)}>
                  <Zap className="h-4 w-4" /> Optimize for {selectedPlatform.name} (2 Credits)
                </Button>
             </motion.div>
          )}

          {/* Confirm Modal */}
          <AnimatePresence>
            {showConfirm && (
              <>
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md" onClick={() => setShowConfirm(false)} />
                <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="fixed inset-0 z-50 m-auto h-fit w-full max-w-md bg-card/90 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-7">
                  <h2 className="text-2xl font-bold mb-3 tracking-tight">Confirm Optimization</h2>
                  <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
                    This action will consume <strong className="text-foreground">2 credits</strong> and take about 30-60 seconds to analyze live job trends on {selectedPlatform?.name}.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button variant="ghost" className="rounded-xl hover:bg-white/5" onClick={() => setShowConfirm(false)}>Cancel</Button>
                    <Button onClick={handleStart} disabled={startMutation.isPending} className="gap-2 rounded-xl">
                      {startMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
                      Start Analysis
                    </Button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* How it Works / Why it's Useful Section */}
          <div className="mt-24 pt-16 border-t border-white/5 relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight mb-4">Why Platform Optimization?</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Different job platforms have distinct ATS (Applicant Tracking System) algorithms. We use advanced AI to decode what top companies on each platform prioritize, giving you an unfair advantage.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-card/40 p-6 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-card/60 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-5 shadow-inner">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">1. Select Platform</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Choose the platform you're applying on. We track thousands of live job listings from top companies on Naukri, LinkedIn, Internshala, and more.</p>
              </div>
              <div className="bg-card/40 p-6 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-card/60 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mb-5 shadow-inner">
                  <Zap className="h-6 w-6 text-amber-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">2. AI Analysis</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Our AI cross-references your profile against our intelligence database to find critical missing keywords, layout preferences, and language tones.</p>
              </div>
              <div className="bg-card/40 p-6 rounded-3xl border border-white/5 backdrop-blur-sm hover:bg-card/60 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mb-5 shadow-inner">
                  <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                </div>
                <h3 className="text-lg font-semibold mb-2 text-foreground">3. Dominate ATS</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">Get a platform-perfect resume exported as PDF or DOCX, ready to bypass filters and land straight on the recruiter's desk.</p>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  // State: Processing
  if (statusData?.status === "pending" || statusData?.status === "processing" || !statusData) {
    return (
      <AppLayout>
        <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
          {/* Subtle gradient background element */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none -z-10 animate-pulse" />
          
          <div className="relative mb-12 flex justify-center items-center h-32">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center animate-pulse border border-primary/20 shadow-[0_0_40px_-10px_rgba(16,185,129,0.3)]">
              <Loader2 className="h-10 w-10 text-primary animate-spin" />
            </div>
          </div>
          <div className="h-10 relative w-full flex justify-center items-center overflow-hidden">
             <AnimatePresence mode="wait">
                <motion.p
                  key={loadingMsgIdx}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -15 }}
                  className="text-xl font-semibold text-foreground tracking-tight absolute"
                >
                  {LOADING_MESSAGES[loadingMsgIdx].replace("{platform}", selectedPlatform?.name || "the platform")}
                </motion.p>
             </AnimatePresence>
          </div>
          <p className="text-sm text-muted-foreground mt-4 max-w-md">
            We're using AI and graph queries to deeply analyze what top employers on this platform are looking for right now.
          </p>
          {/* Enhanced Progress Bar */}
          <div className="w-full max-w-md mx-auto mt-10 h-1.5 bg-white/5 rounded-full overflow-hidden shadow-inner border border-white/5">
             <motion.div 
               className="h-full bg-primary rounded-full relative" 
               initial={{ width: "0%" }} 
               animate={{ width: "95%" }} 
               transition={{ duration: 90, ease: "easeOut" }} 
             >
               <div className="absolute top-0 right-0 bottom-0 w-20 bg-gradient-to-r from-transparent to-white/30 animate-pulse" />
             </motion.div>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (isError || statusData?.status === "failed" || timeoutError) {
    return (
      <AppLayout>
         <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
            <AlertCircle className="h-16 w-16 text-destructive mb-6 animate-bounce" />
            <h2 className="text-2xl font-bold mb-3">
              {timeoutError ? "Request Timed Out" : "Optimization Failed"}
            </h2>
            <p className="text-muted-foreground mb-8">
              {timeoutError 
                ? "The AI worker took too long to respond. The system might be experiencing high load."
                : (statusData?.errorMessage || "There was an issue processing your resume for this platform.")}
            </p>
            <Button onClick={() => { setActivePlatformStr(null); setTimeoutError(false); }} variant="outline" className="rounded-xl">Try Again</Button>
         </div>
      </AppLayout>
    );
  }

  // State: Completed
  if (statusData.status === "completed" && (statusData.optimizedResume || statusData.optimizedJson)) {
    const scoreBefore = statusData.atsScores.before ?? 0;
    const scoreAfter = statusData.atsScores.after ?? 0;
    const scoreIncrease = scoreAfter - scoreBefore;

    return (
      <AppLayout>
        <div className="max-w-7xl mx-auto px-6 py-10 relative">
          {/* Subtle gradient background element */}
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />
          
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground flex items-center gap-3">
                Optimization Complete
                <CheckCircle2 className="h-8 w-8 text-emerald-500" />
              </h1>
              <p className="text-muted-foreground mt-2 text-sm font-medium">Targeted against top matching jobs on {selectedPlatform?.name}</p>
            </div>
            
            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <Button 
                variant="outline"
                onClick={() => { setActivePlatformStr(null); setSelectedPlatform(null); }}
                className="flex-1 md:flex-none gap-2 rounded-xl border-border/60 hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4" />
                Start Over
              </Button>
              <Button 
                onClick={() => downloadFile("pdf")} 
                disabled={downloading !== null}
                className="flex-1 md:flex-none gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-lg shadow-primary/20 rounded-xl"
              >
                {downloading === "pdf" ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
                Download Resume
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1fr_420px] gap-8 items-start relative">
            {/* Left Column: Live Preview */}
            <div className="flex flex-col gap-6 lg:sticky lg:top-24 h-[calc(100vh-8rem)]">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-foreground/90 shrink-0">
                <FileText className="h-5 w-5 text-primary" /> Live Resume Preview
              </h3>
              <div className="bg-card/40 backdrop-blur-md p-6 md:p-8 rounded-3xl border border-border/50 shadow-inner overflow-auto flex-1 flex justify-center items-start">
                 <div className="w-full max-w-[800px] min-w-[600px] mx-auto bg-white shadow-2xl rounded-sm shrink-0">
                    <ResumeDocument resume={statusData.optimizedResume || statusData.optimizedJson} keywordsAdded={statusData.keywordsAdded} />
                 </div>
              </div>
            </div>

            {/* Right Column: Dashboard */}
            <div className="flex flex-col gap-6">
              {/* A. Hero / Score Header (Animated Gauge) */}
              <div className="bg-card/60 backdrop-blur-xl rounded-3xl border border-white/5 p-8 shadow-xl relative overflow-hidden flex flex-col items-center text-center">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px] -z-10 translate-x-1/2 -translate-y-1/2" />
                
                <h3 className="text-xl font-bold text-foreground mb-1">Optimization Successful!</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Your resume is now highly optimized for {selectedPlatform?.name} algorithms.
                </p>

                {/* Animated Gauge */}
                <div className="relative w-48 h-48 flex items-center justify-center mb-4">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Background Track */}
                    <circle cx="50" cy="50" r="40" className="stroke-white/5" strokeWidth="8" fill="none" />
                    {/* Animated Score Bar */}
                    <motion.circle 
                      cx="50" cy="50" r="40" 
                      className="stroke-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" 
                      strokeWidth="8" fill="none" strokeLinecap="round"
                      initial={{ strokeDasharray: "0, 251.2" }}
                      animate={{ strokeDasharray: `${(scoreAfter / 100) * 251.2}, 251.2` }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span 
                      className="text-5xl font-bold text-emerald-400 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      {scoreAfter}
                    </motion.span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mt-1">ATS Score</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 bg-background/50 rounded-2xl px-5 py-3 border border-white/5">
                  <div className="text-center">
                    <div className="text-sm font-semibold text-muted-foreground">{scoreBefore}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground/60">Before</div>
                  </div>
                  {statusData.improvement && (
                    <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full shadow-sm border border-emerald-500/20">
                      +{statusData.improvement} Pts
                    </span>
                  )}
                </div>
              </div>

              {/* B. The "Skills to Learn" Roadmap */}
              {statusData.skillRecommendations && statusData.skillRecommendations.length > 0 && (
                <div className="bg-card/60 backdrop-blur-xl rounded-3xl border border-white/5 p-6 shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] -z-10 translate-x-1/2 -translate-y-1/2" />
                  <h3 className="text-xs font-bold text-primary mb-3 uppercase tracking-widest flex items-center gap-2">
                    Strategic Skill Roadmap
                  </h3>
                  <p className="text-[13px] text-muted-foreground mb-5 leading-relaxed">
                    Based on market trends, adding these real-world skills to your toolkit will drastically increase your callback rate.
                  </p>
                  <div className="space-y-4">
                    {statusData.skillRecommendations.map((rec, i) => {
                      const imp = rec.importance.toLowerCase();
                      const isCritical = imp === "critical";
                      const isHigh = imp === "high";
                      const colorTheme = isCritical 
                        ? { bg: "bg-red-500/5 hover:bg-red-500/10", border: "border-red-500/10", badgeBg: "bg-red-500/20", badgeText: "text-red-400", badgeBorder: "border-red-500/20" }
                        : isHigh 
                        ? { bg: "bg-amber-500/5 hover:bg-amber-500/10", border: "border-amber-500/10", badgeBg: "bg-amber-500/20", badgeText: "text-amber-400", badgeBorder: "border-amber-500/20" }
                        : { bg: "bg-blue-500/5 hover:bg-blue-500/10", border: "border-blue-500/10", badgeBg: "bg-blue-500/20", badgeText: "text-blue-400", badgeBorder: "border-blue-500/20" };

                      return (
                        <div key={i} className={`flex flex-col p-4 rounded-2xl border transition-colors ${colorTheme.bg} ${colorTheme.border}`}>
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-semibold text-foreground capitalize">
                                {rec.skill}
                              </span>
                              <span className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${colorTheme.badgeBg} ${colorTheme.badgeText} ${colorTheme.badgeBorder}`}>
                                {rec.importance}
                              </span>
                            </div>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md shadow-sm border ${colorTheme.badgeBg} ${colorTheme.badgeText} ${colorTheme.badgeBorder}`}>
                              {rec.demandPct}% Demand
                            </span>
                          </div>
                          <p className="text-xs text-muted-foreground leading-relaxed font-medium">
                            {rec.learnMessage}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* C. Platform Trends (Market Intelligence) */}
              {statusData.scoreDetails?.topPlatformSkills && statusData.scoreDetails.topPlatformSkills.length > 0 && (
                <div className="bg-card/60 backdrop-blur-xl rounded-3xl border border-white/5 p-6 shadow-xl">
                  <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">
                    Platform Skill Trends ({selectedPlatform?.name})
                  </h3>
                  <div className="space-y-3">
                    {statusData.scoreDetails.topPlatformSkills.map((trend, i) => (
                      <div key={i} className="flex flex-col gap-1.5">
                        <div className="flex justify-between text-xs font-medium">
                          <span className="capitalize text-foreground/90">{trend.skill}</span>
                          <span className="text-muted-foreground">{trend.pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-primary/60 rounded-full" 
                            initial={{ width: 0 }} 
                            animate={{ width: `${trend.pct}%` }} 
                            transition={{ duration: 1, delay: 0.2 + i * 0.1 }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Optimization Notes & Keywords */}
              {(statusData.optimizationNotes || statusData.keywordsAdded || statusData.keywordsMissing) && (
                <div className="bg-card/60 backdrop-blur-xl rounded-3xl border border-white/5 p-6 shadow-xl">
                  {statusData.optimizationNotes && statusData.optimizationNotes.length > 0 && (
                    <>
                      <h3 className="text-xs font-bold text-muted-foreground mb-4 uppercase tracking-widest">What AI Changed</h3>
                      <ul className="space-y-3.5">
                        {statusData.optimizationNotes.map((note, i) => (
                          <li key={i} className="flex gap-3 text-sm text-foreground/90 leading-relaxed">
                            <Zap className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                            <span>{note}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                  {statusData.keywordsAdded && statusData.keywordsAdded.length > 0 && (
                    <div className={`pt-5 ${statusData.optimizationNotes && statusData.optimizationNotes.length > 0 ? 'mt-5 border-t border-white/5' : ''}`}>
                       <p className="text-xs font-bold text-emerald-400 mb-3 uppercase tracking-widest">Keywords Infused</p>
                       <div className="flex flex-wrap gap-2">
                         {statusData.keywordsAdded.map(kw => (
                           <span key={kw} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm capitalize">
                             {kw}
                           </span>
                         ))}
                       </div>
                    </div>
                  )}
                  {statusData.keywordsMissing && statusData.keywordsMissing.length > 0 && (
                    <div className={`pt-5 mt-5 border-t border-white/5`}>
                       <p className="text-xs font-bold text-red-400 mb-3 uppercase tracking-widest">Still Missing (Action Required)</p>
                       <p className="text-xs text-muted-foreground mb-3">You don't have these skills in your profile, so we couldn't add them safely. Consider learning these:</p>
                       <div className="flex flex-wrap gap-2">
                         {statusData.keywordsMissing.map((kw: string) => (
                           <span key={kw} className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 shadow-sm capitalize">
                             {kw}
                           </span>
                         ))}
                       </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* Actionable CTA Footer */}
          <div className="mt-12 p-8 bg-card/60 backdrop-blur-xl border border-white/5 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-1/2 left-0 w-[400px] h-[200px] bg-primary/10 rounded-full blur-[60px] -z-10 -translate-y-1/2" />
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-foreground">Ready to land interviews?</h2>
              <p className="text-muted-foreground mt-1.5 max-w-md">Your resume is now hyper-optimized. Download it and start applying on {selectedPlatform?.name} right away.</p>
            </div>
            <div className="flex flex-col sm:flex-row w-full md:w-auto gap-4">
              <Button 
                onClick={() => downloadFile("pdf")} 
                disabled={downloading !== null}
                size="lg"
                className="w-full sm:w-auto gap-2 bg-gradient-to-r from-primary to-emerald-600 hover:from-primary/90 hover:to-emerald-600/90 text-white shadow-lg shadow-primary/20 rounded-xl h-14 px-8 text-base"
              >
                {downloading === "pdf" ? <Loader2 className="h-5 w-5 animate-spin" /> : <FileDown className="h-5 w-5" />}
                Download ATS-Friendly Resume
              </Button>
              <Button 
                onClick={() => window.location.href = '/jobs'}
                size="lg"
                className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/30 rounded-xl h-14 px-8 text-base"
              >
                <Briefcase className="h-5 w-5" />
                Apply to Jobs Now
              </Button>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }
  
  return null;
}
