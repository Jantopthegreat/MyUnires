"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ResidentFilterBar from "@/components/ResidentFilterBar";
import ResidentTable from "@/components/ResidentTable";
import { useResidentDataMusyrif } from "@/lib/hooks/useResidentDataMusyrif";
import { showResidentDetail } from "@/lib/residentModal";
import { handleExcelImport } from "@/lib/excelImport";
import { clearAuth } from "@/lib/api";

export default function ResidentPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const {
    residents,
    filteredResidents,
    usrohList,
    lantaiList,
    loading,
    searchTerm,
    setSearchTerm,
    selectedUsroh,
    setSelectedUsroh,
    selectedLantai,
    setSelectedLantai,
    refetchResidents,
  } = useResidentDataMusyrif();

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const handleImport = async (file: File) => {
    await handleExcelImport(file, refetchResidents);
  };
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

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "ml-64" : "ml-12"
        }`}
      >
        {/* Spacer supaya tidak ketabrak header */}
        <div className="h-16" />

        {/* Header hijau */}
        <header className="px-6 py-4">
          <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">
            Daftar Nama Resident
          </h1>
        </header>

        {/* ===== Filter Bar ===== */}
        <ResidentFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedUsroh={selectedUsroh}
          onUsrohChange={setSelectedUsroh}
          selectedLantai={selectedLantai}
          onLantaiChange={setSelectedLantai}
          usrohList={usrohList}
          lantaiList={lantaiList}
          onImport={handleImport}
        />

        {/* ===== Table ===== */}
        <section className="px-6 pb-6">
          <div className="bg-white rounded-lg shadow border border-[#004220] overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Memuat data...
              </div>
            ) : filteredResidents.length === 0 ? (
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
                        <th className="py-3 text-left px-4 bg-white">No. Unires</th>
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
                          <td className="py-3 px-4">{resident.usroh || "-"}</td>
                          <td className="py-3 px-4">
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => showResidentDetail(resident)}
                                className="flex items-center gap-2 bg-[#004220] text-white px-4 py-2 rounded-lg hover:bg-[#005a2c] transition text-xs font-semibold"
                              >
                                Lihat Detail
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
            Menampilkan {filteredResidents.length} dari {residents.length} resident
          </div>
        </section>
      </main>
    </div>
  );
}
