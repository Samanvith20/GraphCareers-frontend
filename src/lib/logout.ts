
const BASE_URL = import.meta.env.VITE_BACKEND_URL;
export async function logoutUser() {
  const res = await fetch(`${BASE_URL}/api/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Logout failed");
  return true;
}
