import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

async function fetchProfile() {
  const res = await fetch(`${BASE_URL}/api/user`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }


   const data = await res.json();
   //console.log("profiledata::",data)
 
  return {
    ...data.profile,
    resume: data.resume,
    applicationsCount: data.applicationsCount,
    skills: data.profile.skills ?? [],
    location: data.profile.location ?? "",
    experience: data.profile.experience ?? 0,
    bio: data.profile.bio ?? "",
  };
}

export function useProfile() {
  
  return useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,

    // ✅ caching strategy
    staleTime: 30 * 60 * 1000, // 30 mins
    gcTime: 60 * 60 * 1000,    // keep cache for 1 hour

    // ✅ UX behavior
    retry: 2,
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
  });
}
