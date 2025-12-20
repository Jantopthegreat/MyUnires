"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar_AsistenMusyrif from "@/components/sidebar_asistenMusyrif";
import { apiGet } from "@/lib/api";

type TargetProgressRow = {
  targetId: number;
  nama: string;
  surah: string;
  ayatMulai: number;
  ayatAkhir: number;
  selesai: number;
  belum: number;
};

type ProgressRes = {
  success: boolean;
  data: TargetProgressRow[];
  meta?: { totalResident: number };
};

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

export default function ProgresHafalanPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [rows, setRows] = useState<TargetProgressRow[]>([]);
  const [totalResident, setTotalResident] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await apiGet<ProgressRes>(
          "/api/asisten/tahfidz/progress-target"
        );
        if (!active) return;

        setRows(res.data || []);
        setTotalResident(res.meta?.totalResident ?? 0);
      } catch (e: any) {
        if (!active) return;
        setRows([]);
        setTotalResident(0);
        setErrorMsg(e?.message || "Gagal memuat progress hafalan.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const totals = useMemo(() => {
    const selesai = rows.reduce((acc, r) => acc + (r.selesai || 0), 0);
    const belum = rows.reduce((acc, r) => acc + (r.belum || 0), 0);
    return { selesai, belum };
  }, [rows]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* HEADER (tanpa logout) */}
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

          <img
            src="/lg_umy.svg"
            alt="UMY"
            className="h-7 sm:h-8 w-auto object-contain shrink-0"
          />
          <img
            src="/lg_unires.svg"
            alt="UNIRES"
            className="h-7 sm:h-8 w-auto object-contain shrink-0"
          />
        </div>

        <div className="w-10" />
      </header>

      <Sidebar_AsistenMusyrif
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
              Progres Hafalan
            </h1>
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500">Total Resident</p>
              <p className="mt-2 text-3xl font-semibold text-gray-900 tabular-nums">
                {loading ? "—" : totalResident}
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500">Total Selesai (Akumulasi)</p>
              <p className="mt-2 text-3xl font-semibold text-emerald-700 tabular-nums">
                {loading ? "—" : totals.selesai}
              </p>
            </div>
            <div className="rounded-2xl bg-white border border-gray-100 shadow-sm p-5">
              <p className="text-xs text-gray-500">Total Belum (Akumulasi)</p>
              <p className="mt-2 text-3xl font-semibold text-amber-700 tabular-nums">
                {loading ? "—" : totals.belum}
              </p>
            </div>
          </section>

          <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h3 className="text-sm font-semibold text-gray-900">
                Progress per Target
              </h3>
              <p className="text-xs text-gray-500">Selesai vs belum selesai</p>
            </div>

            {errorMsg ? (
              <div className="px-6 py-4 text-xs text-red-700 bg-red-50 border-b border-red-100">
                {errorMsg}
              </div>
            ) : null}

            <div className="p-6">
              {loading ? (
                <div className="text-sm text-gray-500">Memuat data...</div>
              ) : rows.length === 0 ? (
                <div className="text-sm text-gray-500">
                  Belum ada data progress.
                </div>
              ) : (
                <div className="space-y-3 max-h-[65vh] overflow-auto">
                  {rows.map((r) => {
                    const total = r.selesai + r.belum;
                    const pct = total > 0 ? (r.selesai / total) * 100 : 0;

                    return (
                      <div
                        key={r.targetId}
                        className="rounded-xl border border-gray-100 bg-white p-4"
                      >
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
                  })}
                </div>
              )}
            </div>
          </section>

          <div className="mt-4 text-xs text-gray-500">
            © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
          </div>
        </div>
      </main>
    </div>
  );
}
