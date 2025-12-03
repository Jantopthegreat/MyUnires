"use client";
import { useState, useEffect } from "react";
import Sidebar_Resident from "@/components/Sidebar_Resident";
import Swal from "sweetalert2";

interface NilaiTahfidz {
  id: number;
  targetHafalan: {
    id: number;
    nama: string;
    surah: string;
    ayatMulai: number;
    ayatAkhir: number;
  };
  status: string;
  nilaiHuruf: string | null;
  createdAt: string;
}

export default function NilaiTahfidzPage() {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [nilaiList, setNilaiList] = useState<NilaiTahfidz[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch nilai tahfidz dari backend
  useEffect(() => {
    const fetchNilaiTahfidz = async () => {
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
          setNilaiList(data.data);
        } else {
          throw new Error(data.message || "Gagal memuat data");
        }
      } catch (error: any) {
        console.error("Error fetching nilai tahfidz:", error);
        Swal.fire({
          icon: "error",
          title: "Error",
          text: error.message || "Gagal memuat data nilai tahfidz",
          confirmButtonColor: "#ef4444",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchNilaiTahfidz();
  }, []);

  return (
    <div className="min-h-screen flex bg-white">
      {/* ===== HEADER LOGO ===== */}
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

      {/* ===== SIDEBAR ===== */}
      <Sidebar_Resident isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "ml-64" : "ml-12"
        }`}
      >
        {/* Spacer supaya tidak ketabrak header */}
        <div className="h-16" />

        {/* Header hijau */}
        <header className="px-6 py-4 mb-5 ">
          <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">
            Nilai Tahfidz
          </h1>
        </header>

        {/* ===== Table ===== */}
        <section className="px-6 pb-6">
          <div className="bg-white rounded-lg shadow overflow-hidden border border-[#004220]">
            {loading ? (
              <div className="py-20 text-center text-gray-500">
                Memuat data...
              </div>
            ) : nilaiList.length === 0 ? (
              <div className="py-20 text-center text-gray-500">
                Belum ada data nilai tahfidz
              </div>
            ) : (
              <table className="w-full text-sm border-collapse">
                <thead className="text-[#004220] border-b border-[#004220]">
                  <tr>
                    <th className="py-3 text-left px-4">No</th>
                    <th className="py-3 text-left px-4">Target</th>
                    <th className="py-3 text-left px-4">Surah</th>
                    <th className="py-3 text-left px-4">Ayat</th>
                    <th className="py-3 text-left px-4">Status</th>
                    <th className="py-3 text-left px-4">Nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {nilaiList.map((nilai, index) => (
                    <tr
                      key={nilai.id}
                      className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
                    >
                      <td className="py-3 px-4">{index + 1}</td>
                      <td className="py-3 px-4">{nilai.targetHafalan.nama}</td>
                      <td className="py-3 px-4">{nilai.targetHafalan.surah}</td>
                      <td className="py-3 px-4">
                        {nilai.targetHafalan.ayatMulai}-
                        {nilai.targetHafalan.ayatAkhir}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${
                            nilai.status === "SELESAI"
                              ? "bg-green-100 text-green-700"
                              : nilai.status === "BELUM SELESAI"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {nilai.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold">
                        {nilai.nilaiHuruf || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
