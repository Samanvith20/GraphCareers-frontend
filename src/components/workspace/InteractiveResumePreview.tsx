import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RefreshCw, Zap, Minimize2, Maximize2, Type, Layers, BarChart3, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ResumeSnapshot } from "@/types/workspace";

interface ResumePreviewProps {
  snapshot: ResumeSnapshot;
  onEdit: (actionType: string, payload: any) => void;
  isProcessing?: boolean;
}

const ACTION_MAP: Record<string, { label: string; icon: any }[]> = {
  summary: [
    { label: "Rewrite", icon: RefreshCw },
    { label: "Improve", icon: Zap },
    { label: "Shorten", icon: Minimize2 },
  ],
  experience: [
    { label: "Improve", icon: Zap },
    { label: "Quantify", icon: BarChart3 },
    { label: "Rewrite", icon: RefreshCw },
  ],
  projects: [
    { label: "Improve", icon: Zap },
    { label: "ATS", icon: BarChart3 },
  ],
  skills: [
    { label: "Organize", icon: Layers },
    { label: "Categorize", icon: Type },
    { label: "Merge", icon: Layers },
  ],
};

function HoverToolbar({ actions, onAction, isProcessing }: { actions: any[]; onAction: (l: string) => void; isProcessing?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="absolute -top-3 right-0 flex items-center gap-1 rounded-lg border border-primary/20 bg-card/95 px-1 py-1 shadow-xl shadow-black/20 backdrop-blur-md z-10"
    >
      <div className="px-1.5 flex items-center gap-1 border-r border-border/50 text-[9px] font-bold text-primary tracking-widest uppercase">
        <Zap className="h-3 w-3" /> AI
      </div>
      {actions.map((a, i) => {
        const Icon = a.icon;
        return (
          <Button
            key={i}
            variant="ghost"
            size="sm"
            onClick={(e) => { e.stopPropagation(); onAction(a.label); }}
            disabled={isProcessing}
            className="h-6 px-2 text-[10px] hover:bg-primary/10 hover:text-primary gap-1"
          >
            {isProcessing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Icon className="h-3 w-3" />}
            {a.label}
          </Button>
        );
      })}
    </motion.div>
  );
}

function SectionWrapper({ children, actions, onAction, isProcessing }: any) {
  const [hovered, setHovered] = useState(false);
  return (
    <div 
      className={cn("relative group rounded-xl transition-all duration-200 border border-transparent hover:border-primary/10 hover:bg-primary/[0.02] p-3 -mx-3", isProcessing && "opacity-60")}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <AnimatePresence>
        {hovered && <HoverToolbar actions={actions} onAction={onAction} isProcessing={isProcessing} />}
      </AnimatePresence>
      {children}
    </div>
  );
}

export function ResumePreview({ snapshot, onEdit, isProcessing }: ResumePreviewProps) {
  if (!snapshot) return null;
  const { contact, summary, experience, projects, skills, education, certifications } = snapshot;

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3 mt-4 mb-2">
      <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-primary">{title}</span>
      <div className="flex-1 h-px bg-border/40" />
    </div>
  );

  return (
    <div className="w-full max-w-[850px] mx-auto bg-card rounded-xl border border-border/50 shadow-sm p-8 lg:p-12 text-foreground font-sans text-xs leading-relaxed">
      
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-2xl font-bold mb-1">{contact?.name || "Your Name"}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-muted-foreground">
          {contact?.location && <span>{contact.location}</span>}
          {contact?.phone && <span>{contact.phone}</span>}
          {contact?.email && <span>{contact.email}</span>}
          {contact?.linkedin && <span>{contact.linkedin}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <SectionWrapper 
          actions={ACTION_MAP.summary} 
          onAction={(a: string) => onEdit(a.toUpperCase(), { section: "summary" })}
          isProcessing={isProcessing}
        >
          <SectionHeader title="Summary" />
          <p className="text-foreground/90">{summary}</p>
        </SectionWrapper>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <SectionWrapper 
          actions={ACTION_MAP.experience} 
          onAction={(a: string) => onEdit(a.toUpperCase(), { section: "experience" })}
          isProcessing={isProcessing}
        >
          <SectionHeader title="Experience" />
          <div className="space-y-4">
            {experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <span className="font-bold text-[13px]">{exp.company}</span>
                    <span className="mx-2 text-muted-foreground">|</span>
                    <span className="text-primary font-medium">{exp.title}</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground shrink-0">{exp.startDate} – {exp.endDate}</span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-foreground/80">
                  {exp.bullets.map((b: string, j: number) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Projects */}
      {projects?.length > 0 && (
        <SectionWrapper 
          actions={ACTION_MAP.projects} 
          onAction={(a: string) => onEdit(a.toUpperCase(), { section: "projects" })}
          isProcessing={isProcessing}
        >
          <SectionHeader title="Projects" />
          <div className="space-y-4">
            {projects.map((proj: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold">{proj.name}</span>
                  {proj.date && <span className="text-[10px] text-muted-foreground">{proj.date}</span>}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-foreground/80">
                  {proj.bullets.map((b: string, j: number) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Skills */}
      {skills && Object.keys(skills).length > 0 && (
        <SectionWrapper 
          actions={ACTION_MAP.skills} 
          onAction={(a: string) => onEdit(a.toUpperCase(), { section: "skills" })}
          isProcessing={isProcessing}
        >
          <SectionHeader title="Skills" />
          <div className="space-y-1.5">
            {Object.entries(skills).map(([category, items]: any, i) => (
              <div key={i} className="flex gap-2">
                <span className="font-semibold w-24 shrink-0">{category}:</span>
                <span className="text-foreground/80">{items.join(", ")}</span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Education */}
      {education?.length > 0 && (
        <div className="p-3 -mx-3">
          <SectionHeader title="Education" />
          <div className="space-y-2">
            {education.map((edu: any, i: number) => (
              <div key={i} className="flex justify-between">
                <div>
                  <div className="font-bold">{edu.institution}</div>
                  <div className="text-foreground/80">{edu.degree} in {edu.field}</div>
                </div>
                <div className="text-right text-[10px] text-muted-foreground">
                  <div>{edu.startDate} – {edu.endDate}</div>
                  {edu.gpa && <div>GPA: {edu.gpa}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
