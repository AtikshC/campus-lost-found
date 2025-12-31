export async function fetchJSON<T>(url: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);

  // If you're sending a body, ensure JSON header exists
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(url, {
    ...init,
    headers,
    //  ensures Supabase auth cookies are sent
    credentials: "include",
  });

  const data = await res.json().catch(() => ({} as any));

  if (!res.ok) {
    throw new Error((data as any)?.error || `Request failed (status ${res.status})`);
  }

  return data as T;
}
