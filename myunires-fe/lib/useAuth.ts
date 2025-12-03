"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser, getToken, clearAuth } from "@/lib/api";

export function useAuth(allowedRoles?: string[]) {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    const user = getUser();

    // Jika tidak ada token, redirect ke login
    if (!token || !user) {
      clearAuth();
      router.push("/login");
      return;
    }

    // Jika ada role yang diizinkan, cek apakah user memiliki role tersebut
    if (allowedRoles && !allowedRoles.includes(user.role)) {
      router.push("/login");
      return;
    }
  }, [router, allowedRoles]);

  return { user: getUser(), token: getToken() };
}
