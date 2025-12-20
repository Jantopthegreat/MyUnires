"use client";

import { useState, useEffect } from "react";
import Sidebar_Resident from "@/components/Sidebar_Resident";
import Swal from "sweetalert2";
import { FiMenu } from "react-icons/fi";

interface NilaiTahfidz {
  id: number;
  status: string;
  nilaiHuruf: string | null;
  createdAt: string;
  targetHafalan: {
    id: number;
    nama: string;
    surah: string;
  };
}

interface ProgressBulan {
  bulan: string;
  persen: number;
  selesai: number;
  total: number;
}

const BULAN_NAMES = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
];

export default function ProgresHafalanPage() {
  // desktop collapse
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  const [progressData, setProgressData] = useState<ProgressBulan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3001/api/resident/tahfidz/nilai",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();
        if (!data.success) throw new Error(data.message || "Gagal memuat data");

        const nilaiList: NilaiTahfidz[] = data.data;

        const currentMonth = new Date().getMonth(); // 0-11
        const currentYear = new Date().getFullYear();

        const progressPerBulan = BULAN_NAMES.map((namaBulan, index) => {
          const nilaiDiBulanIni = nilaiList.filter((nilai) => {
            const createdDate = new Date(nilai.createdAt);
            return (
              createdDate.getMonth() === index &&
              createdDate.getFullYear() === currentYear
            );
          });

          const total = nilaiDiBulanIni.length;
          const selesai = nilaiDiBulanIni.filter(
            (n) => n.status === "SELESAI"
          ).length;
          const persen = total > 0 ? Math.round((selesai / total) * 100) : 0;

          return { bulan: namaBulan, persen, selesai, total };
        });

        // reorder: current month first
        const reordered: ProgressBulan[] = [];
        reordered.push(progressPerBulan[currentMonth]);
        for (let i = currentMonth + 1; i <= 11; i++)
          reordered.push(progressPerBulan[i]);
        for (let i = 0; i < currentMonth; i++)
          reordered.push(progressPerBulan[i]);

        setProgressData(reordered);
      } catch (error: any) {
        console.error("Error fetching progress:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Gagal memuat data progres hafalan",
          confirmButtonColor: "#ef4444",
        });

        setProgressData(
          BULAN_NAMES.map((bulan) => ({
            bulan,
            persen: 0,
            selesai: 0,
            total: 0,
          }))
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProgressData();
  }, []);

  const barClass = (p: number) => {
    if (p === 100) return "bg-emerald-500";
    if (p > 0) return "bg-amber-400";
    return "bg-red-400";
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* HEADER (tanpa logout, karena logout ada di sidebar bawah) */}
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
              Progres Hafalan
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

      {/* MAIN (mobile normal, desktop ada padding-left mengikuti sidebar) */}
      <main
        className={[
          "transition-all duration-300",
          isOpen ? "md:pl-64" : "md:pl-14",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          {/* Title bar */}
          <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm">
            Progres Hafalan
          </div>

          {/* Content */}
          <section className="mt-6">
            {loading ? (
              <div className="bg-white rounded-2xl border shadow-sm py-16 text-center text-gray-500">
                Memuat data progres...
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {progressData.map((item, i) => (
                  <div
                    key={i}
                    className="bg-white rounded-2xl border shadow-sm p-5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Target Bulan</p>
                        <p className="text-[#004220] text-base font-semibold">
                          {item.bulan}
                        </p>
                      </div>

                      <span
                        className={[
                          "px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                          item.persen === 100
                            ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                            : item.persen > 0
                            ? "bg-amber-50 text-amber-800 ring-1 ring-amber-100"
                            : "bg-red-50 text-red-700 ring-1 ring-red-100",
                        ].join(" ")}
                      >
                        {item.persen}%
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="h-3 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={[
                            "h-3 rounded-full transition-all duration-700",
                            barClass(item.persen),
                          ].join(" ")}
                          style={{ width: `${item.persen}%` }}
                        />
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>Selesai</span>
                        <span className="tabular-nums">
                          {item.selesai}/{item.total}
                        </span>
                      </div>

                      <p className="mt-3 text-[11px] text-gray-400 leading-relaxed">
                        Persentase dihitung dari total target pada bulan
                        tersebut di tahun berjalan.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
