
import { useQuery } from "@tanstack/react-query";

const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export function useAuth() {
  return useQuery({
    queryKey: ["auth"],
    queryFn: async () => {
      const res = await fetch(`${BASE_URL}/api/auth/me`, {
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to fetch user");
      }

      return res.json();
    },
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}