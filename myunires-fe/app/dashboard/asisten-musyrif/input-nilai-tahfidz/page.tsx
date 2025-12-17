"use client";

import { useState, useEffect, useRef } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import Swal from "sweetalert2";
import { apiGet, apiPost, clearAuth } from "@/lib/api";
import { useRouter } from "next/navigation";

interface NilaiTahfidzData {
  id: number;
  resident: string;
  nim: string;
  email: string;
  usroh?: string;
  usrohId?: number;
  target?: string;
  surah?: string;
  status?: string;
  nilaiHuruf?: string;
  tanggal?: string;
}

interface Resident {
  id: number;
  nama: string;
  nim: string;
  email: string;
  usroh?: string;
}

interface Usroh {
  id: number;
  nama: string;
}

interface TargetHafalan {
  id: number;
  nama: string;
  surah: string;
  ayatMulai: number;
  ayatAkhir: number;
}

export default function InputNilaiTahfidzPage() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Data states
  const [nilaiList, setNilaiList] = useState<NilaiTahfidzData[]>([]);
  const [filteredData, setFilteredData] = useState<NilaiTahfidzData[]>([]);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [usrohList, setUsrohList] = useState<Usroh[]>([]);
  const [targetHafalan, setTargetHafalan] = useState<TargetHafalan[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsroh, setSelectedUsroh] = useState<string>("all");

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedNilai, setSelectedNilai] = useState<NilaiTahfidzData | null>(null);

  // Form states untuk modal [web:22][web:24]
  const [formResidentId, setFormResidentId] = useState<number | null>(null);
  const [formTargetId, setFormTargetId] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<string>("");
  const [formNilaiHuruf, setFormNilaiHuruf] = useState<string>("");

  useEffect(() => {
    fetchAllData();
  }, []);

  // Reset form saat modal dibuka
  useEffect(() => {
    if (showModal) {
      if (modalMode === "add") {
        setFormResidentId(null);
        setFormTargetId(null);
        setFormStatus("");
        setFormNilaiHuruf("");
      }
    }
  }, [showModal, modalMode]);

  const handleFilter = (search: string, usroh: string) => {
    let result = [...nilaiList];
    if (search) {
      result = result.filter(
        (item) =>
          item.resident.toLowerCase().includes(search.toLowerCase()) ||
          item.nim.toLowerCase().includes(search.toLowerCase())
      );
    }
    if (usroh !== "all") {
      result = result.filter((item) => item.usrohId === Number(usroh));
    }
    setFilteredData(result);
    setSearchTerm(search);
    setSelectedUsroh(usroh);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const nilaiRes = await apiGet<any>("/api/asisten/tahfidz/detail");
      const nilaiData = nilaiRes.data ?? [];

      const residentsRes = await apiGet<any>("/api/asisten/residents");
      const residentsData = residentsRes.data ?? [];

      const usrohRes = await apiGet<any>("/api/asisten/usroh");
      const usrohData = usrohRes.data ?? [];

      const targetRes = await apiGet<any>("/api/asisten/target-hafalan");
      const targetData = targetRes.data ?? [];

      setNilaiList(Array.isArray(nilaiData) ? nilaiData : []);
      setFilteredData(Array.isArray(nilaiData) ? nilaiData : []);
      setResidents(Array.isArray(residentsData) ? residentsData : []);
      setUsrohList(Array.isArray(usrohData) ? usrohData : []);
      setTargetHafalan(Array.isArray(targetData) ? targetData : []);
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

  const handleViewDetail = (nilai: NilaiTahfidzData) => {
    const tanggal = new Date(nilai.tanggal || "").toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    Swal.fire({
      title: "Detail Nilai Tahfidz",
      html: `
        <div class="text-left space-y-2">
          <div class="mb-4 pb-4 border-b">
            <h3 class="font-bold text-lg mb-2">Data Resident</h3>
            <p><strong>Nama:</strong> ${nilai.resident}</p>
            <p><strong>NIM:</strong> ${nilai.nim}</p>
            <p><strong>Email:</strong> ${nilai.email}</p>
            <p><strong>Usroh:</strong> ${nilai.usroh || "-"}</p>
          </div>
          
          <div>
            <h3 class="font-bold text-lg mb-2">Nilai Tahfidz</h3>
            <p><strong>Target Hafalan:</strong> ${nilai.target || "-"}</p>
            <p><strong>Surah:</strong> ${nilai.surah || "-"}</p>
            <p><strong>Status:</strong> 
              <span class="px-2 py-1 rounded text-xs font-semibold ml-2 ${
                nilai.status === "SELESAI"
                  ? "bg-green-100 text-green-700"
                  : nilai.status === "BELUM SELESAI"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }">
                ${nilai.status || "-"}
              </span>
            </p>
            <p><strong>Nilai Huruf:</strong> 
              <span class="px-2 py-1 rounded text-xs font-semibold ml-2 ${
                nilai.nilaiHuruf === "A" || nilai.nilaiHuruf === "A-"
                  ? "bg-green-100 text-green-800"
                  : nilai.nilaiHuruf?.startsWith("B")
                  ? "bg-blue-100 text-blue-800"
                  : nilai.nilaiHuruf?.startsWith("C")
                  ? "bg-yellow-100 text-yellow-800"
                  : nilai.nilaiHuruf === "D"
                  ? "bg-orange-100 text-orange-800"
                  : nilai.nilaiHuruf === "E"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }">
                ${nilai.nilaiHuruf || "Belum Dinilai"}
              </span>
            </p>
            <p><strong>Tanggal Penilaian:</strong> ${tanggal}</p>
          </div>
        </div>
      `,
      confirmButtonColor: "#004220",
      width: "600px",
    });
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    if (!file.name.endsWith(".xlsx") && !file.name.endsWith(".xls")) {
      Swal.fire({
        icon: "error",
        title: "Format File Salah",
        text: "Harap upload file Excel (.xlsx atau .xls)",
      });
      return;
    }
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch("/api/asisten/tahfidz/import", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const result = await response.json();
      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          html: `
            <p>${result.message}</p>
            <p class="mt-2">Berhasil: ${result.imported || 0}</p>
            ${
              result.errors?.length > 0
                ? `<p class="text-red-600">Gagal: ${result.errors.length}</p>`
                : ""
            }
          `,
          confirmButtonColor: "#22c55e",
        });
        fetchAllData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal Import",
          text: result.message || "Terjadi kesalahan saat import data.",
        });
      }
    } catch (error) {
      console.error("Error uploading:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengupload file ke server.",
      });
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  // Handler untuk simpan nilai tahfidz
  const handleSaveNilai = async () => {
    // Validasi input [web:24]
    if (!formResidentId || !formTargetId || !formStatus || !formNilaiHuruf) {
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Semua field bertanda * wajib diisi.",
      });
      return;
    }

    try {
      const payload = {
        residentId: formResidentId,
        targetHafalanId: formTargetId,
        status: formStatus,
        nilaiHuruf: formNilaiHuruf,
      };

      await apiPost("/api/asisten/tahfidz", payload);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Nilai tahfidz berhasil disimpan.",
        confirmButtonColor: "#22c55e",
        timer: 2000,
      });

      setShowModal(false);
      fetchAllData();
    } catch (err: any) {
      console.error("Error saving nilai:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: err?.response?.data?.message || "Terjadi kesalahan saat menyimpan nilai.",
      });
    }
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
          <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">Nilai Tahfidz</h1>
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
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
              }}
              className="hidden"
            />
            <button
              onClick={handleImportClick}
              className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-sm"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 3v12m0 0l-3-3m3 3l3-3M5 21h14" />
              </svg>
              Impor Data
            </button>
          </div>

          {/* Add Button */}
          <button
            onClick={() => {
              setModalMode("add");
              setSelectedNilai(null);
              setShowModal(true);
            }}
            className="flex items-center gap-2 bg-[#004220] text-white px-4 py-2 rounded-lg hover:bg-[#003318] transition font-semibold text-sm"
          >
            <FaPlus size={16} />
            Add Nilai
          </button>
        </section>

        {/* ===== TABLE ===== */}
        <section className="px-6 pb-6">
          <div className="bg-white rounded-lg shadow border border-[#004220] overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-500">Memuat data...</div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Tidak ada data tahfidz</div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="text-[#004220] border-b border-[#004220] bg-white sticky top-0 z-10">
                      <tr>
                        <th className="py-3 text-left px-4 bg-white">No</th>
                        <th className="py-3 text-left px-4 bg-white">Nama</th>
                        <th className="py-3 text-left px-4 bg-white">NIM</th>
                        <th className="py-3 text-left px-4 bg-white">Usroh</th>
                        <th className="py-3 text-left px-4 bg-white">Target Hafalan</th>
                        <th className="py-3 text-left px-4 bg-white">Surah</th>
                        <th className="py-3 text-left px-4 bg-white">Nilai Huruf</th>
                        <th className="py-3 text-center px-4 bg-white">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredData.map((nilai, i) => (
                        <tr
                          key={nilai.id}
                          className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
                        >
                          <td className="py-3 px-4">{i + 1}</td>
                          <td className="py-3 px-4">{nilai.resident}</td>
                          <td className="py-3 px-4">{nilai.nim}</td>
                          <td className="py-3 px-4">{nilai.usroh || "-"}</td>
                          <td className="py-3 px-4">{nilai.target || "-"}</td>
                          <td className="py-3 px-4">{nilai.surah || "-"}</td>
                          <td className="py-3 px-4">{nilai.nilaiHuruf || "-"}</td>
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleViewDetail(nilai)}
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
            Menampilkan {filteredData.length} dari {nilaiList.length} data tahfidz
          </div>
        </section>
      </main>

      {/* ===== MODAL: Add/Edit Nilai Tahfidz ===== */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="bg-[#004220] px-8 py-5 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-white">
                {modalMode === "add" ? "Tambah Nilai Tahfidz" : "Edit Nilai Tahfidz"}
              </h2>
            </div>

            <div className="p-8 overflow-y-auto max-h-[calc(90vh-150px)]">
              <div className="space-y-5">
                {/* Resident Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Resident <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                    value={formResidentId || ""}
                    onChange={(e) => setFormResidentId(Number(e.target.value) || null)}
                  >
                    <option value="">Pilih Resident</option>
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama} ({r.nim})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Hafalan Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Target Hafalan <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                    value={formTargetId || ""}
                    onChange={(e) => setFormTargetId(Number(e.target.value) || null)}
                  >
                    <option value="">Pilih Target Hafalan</option>
                    {targetHafalan.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nama} - {t.surah} ({t.ayatMulai}:{t.ayatAkhir})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Status Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value)}
                  >
                    <option value="">Pilih Status</option>
                    <option value="SELESAI">Selesai</option>
                    <option value="BELUM SELESAI">Belum Selesai</option>
                    <option value="REVISI">Revisi</option>
                  </select>
                </div>

                {/* Nilai Huruf Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nilai Huruf <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                    value={formNilaiHuruf}
                    onChange={(e) => setFormNilaiHuruf(e.target.value)}
                  >
                    <option value="">Pilih Nilai Huruf</option>
                    <option value="A">A (90-100)</option>
                    <option value="A-">A- (85-89)</option>
                    <option value="B+">B+ (80-84)</option>
                    <option value="B">B (75-79)</option>
                    <option value="B-">B- (70-74)</option>
                    <option value="C+">C+ (65-69)</option>
                    <option value="C">C (60-64)</option>
                    <option value="D">D (50-59)</option>
                    <option value="E">E (&lt;50)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleSaveNilai}
                className="px-4 py-2 rounded-lg bg-[#004220] text-white hover:bg-[#003318]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
