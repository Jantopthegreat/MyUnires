"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Swal from "sweetalert2";
import { apiPost } from "@/lib/api";

export default function ActivatePage() {
  const router = useRouter();
  const sp = useSearchParams();

  const token = useMemo(() => sp.get("token") || "", [sp]);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleActivate = async () => {
    if (!token) {
      Swal.fire({ icon: "error", title: "Link tidak valid", text: "Token tidak ditemukan di URL." });
      return;
    }
    if (!password || password.length < 6) {
      Swal.fire({ icon: "error", title: "Validasi", text: "Password minimal 6 karakter." });
      return;
    }
    if (password !== confirm) {
      Swal.fire({ icon: "error", title: "Validasi", text: "Konfirmasi password tidak sama." });
      return;
    }

    try {
      setLoading(true);
      await apiPost("/api/auth/activate", { token, password });
      Swal.fire({ icon: "success", title: "Berhasil", text: "Akun berhasil diaktivasi. Silakan login.", timer: 2000 });
      router.push("/login");
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err?.response?.data?.message || "Aktivasi gagal.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5] p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-lg font-semibold mb-1">Aktivasi Akun</h1>
        <p className="text-xs text-gray-500 mb-6">Buat password untuk mengaktifkan akun.</p>

        <label className="block text-sm font-medium mb-1">Password</label>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm mb-3"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <label className="block text-sm font-medium mb-1">Konfirmasi Password</label>
        <input
          className="w-full border rounded-lg px-3 py-2 text-sm mb-5"
          type="password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          onClick={handleActivate}
          disabled={loading}
          className="w-full bg-[#004220] text-white rounded-lg py-2 hover:bg-[#003318] disabled:opacity-60"
        >
          {loading ? "Memproses..." : "Aktifkan Akun"}
        </button>
      </div>
    </div>
  );
}
