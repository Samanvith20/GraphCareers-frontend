import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export interface JobPreferences {
  desiredRoles: string[] | null;
  locations: string[] | null;
  workModes: string[] | null;
  employmentTypes: string[] | null;
}
export interface JobFeedContext {
  mode: "profile" | "role" | "explore";
  title: string;
  description: string;
  hasSkills: boolean;
  experienceKnown: boolean;
  unanswered: string[];
  warnings: string[];
}
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function useJobPreferences() {
  const { data: auth } = useAuth();
  const client = useQueryClient();
  const userId = auth?.user?.id;
  const query = useQuery<{ preferences: JobPreferences }>({
    queryKey: ["job-preferences", userId], enabled: Boolean(userId),
    queryFn: async ({ signal }) => {
      const res = await fetch(`${BASE_URL}/api/jobs/preferences`, { credentials: "include", signal });
      if (!res.ok) throw new Error("Unable to load job preferences. Please retry.");
      return res.json();
    },
  });
  const save = useMutation({
    mutationFn: async (patch: Partial<JobPreferences>) => {
      const res = await fetch(`${BASE_URL}/api/jobs/preferences`, {
        method: "PATCH", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(patch),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.message || "Unable to save preferences");
      return data as { preferences: JobPreferences };
    },
    onSuccess: async data => {
      client.setQueryData(["job-preferences", userId], data);
      await client.invalidateQueries({ queryKey: ["match-jobs"] });
      toast.success("Job preferences saved. Your master resume has not changed.");
    },
    onError: (error: Error) => toast.error(error.message),
  });
  return { ...query, save };
}

export function useJobRoles(search: string, enabled: boolean) {
  return useQuery<{ roles: string[] }>({
    queryKey: ["job-role-options", search], enabled, staleTime: 5 * 60 * 1000,
    queryFn: async ({ signal }) => {
      const res = await fetch(`${BASE_URL}/api/jobs/roles?q=${encodeURIComponent(search)}`, { credentials: "include", signal });
      if (!res.ok) throw new Error("Could not load roles. You can skip this step and retry later.");
      return res.json();
    },
  });
}
