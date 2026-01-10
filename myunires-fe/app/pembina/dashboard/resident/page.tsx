"use client";

import { useState } from "react";
import Sidebar from "@/components/sidebar_musyrif";
import ResidentFilterBar from "@/components/ResidentFilterBar";
import { useResidentDataMusyrif } from "@/lib/hooks/useResidentDataMusyrif";
import { showResidentDetail } from "@/lib/residentModal";

export default function ResidentPage() {
  const [isOpen, setIsOpen] = useState(true); // desktop collapse
  const [mobileOpen, setMobileOpen] = useState(false); // mobile drawer

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
    //refetchResidents,
  } = useResidentDataMusyrif();

  const toggleSidebar = () => setIsOpen((prev) => !prev);

  return (
    <div className="min-h-screen bg-white">
      {/* ===== HEADER LOGO (tanpa logout) ===== */}
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-4 sm:px-6 border-b">
        <div className="flex items-center gap-3">
          {/* tombol buka sidebar khusus mobile */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Open menu"
          >
            {/* icon hamburger sederhana */}
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
            className="h-9 sm:h-10 object-contain"
          />
          <img
            src="/lg_unires.svg"
            alt="UNIRES"
            className="h-9 sm:h-10 object-contain"
          />
        </div>

        {/* kanan kosong, karena logout pindah ke sidebar */}
        <div className="w-10" />
      </header>

      {/* ===== SIDEBAR (desktop + mobile drawer) ===== */}
      <Sidebar
        isOpen={isOpen}
        toggleSidebar={() => setIsOpen((p) => !p)}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={[
          "pt-16 transition-all duration-300 ease-in-out",
          // desktop: kasih margin sesuai sidebar; mobile: no margin
          isOpen ? "md:ml-64" : "md:ml-12",
        ].join(" ")}
      >
        <header className="px-4 sm:px-6 py-4">
          <h1 className="bg-[#004220] text-white text-center py-4 sm:py-6 rounded-md text-base sm:text-lg font-semibold">
            Daftar Nama Resident
          </h1>
        </header>

        {/* Filter Bar */}
        <ResidentFilterBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          selectedUsroh={selectedUsroh}
          onUsrohChange={setSelectedUsroh}
          selectedLantai={selectedLantai}
          onLantaiChange={setSelectedLantai}
          usrohList={usrohList}
          lantaiList={lantaiList}
        />

        {/* Table */}
        <section className="px-4 sm:px-6 pb-6">
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
                <div className="max-h-[60vh] md:max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="text-[#004220] border-b border-[#004220] bg-white sticky top-0 z-10">
                      <tr>
                        <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                          No
                        </th>
                        <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                          Nama
                        </th>
                        <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                          No. Unires
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
                          className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
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
                            {resident.usroh || "-"}
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex justify-center">
                              <button
                                onClick={() => showResidentDetail(resident)}
                                className="bg-[#004220] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#005a2c] transition text-xs font-semibold whitespace-nowrap"
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

          <div className="mt-3 text-sm text-gray-600">
            Menampilkan {filteredResidents.length} dari {residents.length}{" "}
            resident
          </div>
        </section>
      </main>
    </div>
  );
}
