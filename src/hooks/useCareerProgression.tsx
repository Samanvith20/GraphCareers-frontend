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
    staleTime: 30 * 60 * 1000, // 30 mins
    gcTime: 60 * 60 * 1000,    // keep cache for 1 hour

    // ✅ UX behavior
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
