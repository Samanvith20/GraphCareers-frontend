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
     console.log("data::",data)
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
    retry:3,
    // staleTime: 5 * 60 * 1000, // cache profile for 5 mins
  });
}