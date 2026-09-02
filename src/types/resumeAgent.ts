export type ResumeAgentTargetType = "platform_market" | "manual_jd";

export type ResumeAgentRunStatus =
  | "pending"
  | "analyzing"
  | "awaiting_confirmation"
  | "applying"
  | "validating"
  | "completed"
  | "no_improvement"
  | "failed"
  | "cancelled";

export interface ResumeSkillRequirement {
  name: string;
  importance: "required" | "preferred" | string;
  demandPercent?: number;
}

export interface ResumeTargetRequirements {
  requiredSkills: ResumeSkillRequirement[];
  preferredSkills: ResumeSkillRequirement[];
  responsibilities: string[];
  keywords: string[];
  constraints: {
    minExperience?: number | null;
    maxExperience?: number | null;
    location?: string | null;
    workMode?: string | null;
    education?: string | null;
  };
  market?: {
    platform?: string;
    role?: string;
    sampleSize?: number;
    rankedSkills?: Array<{ name: string; demandPercent: number; weight: number }>;
  } | null;
  analysisConfidence?: "low" | "medium" | "high";
}

export interface ResumeAgentTarget {
  id: string;
  type: ResumeAgentTargetType;
  platform?: string | null;
  companyName?: string | null;
  jobTitle: string;
  atsVendor?: string | null;
  requirementsJson: ResumeTargetRequirements;
  createdAt: string;
}

export interface ResumeScore {
  overall: number;
  atsCompatibility: {
    score: number;
    checks: Array<{ id: string; label: string; weight: number; passed: boolean }>;
  };
  targetMatch: {
    score: number;
    breakdown: Record<string, number>;
    matchedSkills: string[];
    missingRequiredSkills: string[];
    missingPreferredSkills: string[];
  };
  resumeQuality: {
    score: number;
    breakdown: Record<string, number>;
  };
  weights: Record<string, number>;
}

export interface ResumeProposal {
  id: string;
  type: string;
  targetPath: string;
  before: unknown;
  after: unknown;
  rationale: string;
  requiresConfirmation: boolean;
  status: "proposed" | "approved" | "rejected" | "applied" | "blocked";
  violations: string[];
}

export interface ResumeAgentRun {
  id: string;
  targetId: string;
  baseVersionId: string;
  outputVersionId?: string | null;
  mode: "analyze" | "optimize";
  status: ResumeAgentRunStatus;
  scoreBefore?: ResumeScore | null;
  scoreAfter?: ResumeScore | null;
  result?: {
    changed?: boolean;
    keptOriginal?: boolean;
    improvement?: number;
    reason?: string;
    [key: string]: unknown;
  } | null;
  error?: { code: string; message: string } | null;
  target?: {
    id: string;
    type: ResumeAgentTargetType;
    platform?: string | null;
    companyName?: string | null;
    jobTitle: string;
    atsVendor?: string | null;
    requirements: ResumeTargetRequirements;
  };
  proposals?: ResumeProposal[];
  createdAt: string;
  updatedAt: string;
  completedAt?: string | null;
}

export interface ResumeContact {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  location?: string | null;
  linkedin?: string | null;
  github?: string | null;
  portfolio?: string | null;
}

export interface ResumeExperienceEntry {
  company?: string | null;
  role?: string | null;
  title?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  location?: string | null;
  description?: string[];
  bullets?: string[];
}

export interface ResumeProjectEntry {
  name?: string | null;
  url?: string | null;
  date?: string | null;
  techStack?: string[];
  description?: string[];
  bullets?: string[];
}

export interface ResumeEducationEntry {
  institution?: string | null;
  degree?: string | null;
  field?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  gpa?: string | null;
  location?: string | null;
}

export interface ResumeSnapshot {
  contact?: ResumeContact;
  summary?: string | null;
  experience?: ResumeExperienceEntry[];
  projects?: ResumeProjectEntry[];
  skills?: Record<string, string[]> | string[];
  education?: ResumeEducationEntry[];
  certifications?: Array<string | { name?: string; issuer?: string; date?: string }>;
}

export interface ResumeVersion {
  id: string;
  workspaceId: string;
  versionNumber: number;
  snapshotJson: ResumeSnapshot;
  source: string;
  parentVersionId?: string | null;
  changeSummary?: string | null;
  createdAt: string;
}

export interface ResumeAgentMessage {
  id: string;
  role: "user" | "assistant" | "tool" | "system";
  content: string;
  intent?: string | null;
  metadataJson?: Record<string, unknown> | null;
  createdAt: string;
}

export interface ResumeWorkspaceResponse {
  success: boolean;
  workspace: {
    id: string;
    status: string;
    activeVersionId: string;
    totalVersions: number;
    totalOptimizations: number;
  };
  versions: Array<Pick<ResumeVersion, "id" | "versionNumber" | "source" | "parentVersionId" | "changeSummary" | "createdAt">>;
}

export interface PlatformTargetInput {
  platform: string;
  role: string;
  location?: string;
  minExperience?: number;
  maxExperience?: number;
  sampleSize?: number;
}

export interface ManualTargetInput {
  jobTitle: string;
  companyName?: string;
  jobDescription: string;
  platform?: string;
  atsVendor?: string;
  jobUrl?: string;
}

export type MissingSkillConfirmation =
  | "used_professionally"
  | "used_in_project"
  | "completed_course"
  | "basic_knowledge"
  | "not_used";

export interface MissingSkillInput {
  skill: string;
  confirmation: MissingSkillConfirmation;
  organizationOrProject?: string;
  usageDetails?: string;
  metric?: string;
  applyTo?: "skills" | "experience" | "project" | "learning";
}
