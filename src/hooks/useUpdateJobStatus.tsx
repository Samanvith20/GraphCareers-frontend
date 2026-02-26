// hooks/useUpsertJobStatus.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export function useUpsertJobStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      jobUrl: string;
      jobTitle?: string;
      company?: string;
      source: string;
      status: string;
    }) => {
      const res = await fetch(
        `${BASE_URL}/api/job-applications`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Failed to update job status");
      return res.json();
    },
    onSuccess: () => {
      // 🔁 refetch statuses
      queryClient.invalidateQueries({ queryKey: ["user-job-applications"] });
    },
  });
}