"use client";

import { useAuth } from "@/lib/useAuth";
import { apiGet, clearAuth, getUser } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import LogoutModal from "@/components/LogoutModal";
import Link from "next/link";

type AdminSummaryResponse = {
  success: boolean;
  message?: string;
  data: {
    residentCount: number;
    musyrifCount: number;
    asistenCount: number;
    updatedAt?: string;
  };
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

type TahfidzProgressResponse = {
  success: boolean;
  message?: string;
  data: TargetProgressRow[];
};

function StatCard({
  label,
  value,
  accent = "green",
  href,
  loading,
}: {
  label: string;
  value: number;
  accent?: "green" | "blue" | "amber";
  href?: string;
  loading?: boolean;
}) {
  const accentMap = {
    green: "bg-emerald-50 text-emerald-700 ring-emerald-100",
    blue: "bg-blue-50 text-blue-700 ring-blue-100",
    amber: "bg-amber-50 text-amber-800 ring-amber-100",
  } as const;

  const card = (
    <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5 hover:shadow transition">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs text-gray-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold text-gray-900 tabular-nums">
            {loading ? "—" : value}
          </p>
        </div>

        <div
          className={`shrink-0 rounded-full px-3 py-1 text-[11px] font-semibold ring-1 ${accentMap[accent]}`}
        >
          Total
        </div>
      </div>

      {href ? <p className="mt-3 text-[11px] text-gray-500">Klik untuk kelola data</p> : null}
    </div>
  );

  return href ? (
    <Link href={href} className="block">
      {card}
    </Link>
  ) : (
    card
  );
}

function ProgressBar({ value }: { value: number }) {
  const v = Math.max(0, Math.min(100, value));
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-gray-100 overflow-hidden">
        <div className="h-2 rounded-full bg-emerald-600" style={{ width: `${v}%` }} />
      </div>
      <p className="mt-1 text-[11px] text-gray-500">{v.toFixed(0)}%</p>
    </div>
  );
}

function MenuCard({
  title,
  subtitle,
  icon,
  href,
  tone = "emerald",
}: {
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  tone?: "emerald" | "blue" | "amber";
}) {
  const toneMap = {
    emerald: {
      ring: "hover:ring-emerald-200",
      badge: "text-emerald-700 bg-emerald-50 ring-emerald-100",
      glow: "from-emerald-500/0 via-emerald-500/10 to-emerald-500/0",
    },
    blue: {
      ring: "hover:ring-blue-200",
      badge: "text-blue-700 bg-blue-50 ring-blue-100",
      glow: "from-blue-500/0 via-blue-500/10 to-blue-500/0",
    },
    amber: {
      ring: "hover:ring-amber-200",
      badge: "text-amber-800 bg-amber-50 ring-amber-100",
      glow: "from-amber-500/0 via-amber-500/10 to-amber-500/0",
    },
  } as const;

  const t = toneMap[tone];

  return (
    <Link
      href={href}
      className={[
        "group relative overflow-hidden rounded-2xl bg-white border border-gray-100 shadow-sm",
        "ring-1 ring-transparent transition",
        "hover:shadow-md hover:-translate-y-[1px]",
        t.ring,
      ].join(" ")}
    >
      {/* subtle top glow */}
      <div className={`pointer-events-none absolute inset-x-0 -top-24 h-48 bg-gradient-to-b ${t.glow}`} />

      <div className="p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div
            className={[
              "h-12 w-12 rounded-xl bg-white ring-1 ring-gray-100 shadow-sm",
              "flex items-center justify-center shrink-0",
            ].join(" ")}
          >
            <img src={icon} alt={title} className="h-7 w-7 opacity-90 group-hover:opacity-100" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-semibold text-gray-900 leading-snug">{title}</p>
            <p className="mt-1 text-xs text-gray-500 leading-snug">{subtitle}</p>

            <div
              className={[
                "mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-semibold",
                "ring-1",
                t.badge,
              ].join(" ")}
            >
              Kelola
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </div>
          </div>
        </div>

        <div className="text-gray-300 group-hover:text-gray-400 transition text-lg leading-none">›</div>
      </div>
    </Link>
  );
}


function TargetProgressTable({
  rows,
  loading,
  error,
}: {
  rows: TargetProgressRow[];
  loading: boolean;
  error: string | null;
}) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl shadow-sm">
      <div className="px-6 py-5 border-b flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900">Progress Tahfidz per Target</h3>
        <p className="text-xs text-gray-500">Selesai vs belum selesai</p>
      </div>

      {error ? (
        <div className="px-6 py-4 text-xs text-red-700 bg-red-50 border-b border-red-100">
          {error}
        </div>
      ) : null}

<div className="relative overflow-x-auto max-h-[420px] overflow-y-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 bg-gray-50 border-b">
            <tr>
              <th className="px-6 py-3">Target</th>
              <th className="px-6 py-3">Selesai</th>
              <th className="px-6 py-3">Belum</th>
              <th className="px-6 py-3 w-[260px]">Progress</th>
              <th className="px-6 py-3 text-right">Aksi</th>
            </tr>
          </thead>

          <tbody className="divide-y">
            {loading ? (
              <tr>
                <td className="px-6 py-6 text-xs text-gray-500" colSpan={5}>
                  Memuat data...
                </td>
              </tr>
            ) : null}

            {!loading &&
              rows.map((r) => {
                const total = r.selesai + r.belum;
                const pct = total > 0 ? (r.selesai / total) * 100 : 0;

                return (
                  <tr key={r.targetId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-gray-900">{r.nama}</p>
                      <p className="text-xs text-gray-500">
                        {r.surah} ({r.ayatMulai}–{r.ayatAkhir})
                      </p>
                    </td>

                    <td className="px-6 py-4 font-medium text-emerald-700 tabular-nums">
                      {r.selesai}
                    </td>

                    <td className="px-6 py-4 font-medium text-gray-700 tabular-nums">
                      {r.belum}
                    </td>

                    <td className="px-6 py-4">
                      <ProgressBar value={pct} />
                    </td>

                    <td className="px-6 py-4 text-right">
                      {/* route detail ini optional, nanti bisa kamu buat */}
                      <Link
                        href={`/admin/tahfidz/target/${r.targetId}`}
                        className="text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                      >
                        Detail
                      </Link>
                    </td>
                  </tr>
                );
              })}

            {!loading && !rows.length ? (
              <tr>
                <td className="px-6 py-6 text-xs text-gray-500" colSpan={5}>
                  Belum ada data progress.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  useAuth(["ADMIN"]);

  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [summary, setSummary] = useState<AdminSummaryResponse["data"] | null>(null);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

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
        setLoadingSummary(true);
        setSummaryError(null);

        const res = await apiGet<AdminSummaryResponse>("/api/admin/summary");
        if (!active) return;

        setSummary(res.data);
      } catch (e: any) {
        if (!active) return;
        setSummary(null);
        setSummaryError(e?.message || "Gagal memuat ringkasan dashboard.");
      } finally {
        if (active) setLoadingSummary(false);
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

        const res = await apiGet<TahfidzProgressResponse>(
          "/api/admin/tahfidz/progress-target"
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

  const features = useMemo(
  () => [
    {
      title: "Data Resident",
      subtitle: "Kelola akun dan profil resident",
      icon: "/res_perlantai.svg",
      href: "/admin/resident",
      tone: "emerald" as const,
    },
    {
      title: "Data Asisten Musyrif",
      subtitle: "Kelola asisten & penempatan",
      icon: "/res_perlantai.svg",
      href: "/admin/asisten",
      tone: "blue" as const,
    },
    {
      title: "Data Musyrif",
      subtitle: "Kelola pembina & akses",
      icon: "/res_perlantai.svg",
      href: "/admin/musyrif",
      tone: "amber" as const,
    },
    {
      title: "Materi Pembelajaran",
      subtitle: "Kelola materi & file pembelajaran",
      icon: "/materi_pem.svg",
      href: "/admin/materi",
      tone: "emerald" as const,
    },
    {
      title: "Target Hafalan",
      subtitle: "Kelola target & ayat",
      icon: "/progres_hafalan.svg",
      href: "/admin/target",
      tone: "blue" as const,
    },
    {
      title: "Sub Target",
      subtitle: "Kelola sub target per target",
      icon: "/progres_hafalan.svg",
      href: "/admin/subtarget",
      tone: "amber" as const,
    },
    {
      title: "Asrama",
      subtitle: "Gedung, lantai, dan usroh",
      icon: "/dashboard.svg",
      href: "/admin/asrama",
      tone: "emerald" as const,
    },
  ],
  []
);


  const initial = userData?.name ? userData.name.charAt(0).toUpperCase() : "A";

  return (
    <div className="min-h-screen bg-[#F5F5F5] flex flex-col">
      {/* HEADER */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="/lg_umy.svg" alt="UMY" className="h-8" />
            <img src="/lg_unires.svg" alt="Unires" className="h-8" />
          </div>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full text-xs shadow"
          >
            Log Out
          </button>
        </div>
      </header>

      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />

      {/* TOP BAR */}
      <section className="bg-[#004220] text-white">
        <div className="mx-auto max-w-6xl px-6 py-6 relative">
          <h1 className="text-center text-lg font-semibold tracking-wide">Dashboard Admin</h1>

          <div className="absolute left-6 top-1/2 -translate-y-1/2 flex items-center gap-3">
            <div className="bg-yellow-400 text-black w-10 h-10 flex items-center justify-center rounded-full font-bold text-base">
              {initial}
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium">{userData?.name || "Admin"}</p>
              <p className="text-xs opacity-90">{userData?.email || ""}</p>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT */}
      <main className="grow">
        <div className="mx-auto max-w-6xl px-6 py-10 space-y-8">
          {/* STATS */}
          <section className="space-y-3">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-sm font-semibold text-gray-900">Ringkasan Data</h2>
              <p className="text-[11px] text-gray-500">
                {summary?.updatedAt ? `Update: ${summary.updatedAt}` : ""}
              </p>
            </div>

            {summaryError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs text-red-700">
                {summaryError}
              </div>
            ) : null}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                label="Total Resident"
                value={summary?.residentCount ?? 0}
                loading={loadingSummary}
                accent="green"
                href="/admin/resident"
              />
              <StatCard
                label="Total Musyrif (Pembina)"
                value={summary?.musyrifCount ?? 0}
                loading={loadingSummary}
                accent="blue"
                href="/admin/pembina"
              />
              <StatCard
                label="Total Asisten Musyrif"
                value={summary?.asistenCount ?? 0}
                loading={loadingSummary}
                accent="amber"
                href="/admin/asisten"
              />
            </div>
          </section>

          {/* TAHFIDZ TABLE */}
          <TargetProgressTable rows={progressRows} loading={loadingProgress} error={progressError} />

          {/* MENU */}
          <section className="bg-white border border-gray-100 rounded-2xl shadow-sm">
  <div className="px-6 py-5 border-b">
    <div className="flex items-center justify-between gap-4">
      <h2 className="text-sm font-semibold text-gray-900">Quick Actions</h2>
      <p className="text-xs text-gray-500">Akses cepat modul admin</p>
    </div>
  </div>

  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
  {features.map((f) => (
    <div
      key={f.href}
      className={f.title === "Asrama" ? "lg:col-start-2" : ""}
    >
      <MenuCard
        title={f.title}
        subtitle={f.subtitle}
        icon={f.icon}
        href={f.href}
        tone={f.tone}
      />
    </div>
  ))}
</div>
</section>

        </div>
      </main>

      {/* FOOTER */}
      <footer className="bg-[#004220] text-center text-white py-4 text-xs">
        © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
      </footer>
    </div>
  );
}
