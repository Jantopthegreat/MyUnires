"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { useAuth } from "@/lib/useAuth";
import { apiGet, clearAuth, getUser } from "@/lib/api";
import LogoutModal from "@/components/LogoutModal";

type ResidentRow = {
  id: number;
  name: string;
  email: string;
  nim: string;
  jurusan: string;
  angkatan: number;
  usroh: string;
  noTelp: string;
};

type TargetProgressRow = {
  targetId: number;
  nama: string;
  surah: string;
  ayatMulai: number;
  ayatAkhir: number;
  selesai: number;
  belum: number;
};

type ApiRes<T> = { success: boolean; message?: string; data: T };
type ProgressRes = {
  success: boolean;
  data: TargetProgressRow[];
  meta?: { totalResident: number };
  message?: string;
};

function StatCard({
  label,
  value,
  accent = "green",
  loading,
  hint,
}: {
  label: string;
  value: number;
  accent?: "green" | "blue" | "amber";
  loading?: boolean;
  hint?: string;
}) {
  const accentMap = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    amber: "bg-amber-50 text-amber-800 ring-amber-100",
  } as const;

  return (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 tabular-nums">
            {loading ? "—" : value}
          </p>
          {hint ? (
            <p className="mt-1 text-[11px] text-gray-500">{hint}</p>
          ) : null}
        </div>

        <div
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${accentMap[accent]}`}
        >
          Total
        </div>
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div
          className="h-2 rounded-full bg-emerald-600"
          style={{ width: `${v}%` }}
        />
      </div>
      <p className="mt-1 text-[11px] text-gray-500">{v.toFixed(0)}%</p>
    </div>
  );
}

function ResidentMiniCard({ r }: { r: ResidentRow }) {
  const initial = r?.name ? r.name.charAt(0).toUpperCase() : "R";

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 hover:bg-gray-50 transition">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div className="bg-yellow-400 text-black w-9 h-9 flex items-center justify-center rounded-full font-bold shrink-0">
            {initial}
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {r.name}
            </p>
            <p className="text-xs text-gray-500 truncate">{r.email}</p>
            <p className="mt-1 text-[11px] text-gray-600 truncate">
              NIM: {r.nim} • {r.jurusan} • {r.angkatan}
            </p>
          </div>
        </div>

        <Link
          href={`/dashboard/asisten-musyrif/input-nilai-tahfidz?residentId=${r.id}`}
          className="shrink-0 inline-flex items-center rounded-lg px-3 py-2 text-xs font-semibold bg-emerald-600 text-white hover:bg-emerald-700"
        >
          Input Nilai
        </Link>
      </div>
    </div>
  );
}

function TargetProgressCard({ r }: { r: TargetProgressRow }) {
  const total = r.selesai + r.belum;
  const pct = total > 0 ? (r.selesai / total) * 100 : 0;

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {r.nama}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {r.surah} ({r.ayatMulai}–{r.ayatAkhir})
          </p>
        </div>

        <div className="shrink-0 text-xs font-semibold text-emerald-700 tabular-nums">
          {r.selesai}/{total}
        </div>
      </div>

      <div className="mt-3">
        <ProgressBar value={pct} />
      </div>
    </div>
  );
}

export default function DashboardAsistenMusyrif() {
  const router = useRouter();
  useAuth(["ASISTEN"]);

  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // residents
  const [residents, setResidents] = useState<ResidentRow[]>([]);
  const [loadingResidents, setLoadingResidents] = useState(true);
  const [residentsError, setResidentsError] = useState<string | null>(null);

  // progress target
  const [progressRows, setProgressRows] = useState<TargetProgressRow[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [progressError, setProgressError] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) setUserData(currentUser);
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoadingResidents(true);
        setResidentsError(null);

        const res = await apiGet<ApiRes<ResidentRow[]>>(
          "/api/asisten/residents"
        );
        if (!active) return;

        setResidents(res.data || []);
      } catch (e: any) {
        if (!active) return;
        setResidents([]);
        setResidentsError(e?.message || "Gagal memuat resident binaan.");
      } finally {
        if (active) setLoadingResidents(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoadingProgress(true);
        setProgressError(null);

        const res = await apiGet<ProgressRes>(
          "/api/asisten/tahfidz/progress-target"
        );
        if (!active) return;

        setProgressRows(res.data || []);
      } catch (e: any) {
        if (!active) return;
        setProgressRows([]);
        setProgressError(e?.message || "Gagal memuat progress tahfidz.");
      } finally {
        if (active) setLoadingProgress(false);
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

  const initial = userData?.name ? userData.name.charAt(0).toUpperCase() : "A";
  const topResidents = useMemo(() => residents.slice(0, 5), [residents]);

  const totalResident = residents.length;

  // ringkasan progress overall (dari rows target)
  const totalSelesai = useMemo(
    () => progressRows.reduce((acc, r) => acc + (r.selesai || 0), 0),
    [progressRows]
  );
  const totalBelum = useMemo(
    () => progressRows.reduce((acc, r) => acc + (r.belum || 0), 0),
    [progressRows]
  );

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* TOP HEADER */}
      <header className="h-16 bg-white border-b flex items-center sticky top-0 z-30">
        <div className="w-full mx-auto max-w-7xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="/lg_umy.svg" alt="UMY" className="h-8" />
            <img src="/lg_unires.svg" alt="UNIRES" className="h-8" />
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </header>

      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />

      {/* BODY */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
        {/* Title hijau */}
        <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm relative">
          Dashboard Asisten Musyrif
          <div className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 items-center gap-3">
            <div className="bg-yellow-400 text-black w-10 h-10 flex items-center justify-center rounded-full font-bold text-base">
              {initial}
            </div>
            <div className="leading-tight text-left">
              <p className="text-sm font-medium">
                {userData?.name || "Asisten"}
              </p>
              <p className="text-xs opacity-90">{userData?.email || ""}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-6">
          {/* Ringkasan */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">Ringkasan</h2>
              <p className="text-[11px] text-gray-500">
                Data binaan usroh kamu
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <StatCard
                label="Total Resident Binaan"
                value={totalResident}
                loading={loadingResidents}
                accent="green"
                hint="Resident dalam usroh binaan"
              />
              <StatCard
                label="Total Selesai (Akumulasi)"
                value={totalSelesai}
                loading={loadingProgress}
                accent="blue"
                hint="Dari semua target (count selesai)"
              />
              <StatCard
                label="Total Belum (Akumulasi)"
                value={totalBelum}
                loading={loadingProgress}
                accent="amber"
                hint="Dari semua target (count belum)"
              />
            </div>
          </section>

          {/* Grid 2 kolom: Residents + Progress */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            {/* Panel resident (Top 5 + scroll) */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Resident Binaan (Top 5)
                  </h3>
                  <p className="text-xs text-gray-500">
                    Klik “Input Nilai” untuk isi nilai tahfidz
                  </p>
                </div>

                <Link
                  href="/dashboard/asisten-musyrif/resident-per-usroh"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Lihat semua →
                </Link>
              </div>

              {residentsError ? (
                <div className="px-6 py-4 text-xs text-red-700 bg-red-50 border-b border-red-100">
                  {residentsError}
                </div>
              ) : null}

              <div className="p-6">
                <div className="max-h-[360px] overflow-auto space-y-3">
                  {loadingResidents ? (
                    <div className="text-xs text-gray-500">Memuat data...</div>
                  ) : null}

                  {!loadingResidents &&
                    topResidents.map((r) => (
                      <ResidentMiniCard key={r.id} r={r} />
                    ))}

                  {!loadingResidents && !topResidents.length ? (
                    <div className="text-xs text-gray-500">
                      Belum ada resident binaan.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Panel progress target (scroll) */}
            <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">
                    Progress Tahfidz per Target
                  </h3>
                  <p className="text-xs text-gray-500">
                    Selesai vs belum selesai
                  </p>
                </div>

                <Link
                  href="/dashboard/asisten-musyrif/input-nilai-tahfidz"
                  className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                >
                  Input nilai →
                </Link>
              </div>

              {progressError ? (
                <div className="px-6 py-4 text-xs text-red-700 bg-red-50 border-b border-red-100">
                  {progressError}
                </div>
              ) : null}

              <div className="p-6">
                <div className="max-h-[360px] overflow-auto space-y-3">
                  {loadingProgress ? (
                    <div className="text-xs text-gray-500">Memuat data...</div>
                  ) : null}

                  {!loadingProgress &&
                    progressRows.map((r) => (
                      <TargetProgressCard key={r.targetId} r={r} />
                    ))}

                  {!loadingProgress && !progressRows.length ? (
                    <div className="text-xs text-gray-500">
                      Belum ada data progress.
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </section>

          {/* Menu (format UMY, sederhana) */}
          <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b">
              <div className="flex items-center justify-between gap-4">
                <h2 className="text-sm font-semibold text-gray-900">
                  Menu Asisten
                </h2>
                <p className="text-xs text-gray-500">
                  Akses cepat fitur asisten
                </p>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link
                href="/dashboard/asisten-musyrif/resident-per-usroh"
                className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Resident Per Usroh
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Lihat daftar resident binaan
                </p>
              </Link>

              <Link
                href="/dashboard/asisten-musyrif/input-nilai-tahfidz"
                className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Input Nilai Tahfidz
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Input/update nilai tahfidz
                </p>
              </Link>

              <Link
                href="/dashboard/asisten-musyrif/buat-assignment"
                className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow-md transition"
              >
                <p className="text-sm font-semibold text-gray-900">
                  Buat Assignment
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Kelola soal & gambar
                </p>
              </Link>
            </div>
          </section>

          <div className="text-xs text-gray-500">
            © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
          </div>
        </div>
      </div>
    </div>
  );
}
