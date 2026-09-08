import { useInfiniteQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useProfile } from "@/hooks/useProfile";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Days options the UI can pass:
//   1 → Today
//   2 → Yesterday (and Today)
//   3 → Last 3 days (default)
export type JobDaysFilter = 1 | 2 | 3;

interface FetchParams {
  pageParam?: number;
  days: JobDaysFilter;
  signal?: AbortSignal;
}

async function fetchMatchedJobs({ pageParam = 1, days, signal }: FetchParams) {
  const url = new URL(`${BASE_URL}/api/jobs`);
  url.searchParams.set("page",  String(pageParam));
  url.searchParams.set("limit", "20");
  url.searchParams.set("days",  String(days));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
    signal,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch jobs");
  }

  return data;
}

export function useMatchedJobs(days: JobDaysFilter = 3) {
  const { data: auth } = useAuth();
  const { data: profile } = useProfile();
  return useInfiniteQuery({
    // days is part of the key → different day range = separate cache entry → auto-refetch
    queryKey: ["match-jobs", auth?.user?.id, days, profile?.skills, profile?.experience, profile?.resume?.status],
    enabled: Boolean(auth?.user?.id),
    queryFn: ({ pageParam, signal }) =>
      fetchMatchedJobs({ pageParam: pageParam as number | undefined, days, signal }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded    = allPages.flatMap((p) => p.jobs).length;
      const totalAvailable = lastPage.filters?.total ?? 0;
      return totalLoaded < totalAvailable ? allPages.length + 1 : undefined;
    },

    staleTime: 2 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    refetchOnWindowFocus: true,

    retry: 2,
  });
}
