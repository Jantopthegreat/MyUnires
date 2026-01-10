"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";
import { apiGet, apiPost, clearAuth } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";

import Sidebar_AsistenMusyrif from "@/components/sidebar_asistenMusyrif";

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
  const searchParams = useSearchParams();

  // sidebar states
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  const [showLogoutModal, setShowLogoutModal] = useState(false);

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

  // Form states
  const [formResidentId, setFormResidentId] = useState<number | null>(null);
  const [formTargetId, setFormTargetId] = useState<number | null>(null);
  const [formStatus, setFormStatus] = useState<string>("");
  const [formNilaiHuruf, setFormNilaiHuruf] = useState<string>("");

  useEffect(() => {
    fetchAllData();
  }, []);

  // Auto-set residentId from query param: ?residentId=123
  useEffect(() => {
    const q = searchParams.get("residentId");
    if (!q) return;
    const id = Number(q);
    if (!Number.isFinite(id)) return;

    // set default resident untuk modal tambah
    setFormResidentId(id);

    // optional: filter list berdasarkan resident (biar langsung fokus)
    setSearchTerm("");
  }, [searchParams]);

  // Reset form saat modal dibuka (mode add)
  useEffect(() => {
    if (!showModal) return;

    if (modalMode === "add") {
      // kalau ada query residentId, jangan di-reset
      const q = searchParams.get("residentId");
      const qId = q ? Number(q) : null;

      setFormResidentId(Number.isFinite(qId as any) ? (qId as number) : null);
      setFormTargetId(null);
      setFormStatus("");
      setFormNilaiHuruf("");
    }
  }, [showModal, modalMode, searchParams]);

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
      const nilaiRes = await apiGet<any>("/api/asisten/tahfidz/detail");
      const nilaiData = nilaiRes.data ?? [];

      const residentsRes = await apiGet<any>("/api/asisten/residents");
      const residentsData = residentsRes.data ?? [];

      const usrohRes = await apiGet<any>("/api/asisten/usroh");
      const usrohData = usrohRes.data ?? [];

      const targetRes = await apiGet<any>("/api/asisten/target-hafalan");
      const targetData = targetRes.data ?? [];

      const nilaiArr = Array.isArray(nilaiData) ? nilaiData : [];

      // mapping aman: API kadang kirim `name`, di sini kita pakai `nama`
      const residentArr: Resident[] = (
        Array.isArray(residentsData) ? residentsData : []
      ).map((r: any) => ({
        id: r.id,
        nama: r.nama ?? r.name ?? "",
        nim: r.nim ?? "",
        email: r.email ?? "",
        usroh: r.usroh ?? "-",
      }));

      setNilaiList(nilaiArr);
      setFilteredData(nilaiArr);
      setResidents(residentArr);
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
    const tanggal = nilai.tanggal
      ? new Date(nilai.tanggal).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      : "-";

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
            <p><strong>Status:</strong> ${nilai.status || "-"}</p>
            <p><strong>Nilai Huruf:</strong> ${
              nilai.nilaiHuruf || "Belum Dinilai"
            }</p>
            <p><strong>Tanggal Penilaian:</strong> ${tanggal}</p>
          </div>
        </div>
      `,
      confirmButtonColor: "#004220",
      width: "600px",
    });
  };

  const handleSaveNilai = async () => {
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
        timer: 1600,
      });

      setShowModal(false);
      fetchAllData();
    } catch (err: any) {
      console.error("Error saving nilai:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal Menyimpan",
        text: err?.message || "Terjadi kesalahan saat menyimpan nilai.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* TOP HEADER */}
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
      </header>

      {/* LOGOUT MODAL */}
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

      {/* SIDEBAR */}
      <Sidebar_AsistenMusyrif
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN */}
      <main
        className={[
          "pt-16 transition-all duration-300",
          isOpen ? "md:ml-64" : "md:ml-14",
          "ml-0",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6">
          <header className="mb-4">
            <h1 className="bg-[#004220] text-white text-center py-4 sm:py-5 rounded-2xl text-base sm:text-lg font-semibold shadow-sm">
              Nilai Tahfidz
            </h1>
          </header>

          {/* FILTER BAR */}
          <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="relative w-full sm:w-[280px]">
                <FaSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Cari Resident (nama/NIM)"
                  value={searchTerm}
                  onChange={(e) => handleFilter(e.target.value, selectedUsroh)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                />
              </div>

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

            <button
              onClick={() => {
                setModalMode("add");
                setSelectedNilai(null);
                setShowModal(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-[#004220] text-white px-4 py-2 rounded-lg hover:bg-[#003318] transition font-semibold text-sm"
            >
              <FaPlus size={16} />
              Add Nilai
            </button>
          </section>

          {/* TABLE */}
          <section className="pb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
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
                            className="text-[#004220] border-b border-gray-100 hover:bg-[#F7F9F8] transition"
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
                              <button
                                onClick={() => handleViewDetail(nilai)}
                                className="bg-[#004220] text-white px-4 py-2 rounded-lg hover:bg-[#005a2c] transition text-xs font-semibold"
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
              Menampilkan {filteredData.length} dari {nilaiList.length} data
              tahfidz
            </div>

            <div className="mt-4 text-xs text-gray-500">
              © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
            </div>
          </section>
        </div>
      </main>

      {/* MODAL ADD */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="bg-[#004220] px-6 sm:px-8 py-5 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                {modalMode === "add"
                  ? "Tambah Nilai Tahfidz"
                  : "Edit Nilai Tahfidz"}
              </h2>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-150px)]">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Resident <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                    value={formResidentId || ""}
                    onChange={(e) =>
                      setFormResidentId(Number(e.target.value) || null)
                    }
                  >
                    <option value="">Pilih Resident</option>
                    {residents.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.nama} ({r.nim})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Target Hafalan <span className="text-red-500">*</span>
                  </label>
                  <select
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                    value={formTargetId || ""}
                    onChange={(e) =>
                      setFormTargetId(Number(e.target.value) || null)
                    }
                  >
                    <option value="">Pilih Target Hafalan</option>
                    {targetHafalan.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nama} - {t.surah} ({t.ayatMulai}:{t.ayatAkhir})
                      </option>
                    ))}
                  </select>
                </div>

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

            <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
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
