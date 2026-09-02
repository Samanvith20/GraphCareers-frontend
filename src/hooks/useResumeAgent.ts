import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type {
  ManualTargetInput,
  MissingSkillInput,
  PlatformTargetInput,
  ResumeAgentMessage,
  ResumeAgentRun,
  ResumeAgentTarget,
  ResumeVersion,
  ResumeWorkspaceResponse,
} from "@/types/resumeAgent";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;
const TERMINAL_STATUSES = new Set(["completed", "no_improvement", "failed", "cancelled", "awaiting_confirmation"]);

interface TargetResponse {
  success: boolean;
  target: ResumeAgentTarget;
}

interface RunResponse {
  success: boolean;
  run: ResumeAgentRun;
}

interface VersionResponse {
  success: boolean;
  version: ResumeVersion;
}

interface MessagesResponse {
  success: boolean;
  messages: ResumeAgentMessage[];
}

interface StartInput {
  type: "platform" | "manual";
  values: PlatformTargetInput | ManualTargetInput;
}

function idempotencyKey() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `resume-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function useResumeAgentWorkspace(enabled = true) {
  return useQuery({
    queryKey: ["resume-agent", "workspace"],
    queryFn: () => apiGet<ResumeWorkspaceResponse>("/resume-agent/workspace"),
    enabled,
    retry: false,
  });
}

export function useStartResumeAgent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: StartInput) => {
      const targetPath = input.type === "platform" ? "/resume-agent/targets/platform" : "/resume-agent/targets/manual-jd";
      const targetResponse = await apiPost<TargetResponse>(targetPath, input.values);
      const runResponse = await apiPost<RunResponse>("/resume-agent/runs", {
        targetId: targetResponse.target.id,
        mode: "optimize",
        idempotencyKey: idempotencyKey(),
      });
      return { target: targetResponse.target, run: runResponse.run };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-agent", "workspace"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useResumeAgentRun(runId: string | null) {
  return useQuery({
    queryKey: ["resume-agent", "run", runId],
    queryFn: () => apiGet<RunResponse>(`/resume-agent/runs/${runId}`).then((response) => response.run),
    enabled: Boolean(runId),
    refetchInterval: (query) => {
      const status = query.state.data?.status;
      return status && TERMINAL_STATUSES.has(status) ? false : 2000;
    },
  });
}

export function useResumeAgentVersion(versionId: string | null) {
  return useQuery({
    queryKey: ["resume-agent", "version", versionId],
    queryFn: () => apiGet<VersionResponse>(`/resume-agent/versions/${versionId}`).then((response) => response.version),
    enabled: Boolean(versionId),
  });
}

export function useResumeAgentMessages(runId: string | null) {
  return useQuery({
    queryKey: ["resume-agent", "messages", runId],
    queryFn: () => apiGet<MessagesResponse>(`/resume-agent/runs/${runId}/messages?limit=100`).then((response) => response.messages),
    enabled: Boolean(runId),
  });
}

export function useResumeAgentChat(runId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (message: string) => apiPost<{
      success: boolean;
      reply: string;
      intent: string;
      metadata: Record<string, unknown> | null;
    }>(`/resume-agent/runs/${runId}/chat`, { message, clientMessageId: idempotencyKey() }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-agent", "messages", runId] });
      queryClient.invalidateQueries({ queryKey: ["resume-agent", "run", runId] });
    },
  });
}

export function useDecideResumeProposal(runId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ proposalId, decision }: { proposalId: string; decision: "approve" | "reject" }) =>
      apiPost<{ success: boolean; proposal: unknown }>(`/resume-agent/proposals/${proposalId}/decision`, { decision }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-agent", "run", runId] });
      queryClient.invalidateQueries({ queryKey: ["resume-agent", "workspace"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useConfirmResumeSkill(runId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: MissingSkillInput) => apiPost<{
      success: boolean;
      result: { changed: boolean; versionId?: string; message?: string };
    }>(`/resume-agent/runs/${runId}/missing-skills/confirm`, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-agent", "run", runId] });
      queryClient.invalidateQueries({ queryKey: ["resume-agent", "workspace"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

export function useDownloadResumeVersion() {
  return useMutation({
    mutationFn: async ({ versionId, format }: { versionId: string; format: "pdf" | "docx" }) => {
      const response = await fetch(`${BASE_URL}/api/resume-agent/versions/${versionId}/download/${format}`, {
        credentials: "include",
      });
      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string; message?: string } | null;
        throw new Error(body?.error || body?.message || `Unable to generate ${format.toUpperCase()}`);
      }
      return { blob: await response.blob(), format };
    },
  });
}
