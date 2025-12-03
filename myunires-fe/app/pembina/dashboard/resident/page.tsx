"use client";
import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ResidentFilterBar from "@/components/ResidentFilterBar";
import ResidentTable from "@/components/ResidentTable";
import { useResidentData } from "@/lib/hooks/useResidentData";
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
  } = useResidentData();

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
          <ResidentTable
            residents={filteredResidents}
            loading={loading}
            onViewDetail={showResidentDetail}
          />

          {/* Info jumlah data */}
          <div className="mt-3 text-sm text-gray-600">
            Menampilkan {filteredResidents.length} dari {residents.length}{" "}
            resident
          </div>
        </section>
      </main>
    </div>
  );
}
