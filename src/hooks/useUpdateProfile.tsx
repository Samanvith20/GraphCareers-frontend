import { useMutation, useQueryClient } from "@tanstack/react-query";
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const res = await fetch(`${BASE_URL}/api/user/update`, {
        method: "PATCH",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error("Profile update failed");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      queryClient.invalidateQueries({ queryKey: ["match-job"] });
      queryClient.invalidateQueries({ queryKey: ["career"] });
    },
  });
};
