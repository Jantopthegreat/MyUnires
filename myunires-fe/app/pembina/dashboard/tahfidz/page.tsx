"use client";
import { useState, useEffect, useRef } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import TahfidzHeader from "@/components/TahfidzHeader";
import TahfidzFilterBar from "@/components/TahfidzFilterBar";
import TahfidzTable, { NilaiTahfidzData } from "@/components/TahfidzTable";
import TahfidzModal from "@/components/TahfidzModal";
import LogoutModal from "@/components/LogoutModal";
import Swal from "sweetalert2";
import { clearAuth } from "@/lib/api";

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
  const [selectedNilai, setSelectedNilai] = useState<NilaiTahfidzData | null>(
    null
  );

  // Fetch all data on mount
  useEffect(() => {
    fetchAllData();
  }, []);

  // Handler untuk filter
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
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Token tidak ditemukan. Silakan login kembali.",
        });
        return;
      }

      // Fetch nilai tahfidz detail (1 nilai = 1 baris)
      const nilaiRes = await fetch(
        "http://localhost:3001/api/musyrif/tahfidz/detail",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const nilaiData = await nilaiRes.json();

      // Fetch residents
      const residentsRes = await fetch(
        "http://localhost:3001/api/musyrif/residents",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const residentsData = await residentsRes.json();

      // Fetch usroh
      const usrohRes = await fetch("http://localhost:3001/api/musyrif/usroh", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const usrohData = await usrohRes.json();

      // Fetch target hafalan
      const targetRes = await fetch(
        "http://localhost:3001/api/musyrif/target-hafalan",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const targetData = await targetRes.json();

      setNilaiList(nilaiData.data || []);
      setFilteredData(nilaiData.data || []); // langsung tampilkan semua data
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

  const handleSave = async (formData: any) => {
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
          body: JSON.stringify(formData),
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
        fetchAllData(); // Refresh data
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: result.message || "Terjadi kesalahan saat menyimpan data.",
        });
      }
    } catch (error) {
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
      width: "600px",
    });
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
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
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Token tidak ditemukan. Silakan login kembali.",
        });
        return;
      }
      const formData = new FormData();
      formData.append("file", file);
      const response = await fetch(
        "http://localhost:3001/api/musyrif/tahfidz/import",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
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
    } catch (error) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal mengupload file ke server.",
      });
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      <TahfidzHeader onLogout={() => setShowLogoutModal(true)} />
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={() => {
          clearAuth();
          window.location.href = "/login";
        }}
      />
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-12"
        }`}
      >
        <div className="h-16" />
        <header className="px-6 py-4">
          <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">
            Nilai Tahfidz
          </h1>
        </header>
        <TahfidzFilterBar
          searchTerm={searchTerm}
          selectedUsroh={selectedUsroh}
          usrohList={usrohList}
          onFilter={handleFilter}
          onImport={handleFileUpload}
          onAdd={handleAdd}
        />
        <section className="px-6 pb-6">
          <div className="bg-white rounded-lg shadow border border-[#004220] overflow-hidden">
            {loading ? (
              <div className="text-center py-10 text-gray-500">
                Memuat data...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Tidak ada data tahfidz
              </div>
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
                              className="flex items-center gap-2 bg-[#004220] text-white px-4 py-2 rounded-lg hover:bg-[#005a2c] transition text-xs font-semibold"
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
          {/* Info jumlah data */}
          <div className="mt-3 text-sm text-gray-600">
            Menampilkan {filteredData.length} dari {nilaiList.length} data tahfidz
          </div>
        </section>
      </main>
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
