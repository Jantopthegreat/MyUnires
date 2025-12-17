"use client";

import { useState, useEffect, useRef } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import Swal from "sweetalert2";
import { apiGet, clearAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

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
  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data states
  const [residents, setResidents] = useState<ResidentData[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<ResidentData[]>([]);
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
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.nim.toLowerCase().includes(search.toLowerCase()) ||
          item.email.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (usroh !== "all") {
      result = result.filter((item) => item.usroh === usrohList.find((u) => u.id === Number(usroh))?.nama);
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

      setResidents(Array.isArray(residentsData) ? residentsData : []);
      setFilteredResidents(Array.isArray(residentsData) ? residentsData : []);
      setUsrohList(Array.isArray(usrohData) ? usrohData : []);
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
    <div className="min-h-screen flex bg-white">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-6 border-b">
        <div className="flex items-center gap-3">
          <img src="/lg_umy.svg" alt="UMY" className="h-10 object-contain" />
          <img src="/lg_unires.svg" alt="UNIRES" className="h-10 object-contain" />
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
            <h2 className="text-2xl font-semibold text-[#004220] mb-4">Log Out</h2>
            <p className="text-gray-700 text-sm mb-1">Tindakan ini akan mengakhiri sesi login Anda.</p>
            <p className="text-gray-700 text-sm mb-6">Apakah Anda ingin melanjutkan?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-6 py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-md transition"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  clearAuth();
                  window.location.href = "/login";
                }}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md transition"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* ===== MAIN CONTENT ===== */}
      <main className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${isOpen ? "ml-64" : "ml-12"}`}>
        <div className="h-16" />

        <header className="px-6 py-4">
          <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">Daftar Resident Per Usroh</h1>
        </header>

        {/* ===== FILTER BAR ===== */}
        <section className="flex flex-wrap items-center justify-between px-6 mb-5 gap-3">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                placeholder="Cari Resident"
                value={searchTerm}
                onChange={(e) => handleFilter(e.target.value, selectedUsroh)}
                className="pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
              />
            </div>

            {/* Usroh Filter */}
            <select
              value={selectedUsroh}
              onChange={(e) => handleFilter(searchTerm, e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
            >
              <option value="all">Usroh (All)</option>
              {usrohList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nama}
                </option>
              ))}
            </select>

            {/* Import Button */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m0 0l-3-3m3 3l3-3M5 21h14" />
              </svg>
              Impor Data
            </button>
          </div>
        </section>

        {/* ===== TABLE ===== */}
        <section className="px-6 pb-6">
          <div className="bg-white rounded-lg shadow border border-[#004220] overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Memuat data...</div>
            ) : filteredResidents.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Tidak ada resident</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="text-[#004220] border-b border-[#004220] bg-white sticky top-0 z-10">
                      <tr>
                        <th className="py-3 text-left px-4 bg-white">No</th>
                        <th className="py-3 text-left px-4 bg-white">Nama</th>
                        <th className="py-3 text-left px-4 bg-white">NIM</th>
                        <th className="py-3 text-left px-4 bg-white">Email</th>
                        <th className="py-3 text-left px-4 bg-white">Usroh</th>
                        <th className="py-3 text-center px-4 bg-white">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredResidents.map((resident, i) => (
                        <tr
                          key={resident.id}
                          className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
                        >
                          <td className="py-3 px-4">{i + 1}</td>
                          <td className="py-3 px-4">{resident.name}</td>
                          <td className="py-3 px-4">{resident.nim}</td>
                          <td className="py-3 px-4">{resident.email}</td>
                          <td className="py-3 px-4">{resident.usroh || "-"}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleViewDetail(resident)}
                              className="flex items-center gap-2 bg-[#004220] text-white px-4 py-2 rounded-lg hover:bg-[#005a2c] transition text-xs font-semibold justify-center"
                            >
                              Lihat Detail
                            </button>
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
            Menampilkan {filteredResidents.length} dari {residents.length} resident
          </div>
        </section>
      </main>
    </div>
  );
}
