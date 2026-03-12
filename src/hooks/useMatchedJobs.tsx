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
// console.log('data:;',data)

  return data;
}

export function useMatchedJobs() {
  return useQuery({
    queryKey: ["match-jobs"],
    queryFn: fetchMatchedJobs,

  // ✅ cache jobs for 24 hours
    staleTime: 24 * 60 * 60 * 1000, // 24h
    gcTime: 48 * 60 * 60 * 1000, // keep in memory 4

    // ✅ UX
    retry: 2,
  });
}
