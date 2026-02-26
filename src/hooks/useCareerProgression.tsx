import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

async function fetchcareerProgression() {
  const res = await fetch(`${BASE_URL}/api/career`, {
    method:'POST',
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }


   const data = await res.json();
 
  return data;
}

export function useCareerProgression() {
  
  return useQuery({
    queryKey: ["career"],
    queryFn: fetchcareerProgression,

    // ✅ caching strategy
    staleTime: 30 * 60 * 1000, // 30 mins
    gcTime: 60 * 60 * 1000,    // keep cache for 1 hour

    // ✅ UX behavior
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
