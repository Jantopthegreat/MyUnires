"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaChevronRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import Swal from "sweetalert2";
import { clearAuth, getToken, apiGet } from "@/lib/api";

interface ResidentWithUsroh {
  id: number;
  name: string;
  nim: string;
  usrohId: number | null;
  usroh: string | null;
}

interface Usroh {
  id: number;
  nama: string;
}

export default function RevisiPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // Data states
  const [residents, setResidents] = useState<ResidentWithUsroh[]>([]);
  const [filteredData, setFilteredData] = useState<ResidentWithUsroh[]>([]);
  const [usrohList, setUsrohList] = useState<Usroh[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsroh, setSelectedUsroh] = useState<string>("all");

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Apply filters whenever residents, searchTerm, or selectedUsroh changes
  useEffect(() => {
    let result = [...residents];

    // Filter by search
    if (searchTerm) {
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.nim.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by usroh
    if (selectedUsroh !== "all") {
      // Debug log
      if (result.length > 0) {
        // console.log("DEBUG: Filter usrohId", {
        //   selectedUsroh,
        //   data: result.map((r) => ({ id: r.id, usrohId: r.usrohId })),
        // });
      }
      result = result.filter((item) => item.usrohId === Number(selectedUsroh));
    }

    setFilteredData(result);
  }, [searchTerm, selectedUsroh, residents, usrohList]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      // optional: kalau tetap mau validasi token manual
      const token = getToken();
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Token tidak ditemukan. Silakan login kembali.",
        });
        return;
      }

      const [residentsData, usrohData] = await Promise.all([
        apiGet<any>("/api/musyrif/residents"),
        apiGet<any>("/api/musyrif/usroh"),
      ]);

      setResidents(residentsData.data || []);
      setUsrohList(usrohData.data || []);
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error?.message || "Gagal memuat data dari server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewResident = (resident: ResidentWithUsroh) => {
    // Navigate to detail page with resident ID
    router.push(`/pembina/dashboard/revisi/${resident.id}`);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ===== HEADER ===== */}
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
                  clearAuth();
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
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* ===== MAIN ===== */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-12"
        }`}
      >
        <div className="h-16" />
        <header className="px-6 py-4">
          <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">
            Revisi Nilai Tahfidz
          </h1>
        </header>

        {/* ===== FILTER BAR ===== */}
        <section className="flex flex-wrap items-center justify-between px-6 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 shadow-sm bg-white">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Cari Resident"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="outline-none text-sm w-40 bg-transparent"
              />
            </div>

            {/* Usroh Filter */}
            <select
              value={selectedUsroh}
              onChange={(e) => setSelectedUsroh(e.target.value)}
              className="border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-400 shadow-sm bg-white outline-none focus:ring-2 focus:ring-[#004220]"
            >
              <option value="all">Usroh (All)</option>
              {usrohList.map((usroh) => (
                <option key={usroh.id} value={String(usroh.id)}>
                  {usroh.nama}
                </option>
              ))}
            </select>
          </div>
        </section>

        {/* ===== TABLE ===== */}
        <section className="px-6 pb-6">
          <div className="bg-white rounded-lg shadow border border-[#004220] overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Memuat data...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Tidak ada data resident
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="text-[#004220] border-b border-[#004220] bg-white sticky top-0 z-10">
                      <tr>
                        <th className="py-3 text-left px-4 bg-white">No</th>
                        <th className="py-3 text-left px-4 bg-white">Nama</th>
                        <th className="py-3 text-left px-4 bg-white">
                          No. Unires
                        </th>
                        <th className="py-3 text-left px-4 bg-white">Usroh</th>
                        <th className="py-3 text-center px-4 bg-white">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((resident, i) => (
                        <tr
                          key={resident.id}
                          className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
                        >
                          <td className="py-3 px-4">{i + 1}</td>
                          <td className="py-3 px-4">{resident.name}</td>
                          <td className="py-3 px-4">{resident.nim}</td>
                          <td className="py-3 px-4">{resident.usroh || "-"}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => handleViewResident(resident)}
                                className="flex items-center gap-2 bg-[#004220] text-white px-4 py-2 rounded-lg hover:bg-[#005a2c] transition text-xs font-semibold"
                              >
                                Lihat Detail
                                <FaChevronRight className="h-3 w-3" />
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
          {/* Info jumlah data */}
          <div className="mt-3 text-sm text-gray-600">
            Menampilkan {filteredData.length} dari {residents.length} resident
          </div>
        </section>
      </main>
    </div>
  );
}
