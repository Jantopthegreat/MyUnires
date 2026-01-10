"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import Sidebar_Resident from "@/components/Sidebar_Resident";
import { FiMenu } from "react-icons/fi";
import { apiGet } from "@/lib/api";

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
  // desktop collapse
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [nilaiList, setNilaiList] = useState<NilaiTahfidz[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNilaiTahfidz = async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>("/api/resident/tahfidz/nilai");

      if (res?.success) setNilaiList(res.data);
      else throw new Error(res?.message || "Gagal memuat data");
    } catch (error: any) {
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

  useEffect(() => {
    fetchNilaiTahfidz();
  }, []);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* HEADER */}
      <header className="h-16 bg-white border-b flex items-center sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* left: menu button (mobile) + logos */}
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
        </div>
      </header>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
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
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SIDEBAR */}
      <Sidebar_Resident
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN
          - mobile: normal (no margin-left)
          - desktop: padding-left sesuai lebar sidebar */}
      <main
        className={[
          "transition-all duration-300",
          isOpen ? "md:pl-64" : "md:pl-14",
        ].join(" ")}
      >
        {/* Page container */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          {/* Title bar */}
          <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm">
            Nilai Tahfidz
          </div>

          {/* Table card */}
          <section className="mt-6 bg-white rounded-2xl shadow-sm border overflow-hidden">
            {loading ? (
              <div className="py-16 text-center text-gray-500">
                Memuat data...
              </div>
            ) : nilaiList.length === 0 ? (
              <div className="py-16 text-center text-gray-500">
                Belum ada data nilai tahfidz
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b text-gray-700">
                    <tr>
                      <th className="py-3 px-4 text-left whitespace-nowrap">
                        No
                      </th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">
                        Target
                      </th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">
                        Surah
                      </th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">
                        Ayat
                      </th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">
                        Status
                      </th>
                      <th className="py-3 px-4 text-left whitespace-nowrap">
                        Nilai
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y">
                    {nilaiList.map((nilai, index) => (
                      <tr key={nilai.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 whitespace-nowrap">
                          {index + 1}
                        </td>
                        <td className="py-3 px-4">
                          {nilai.targetHafalan.nama}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {nilai.targetHafalan.surah}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          {nilai.targetHafalan.ayatMulai}-
                          {nilai.targetHafalan.ayatAkhir}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={[
                              "px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap",
                              nilai.status === "SELESAI"
                                ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                : nilai.status === "BELUM SELESAI"
                                ? "bg-amber-50 text-amber-800 ring-1 ring-amber-100"
                                : "bg-gray-50 text-gray-700 ring-1 ring-gray-100",
                            ].join(" ")}
                          >
                            {nilai.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold whitespace-nowrap">
                          {nilai.nilaiHuruf || "-"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
