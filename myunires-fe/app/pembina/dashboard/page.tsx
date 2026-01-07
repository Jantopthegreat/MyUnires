"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar_Musyrif from "@/components/sidebar_musyrif";
import LogoutModal from "@/components/LogoutModal";
import { apiGet, clearAuth } from "@/lib/api";

type ResidentItem = {
  id: number;
  name: string;
  nim: string;
  usroh?: string | null;
};

type NilaiTahfidzDetailRow = {
  id: number;
  residentId: number;
  status: string; // "SELESAI" | "BELUM SELESAI" | "REVISI"
  target?: string;
  surah?: string;
};

type ApiRes<T> = { success: boolean; data: T };

function StatCard({
  label,
  value,
  tone = "gray",
}: {
  label: string;
  value: string | number;
  tone?: "gray" | "green" | "amber" | "blue";
}) {
  const toneMap = {
    gray: "text-gray-900",
    green: "text-emerald-700",
    amber: "text-amber-700",
    blue: "text-blue-700",
  };
  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
      <p className="text-xs text-gray-500">{label}</p>
      <p
        className={`mt-2 text-3xl font-semibold tabular-nums ${toneMap[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}

export default function DashboardMusyrifPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [residents, setResidents] = useState<ResidentItem[]>([]);
  const [nilaiDetail, setNilaiDetail] = useState<NilaiTahfidzDetailRow[]>([]);
  const [loading, setLoading] = useState(true);
  // Fungsi handleLogout
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
    }
    window.location.href = "/login";
  };

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);

        const [resResident, resNilai] = await Promise.all([
          apiGet<ApiRes<ResidentItem[]>>("/api/musyrif/residents"),
          apiGet<ApiRes<NilaiTahfidzDetailRow[]>>(
            "/api/musyrif/tahfidz/detail"
          ),
        ]);

        if (!active) return;

        setResidents(resResident.data || []);
        setNilaiDetail(resNilai.data || []);
      } catch (e) {
        if (!active) return;
        setResidents([]);
        setNilaiDetail([]);
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const stats = useMemo(() => {
    const totalResident = residents.length;

    const totalNilai = nilaiDetail.length;
    const selesai = nilaiDetail.filter(
      (n) => (n.status || "").toUpperCase() === "SELESAI"
    ).length;
    const belum = nilaiDetail.filter(
      (n) => (n.status || "").toUpperCase() === "BELUM SELESAI"
    ).length;
    const revisi = nilaiDetail.filter(
      (n) => (n.status || "").toUpperCase() === "REVISI"
    ).length;

    // “Progress cepat”: persen selesai dari semua record tahfidz
    const pct = totalNilai > 0 ? Math.round((selesai / totalNilai) * 100) : 0;

    return { totalResident, totalNilai, selesai, belum, revisi, pct };
  }, [residents, nilaiDetail]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-4 sm:px-6 border-b">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Open menu"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M4 6h16M4 12h16M4 18h16"
                stroke="#0D6B44"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>

          {showLogoutModal && (
            <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-sm text-center">
                <h2 className="text-xl font-semibold text-[#004220] mb-3">
                  Log Out
                </h2>
                <p className="text-gray-600 text-sm mb-6">Akhiri sesi login?</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={() => setShowLogoutModal(false)}
                    className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            </div>
          )}

          <img
            src="/lg_umy.svg"
            alt="UMY"
            className="h-7 sm:h-8 w-auto object-contain shrink-0"
          />
          <img
            src="/lg_unires.svg"
            alt="MyUnires"
            className="h-7 sm:h-8 w-auto object-contain shrink-0"
          />
        </div>

        {/* Tombol Logout */}
        <button
          className="bg-[#E50914] hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full shadow-md"
          onClick={() => setShowLogoutModal(true)}
        >
          Log Out
        </button>
      </header>

      <Sidebar_Musyrif
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen((p) => !p)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      <main
        className={[
          "pt-16 transition-all duration-300",
          isOpen ? "md:ml-64" : "md:ml-14",
          "ml-0",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
          <header className="mb-4">
            <h1 className="bg-[#004220] text-white text-center py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-semibold shadow-sm">
              Dashboard Musyrif
            </h1>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              label="Resident binaan"
              value={loading ? "—" : stats.totalResident}
            />
            <StatCard
              label="Total data tahfidz"
              value={loading ? "—" : stats.totalNilai}
            />
            <StatCard
              label="Selesai"
              value={loading ? "—" : stats.selesai}
              tone="green"
            />
            <StatCard
              label="Revisi"
              value={loading ? "—" : stats.revisi}
              tone="amber"
            />
          </section>

          <section className="rounded-2xl bg-white border border-gray-100 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h3 className="text-sm font-semibold text-gray-900">
                Ringkasan Progress Hafalan
              </h3>
              <p className="text-xs text-gray-500">
                Dihitung dari /tahfidz/detail (status per target)
              </p>
            </div>

            <div className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-700">Persentase selesai</p>
                <p className="text-sm font-semibold text-emerald-700 tabular-nums">
                  {loading ? "—" : `${stats.pct}%`}
                </p>
              </div>

              <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-2 rounded-full bg-emerald-600"
                  style={{ width: `${stats.pct}%` }}
                />
              </div>

              <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">Belum selesai</p>
                  <p className="mt-1 text-lg font-semibold text-blue-700 tabular-nums">
                    {loading ? "—" : stats.belum}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">Selesai</p>
                  <p className="mt-1 text-lg font-semibold text-emerald-700 tabular-nums">
                    {loading ? "—" : stats.selesai}
                  </p>
                </div>
                <div className="rounded-xl bg-gray-50 border border-gray-100 p-4">
                  <p className="text-xs text-gray-500">Revisi</p>
                  <p className="mt-1 text-lg font-semibold text-amber-700 tabular-nums">
                    {loading ? "—" : stats.revisi}
                  </p>
                </div>
              </div>
            </div>
          </section>

          <div className="mt-4 text-xs text-gray-500">
            © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
          </div>
        </div>
      </main>
      {/* Modal Logout */}
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />
    </div>
  );
}
