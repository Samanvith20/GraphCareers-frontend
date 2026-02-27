import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

async function fetchMatchedJobs() {
  const res = await fetch(`${BASE_URL}/api/jobs`, {
    method: "GET",
      cache: "no-store",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    
  });


  if (!res.ok) {
    throw new Error("Failed to fetch jobs");
  }

  const data = await res.json();

  return data;
}

export function useMatchedJobs() {
  return useQuery({
    queryKey: ["match-jobs"],
    queryFn: fetchMatchedJobs,

    // ✅ caching strategy for jobs
    staleTime: 30 * 60 * 1000, // 30 mins
    gcTime: 60 * 60 * 1000,    // keep cache for 1 hour

    // ✅ UX
    retry: 2,
  });
}
