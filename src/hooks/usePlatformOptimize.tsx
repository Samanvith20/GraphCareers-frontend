import { useMutation, useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Types based on the API integration guide
export interface SkillRecommendation {
  skill: string;
  demandPct: number;
  importance: string;
  learnMessage: string;
}

export interface PlatformOptimizeStatusResponse {
  success: boolean;
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  atsScores?: {
    [platform: string]: number;
    before?: number;
    after?: number;
  };
  improvement?: number;
  keywordsAdded?: string[];
  keywordsMissing?: string[];
  skillRecommendations?: SkillRecommendation[];
  scoreDetails?: {
    topPlatformSkills?: { skill: string; pct: number }[];
  };
  optimizationNotes?: string[];
  optimizedResume?: any;
  optimizedJson?: any; // Keeping for backward compatibility
}

// 1. Mutation to start the optimization job
export function useStartPlatformOptimize() {
  return useMutation({
    mutationFn: async ({ platform, userId }: { platform: string; userId: string }) => {
      // Use the exact combination requested by the backend
      const idempotencyKey = `${userId}-${platform}`;

      const response = await fetch(`${BASE_URL}/api/resume-intelligence/${platform}/optimize`, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey
        },
        credentials: "include",
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 429) {
          throw new Error(errorData.message || "You already have an active optimization running for another platform. Please wait for it to finish.");
        }
        if (response.status === 409) {
           throw new Error(errorData.message || "Optimization already in progress for this platform.");
        }
        throw new Error(errorData.message || "Failed to start optimization");
      }
      
      const data = await response.json().catch(() => ({}));
      return { success: true, platform, cached: data.cached === true };
    },
  });
}

// 2. Query to poll the status
export function usePlatformOptimizeStatus(platform: string | null, stopPolling: boolean = false) {
  return useQuery({
    queryKey: ["platformOptimizeStatus", platform],
    queryFn: async () => {
      if (!platform) return null;
      
      const response = await fetch(`${BASE_URL}/api/resume-intelligence/${platform}/status`, {
        credentials: "include",
      });
      
      if (!response.ok) {
         throw new Error("Failed to fetch optimization status");
      }
      return response.json() as Promise<PlatformOptimizeStatusResponse>;
    },
    enabled: !!platform && !stopPolling,
    // Poll every 5 seconds until completed or failed
    refetchInterval: (query) => {
      if (stopPolling) return false;
      const data = query.state.data;
      if (data?.status === "completed" || data?.status === "failed") {
        return false;
      }
      return 5000;
    },
  });
}
