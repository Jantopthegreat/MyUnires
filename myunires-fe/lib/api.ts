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
  const token = getToken();
  const res = await fetch(url, { 
    cache: "no-store",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
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
  const token = getToken();
  const res = await fetch(url, {
    method: "POST",
    headers: { 
      "Content-Type": "application/json", 
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}) 
    },
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

// ============ Auth Helpers ============

export interface LoginResponse {
  message: string;
  user: {
    id: number;
    name: string;
    email: string;
    role: "ADMIN" | "MUSYRIF" | "ASISTEN" | "RESIDENT";
  };
  token: string;
}

export async function login(email: string, password: string): Promise<LoginResponse> {
  return apiPost<LoginResponse>("/api/auth/login", { email, password });
}

export function saveAuth(data: LoginResponse) {
  if (typeof window !== "undefined") {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
}

export function getToken(): string | null {
  if (typeof window !== "undefined") {
    return localStorage.getItem("token");
  }
  return null;
}

export function getUser(): LoginResponse["user"] | null {
  if (typeof window !== "undefined") {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
  return null;
}

export function clearAuth() {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export function getRedirectPath(role: string): string {
  switch (role) {
    case "ADMIN":
      return "/pembina/dashboard";
    case "MUSYRIF":
      return "/pembina/dashboard";
    case "ASISTEN":
      return "/dashboard/asisten-musyrif";
    case "RESIDENT":
      return "/resident/dashboard";
    default:
      return "/login";
  }
}
