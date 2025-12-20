"use client";

import { useState, useEffect, useRef } from "react";
import { FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import { apiGet, clearAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

import Sidebar_AsistenMusyrif from "@/components/sidebar_asistenMusyrif";

interface ResidentData {
  id: number;
  name: string;
  nim: string;
  email: string;
  usroh?: string;
  noTelp?: string;
  jurusan?: string;
  angkatan?: string;
}

interface Usroh {
  id: number;
  nama: string;
}

export default function ResidentPerUsrohPage() {
  const router = useRouter();

  // sidebar states (desktop + mobile)
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data states
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<ResidentData[]>(
    []
  );
  const [usrohList, setUsrohList] = useState<Usroh[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsroh, setSelectedUsroh] = useState<string>("all");

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleFilter = (search: string, usroh: string) => {
    let result = [...residents];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(s) ||
          item.nim.toLowerCase().includes(s) ||
          item.email.toLowerCase().includes(s)
      );
    }

    if (usroh !== "all") {
      const uName = usrohList.find((u) => u.id === Number(usroh))?.nama;
      result = result.filter((item) => item.usroh === uName);
    }

    setFilteredResidents(result);
    setSearchTerm(search);
    setSelectedUsroh(usroh);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const residentsRes = await apiGet<any>("/api/asisten/residents");
      const residentsData = residentsRes.data ?? [];

      const usrohRes = await apiGet<any>("/api/asisten/usroh");
      const usrohData = usrohRes.data ?? [];

      const arrResidents = Array.isArray(residentsData) ? residentsData : [];
      const arrUsroh = Array.isArray(usrohData) ? usrohData : [];

      setResidents(arrResidents);
      setFilteredResidents(arrResidents);
      setUsrohList(arrUsroh);
    } catch (error) {
      console.error("Error fetching data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data dari server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (resident: ResidentData) => {
    Swal.fire({
      title: "Detail Resident",
      html: `
        <div class="text-left space-y-2">
          <p><strong>Nama:</strong> ${resident.name}</p>
          <p><strong>NIM:</strong> ${resident.nim}</p>
          <p><strong>Email:</strong> ${resident.email}</p>
          <p><strong>Usroh:</strong> ${resident.usroh || "-"}</p>
          <p><strong>Jurusan:</strong> ${resident.jurusan || "-"}</p>
          <p><strong>Angkatan:</strong> ${resident.angkatan || "-"}</p>
          <p><strong>No. Telp:</strong> ${resident.noTelp || "-"}</p>
        </div>
      `,
      confirmButtonColor: "#004220",
      width: "500px",
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* ===== TOP HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-4 sm:px-6 border-b">
        <div className="flex items-center gap-3">
          {/* tombol menu mobile */}
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
      </header>

      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
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
                  clearAuth();
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

      {/* ===== SIDEBAR (Asisten) ===== */}
      <Sidebar_AsistenMusyrif
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={[
          "pt-16 transition-all duration-300",
          // desktop: kasih margin sesuai sidebar
          isOpen ? "md:ml-64" : "md:ml-14",
          // mobile: jangan ada margin
          "ml-0",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
          <header className="mb-4">
            <h1 className="bg-[#004220] text-white text-center py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-semibold shadow-sm">
              Daftar Resident Per Usroh
            </h1>
          </header>

          {/* ===== FILTER BAR ===== */}
          <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              {/* Search Input */}
              <div className="relative w-full sm:w-[280px]">
                <FaSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Cari Resident (nama/NIM/email)"
                  value={searchTerm}
                  onChange={(e) => handleFilter(e.target.value, selectedUsroh)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                />
              </div>

              {/* Usroh Filter */}
              <select
                value={selectedUsroh}
                onChange={(e) => handleFilter(searchTerm, e.target.value)}
                className="w-full sm:w-[220px] px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
              >
                <option value="all">Usroh (All)</option>
                {usrohList.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nama}
                  </option>
                ))}
              </select>
            </div>
          </section>

          {/* ===== TABLE ===== */}
          <section className="pb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {loading ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  Memuat data...
                </div>
              ) : filteredResidents.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  Tidak ada resident
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="max-h-[65vh] overflow-y-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="text-[#004220] border-b border-gray-200 bg-white sticky top-0 z-10">
                        <tr>
                          <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                            No
                          </th>
                          <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                            Nama
                          </th>
                          <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                            NIM
                          </th>
                          <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                            Email
                          </th>
                          <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                            Usroh
                          </th>
                          <th className="py-3 text-center px-4 bg-white whitespace-nowrap">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredResidents.map((resident, i) => (
                          <tr
                            key={resident.id}
                            className="text-[#004220] border-b border-gray-100 hover:bg-[#F7F9F8] transition"
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              {i + 1}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {resident.name}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {resident.nim}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {resident.email}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {resident.usroh || "-"}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <button
                                  onClick={() => handleViewDetail(resident)}
                                  className="bg-[#004220] text-white px-4 py-2 rounded-lg hover:bg-[#005a2c] transition text-xs font-semibold"
                                >
                                  Lihat Detail
                                </button>

                                <button
                                  onClick={() =>
                                    router.push(
                                      `/dashboard/asisten-musyrif/input-nilai-tahfidz?residentId=${resident.id}`
                                    )
                                  }
                                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition text-xs font-semibold"
                                >
                                  Input Nilai
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-3 text-sm text-gray-600">
              Menampilkan {filteredResidents.length} dari {residents.length}{" "}
              resident
            </div>
          </section>

          <div className="text-xs text-gray-500">
            © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
          </div>
        </div>
      </main>
    </div>
  );
}
