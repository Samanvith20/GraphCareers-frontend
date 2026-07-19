import { useInfiniteQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

// Days options the UI can pass:
//   1 → Today
//   2 → Yesterday (and Today)
//   3 → Last 3 days (default)
export type JobDaysFilter = 1 | 2 | 3;

interface FetchParams {
  pageParam?: number;
  days: JobDaysFilter;
}

async function fetchMatchedJobs({ pageParam = 1, days }: FetchParams) {
  const url = new URL(`${BASE_URL}/api/jobs`);
  url.searchParams.set("page",  String(pageParam));
  url.searchParams.set("limit", "20");
  url.searchParams.set("days",  String(days));

  const res = await fetch(url.toString(), {
    method: "GET",
    credentials: "include",
  });

  const data = await res.json();

  // Profile incomplete — return empty gracefully, don't crash
  if (res.status === 400) {
    return { jobs: [], error: data.error };
  }

  if (!res.ok) {
    throw new Error(data.error || "Failed to fetch jobs");
  }

  return data;
}

export function useMatchedJobs(days: JobDaysFilter = 3) {
  return useInfiniteQuery({
    // days is part of the key → different day range = separate cache entry → auto-refetch
    queryKey: ["match-jobs", days],
    queryFn: ({ pageParam }) =>
      fetchMatchedJobs({ pageParam: pageParam as number | undefined, days }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const totalLoaded    = allPages.flatMap((p) => p.jobs).length;
      const totalAvailable = lastPage.filters?.total ?? 0;
      return totalLoaded < totalAvailable ? allPages.length + 1 : undefined;
    },

    // Each days-filter result is cached independently for 24 h
    staleTime: 24 * 60 * 60 * 1000,
    gcTime:    48 * 60 * 60 * 1000,

    retry: 2,
  });
}
