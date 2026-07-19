
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

if (!BASE_URL) {
  throw new Error("VITE_BACKEND_URL is not defined");
}

export async function apiPost<T>(
  path: string,
  body: unknown
): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include", // important if using cookies
    body: JSON.stringify(body),
  });

  const data = await res.json();
  

  if (!res.ok) {
    const errMsg = typeof data.error === 'object' && data.error !== null 
      ? data.error.message || "Request failed" 
      : data.message || data.error || "Request failed";
    throw new Error(errMsg);
  }

  return data;
}