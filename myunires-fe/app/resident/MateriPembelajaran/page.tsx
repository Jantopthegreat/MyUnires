"use client";

import { useState, useEffect, useMemo } from "react";
import { FaBook, FaArrowLeft } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import Sidebar_Resident from "@/components/Sidebar_Resident";
import { apiGet } from "@/lib/api";

interface KategoriMateri {
  id: number;
  nama: string;
}

interface Materi {
  id: number;
  judul: string;
  deskripsi: string;
  fileUrl: string | null;
  kategoriId: number;
  kategori: KategoriMateri;
}

export default function MateriPembelajaranPage() {
  // desktop collapse
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  const [kategoriList, setKategoriList] = useState<KategoriMateri[]>([]);
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [selectedKategori, setSelectedKategori] =
    useState<KategoriMateri | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch kategori + materi
  useEffect(() => {
    const run = async () => {
      setLoading(true);
      try {
        const [katRes, materiRes] = await Promise.all([
          apiGet<any>("/api/resident/kategori"),
          apiGet<any>("/api/resident/materi"),
        ]);

        const kategori = katRes?.data || katRes?.kategori || katRes;
        const materi = materiRes?.data || materiRes?.materi || materiRes;

        setKategoriList(Array.isArray(kategori) ? kategori : []);
        setMateriList(Array.isArray(materi) ? materi : []);
      } catch (error) {
        console.error("Error fetching kategori/materi:", error);
        setKategoriList([]);
        setMateriList([]);
      } finally {
        setLoading(false);
      }
    };

    run();
  }, []);

  const filteredMateri = useMemo(() => {
    if (!selectedKategori) return [];
    return materiList.filter((m) => m.kategoriId === selectedKategori.id);
  }, [selectedKategori, materiList]);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* HEADER (tanpa logout) */}
      <header className="h-16 bg-white border-b flex items-center sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <FiMenu size={18} className="text-[#0D6B44]" />
            </button>

            <img
              src="/lg_umy.svg"
              alt="UMY"
              className="h-6 sm:h-8 w-auto shrink-0"
            />
            <img
              src="/lg_unires.svg"
              alt="UNIRES"
              className="h-6 sm:h-8 w-auto shrink-0"
            />
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Resident</p>
            <p className="text-sm font-semibold text-[#004220] leading-tight">
              Materi Pembelajaran
            </p>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <Sidebar_Resident
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN */}
      <main
        className={[
          "transition-all duration-300",
          isOpen ? "md:pl-64" : "md:pl-14",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          {/* Title bar */}
          <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm">
            Materi Pembelajaran
          </div>

          {/* Content */}
          <section className="mt-6">
            {loading ? (
              <div className="bg-white rounded-2xl border shadow-sm py-16 text-center text-gray-500">
                Memuat data...
              </div>
            ) : !selectedKategori ? (
              <>
                {/* KATEGORI LIST */}
                {kategoriList.length === 0 ? (
                  <div className="bg-white rounded-2xl border shadow-sm py-12 text-center">
                    <p className="text-gray-600 font-semibold">
                      Tidak ada kategori materi
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Cek koneksi atau hubungi administrator.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kategoriList.map((k) => (
                      <button
                        key={k.id}
                        onClick={() => setSelectedKategori(k)}
                        className="group text-left bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Kategori</p>
                            <h3 className="text-[#004220] text-lg font-semibold mt-1">
                              {k.nama}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                              Lihat materi yang tersedia di kategori ini.
                            </p>
                          </div>

                          <div className="h-11 w-11 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center shrink-0">
                            <FaBook className="text-[#0D6B44] text-lg" />
                          </div>
                        </div>

                        <div className="mt-4 inline-flex items-center text-sm font-semibold text-[#0D6B44] group-hover:underline">
                          Buka
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* BACK + HEADER KATEGORI */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <button
                    onClick={() => setSelectedKategori(null)}
                    className="inline-flex items-center gap-2 text-[#004220] hover:text-[#003318] font-semibold transition"
                  >
                    <FaArrowLeft />
                    Kembali
                  </button>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Kategori</p>
                    <p className="text-base font-semibold text-[#004220]">
                      {selectedKategori.nama}
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-white rounded-2xl border shadow-sm p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-[#004220]">
                        {selectedKategori.nama}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {filteredMateri.length} materi tersedia
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 whitespace-nowrap">
                      Materi
                    </span>
                  </div>
                </div>

                {/* MATERI LIST */}
                <div className="mt-4">
                  {filteredMateri.length === 0 ? (
                    <div className="bg-white rounded-2xl border shadow-sm py-12 text-center text-gray-500">
                      Belum ada materi untuk kategori ini
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredMateri.map((m) => (
                        <div
                          key={m.id}
                          className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-11 w-11 rounded-xl bg-[#004220] flex items-center justify-center shrink-0">
                              <FaBook className="text-white text-lg" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-semibold text-[#004220] leading-snug">
                                {m.judul}
                              </h3>

                              <div className="mt-1">
                                <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                  {selectedKategori.nama}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 text-sm mt-4 leading-relaxed line-clamp-3">
                            {m.deskripsi}
                          </p>

                          <div className="mt-5">
                            {m.fileUrl ? (
                              <a
                                href={m.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex w-full items-center justify-center rounded-xl bg-[#004220] hover:bg-[#003318] text-white font-semibold py-2.5 transition"
                              >
                                Lihat Materi
                              </a>
                            ) : (
                              <div className="text-center text-gray-400 text-sm py-2">
                                File materi belum tersedia
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
