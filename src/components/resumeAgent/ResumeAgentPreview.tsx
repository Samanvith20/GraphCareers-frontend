import { FileText, LockKeyhole } from "lucide-react";
import type { ResumeSnapshot } from "@/types/resumeAgent";

function bullets(entry: { bullets?: string[]; description?: string[] }) {
  return entry.bullets?.length ? entry.bullets : entry.description || [];
}

function certificationLabel(value: NonNullable<ResumeSnapshot["certifications"]>[number]) {
  if (typeof value === "string") return value;
  return [value.name, value.issuer, value.date].filter(Boolean).join(" · ");
}

function SectionTitle({ children }: { children: string }) {
  return (
    <div className="mb-3 mt-7 flex items-center gap-3 first:mt-0">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.16em] text-slate-800">{children}</h3>
      <div className="h-px flex-1 bg-slate-300" />
    </div>
  );
}

export function ResumeAgentPreview({ snapshot, versionNumber }: { snapshot: ResumeSnapshot; versionNumber: number }) {
  const skills = snapshot.skills;
  return (
    <section className="overflow-hidden rounded-2xl border border-border bg-card shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border bg-muted/30 px-5 py-3">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-primary" /> Generated resume preview
        </div>
        <div className="flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-medium text-primary">
          <LockKeyhole className="h-3 w-3" /> Version {versionNumber} · master protected
        </div>
      </div>

      <div className="max-h-[820px] overflow-y-auto bg-slate-100 p-3 sm:p-6">
        <article className="mx-auto min-h-[900px] max-w-[760px] bg-white px-8 py-10 text-[11px] leading-relaxed text-slate-800 shadow-xl sm:px-12">
          <header className="border-b border-slate-300 pb-4 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">{snapshot.contact?.name || "Candidate"}</h1>
            <div className="mt-2 flex flex-wrap justify-center gap-x-3 gap-y-1 text-[10px] text-slate-600">
              {[snapshot.contact?.location, snapshot.contact?.phone, snapshot.contact?.email, snapshot.contact?.linkedin, snapshot.contact?.github]
                .filter(Boolean)
                .map((value) => <span key={String(value)}>{value}</span>)}
            </div>
          </header>

          {snapshot.summary && (
            <div>
              <SectionTitle>Professional summary</SectionTitle>
              <p>{snapshot.summary}</p>
            </div>
          )}

          {snapshot.experience && snapshot.experience.length > 0 && (
            <div>
              <SectionTitle>Experience</SectionTitle>
              <div className="space-y-4">
                {snapshot.experience.map((entry, index) => (
                  <div key={`${entry.company || "experience"}-${index}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <div>
                        <strong className="text-slate-950">{entry.company || "Company"}</strong>
                        {(entry.title || entry.role) && <span> · {entry.title || entry.role}</span>}
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {[entry.startDate, entry.endDate].filter(Boolean).join(" – ")}
                      </span>
                    </div>
                    <ul className="ml-4 mt-1 list-disc space-y-1">
                      {bullets(entry).map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {snapshot.projects && snapshot.projects.length > 0 && (
            <div>
              <SectionTitle>Projects</SectionTitle>
              <div className="space-y-4">
                {snapshot.projects.map((project, index) => (
                  <div key={`${project.name || "project"}-${index}`}>
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <strong className="text-slate-950">{project.name || "Project"}</strong>
                      <span className="text-[10px] text-slate-500">{project.date}</span>
                    </div>
                    {project.techStack && project.techStack.length > 0 && (
                      <p className="mt-1 font-medium text-slate-600">{project.techStack.join(", ")}</p>
                    )}
                    <ul className="ml-4 mt-1 list-disc space-y-1">
                      {bullets(project).map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {skills && (Array.isArray(skills) ? skills.length > 0 : Object.keys(skills).length > 0) && (
            <div>
              <SectionTitle>Skills</SectionTitle>
              {Array.isArray(skills) ? (
                <p>{skills.join(", ")}</p>
              ) : (
                <div className="space-y-1">
                  {Object.entries(skills).filter(([, values]) => values.length > 0).map(([category, values]) => (
                    <p key={category}><strong className="capitalize text-slate-950">{category}:</strong> {values.join(", ")}</p>
                  ))}
                </div>
              )}
            </div>
          )}

          {snapshot.education && snapshot.education.length > 0 && (
            <div>
              <SectionTitle>Education</SectionTitle>
              <div className="space-y-2">
                {snapshot.education.map((entry, index) => (
                  <div key={`${entry.institution || "education"}-${index}`} className="flex flex-wrap justify-between gap-2">
                    <div><strong className="text-slate-950">{entry.institution}</strong> · {[entry.degree, entry.field].filter(Boolean).join(", ")}</div>
                    <span className="text-[10px] text-slate-500">{[entry.startDate, entry.endDate].filter(Boolean).join(" – ")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {snapshot.certifications && snapshot.certifications.length > 0 && (
            <div>
              <SectionTitle>Certifications</SectionTitle>
              <ul className="ml-4 list-disc space-y-1">
                {snapshot.certifications.map((item, index) => <li key={index}>{certificationLabel(item)}</li>)}
              </ul>
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
