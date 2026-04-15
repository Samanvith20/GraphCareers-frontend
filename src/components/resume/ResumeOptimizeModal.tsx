// components/resume/ResumeOptimizeModal.tsx
// LAYOUT: unchanged slide-in drawer from right (900px wide)
// CHANGE: Step 3 now shows a rendered ATS resume document + score panel
//         instead of raw text tabs

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, ChevronRight, Loader2, CheckCircle2, AlertCircle,
  Download, ThumbsUp, Zap, FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

// NEW: full structured resume returned by updated backend
interface Contact {
  name: string; email: string; phone: string;
  location: string; linkedin: string; github: string;
}
interface ExperienceEntry {
  company: string; title: string; startDate: string;
  endDate: string; location: string; bullets: string[];
}
interface ProjectEntry {
  name: string; url: string; date: string; bullets: string[];
}
interface EducationEntry {
  institution: string; degree: string; field: string;
  startDate: string; endDate: string; gpa: string; location: string;
}
interface OptimizedResume {
  contact:           Contact;
  summary:           string;
  experience:        ExperienceEntry[];
  projects:          ProjectEntry[];
  skills:            Record<string, string[]>;
  education:         EducationEntry[];
  certifications:    string[];
  optimizationNotes: string[];
}

interface OptimizeResult {
  scoreBefore:       number;
  scoreAfter:        number;
  optimizedResume:   OptimizedResume;
  keywordsAdded:     string[];
  optimizationNotes: string[];
}

interface AnalyzeResult {
  scoreBefore:      number;
  scoreAfter:       number | null;
  matchedSkills:    string[];
  missingSkills:    string[];
  matchPercent:     number;
  alreadyOptimized: boolean;
  optimizedResume:  OptimizedResume | null;
  keywordsAdded:    string[];
  breakdown:        Record<string, { points: number; max: number; label: string }>;
}

interface ResumeOptimizeModalProps {
  open:        boolean;
  jobSourceId: string;
  jobTitle:    string;
  company:     string;
  userCredits: number;
  onClose:     () => void;
}

type Step = 1 | 2 | 3;

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// ─── Step indicator — UNCHANGED ───────────────────────────────────────────────

function Steps({ current }: { current: Step }) {
  const steps = ["See Your Difference", "Align Your Resume", "Review Your New Resume"] as const;
  return (
    <div className="flex items-center mb-6">
      {steps.map((label, i) => {
        const num    = (i + 1) as Step;
        const done   = num < current;
        const active = num === current;
        return (
          <div key={i} className="flex items-center flex-1 min-w-0">
            <div className="flex items-center gap-1.5 shrink-0">
              <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors
                ${active ? "bg-emerald-500 text-white" :
                  done   ? "bg-emerald-500/20 text-emerald-500" :
                           "bg-muted text-muted-foreground"}`}>
                {done ? <CheckCircle2 className="h-3 w-3" /> : num}
              </div>
              <span className={`text-xs truncate hidden sm:block
                ${active ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                {label}
              </span>
            </div>
            {i < steps.length - 1 && <div className="flex-1 h-px bg-border mx-2" />}
          </div>
        );
      })}
    </div>
  );
}

// ─── Mini score gauge — UNCHANGED ─────────────────────────────────────────────

function MiniGauge({ score, label }: { score: number; label: string }) {
  const colour =
    score >= 80 ? "#10b981" :
    score >= 60 ? "#f59e0b" :
    score >= 40 ? "#f97316" : "#ef4444";
  return (
    <div className="flex flex-col items-center">
      <div
        className="h-16 w-16 rounded-full border-4 flex items-center justify-center"
        style={{ borderColor: colour }}
      >
        <span className="text-lg font-bold" style={{ color: colour }}>
          {(score / 10).toFixed(1)}
        </span>
      </div>
      <span className="text-[10px] mt-1" style={{ color: colour }}>{label}</span>
    </div>
  );
}

// ─── Skill chip — UNCHANGED ───────────────────────────────────────────────────

type ChipVariant = "matched" | "missing" | "added";
function SkillChip({ label, variant }: { label: string; variant: ChipVariant }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium border capitalize
      ${variant === "matched" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
        variant === "added"   ? "bg-primary/10 text-primary border-primary/20" :
                                "bg-muted text-muted-foreground border-border"}`}>
      {variant === "matched" && <ThumbsUp className="h-2.5 w-2.5" />}
      {variant === "added"   && <Zap      className="h-2.5 w-2.5" />}
      {label}
    </span>
  );
}

// ─── Keyword table row — UNCHANGED ────────────────────────────────────────────

function KeywordRow({ label, children, status }: {
  label: string; children: React.ReactNode; status: "warn" | "ok" | "neutral";
}) {
  return (
    <div className="grid grid-cols-[130px_1fr_28px] items-start gap-2 py-2.5 border-b border-border last:border-0">
      <span className="text-xs font-medium text-foreground">{label}</span>
      <div className="text-xs text-muted-foreground">{children}</div>
      <div className="flex justify-center pt-0.5">
        {status === "warn" && <AlertCircle  className="h-4 w-4 text-amber-500"   />}
        {status === "ok"   && <CheckCircle2 className="h-4 w-4 text-emerald-500" />}
      </div>
    </div>
  );
}

// ─── NEW: ATS Resume document renderer ───────────────────────────────────────
// Renders the structured JSON as a clean single-column ATS resume.
// Looks like a real human-written document — not a UI component.

function ResumeDocument({ resume }: { resume: OptimizedResume }) {
  const { contact, summary, experience, projects, skills, education, certifications } = resume;

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-2 mt-4 mb-1.5">
      <span style={{
        fontSize: "11px", fontWeight: "700", letterSpacing: "0.08em",
        textTransform: "uppercase", color: "#1a1a1a",
      }}>{title}</span>
      <div style={{ flex: 1, height: "1px", background: "#c0c0c0" }} />
    </div>
  );

  const hasSkills = skills && Object.values(skills).some(arr => arr?.length > 0);

  return (
    <div style={{
      fontFamily: "'Arial', 'Helvetica Neue', sans-serif",
      fontSize:   "11px",
      lineHeight: "1.5",
      color:      "#1a1a1a",
      padding:    "32px 36px",
      background: "#fff",
      minHeight:  "100%",
    }}>
      {/* Contact header */}
      <div style={{ textAlign: "center", borderBottom: "1px solid #d0d0d0", paddingBottom: "10px", marginBottom: "2px" }}>
        <div style={{ fontSize: "20px", fontWeight: "700", marginBottom: "5px" }}>
          {contact?.name || "Your Name"}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 12px", fontSize: "10px", color: "#444" }}>
          {contact?.location && <span>{contact.location}</span>}
          {contact?.phone    && <span>{contact.phone}</span>}
          {contact?.email    && <span style={{ color: "#1a5fa8" }}>{contact.email}</span>}
          {contact?.linkedin && (
            <span style={{ color: "#1a5fa8" }}>
              {contact.linkedin.replace(/^https?:\/\//i, "").replace("www.", "")}
            </span>
          )}
          {contact?.github && (
            <span style={{ color: "#1a5fa8" }}>
              {contact.github.replace(/^https?:\/\//i, "").replace("www.", "")}
            </span>
          )}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <>
          <SectionHeader title="Summary" />
          <p style={{ color: "#2a2a2a", lineHeight: "1.55" }}>{summary}</p>
        </>
      )}

      {/* Technical Skills */}
      {hasSkills && (
        <>
          <SectionHeader title="Technical Skills" />
          <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
            {Object.entries(skills).map(([cat, items]) =>
              items?.length > 0 ? (
                <div key={cat} style={{ display: "flex", gap: "4px" }}>
                  <span style={{ fontWeight: "700", minWidth: "130px", flexShrink: 0 }}>{cat}:</span>
                  <span style={{ color: "#2a2a2a" }}>{items.join(", ")}</span>
                </div>
              ) : null
            )}
          </div>
        </>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <>
          <SectionHeader title="Projects" />
          {projects.map((proj, i) => (
            <div key={i} style={{ marginBottom: "8px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <div style={{ display: "flex", gap: "6px", alignItems: "baseline" }}>
                  <span style={{ fontWeight: "700" }}>{proj.name}</span>
                  {proj.url && (
                    <span style={{ color: "#1a5fa8", fontSize: "10px" }}>
                      {proj.url.replace(/^https?:\/\//i, "").replace("www.", "")}
                    </span>
                  )}
                </div>
                {proj.date && <span style={{ color: "#555", fontSize: "10px", whiteSpace: "nowrap" }}>{proj.date}</span>}
              </div>
              <ul style={{ margin: "2px 0 0 14px", paddingLeft: "0", listStyleType: "disc" }}>
                {proj.bullets?.map((b, j) => (
                  <li key={j} style={{ marginBottom: "1px", color: "#2a2a2a" }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <>
          <SectionHeader title="Work Experience" />
          {experience.map((exp, i) => (
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
                {exp.bullets?.map((b, j) => (
                  <li key={j} style={{ marginBottom: "2px", color: "#2a2a2a" }}>{b}</li>
                ))}
              </ul>
            </div>
          ))}
        </>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <>
          <SectionHeader title="Education" />
          {education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "2px", marginBottom: "4px" }}>
              <div>
                <span style={{ fontWeight: "700" }}>{edu.institution}</span>
                <span style={{ color: "#333" }}> · {edu.degree}{edu.field ? `, ${edu.field}` : ""}</span>
                {edu.gpa && <span style={{ color: "#555" }}> · GPA: {edu.gpa}</span>}
              </div>
              <span style={{ color: "#555", fontSize: "10px", whiteSpace: "nowrap" }}>
                {edu.startDate}{edu.endDate ? ` – ${edu.endDate}` : ""}{edu.location ? ` · ${edu.location}` : ""}
              </span>
            </div>
          ))}
        </>
      )}

      {/* Certifications */}
      {certifications?.length > 0 && (
        <>
          <SectionHeader title="Certifications" />
          <ul style={{ margin: "0 0 0 14px", paddingLeft: "0", listStyleType: "disc" }}>
            {certifications.map((c, i) => (
              <li key={i} style={{ color: "#2a2a2a" }}>{c}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

// ─── Progress steps — UNCHANGED ───────────────────────────────────────────────

const PROGRESS_STEPS = [
  "Analyzing job requirements…",
  "Identifying keyword gaps…",
  "Rewriting experience bullets…",
  "Integrating keywords naturally…",
];

// ─── Main modal ───────────────────────────────────────────────────────────────

export function ResumeOptimizeModal({
  open, jobSourceId, jobTitle, company, userCredits, onClose,
}: ResumeOptimizeModalProps) {
  const [step,         setStep]         = useState<Step>(1);
  const [analyzeData,  setAnalyzeData]  = useState<AnalyzeResult | null>(null);
  const [optimizeData, setOptimizeData] = useState<OptimizeResult | null>(null);
  const [loading,      setLoading]      = useState(false);
  const [error,        setError]        = useState<string | null>(null);
  // NEW: which panel is active in step 3
  const [activePanel,  setActivePanel]  = useState<"resume" | "changes">("resume");
  const printRef = useRef<HTMLDivElement>(null);

  // Load analysis on open — UNCHANGED
  useEffect(() => {
    if (!open) return;
    setStep(1);
    setAnalyzeData(null);
    setOptimizeData(null);
    setError(null);
    setLoading(true);

    fetch(`${BASE_URL}/api/resume/analyze/${jobSourceId}`, { credentials: "include", method: "POST" })
      .then((r) => r.json())
      .then((d: AnalyzeResult & { error?: string; message?: string }) => {
        if (d.error) throw new Error(d.message ?? d.error);
        setAnalyzeData(d);

        // If already optimized jump to step 3
        if (d.alreadyOptimized && d.optimizedResume) {
          setOptimizeData({
            scoreBefore:       d.scoreBefore,
            scoreAfter:        d.scoreAfter ?? d.scoreBefore,
            optimizedResume:   d.optimizedResume,
            keywordsAdded:     d.keywordsAdded,
            optimizationNotes: d.optimizedResume.optimizationNotes ?? [],
          });
          setStep(3);
        }
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false));
  }, [open, jobSourceId]);

  // Trigger AI optimization — UNCHANGED logic, updated response shape
  async function runOptimize() {
    setStep(2);
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`${BASE_URL}/api/resume/optimize/${jobSourceId}`, { credentials: "include", method: "POST" });
      const d = await r.json() as OptimizeResult & { error?: string; message?: string };
      if (!r.ok) throw new Error(d.message ?? d.error ?? "Optimization failed");
      setOptimizeData({
        scoreBefore:       d.scoreBefore,
        scoreAfter:        d.scoreAfter,
        optimizedResume:   d.optimizedResume,
        keywordsAdded:     d.keywordsAdded ?? [],
        optimizationNotes: d.optimizationNotes ?? d.optimizedResume?.optimizationNotes ?? [],
      });
      setStep(3);
    } catch (e: unknown) {
      onClose();
      toast.error(e instanceof Error ? e.message || "Something went wrong" : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  // Print/download the rendered resume
  function handleDownload() {
    if (!printRef.current) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head><title>Resume</title>
      <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, Helvetica, sans-serif; }
        @page { margin: 0.5in; size: letter; }
        ul { padding-left: 14px; }
        li { margin-bottom: 2px; }
      </style>
      </head><body>${printRef.current.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  }

  const delta = optimizeData ? optimizeData.scoreAfter - optimizeData.scoreBefore : 0;

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop — UNCHANGED */}
          <motion.div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Drawer — UNCHANGED slide-in from right, 900px */}
          <motion.div
            className="fixed top-0 right-0 z-50 h-full w-[900px] max-w-[90vw] bg-background border-l border-border/60 shadow-2xl flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
          >
            {/* Header — UNCHANGED */}
            <div className="flex items-center justify-between px-8 pt-5 pb-3 border-b border-border sticky top-0 bg-background z-10 shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="font-semibold text-foreground">Generate Your Custom Resume</h2>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  {userCredits} credits available today
                </span>
              </div>
              <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Scrollable body — steps 1 & 2 scroll normally, step 3 uses flex layout */}
            {step !== 3 ? (
              <div className="flex-1 overflow-y-auto px-6 py-5">
                <Steps current={step} />

                {/* ─── STEP 1 — UNCHANGED ──────────────────────────────────── */}
                {step === 1 && (
                  <div className="space-y-5">
                    {loading ? (
                      <div className="flex flex-col items-center gap-3 py-12">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <p className="text-sm text-muted-foreground">Analyzing your resume…</p>
                      </div>
                    ) : error ? (
                      <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-4 text-sm text-destructive">{error}</div>
                    ) : analyzeData ? (
                      <>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="text-lg font-bold text-foreground leading-snug">
                              {analyzeData.scoreBefore < 60
                                ? "Your Resume is a Low Match for This Job"
                                : analyzeData.scoreBefore < 80
                                ? "Your Resume Partially Matches This Job"
                                : "Your Resume is a Strong Match"}
                            </h3>
                            {analyzeData.scoreBefore < 60 && (
                              <p className="text-xs text-amber-600 mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Resumes under 6.0 are likely to be filtered out — we'll help you fix it fast.
                              </p>
                            )}
                          </div>
                          <div className="shrink-0">
                            <MiniGauge
                              score={analyzeData.scoreBefore}
                              label={analyzeData.scoreBefore >= 80 ? "Strong" : analyzeData.scoreBefore >= 60 ? "Good" : "Poor"}
                            />
                          </div>
                        </div>

                        <div className="rounded-xl border border-border overflow-hidden">
                          <div className="grid grid-cols-[130px_1fr_1fr] bg-secondary/40 px-3 py-2 text-xs font-medium text-muted-foreground">
                            <span>Overview</span>
                            <div className="flex items-center gap-2">
                              <div className="h-6 w-6 rounded bg-red-600 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
                                {company.slice(0, 2).toUpperCase()}
                              </div>
                              <span className="truncate text-foreground font-medium">{jobTitle}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 shrink-0" />
                              <span className="text-foreground font-medium truncate">Your resume</span>
                            </div>
                          </div>
                          <div className="px-3">
                            <KeywordRow label="Job Title" status="warn">
                              <div className="grid grid-cols-2 gap-2">
                                <span>{jobTitle}</span>
                                <span className="text-foreground">{analyzeData.matchPercent}% match</span>
                              </div>
                            </KeywordRow>
                            <KeywordRow
                              label={`Job Keywords (${analyzeData.matchedSkills.length}/${analyzeData.matchedSkills.length + analyzeData.missingSkills.length})`}
                              status={analyzeData.missingSkills.length > 0 ? "warn" : "ok"}
                            >
                              <div className="flex flex-wrap gap-1">
                                {analyzeData.matchedSkills.slice(0, 6).map((sk) => (
                                  <SkillChip key={sk} label={sk} variant="matched" />
                                ))}
                                {analyzeData.missingSkills.slice(0, 4).map((sk) => (
                                  <SkillChip key={sk} label={sk} variant="missing" />
                                ))}
                                {analyzeData.missingSkills.length > 4 && (
                                  <span className="text-[11px] text-muted-foreground self-center">
                                    +{analyzeData.missingSkills.length - 4} missing
                                  </span>
                                )}
                              </div>
                            </KeywordRow>
                          </div>
                        </div>

                        <Button
                          className="w-full bg-emerald-500 hover:bg-emerald-600 text-white gap-2"
                          onClick={runOptimize}
                          disabled={userCredits < 1}
                        >
                          <Zap className="h-4 w-4" />
                          {userCredits < 1 ? "No credits remaining — upgrade to continue" : "Improve My Resume for This Job (1 credit)"}
                        </Button>
                      </>
                    ) : null}
                  </div>
                )}

                {/* ─── STEP 2 — UNCHANGED ──────────────────────────────────── */}
                {step === 2 && (
                  <div className="flex flex-col items-center gap-5 py-16">
                    <div className="relative">
                      <Loader2 className="h-10 w-10 animate-spin text-primary" />
                      <Zap className="h-4 w-4 text-primary absolute inset-0 m-auto" />
                    </div>
                    <div className="text-center space-y-1">
                      <p className="text-sm font-medium text-foreground">Optimizing your resume…</p>
                      <p className="text-xs text-muted-foreground max-w-xs">
                        Rewriting bullets, integrating missing keywords, and strengthening your summary for this role.
                      </p>
                    </div>
                    <div className="w-full max-w-xs space-y-2">
                      {PROGRESS_STEPS.map((s, i) => (
                        <motion.div key={s}
                          className="flex items-center gap-2 text-xs text-muted-foreground"
                          initial={{ opacity: 0, x: -8 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.7 }}
                        >
                          <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                          {s}
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}

                {error && step !== 1 && (
                  <div className="mt-4 rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-sm text-destructive">{error}</div>
                )}
              </div>
            ) : (
              /* ─── STEP 3: TWO-PANEL RESUME VIEW ──────────────────────────────
                 Left: rendered resume document (scrollable)
                 Right: score + changes panel (fixed width, scrollable)        */
              optimizeData && (
                <div className="flex-1 flex overflow-hidden">

                  {/* LEFT — resume paper */}
                  <div className="flex-1 flex flex-col overflow-hidden bg-gray-100 border-r border-border">

                    {/* Toolbar */}
                    <div className="flex items-center justify-between gap-3 px-4 py-2 bg-white border-b border-gray-200 shrink-0">
                      <div className="flex items-center gap-1 bg-gray-100 rounded-lg p-0.5">
                        <button
                          onClick={() => setActivePanel("resume")}
                          className={`text-xs px-3 py-1 rounded-md font-medium transition-colors
                            ${activePanel === "resume" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          AI Rewrite
                        </button>
                        <button
                          onClick={() => setActivePanel("changes")}
                          className={`text-xs px-3 py-1 rounded-md font-medium transition-colors
                            ${activePanel === "changes" ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}
                        >
                          What Changed
                        </button>
                      </div>
                      <Button variant="outline" size="sm" className="h-7 gap-1.5 text-xs" onClick={handleDownload}>
                        <Download className="h-3 w-3" /> Download Resume
                      </Button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto p-5">
                      {activePanel === "resume" ? (
                        /* Resume paper shadow */
                        <div className="flex justify-center">
                          <div
                            ref={printRef}
                            className="w-full max-w-[680px] bg-white shadow-lg rounded-sm"
                            style={{ minHeight: "900px" }}
                          >
                            <ResumeDocument resume={optimizeData.optimizedResume} />
                          </div>
                        </div>
                      ) : (
                        /* What changed list */
                        <div className="max-w-lg mx-auto space-y-3 py-2">
                          <p className="text-sm font-semibold text-foreground">What the AI changed</p>
                          {optimizeData.optimizationNotes.length > 0
                            ? optimizeData.optimizationNotes.map((note, i) => (
                                <div key={i} className="flex items-start gap-3 bg-white rounded-xl border border-border px-4 py-3 shadow-sm">
                                  <Zap className="h-3.5 w-3.5 text-primary mt-0.5 shrink-0" />
                                  <span className="text-sm text-foreground">{note}</span>
                                </div>
                              ))
                            : <p className="text-sm text-muted-foreground">No specific notes from AI.</p>
                          }
                        </div>
                      )}
                    </div>
                  </div>

                  {/* RIGHT — score + notes panel */}
                  <div className="w-64 shrink-0 flex flex-col overflow-y-auto bg-background border-l border-border">
                    <div className="p-5 space-y-5">

                      {/* Score improved */}
                      <div>
                        <p className="text-sm font-bold text-foreground leading-snug">
                          {delta > 0
                            ? `Great! Your score jumped from ${(optimizeData.scoreBefore / 10).toFixed(1)} to ${(optimizeData.scoreAfter / 10).toFixed(1)}`
                            : `Your resume score: ${(optimizeData.scoreAfter / 10).toFixed(1)}`}
                        </p>
                        <div className="flex items-center gap-3 mt-3">
                          {delta > 0 ? (
                            <>
                              <MiniGauge score={optimizeData.scoreBefore} label="Before" />
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                              <MiniGauge score={optimizeData.scoreAfter} label="After" />
                            </>
                          ) : (
                            <MiniGauge score={optimizeData.scoreAfter} label="Score" />
                          )}
                        </div>
                      </div>

                      <div className="h-px bg-border" />

                      {/* See what changed */}
                      <div>
                        <p className="text-xs font-semibold text-foreground mb-2">See What's Changed</p>
                        <div className="space-y-1.5">
                          {optimizeData.optimizedResume.summary && (
                            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-foreground mt-0.5">•</span>
                              Summary updated to better align the role
                            </p>
                          )}
                          {optimizeData.optimizedResume.experience?.length > 0 && (
                            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-foreground mt-0.5">•</span>
                              Enhanced {optimizeData.optimizedResume.experience.reduce((a, e) => a + (e.bullets?.length ?? 0), 0)} work experience bullets
                            </p>
                          )}
                          {optimizeData.keywordsAdded.length > 0 && (
                            <p className="text-xs text-muted-foreground flex items-start gap-1.5">
                              <span className="text-foreground mt-0.5">•</span>
                              {optimizeData.keywordsAdded.length} missing keywords integrated
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Keywords added */}
                      {optimizeData.keywordsAdded.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-foreground mb-2">Keywords added</p>
                          <div className="flex flex-wrap gap-1.5">
                            {optimizeData.keywordsAdded.map(sk => (
                              <SkillChip key={sk} label={sk} variant="added" />
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="h-px bg-border" />

                      {/* Quick tweak suggestions */}
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-foreground">Quick tweaks</p>
                        {[
                          "Use stronger action verbs for my latest experience",
                          "Shorten my summary to remove filler words",
                          "Remove skills not related to this job",
                        ].map((s) => (
                          <button key={s}
                            className="w-full text-left text-xs px-3 py-2 rounded-lg border border-border bg-secondary/40 hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground flex items-center justify-between gap-2"
                            onClick={() => toast.info("Re-optimize feature coming soon!")}
                          >
                            <span>{s}</span>
                            <ChevronRight className="h-3 w-3 shrink-0" />
                          </button>
                        ))}
                      </div>

                      {/* Download CTA */}
                      <Button
                        className="w-full gap-2 bg-emerald-500 hover:bg-emerald-600 text-white"
                        onClick={handleDownload}
                      >
                        <Download className="h-4 w-4" /> Download Resume
                      </Button>

                    </div>
                  </div>

                </div>
              )
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}