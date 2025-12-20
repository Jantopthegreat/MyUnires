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

const SUBTARGET_URL = "/api/admin/subtarget";
const TARGET_URL = "/api/admin/target-hafalan";

type TargetHafalan = {
  id: number;
  nama: string;
  surah: string;
  ayatMulai: number;
  ayatAkhir: number;
};

type SubTarget = {
  id: number;
  nama: string;
  targetId: number;
  targetHafalan?: {
    id: number;
    nama: string;
    surah: string;
    ayatMulai?: number;
    ayatAkhir?: number;
  };
  createdAt?: string;
};

export default function AdminSubTargetPage() {
  const router = useRouter();
  const { user } = useAuth(ALLOWED_ROLES);

  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [subTargets, setSubTargets] = useState<SubTarget[]>([]);
  const [targets, setTargets] = useState<TargetHafalan[]>([]);
  const [loading, setLoading] = useState(true);

  // filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTargetId, setSelectedTargetId] = useState<string>("all");

  // Detail modal
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailSubTarget, setDetailSubTarget] = useState<SubTarget | null>(
    null
  );

  const openDetailModal = (s: SubTarget) => {
    setDetailSubTarget(s);
    setShowDetailModal(true);
  };

  // modal add/edit
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedSubTarget, setSelectedSubTarget] = useState<SubTarget | null>(
    null
  );

  // form
  const [formNama, setFormNama] = useState("");
  const [formTargetId, setFormTargetId] = useState<string>("");

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
      const [resSub, resTarget] = await Promise.all([
        apiGet<any>(SUBTARGET_URL),
        apiGet<any>(TARGET_URL),
      ]);

      setSubTargets(Array.isArray(resSub.data) ? resSub.data : []);
      setTargets(Array.isArray(resTarget.data) ? resTarget.data : []);
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data sub target.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const targetLabel = (t: TargetHafalan) =>
    `${t.nama} - ${t.surah} ${t.ayatMulai}–${t.ayatAkhir}`;

  const filtered = useMemo(() => {
    let result = [...subTargets];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((s) => {
        const nama = (s.nama || "").toLowerCase();
        const tNama = (s.targetHafalan?.nama || "").toLowerCase();
        const tSurah = (s.targetHafalan?.surah || "").toLowerCase();
        return nama.includes(q) || tNama.includes(q) || tSurah.includes(q);
      });
    }

    if (selectedTargetId !== "all") {
      const idNum = Number(selectedTargetId);
      result = result.filter((s) => Number(s.targetId) === idNum);
    }

    return result;
  }, [subTargets, searchTerm, selectedTargetId]);

  const openAddModal = () => {
    setModalMode("add");
    setSelectedSubTarget(null);
    setFormNama("");
    setFormTargetId("");
    setShowModal(true);
  };

  const openEditModal = (s: SubTarget) => {
    setModalMode("edit");
    setSelectedSubTarget(s);
    setFormNama(s.nama || "");
    setFormTargetId(String(s.targetId ?? ""));
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formNama.trim() || !formTargetId) {
      Swal.fire({
        icon: "error",
        title: "Validasi",
        text: "Nama sub target dan target wajib diisi.",
      });
      return;
    }

    const payload = {
      nama: formNama.trim(),
      targetId: Number(formTargetId),
    };

    if (Number.isNaN(payload.targetId) || payload.targetId <= 0) {
      Swal.fire({
        icon: "error",
        title: "Validasi",
        text: "Target tidak valid.",
      });
      return;
    }

    try {
      if (modalMode === "add") {
        await apiPost(SUBTARGET_URL, payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Sub target ditambahkan.",
          timer: 1500,
        });
      } else if (selectedSubTarget) {
        await apiPut(`${SUBTARGET_URL}/${selectedSubTarget.id}`, payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Sub target diupdate.",
          timer: 1500,
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

  const handleDelete = async (s: SubTarget) => {
    const confirm = await Swal.fire({
      title: "Hapus Sub Target?",
      text: `Yakin ingin menghapus "${s.nama}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await apiDelete(`${SUBTARGET_URL}/${s.id}`);
      Swal.fire({
        icon: "success",
        title: "Terhapus!",
        text: "Sub target berhasil dihapus.",
        timer: 1500,
      });

      setShowDetailModal(false);
      setDetailSubTarget(null);

      fetchData();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menghapus sub target.",
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

      {/* Logout modal */}
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
          <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm">
            Kelola Sub Target
          </div>

          {/* Filter bar + Add */}
          <div className="mt-6 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            <div className="flex items-center gap-3 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
              <div className="relative max-sm:w-full">
                <FaSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Cari Sub Target"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 max-sm:w-full"
                />
              </div>

              <select
                value={selectedTargetId}
                onChange={(e) => setSelectedTargetId(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm max-sm:w-full"
              >
                <option value="all">Target (All)</option>
                {targets.map((t) => (
                  <option key={t.id} value={String(t.id)}>
                    {targetLabel(t)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3 max-sm:w-full max-sm:justify-end">
              <button
                onClick={openAddModal}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2 rounded-full flex items-center shadow-sm transition font-semibold text-sm max-sm:px-3 max-sm:text-xs"
              >
                <FaPlus className="mr-2" /> Add SubTarget
              </button>
            </div>
          </div>

          {/* Table */}
          <section className="mt-6 bg-white rounded-2xl shadow-sm border overflow-hidden">
            {loading && subTargets.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Memuat data...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Tidak ada data sub target
              </div>
            ) : (
              <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b sticky top-0 z-10">
                    <tr>
                      <th className="py-3 px-4 text-left">No</th>
                      <th className="py-3 px-4 text-left">Sub Target</th>
                      <th className="py-3 px-4 text-left">Target</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((s, i) => (
                      <tr key={s.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{i + 1}</td>
                        <td className="py-3 px-4">{s.nama}</td>
                        <td className="py-3 px-4">
                          {s.targetHafalan
                            ? `${s.targetHafalan.nama} - ${s.targetHafalan.surah}`
                            : "-"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                            <button
                              onClick={() => openDetailModal(s)}
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
                              onClick={() => openEditModal(s)}
                              className="text-blue-600 hover:underline"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(s)}
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
            Menampilkan {filtered.length} dari {subTargets.length} sub target
          </div>
        </main>
      </div>

      {/* Detail Modal */}
      {showDetailModal && detailSubTarget && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Detail Sub Target</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailSubTarget(null);
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="col-span-2">
                <div className="text-gray-500">Nama Sub Target</div>
                <div className="font-medium wrap-anywhere">
                  {detailSubTarget.nama || "-"}
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-gray-500">Target</div>
                <div className="font-medium wrap-anywhere">
                  {detailSubTarget.targetHafalan
                    ? `${detailSubTarget.targetHafalan.nama} - ${detailSubTarget.targetHafalan.surah}`
                    : "-"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Ayat Mulai</div>
                <div className="font-medium">
                  {detailSubTarget.targetHafalan?.ayatMulai ?? "-"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Ayat Akhir</div>
                <div className="font-medium">
                  {detailSubTarget.targetHafalan?.ayatAkhir ?? "-"}
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-gray-500">Created At</div>
                <div className="font-medium wrap-anywhere">
                  {detailSubTarget.createdAt || "-"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(detailSubTarget);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-blue-700 border-blue-200"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(detailSubTarget)}
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
              {modalMode === "add" ? "Tambah Sub Target" : "Edit Sub Target"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Sub Target <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Contoh: Sub Target 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Target Hafalan <span className="text-red-500">*</span>
                </label>
                <select
                  value={formTargetId}
                  onChange={(e) => setFormTargetId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Pilih Target</option>
                  {targets.map((t) => (
                    <option key={t.id} value={String(t.id)}>
                      {targetLabel(t)}
                    </option>
                  ))}
                </select>
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
