
import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

async function fetchUserJobApplications() {
  const res = await fetch(`${BASE_URL}/api/job-applications`, {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch job applications");
  }

  const data = await res.json();
  return data.jobs; 
}

export function useUserJobApplications() {
  return useQuery({
    queryKey: ["user-job-applications"],
    queryFn: fetchUserJobApplications,
    staleTime: 60 * 1000, // 1 min (jobs change often)
  });
}