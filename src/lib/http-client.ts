const getRuntimeEnv = (): Record<string, string | undefined> => {
  if (typeof window === "undefined") return {};
  return (window as Window & { __APP_ENV__?: Record<string, string | undefined> }).__APP_ENV__ ?? {};
};

export const API_BASE_URL: string = getRuntimeEnv().VITE_API_URL ?? "/api";

export async function requestJson<T>(path: string, fallback: T, init?: RequestInit): Promise<T> {
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, init);
    if (!response.ok) {
      console.warn(`API ${response.status} for ${path}`);
      return fallback;
    }

    const contentType = response.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      return (await response.json()) as T;
    }

    return fallback;
  } catch (err) {
    console.warn(`API request failed for ${path}:`, err);
    return fallback;
  }
}

export async function requestJsonOrThrow<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, init);
  if (!response.ok) {
    throw new Error(`API ${response.status} for ${path}`);
  }
  return response.json() as T;
}
