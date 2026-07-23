export interface ResumeSnapshot {
  contact: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  summary: string;
  experience: ExperienceEntry[];
  projects: ProjectEntry[];
  skills: Record<string, string[]>;
  education: EducationEntry[];
  certifications: string[];
}

export interface ExperienceEntry {
  company: string;
  title: string;
  startDate: string;
  endDate: string;
  location: string;
  bullets: string[];
}

export interface ProjectEntry {
  name: string;
  url?: string;
  date: string;
  bullets: string[];
}

export interface EducationEntry {
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  gpa?: string;
  location: string;
}

export interface ResumeVersion {
  id: string;
  label: string;
  isActive: boolean;
  atsScore?: number;
  snapshot: ResumeSnapshot;
}

export interface WorkspaceData {
  versions: ResumeVersion[];
  activeVersionId: string;
  credits: number;
}

export interface EditPayload {
  actionType: string;
  actionPayload: Record<string, unknown>;
}

export interface EditResult {
  version: ResumeVersion;
}

export interface CopilotMessage {
  role: "user" | "assistant";
  content: string;
}

export interface KeywordData {
  matched: string[];
  added: string[];
  missing: string[];
}

export interface SkillRecommendation {
  skill: string;
  importance: string;
  demandPct: number;
  learnMessage: string;
}

export interface PlatformInsights {
  topSkills: { skill: string; pct: number }[];
  experienceDistribution?: any;
  workModeDistribution?: any;
}

export interface Recommendation {
  id: string;
  title: string;
  description: string;
  estimatedAtsGain: number;
  actionType: string;
  actionPayload: any;
}

export interface AtsScores {
  before: number;
  after: number;
  improvement: number;
}
