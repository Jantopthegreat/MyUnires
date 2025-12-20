"use client";

import { useEffect, useMemo, useState } from "react";
import Sidebar_AsistenMusyrif from "@/components/sidebar_asistenMusyrif";
import { apiGet } from "@/lib/api";

type MateriRow = {
  id: number;
  judul: string;
  deskripsi?: string | null;
  fileUrl?: string | null;
  kategori?: { nama?: string };
  createdAt?: string;
};

type MateriRes = { success: boolean; data: MateriRow[] };

export default function MateriReadOnlyPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [materi, setMateri] = useState<MateriRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState("all");

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        const res = await apiGet<MateriRes>("/api/asisten/materi");
        if (!active) return;

        setMateri(res.data || []);
      } catch (e: any) {
        if (!active) return;
        setMateri([]);
        setErrorMsg(e?.message || "Gagal memuat materi.");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const kategoriOptions = useMemo(() => {
    const set = new Set<string>();
    materi.forEach((m) => {
      const k = m?.kategori?.nama;
      if (k) set.add(k);
    });
    return ["all", ...Array.from(set).sort((a, b) => a.localeCompare(b))];
  }, [materi]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();

    return materi.filter((m) => {
      const okSearch =
        !q ||
        (m.judul || "").toLowerCase().includes(q) ||
        (m.deskripsi || "").toLowerCase().includes(q) ||
        (m.kategori?.nama || "").toLowerCase().includes(q);

      const okKategori =
        kategoriFilter === "all" ? true : m.kategori?.nama === kategoriFilter;

      return okSearch && okKategori;
    });
  }, [materi, search, kategoriFilter]);

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
              Materi Pembelajaran (Read-only)
            </h1>
          </header>

          <section className="flex flex-col sm:flex-row gap-3 mb-5">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari materi (judul/deskripsi/kategori)"
              className="w-full sm:w-[360px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
            />

            <select
              value={kategoriFilter}
              onChange={(e) => setKategoriFilter(e.target.value)}
              className="w-full sm:w-[220px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
            >
              {kategoriOptions.map((k) => (
                <option key={k} value={k}>
                  {k === "all" ? "Kategori (All)" : k}
                </option>
              ))}
            </select>
          </section>

          <section className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b">
              <h3 className="text-sm font-semibold text-gray-900">
                Daftar Materi
              </h3>
              <p className="text-xs text-gray-500">
                Klik file untuk buka/download
              </p>
            </div>

            {errorMsg ? (
              <div className="px-6 py-4 text-xs text-red-700 bg-red-50 border-b border-red-100">
                {errorMsg}
              </div>
            ) : null}

            <div className="p-6">
              {loading ? (
                <div className="text-sm text-gray-500">Memuat data...</div>
              ) : filtered.length === 0 ? (
                <div className="text-sm text-gray-500">Tidak ada materi.</div>
              ) : (
                <div className="space-y-3 max-h-[65vh] overflow-auto">
                  {filtered.map((m) => (
                    <div
                      key={m.id}
                      className="rounded-xl border border-gray-100 bg-white p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-gray-900">
                            {m.judul}
                          </p>
                          <p className="text-xs text-gray-500">
                            {m.kategori?.nama || "-"}
                          </p>
                          {m.deskripsi ? (
                            <p className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                              {m.deskripsi}
                            </p>
                          ) : null}
                        </div>

                        {m.fileUrl ? (
                          <a
                            href={m.fileUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="shrink-0 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                          >
                            Buka file →
                          </a>
                        ) : (
                          <span className="shrink-0 text-xs text-gray-400">
                            Tidak ada file
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
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
