"use client";
import { useState, useEffect } from "react";
import Sidebar_Resident from "@/components/Sidebar_Resident";
import Swal from "sweetalert2";

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
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [progressData, setProgressData] = useState<ProgressBulan[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data nilai tahfidz dan hitung progress per bulan
  useEffect(() => {
    const fetchProgressData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3001/api/resident/tahfidz/nilai",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          const nilaiList: NilaiTahfidz[] = data.data;

          // Dapatkan bulan saat ini
          const currentMonth = new Date().getMonth(); // 0-11
          const currentYear = new Date().getFullYear();

          // Hitung progress per bulan berdasarkan createdAt
          const progressPerBulan = BULAN_NAMES.map((namaBulan, index) => {
            const bulanIndex = index; // 0 = Januari, 11 = Desember

            // Filter nilai yang dibuat di bulan ini (dari tahun berjalan)
            const nilaiDiBulanIni = nilaiList.filter((nilai) => {
              const createdDate = new Date(nilai.createdAt);
              return (
                createdDate.getMonth() === bulanIndex &&
                createdDate.getFullYear() === currentYear
              );
            });

            const totalTarget = nilaiDiBulanIni.length;
            const selesai = nilaiDiBulanIni.filter(
              (n) => n.status === "SELESAI"
            ).length;

            const persen =
              totalTarget > 0 ? Math.round((selesai / totalTarget) * 100) : 0;

            return {
              bulan: namaBulan,
              persen,
              selesai,
              total: totalTarget,
            };
          });

          // Urutkan: bulan saat ini di atas, lalu bulan setelahnya sampai Desember, kemudian Januari sampai sebelum bulan saat ini
          // Contoh: jika sekarang November (index 10), urutannya: Nov, Des, Jan, Feb, ..., Okt
          const reorderedData: ProgressBulan[] = [];

          // Mulai dari bulan saat ini
          reorderedData.push(progressPerBulan[currentMonth]);

          // Lanjut dari bulan setelah bulan saat ini sampai Desember
          for (let i = currentMonth + 1; i <= 11; i++) {
            reorderedData.push(progressPerBulan[i]);
          }

          // Lanjut dari Januari sampai sebelum bulan saat ini
          for (let i = 0; i < currentMonth; i++) {
            reorderedData.push(progressPerBulan[i]);
          }

          setProgressData(reorderedData);
        } else {
          throw new Error(data.message || "Gagal memuat data");
        }
      } catch (error: any) {
        console.error("Error fetching progress:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Gagal memuat data progres hafalan",
          confirmButtonColor: "#ef4444",
        });

        // Set default data kosong
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

  const getBarStyle = (percent: number) => {
    if (percent === 100) {
      return { width: "100%", backgroundColor: "#B7CFC1" }; // hijau
    } else if (percent > 0 && percent < 100) {
      return { width: `${percent}%`, backgroundColor: "#F9E49A" }; // kuning
    } else {
      return { width: "100%", backgroundColor: "#F9B1B1" }; // merah untuk 0%
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* HEADER */}
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-6 border-b">
        <div className="flex items-center gap-3">
          <img src="/lg_umy.svg" alt="UMY" className="h-10 object-contain" />
          <img
            src="/lg_unires.svg"
            alt="UNIRES"
            className="h-10 object-contain"
          />
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          Logout
        </button>
      </header>

      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
          <div className="bg-[#d1d4d0] rounded-3xl shadow-lg p-8 w-[400px] text-center">
            <h2 className="text-2xl font-semibold text-[#004220] mb-4">
              Log Out
            </h2>
            <p className="text-gray-700 text-sm mb-1">
              Tindakan ini akan mengakhiri sesi login Anda.
            </p>
            <p className="text-gray-700 text-sm mb-6">
              Apakah Anda ingin melanjutkan?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-[#FFC107] hover:bg-[#ffb300] text-white font-semibold px-6 py-2 rounded-full shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="bg-[#E50914] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full shadow-md"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <Sidebar_Resident isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* MAIN */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "ml-64" : "ml-12"
        }`}
      >
        <div className="h-16" />

        <header className="px-6 py-4 mb-5">
          <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">
            Progres Hafalan
          </h1>
        </header>

        <section className="px-6 pb-10">
          {loading ? (
            <div className="text-center py-20 text-gray-500">
              Memuat data progres...
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-x-20 gap-y-2">
              {progressData.map((item, i) => (
                <div key={i}>
                  <p className="text-[#004220] text-sm font-medium mb-1">
                    Target Bulan {item.bulan}
                  </p>

                  <div className="w-full h-4 rounded-full bg-gray-200 border border-gray-300 overflow-hidden">
                    <div
                      className="h-full transition-all duration-700"
                      style={getBarStyle(item.persen)}
                    ></div>
                  </div>

                  <p className="text-xs text-gray-600 mt-0.5 text-right">
                    {item.persen}% ({item.selesai}/{item.total})
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
