"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ResidentTable from "@/components/ResidentTable";
import { apiGet } from "@/lib/api";
import type { Paginated, Resident } from "@/types/resident";

type UsrohOption = { label: string; value: string };
const USROH_OPTIONS: UsrohOption[] = [{ label: "Usroh (All)", value: "All" }];

export default function ResidentPerUsrohPage() {
  const router = useRouter();
  const user = { name: "AsistenMusyrif", email: "asistenmusyrif@umy.ac.id" };

  const [search, setSearch] = useState("");
  const [usroh, setUsroh] = useState<UsrohOption>(USROH_OPTIONS[0]);
  const [rows, setRows] = useState<Resident[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const params = useMemo(
    () => ({ search, usroh: usroh.value, page: 1, limit: 10 }),
    [search, usroh]
  );

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);

    apiGet<Paginated<Resident>>("/residents", params)
      .then((res) => active && setRows(res.data ?? []))
      .catch((e) => {
        if (!active) return;
        setError(e.message);
        setRows([]);
      })
      .finally(() => active && setLoading(false));

    return () => {
      active = false;
    };
  }, [params]);

  return (
    <div className="min-h-screen bg-white">
      {/* TOP bar putih: logo kiri + logout kanan */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Image src="/umy.png" alt="UMY" width={140} height={32} className="h-8 w-auto" priority />
              <Image src="/unires.png" alt="UNIRES" width={120} height={28} className="h-7 w-auto" />
            </div>
            <button
              onClick={() => alert("Log out")}
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* Body grid: sidebar + konten */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-amber-400 text-emerald-900 font-bold grid place-items-center">AM</div>
            <div className="leading-tight text-emerald-900">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs">{user.email}</div>
            </div>
          </div>

          <nav className="mt-6 space-y-2 text-sm">
            <button
              onClick={() => router.push("/dashboard/asisten-musyrif")}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-emerald-900 hover:bg-emerald-900/5"
            >
              Dashboard
            </button>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-emerald-900 text-white">
              Resident Per Usroh
            </div>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-emerald-900 hover:bg-emerald-900/5">
              Input Nilai Tahfidz
            </button>
            <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-emerald-900 hover:bg-emerald-900/5">
              Buat Assignment
            </button>
          </nav>
        </aside>

        {/* Konten utama */}
        <section className="col-span-12 md:col-span-9">
          {/* Title pill hijau */}
          <div className="mx-auto mb-6 max-w-xl">
            <div className="rounded-2xl bg-emerald-900 px-6 py-4 text-center text-white text-2xl font-semibold">
              Daftar Nama Resident
            </div>
          </div>

          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari Resident"
                className="w-full rounded-lg border border-slate-300 px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
                </svg>
              </span>
            </div>

            <select
              value={usroh.value}
              onChange={(e) =>
                setUsroh(USROH_OPTIONS.find((o) => o.value === e.target.value) ?? USROH_OPTIONS[0])
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {USROH_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>

            <button
              onClick={() => alert("Impor Data")}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm hover:bg-slate-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m0 0l-3-3m3 3l3-3M5 21h14" />
              </svg>
              Impor Data
            </button>
          </div>

          <ResidentTable
            rows={rows}
            loading={loading}
            onView={(r) => alert(`Detail: ${r.name} (${r.uniresNumber})`)}
          />

          {error && <p className="mt-3 text-sm text-red-600">Gagal memuat data: {error}</p>}
        </section>
      </div>

      <div className="h-6 bg-emerald-900" />
    </div>
  );
}
