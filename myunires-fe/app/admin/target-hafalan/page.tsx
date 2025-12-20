"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/useAuth";
import {
  getUser,
  clearAuth,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
} from "@/lib/api";
import AdminSidebar from "@/components/adminSidebar";

const ALLOWED_ROLES = ["ADMIN"];
const BASE_URL = "/api/admin/target-hafalan"; // ganti jika route kamu beda

type TargetHafalanItem = {
  id: number;
  nama: string;
  surah: string;
  ayatMulai: number;
  ayatAkhir: number;
  createdAt?: string;
};

export default function AdminTargetHafalanPage() {
  const router = useRouter();
  const { user } = useAuth(ALLOWED_ROLES);

  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [targets, setTargets] = useState<TargetHafalanItem[]>([]);
  const [loading, setLoading] = useState(true);

  // filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedSurah, setSelectedSurah] = useState("all");

  // Modal detail (biar sama seperti referensi musyrif)
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailTarget, setDetailTarget] = useState<TargetHafalanItem | null>(
    null
  );

  const openDetailModal = (t: TargetHafalanItem) => {
    setDetailTarget(t);
    setShowDetailModal(true);
  };

  // modal add/edit
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedTarget, setSelectedTarget] =
    useState<TargetHafalanItem | null>(null);

  // form
  const [formNama, setFormNama] = useState("");
  const [formSurah, setFormSurah] = useState("");
  const [formAyatMulai, setFormAyatMulai] = useState("");
  const [formAyatAkhir, setFormAyatAkhir] = useState("");

  const didFetch = useRef(false);

  useEffect(() => setUserData(getUser()), []);

  useEffect(() => {
    if (!user) return;
    if (didFetch.current) return;
    didFetch.current = true;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await apiGet<any>(BASE_URL);
      setTargets(Array.isArray(res.data) ? res.data : []);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data target hafalan.",
      });
    } finally {
      setLoading(false);
    }
  };

  const surahOptions = useMemo(() => {
    const set = new Set<string>();
    targets.forEach((t) => {
      const s = (t.surah || "").trim();
      if (s) set.add(s);
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [targets]);

  const filteredTargets = useMemo(() => {
    let result = [...targets];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((t) => {
        const nama = (t.nama || "").toLowerCase();
        const surah = (t.surah || "").toLowerCase();
        return nama.includes(q) || surah.includes(q);
      });
    }

    if (selectedSurah !== "all") {
      result = result.filter((t) => (t.surah || "") === selectedSurah);
    }

    return result;
  }, [targets, searchTerm, selectedSurah]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedTarget(null);
    setFormNama("");
    setFormSurah("");
    setFormAyatMulai("");
    setFormAyatAkhir("");
    setShowModal(true);
  };

  const openEditModal = (t: TargetHafalanItem) => {
    setModalMode("edit");
    setSelectedTarget(t);
    setFormNama(t.nama || "");
    setFormSurah(t.surah || "");
    setFormAyatMulai(String(t.ayatMulai ?? ""));
    setFormAyatAkhir(String(t.ayatAkhir ?? ""));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formNama || !formSurah || !formAyatMulai || !formAyatAkhir) {
      Swal.fire({
        icon: "error",
        title: "Validasi",
        text: "Semua field wajib diisi.",
      });
      return;
    }

    const payload = {
      nama: formNama,
      surah: formSurah,
      ayatMulai: Number(formAyatMulai),
      ayatAkhir: Number(formAyatAkhir),
    };

    if (Number.isNaN(payload.ayatMulai) || Number.isNaN(payload.ayatAkhir)) {
      Swal.fire({
        icon: "error",
        title: "Validasi",
        text: "Ayat mulai/akhir harus angka.",
      });
      return;
    }

    if (
      payload.ayatMulai <= 0 ||
      payload.ayatAkhir <= 0 ||
      payload.ayatAkhir < payload.ayatMulai
    ) {
      Swal.fire({
        icon: "error",
        title: "Validasi",
        text: "Range ayat tidak valid.",
      });
      return;
    }

    try {
      if (modalMode === "add") {
        await apiPost(BASE_URL, payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Target hafalan ditambahkan.",
          timer: 1800,
        });
      } else if (selectedTarget) {
        await apiPut(`${BASE_URL}/${selectedTarget.id}`, payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Target hafalan diupdate.",
          timer: 1800,
        });
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: err?.message || "Terjadi kesalahan.",
      });
    }
  };

  const handleDelete = async (t: TargetHafalanItem) => {
    const confirm = await Swal.fire({
      title: "Hapus Target Hafalan?",
      text: `Yakin ingin menghapus "${t.nama}"? (Sub-target terkait juga ikut terhapus)`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await apiDelete(`${BASE_URL}/${t.id}`);
      Swal.fire({
        icon: "success",
        title: "Terhapus!",
        text: "Target hafalan berhasil dihapus.",
        timer: 1800,
      });

      // jika sedang buka detail, tutup biar tidak pegang data lama
      setShowDetailModal(false);
      setDetailTarget(null);

      fetchData();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menghapus target hafalan.",
      });
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* TOP HEADER */}
      <header className="h-16 bg-white border-b flex items-center sticky top-0 z-30">
        <div className="w-full mx-auto max-w-7xl px-6 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <img src="/lg_umy.svg" alt="UMY" className="h-8" />
            <img src="/lg_unires.svg" alt="UNIRES" className="h-8" />
          </div>
        </div>
      </header>

      {/* Logout modal (sama seperti referensi) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 w-full max-w-sm text-center">
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
                onClick={handleLogout}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-6 flex flex-col md:flex-row gap-4 md:gap-6">
        <AdminSidebar
          userName={userData?.name}
          userEmail={userData?.email}
          onLogoutClick={() => setShowLogoutModal(true)}
        />

        <main className="flex-1 min-w-0">
          {/* Title hijau */}
          <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm">
            Kelola Target Hafalan
          </div>

          {/* Filter bar + Add */}
          <div className="mt-6 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            {/* KIRI */}
            <div className="flex items-center gap-3 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
              <div className="relative max-sm:w-full">
                <FaSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Cari Target"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 max-sm:w-full"
                />
              </div>

              <select
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm max-sm:w-full"
              >
                <option value="all">Surah (All)</option>
                {surahOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            {/* KANAN */}
            <div className="flex items-center gap-3 max-sm:w-full max-sm:justify-end">
              <button
                onClick={openAddModal}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2 rounded-full flex items-center shadow-sm transition font-semibold text-sm max-sm:px-3 max-sm:text-xs"
              >
                <FaPlus className="mr-2" /> Add Target
              </button>
            </div>
          </div>

          {/* Table */}
          <section className="mt-6 bg-white rounded-2xl shadow-sm border overflow-hidden">
            {loading && targets.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Memuat data...
              </div>
            ) : filteredTargets.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Tidak ada data target hafalan
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4 text-left">No</th>
                      <th className="py-3 px-4 text-left">Target</th>
                      <th className="py-3 px-4 text-left">Surah</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTargets.map((t, i) => (
                      <tr key={t.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{i + 1}</td>
                        <td className="py-3 px-4">{t.nama}</td>
                        <td className="py-3 px-4">
                          {t.surah} {t.ayatMulai}–{t.ayatAkhir}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                            <button
                              onClick={() => openDetailModal(t)}
                              className="hover:opacity-80"
                              title="Detail"
                            >
                              <img
                                src="/eye_icon.svg"
                                alt="Detail"
                                className="w-5 h-5 shrink-0"
                              />
                            </button>

                            <button
                              onClick={() => openEditModal(t)}
                              className="text-blue-600 hover:underline"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(t)}
                              className="text-red-600 hover:underline"
                            >
                              Hapus
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="mt-3 text-sm text-gray-600">
            Menampilkan {filteredTargets.length} dari {targets.length} target
          </div>
        </main>
      </div>

      {/* Detail Modal (biar sama seperti referensi) */}
      {showDetailModal && detailTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Detail Target Hafalan</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailTarget(null);
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <div className="text-gray-500">Nama Target</div>
                <div className="font-medium wrap-anywhere">
                  {detailTarget.nama || "-"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Surah</div>
                <div className="font-medium wrap-anywhere">
                  {detailTarget.surah || "-"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Range Ayat</div>
                <div className="font-medium">
                  {detailTarget.ayatMulai ?? "-"}–
                  {detailTarget.ayatAkhir ?? "-"}
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-gray-500">Created At</div>
                <div className="font-medium wrap-anywhere">
                  {detailTarget.createdAt || "-"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(detailTarget);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-blue-700 border-blue-200"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(detailTarget)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {modalMode === "add"
                ? "Tambah Target Hafalan"
                : "Edit Target Hafalan"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Target <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Contoh: Target 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Surah <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formSurah}
                  onChange={(e) => setFormSurah(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Contoh: An-Naba'"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ayat Mulai <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formAyatMulai}
                    onChange={(e) => setFormAyatMulai(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    Ayat Akhir <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formAyatAkhir}
                    onChange={(e) => setFormAyatAkhir(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-[#004220] text-white rounded-lg hover:bg-[#003318]"
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
