import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import type { WorkspaceData, ResumeVersion, EditPayload, EditResult } from "@/types/workspace";

export function useResumeWorkspace() {
  return useQuery({
    queryKey: ["resume-workspace"],
    queryFn: () => apiGet<WorkspaceData>("/resume-workspace"),
    staleTime: 5 * 60 * 1000,
  });
}

export function useResumeVersion(versionId: string | null) {
  return useQuery({
    queryKey: ["resume-version", versionId],
    queryFn: () => apiGet<ResumeVersion>(`/resume-workspace/versions/${versionId}`),
    enabled: !!versionId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useActivateVersion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (versionId: string) =>
      apiPost<ResumeVersion>(`/resume-workspace/versions/${versionId}/activate`, {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-workspace"] });
      queryClient.invalidateQueries({ queryKey: ["resume-version"] });
    },
  });
}

export function useResumeEdit(versionId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: EditPayload) =>
      apiPost<EditResult>(`/resume/edit/${versionId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-version", versionId] });
      queryClient.invalidateQueries({ queryKey: ["resume-workspace"] });
    },
  });
}

export function useJdOptimize(versionId: string | null) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { jobTitle: string; companyName: string; jobDescription: string }) =>
      apiPost<any>(`/resume/jd-optimize/${versionId}`, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resume-version", versionId] });
      queryClient.invalidateQueries({ queryKey: ["resume-workspace"] });
    },
  });
}
