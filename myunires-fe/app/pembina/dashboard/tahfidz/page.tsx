"use client";

import { useEffect, useRef, useState } from "react";
import Swal from "sweetalert2";

import Sidebar_Musyrif from "@/components/sidebar_musyrif";
import TahfidzModal from "@/components/TahfidzModal";
import { NilaiTahfidzData } from "@/components/TahfidzTable";

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

export default function TahfidzPage() {
  // Sidebar states (desktop + mobile)
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
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
  const [selectedNilai, setSelectedNilai] = useState<NilaiTahfidzData | null>(
    null
  );

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleFilter = (search: string, usroh: string) => {
    let result = [...nilaiList];

    if (search) {
      const s = search.toLowerCase();
      result = result.filter(
        (item) =>
          item.resident.toLowerCase().includes(s) ||
          item.nim.toLowerCase().includes(s)
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
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Token tidak ditemukan. Silakan login kembali.",
        });
        return;
      }

      const [nilaiRes, residentsRes, usrohRes, targetRes] = await Promise.all([
        fetch("http://localhost:3001/api/musyrif/tahfidz/detail", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3001/api/musyrif/residents", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3001/api/musyrif/usroh", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3001/api/musyrif/target-hafalan", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      const [nilaiData, residentsData, usrohData, targetData] =
        await Promise.all([
          nilaiRes.json(),
          residentsRes.json(),
          usrohRes.json(),
          targetRes.json(),
        ]);

      setNilaiList(nilaiData.data || []);
      setFilteredData(nilaiData.data || []);
      setResidents(residentsData.data || []);
      setUsrohList(usrohData.data || []);
      setTargetHafalan(targetData.data || []);
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data dari server.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setModalMode("add");
    setSelectedNilai(null);
    setShowModal(true);
  };

  const handleEdit = (nilai: NilaiTahfidzData) => {
    setModalMode("edit");
    setSelectedNilai(nilai);
    setShowModal(true);
  };

  const handleSave = async (payload: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Token tidak ditemukan. Silakan login kembali.",
        });
        return;
      }

      const response = await fetch(
        "http://localhost:3001/api/musyrif/tahfidz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: result.message || "Data berhasil disimpan.",
          confirmButtonColor: "#22c55e",
          timer: 2000,
        });

        setShowModal(false);
        fetchAllData();
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: result.message || "Terjadi kesalahan saat menyimpan data.",
        });
      }
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menyimpan data ke server.",
      });
    }
  };

  const handleViewDetail = (nilai: NilaiTahfidzData) => {
    const tanggal = new Date(nilai.tanggal).toLocaleDateString("id-ID", {
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
            <p><strong>Target Hafalan:</strong> ${nilai.target}</p>
            <p><strong>Surah:</strong> ${nilai.surah}</p>
            <p><strong>Status:</strong>
              <span class="px-2 py-1 rounded text-xs font-semibold ml-2 ${
                nilai.status === "SELESAI"
                  ? "bg-green-100 text-green-700"
                  : nilai.status === "BELUM SELESAI"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-yellow-100 text-yellow-800"
              }">
                ${nilai.status}
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
      width: "min(600px, 92vw)",
    });
  };

  const handleImportClick = () => fileInputRef.current?.click();

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
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Token tidak ditemukan. Silakan login kembali.",
        });
        return;
      }

      const fd = new FormData();
      fd.append("file", file);

      const response = await fetch(
        "http://localhost:3001/api/musyrif/tahfidz/import",
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        }
      );

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
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengupload file ke server.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ===== TOP HEADER (NO LOGOUT) ===== */}
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-4 sm:px-6 border-b">
        <div className="flex items-center gap-3">
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

        <div className="w-10" />
      </header>

      {/* ===== SIDEBAR (logout di sidebar) ===== */}
      <Sidebar_Musyrif
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* ===== MAIN ===== */}
      <main
        className={[
          "pt-16 transition-all duration-300 ease-in-out",
          isOpen ? "md:ml-64" : "md:ml-14",
          "ml-0",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
          <header className="mb-4">
            <h1 className="bg-[#004220] text-white text-center py-4 sm:py-6 rounded-2xl text-base sm:text-lg font-semibold shadow-sm">
              Nilai Tahfidz
            </h1>
          </header>

          {/* ===== FILTER CARD (rapi di mobile) ===== */}
          <section className="mb-5">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="Cari Resident"
                  value={searchTerm}
                  onChange={(e) => handleFilter(e.target.value, selectedUsroh)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                />

                <select
                  value={selectedUsroh}
                  onChange={(e) => handleFilter(searchTerm, e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-xl text-sm bg-white focus:outline-none focus:ring-1 focus:ring-[#004220]"
                >
                  <option value="all">Usroh (All)</option>
                  {usrohList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-3 flex flex-col sm:flex-row gap-3 sm:justify-end">
                {/* hidden input excel */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls"
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) handleFileUpload(f);
                    e.currentTarget.value = "";
                  }}
                />

                <button
                  type="button"
                  onClick={handleImportClick}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 text-sm font-semibold hover:bg-gray-50 transition"
                >
                  Impor Data
                </button>

                <button
                  type="button"
                  onClick={handleAdd}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-[#004220] text-white text-sm font-semibold hover:bg-[#005a2c] transition"
                >
                  Tambah Nilai
                </button>
              </div>
            </div>
          </section>

          {/* ===== TABLE ===== */}
          <section className="pb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-[#004220]/20 overflow-hidden">
              {loading ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  Memuat data...
                </div>
              ) : filteredData.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  Tidak ada data tahfidz
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <div className="max-h-[65vh] md:max-h-[600px] overflow-y-auto">
                    <table className="w-full text-sm border-collapse">
                      <thead className="text-[#004220] border-b border-[#004220]/30 bg-white sticky top-0 z-10">
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
                            Usroh
                          </th>
                          <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                            Target Hafalan
                          </th>
                          <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                            Surah
                          </th>
                          <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                            Nilai Huruf
                          </th>
                          <th className="py-3 text-center px-4 bg-white whitespace-nowrap">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredData.map((nilai, i) => (
                          <tr
                            key={nilai.id}
                            className="text-[#004220] border-b border-[#004220]/10 hover:bg-[#F7F9F8] transition"
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              {i + 1}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {nilai.resident}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {nilai.nim}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {nilai.usroh || "-"}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {nilai.target || "-"}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {nilai.surah || "-"}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {nilai.nilaiHuruf || "-"}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <div className="flex justify-center">
                                <button
                                  onClick={() => handleViewDetail(nilai)}
                                  className="bg-[#004220] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#005a2c] transition text-xs font-semibold"
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
              Menampilkan {filteredData.length} dari {nilaiList.length} data
              tahfidz
            </div>
          </section>

          <div className="text-xs text-gray-500">
            © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
          </div>
        </div>
      </main>

      {/* ===== MODAL ADD/EDIT ===== */}
      <TahfidzModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        mode={modalMode}
        data={selectedNilai}
        residents={residents}
        targetHafalan={targetHafalan}
      />
    </div>
  );
}
