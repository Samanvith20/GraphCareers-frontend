import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiPost } from "@/lib/api";

// ─── Interfaces ──────────────────────────────────────────────────────────────

export interface ReferralContact {
  id: string;
  providerPersonId?: string;
  fullName: string;
  title: string;
  linkedinUrl?: string;
  score?: number;
  isRevealed: boolean;
  email?: string; // only present if isRevealed is true
}

export interface ReferralRequest {
  requestId: string;
  companyName: string;
  companyDomain?: string;
  jobTitleContext?: string | null;
  locationContext?: string | null;
  status: "pending" | "completed" | "failed_no_contacts";
  contacts: ReferralContact[];
  requestedAt: string;
}

export interface ReferralsDashboardData {
  requests: ReferralRequest[];
  credits: {
    remaining: number;
  };
}

export interface RequestReferralPayload {
  companyName: string;
  jobSourceId: string;
}

export interface RevealContactPayload {
  providerPersonId: string;
  companyDomain: string;
  fullName?: string;
  title?: string;
  linkedinUrl?: string;
}

// ─── Request Referral ────────────────────────────────────────────────────────

export function useRequestReferrals() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: RequestReferralPayload) =>
      apiPost<{ success: boolean; status: "completed" | "failed_no_contacts" }>("/referrals/request", payload),
    onSuccess: () => {
      // Refresh the dashboard list
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
    },
  });
}

// ─── Get Referrals Dashboard ─────────────────────────────────────────────────

export function useGetReferrals() {
  // We need a GET wrapper in api.ts or we can just fetch directly since we only have apiPost.
  // Actually, I'll just fetch directly here to keep it simple and authentic.
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  return useQuery({
    queryKey: ["referrals"],
    queryFn: async (): Promise<ReferralsDashboardData> => {
      const res = await fetch(`${BASE_URL}/api/referrals/dashboard`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || data.error || "Failed to fetch referrals");
      }
      return {
        requests: Array.isArray(data.data) ? data.data : [],
        credits: data.credits || { remaining: 0 }
      };
    },
    // Keep it relatively fresh for pending states
    refetchInterval: (data: any) => {
      // If any request is pending, poll every 5 seconds
      const hasPending = data?.requests && Array.isArray(data.requests) && data.requests.some((r: any) => r.status === "pending");
      return hasPending ? 5000 : false;
    }
  });
}

// ─── Reveal Contact ──────────────────────────────────────────────────────────

export function useRevealReferralContact() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (payload: RevealContactPayload) =>
      apiPost<{ success: boolean; data?: { contact: ReferralContact; creditCharged: boolean; credits: { remaining: number } }; error?: { code: string; message: string } }>("/contacts/reveal", payload),
    onSuccess: () => {
      // Refresh profile to sync credits site-wide
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      // Refresh dashboard to show the revealed email
      queryClient.invalidateQueries({ queryKey: ["referrals"] });
    },
  });
}
