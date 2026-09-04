
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

interface ApiGetOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

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

export async function apiGet<T>(path: string, options: ApiGetOptions = {}): Promise<T> {
  const controller = new AbortController();
  let timedOut = false;
  const abortFromCaller = () => controller.abort();
  options.signal?.addEventListener("abort", abortFromCaller, { once: true });
  const timeout = options.timeoutMs ? window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, options.timeoutMs) : null;

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/api${path}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      signal: controller.signal,
    });
  } catch (error) {
    if (timedOut) throw new Error("The server did not respond in time. Please try checking the status again.");
    throw error;
  } finally {
    if (timeout !== null) window.clearTimeout(timeout);
    options.signal?.removeEventListener("abort", abortFromCaller);
  }

  const data = await res.json();
  
  if (!res.ok) {
    const errMsg = typeof data.error === 'object' && data.error !== null 
      ? data.error.message || "Request failed" 
      : data.message || data.error || "Request failed";
    throw new Error(errMsg);
  }

  return data;
}
