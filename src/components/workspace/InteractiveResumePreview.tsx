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

function SectionWrapper({ children }: { children: any }) {
  return (
    <div className="py-2">
      {children}
    </div>
  );
}

export function ResumePreview({ snapshot, onEdit, isProcessing }: ResumePreviewProps) {
  if (!snapshot) return null;
  const { contact, summary, experience, projects, skills, education, certifications } = snapshot;

  const SectionHeader = ({ title }: { title: string }) => (
    <div className="flex items-center gap-3 mt-6 mb-3">
      <span className="text-[11px] font-extrabold uppercase tracking-[0.15em] text-emerald-400">{title}</span>
      <div className="flex-1 h-px bg-gradient-to-r from-emerald-500/30 via-white/10 to-transparent" />
    </div>
  );

  return (
    <div className="w-full max-w-[850px] mx-auto bg-[#0E131F] text-slate-100 rounded-2xl border border-white/10 shadow-[0_25px_60px_rgba(0,0,0,0.6)] p-8 lg:p-12 font-sans text-xs leading-relaxed relative">
      
      {/* Executive Document Header */}
      <div className="text-center mb-8 pb-6 border-b border-white/10">
        <h1 className="text-3xl font-extrabold tracking-tight mb-2 text-white">{contact?.name || "Your Name"}</h1>
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-medium">
          {contact?.location && <span className="hover:text-emerald-400 transition-colors">{contact.location}</span>}
          {contact?.phone && <span>• {contact.phone}</span>}
          {contact?.email && <span className="hover:text-emerald-400 transition-colors">• {contact.email}</span>}
          {contact?.linkedin && <span className="hover:text-emerald-400 transition-colors">• {contact.linkedin}</span>}
          {contact?.github && <span className="hover:text-emerald-400 transition-colors">• {contact.github}</span>}
        </div>
      </div>

      {/* Summary */}
      {summary && (
        <SectionWrapper>
          <SectionHeader title="Summary" />
          <p className="text-slate-300 leading-relaxed">{summary}</p>
        </SectionWrapper>
      )}

      {/* Experience */}
      {experience?.length > 0 && (
        <SectionWrapper>
          <SectionHeader title="Experience" />
          <div className="space-y-4">
            {experience.map((exp: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <div>
                    <span className="font-bold text-[13px] text-white">{exp.company}</span>
                    <span className="mx-2 text-slate-500">|</span>
                    <span className="text-emerald-400 font-medium">{exp.title}</span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">{exp.startDate} – {exp.endDate}</span>
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-slate-300">
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
        <SectionWrapper>
          <SectionHeader title="Projects" />
          <div className="space-y-4">
            {projects.map((proj: any, i: number) => (
              <div key={i}>
                <div className="flex justify-between items-baseline mb-1">
                  <span className="font-bold text-white">{proj.name}</span>
                  {proj.date && <span className="text-[10px] text-slate-400">{proj.date}</span>}
                </div>
                <ul className="list-disc list-outside ml-4 space-y-1 text-slate-300">
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
        <SectionWrapper>
          <SectionHeader title="Skills" />
          <div className="space-y-1.5">
            {Object.entries(skills).map(([category, items]: any, i) => (
              <div key={i} className="flex gap-2">
                <span className="font-semibold text-slate-300 w-28 shrink-0 capitalize">{category}:</span>
                <span className="text-slate-300">{Array.isArray(items) ? items.join(", ") : String(items)}</span>
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}

      {/* Education */}
      {education && (
        <SectionWrapper>
          <SectionHeader title="Education" />
          <div className="space-y-3">
            {(Array.isArray(education) ? education : [education]).map((edu: any, i: number) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <div className="font-bold text-white">{edu.institution || edu.school || edu.college}</div>
                  <div className="text-slate-300">{edu.degree || edu.title} {edu.field ? `in ${edu.field}` : ""}</div>
                </div>
                <div className="text-right text-[10px] text-slate-400 shrink-0">
                  {edu.startDate && <div>{edu.startDate} – {edu.endDate || "Present"}</div>}
                  {edu.gpa && <div>GPA: {edu.gpa}</div>}
                </div>
              </div>
            ))}
          </div>
        </SectionWrapper>
      )}
    </div>
  );
}
