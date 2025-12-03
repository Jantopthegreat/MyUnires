"use client";
import { useState, useEffect } from "react";
import { FaBook, FaArrowLeft } from "react-icons/fa";
import Sidebar_Resident from "@/components/Sidebar_Resident";

interface KategoriMateri {
  id: number;
  nama: string;
}

interface Materi {
  id: number;
  judul: string;
  deskripsi: string;
  fileUrl: string | null;
  kategoriId: number;
  kategori: KategoriMateri;
}

export default function MateriPembelajaranPage() {
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [kategoriList, setKategoriList] = useState<KategoriMateri[]>([]);
  const [materiList, setMateriList] = useState<Materi[]>([]);
  const [selectedKategori, setSelectedKategori] =
    useState<KategoriMateri | null>(null);
  const [filteredMateri, setFilteredMateri] = useState<Materi[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch kategori list
  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3001/api/resident/kategori",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Kategori response:", result);

        // Handle jika response adalah array atau object dengan property kategori atau data
        const data = result.data || result.kategori || result;
        setKategoriList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching kategori:", error);
        setKategoriList([]);
      }
    };

    const fetchMateri = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3001/api/resident/materi",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        console.log("Materi response:", result);

        // Handle jika response adalah array atau object dengan property materi atau data
        const data = result.data || result.materi || result;
        setMateriList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching materi:", error);
        setMateriList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKategori();
    fetchMateri();
  }, []);

  // Filter materi by selected kategori
  useEffect(() => {
    if (selectedKategori) {
      const filtered = materiList.filter(
        (m) => m.kategoriId === selectedKategori.id
      );
      setFilteredMateri(filtered);
    }
  }, [selectedKategori, materiList]);

  const handleKategoriClick = (kategori: KategoriMateri) => {
    setSelectedKategori(kategori);
  };

  const handleBackToKategori = () => {
    setSelectedKategori(null);
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
        <header className="px-6 py-4 mb-5">
          <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">
            Materi Pembelajaran
          </h1>
        </header>

        {/* ===== Content ===== */}
        <section className="px-6 pb-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-500">Memuat data...</div>
            </div>
          ) : !selectedKategori ? (
            /* ===== Kategori List ===== */
            <div className="px-6 py-4 mb-5 space-y-4">
              {kategoriList.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-2">
                    Tidak ada kategori materi tersedia
                  </p>
                  <p className="text-sm text-gray-400">
                    Silakan cek koneksi atau hubungi administrator
                  </p>
                </div>
              ) : (
                kategoriList.map((kategori) => (
                  <button
                    key={kategori.id}
                    onClick={() => handleKategoriClick(kategori)}
                    className="w-full bg-white text-[#004220] text-center py-3 rounded-md text-lg font-semibold border border-[#004220] hover:bg-[#004220] hover:text-white transition-all duration-200"
                  >
                    {kategori.nama}
                  </button>
                ))
              )}
            </div>
          ) : (
            /* ===== Materi List ===== */
            <div className="px-6 py-4">
              {/* Back Button */}
              <button
                onClick={handleBackToKategori}
                className="mb-5 flex items-center gap-2 text-[#004220] hover:text-[#003318] font-medium transition"
              >
                <FaArrowLeft />
                Kembali ke Kategori
              </button>

              {/* Kategori Title */}
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-[#004220] mb-2">
                  {selectedKategori.nama}
                </h2>
                <p className="text-gray-600">
                  {filteredMateri.length} materi tersedia
                </p>
              </div>

              {/* Materi Cards */}
              {filteredMateri.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Belum ada materi untuk kategori ini
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredMateri.map((materi) => (
                    <div
                      key={materi.id}
                      className="bg-white border border-gray-300 rounded-lg p-5 hover:shadow-lg transition-all duration-200"
                    >
                      {/* Materi Icon & Title */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-[#004220] p-3 rounded-md">
                          <FaBook className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#004220] mb-1">
                            {materi.judul}
                          </h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {selectedKategori.nama}
                          </span>
                        </div>
                      </div>

                      {/* Materi Description */}
                      <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                        {materi.deskripsi}
                      </p>

                      {/* Download Button (if fileUrl exists) */}
                      {materi.fileUrl && (
                        <a
                          href={materi.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-block w-full text-center bg-[#004220] hover:bg-[#003318] text-white font-medium py-2 px-4 rounded-md transition"
                        >
                          Lihat Materi
                        </a>
                      )}

                      {!materi.fileUrl && (
                        <div className="text-center text-gray-400 text-sm py-2">
                          File materi belum tersedia
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
