// lib/api.ts
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

// helper bikin querystring yang bersih
const toQS = (params?: Record<string, any>) => {
  if (!params) return "";
  const pairs = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  const qs = new URLSearchParams(pairs as [string, string][]).toString();
  return qs ? `?${qs}` : "";
};

// ✅ versi apiGet-mu tetap dipakai
export async function apiGet<T>(path: string, params?: Record<string, any>) {
  const url = `${API_BASE}${path}${toQS(params)}`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`GET ${url} -> ${res.status} ${res.statusText}`);
  return (await res.json()) as T;
}

// ✅ tambah apiPost untuk submit form
export async function apiPost<T>(
  path: string,
  body: unknown,
  init?: RequestInit
) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
    body: JSON.stringify(body),
    cache: "no-store",
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`POST ${url} -> ${res.status} ${res.statusText} ${text}`);
  }
  return (await res.json()) as T;
}
