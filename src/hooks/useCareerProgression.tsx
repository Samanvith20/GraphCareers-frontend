import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

async function fetchcareerProgression() {
  const res = await fetch(`${BASE_URL}/api/career`, {
    method:'POST',
    credentials: "include",
  });

 


   const data = await res.json();
    // 🔴 real server failure only
  if (res.status >= 500) {
    throw new Error("Server error");
  }
 
  return data;
}

export function useCareerProgression() {
  
  return useQuery({
    queryKey: ["career"],
    queryFn: fetchcareerProgression,

    // ✅ caching strategy
      staleTime: 24 * 60 * 60 * 1000, // 24h
    gcTime: 48 * 60 * 60 * 1000, // keep cache 48h

    // ✅ UX behavior
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
