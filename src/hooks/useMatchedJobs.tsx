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

    // // ✅ caching strategy for jobs
    // staleTime: 7 * 60 * 1000, // 7 minutes
    // gcTime: 15 * 60 * 1000,   // 15 minutes

    // // ✅ UX
    // retry: 2,
  });
}
