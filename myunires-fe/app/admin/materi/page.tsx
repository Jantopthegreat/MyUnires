"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/useAuth";
import { getUser, clearAuth, apiGet, apiPost, apiPut, apiDelete, apiUpload, apiUploadPut } from "@/lib/api";
import AdminSidebar from "@/components/adminSidebar";

const ALLOWED_ROLES = ["ADMIN"];

const MATERI_URL = "/api/admin/materi";
const KATEGORI_URL = "/api/admin/kategori-materi"; // kalau belum ada endpoint, nanti kita buat

type KategoriMateri = {
  id: number;
  nama: string;
};

type Materi = {
  id: number;
  judul: string;
  deskripsi?: string | null;
  fileUrl?: string | null;
  kategoriId: number;
  kategori?: { id: number; nama: string }; // kalau backend include
};

export default function AdminMateriPage() {
  const router = useRouter();
  const { user } = useAuth(ALLOWED_ROLES);

  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [materi, setMateri] = useState<Materi[]>([]);
  const [kategori, setKategori] = useState<KategoriMateri[]>([]);
  const [loading, setLoading] = useState(true);

  // filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedKategoriId, setSelectedKategoriId] = useState<string>("all");

  // modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedMateri, setSelectedMateri] = useState<Materi | null>(null);

  // form
  const [formJudul, setFormJudul] = useState("");
  const [formDeskripsi, setFormDeskripsi] = useState("");
  const [formKategoriId, setFormKategoriId] = useState<string>("");
  const [formFile, setFormFile] = useState<File | null>(null);

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
      const resMateri = await apiGet<any>(MATERI_URL);
      setMateri(Array.isArray(resMateri.data) ? resMateri.data : []);

      // kategori: optional (kalau endpoint belum ada, FE tetap jalan)
      try {
        const resKat = await apiGet<any>(KATEGORI_URL);
        setKategori(Array.isArray(resKat.data) ? resKat.data : []);
      } catch {
        setKategori([]);
      }
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal memuat data materi." });
    } finally {
      setLoading(false);
    }
  };

  const kategoriLabelById = useMemo(() => {
    const map = new Map<number, string>();
    kategori.forEach((k) => map.set(k.id, k.nama));
    return map;
  }, [kategori]);

  const filtered = useMemo(() => {
    let result = [...materi];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((m) => {
        const judul = (m.judul || "").toLowerCase();
        const kat = (m.kategori?.nama || kategoriLabelById.get(m.kategoriId) || "").toLowerCase();
        return judul.includes(q) || kat.includes(q);
      });
    }

    if (selectedKategoriId !== "all") {
      const idNum = Number(selectedKategoriId);
      result = result.filter((m) => Number(m.kategoriId) === idNum);
    }

    return result;
  }, [materi, searchTerm, selectedKategoriId, kategoriLabelById]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedMateri(null);
    setFormJudul("");
    setFormDeskripsi("");
    setFormKategoriId("");
    setFormFile(null);
    setShowModal(true);
  };

  const openEditModal = (m: Materi) => {
    setModalMode("edit");
    setSelectedMateri(m);
    setFormJudul(m.judul || "");
    setFormDeskripsi(m.deskripsi || "");
    setFormKategoriId(String(m.kategoriId ?? ""));
    setFormFile(null);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formJudul.trim() || !formKategoriId) {
      Swal.fire({ icon: "error", title: "Validasi", text: "Judul dan kategori wajib diisi." });
      return;
    }

    // Backend kamu support file upload via req.file (multer) dan field fileUrl [file:41]
    // jadi kirim FormData biar bisa gabung text + file.
    const fd = new FormData();
    fd.append("judul", formJudul.trim());
    fd.append("deskripsi", formDeskripsi?.trim() || "");
    fd.append("kategoriId", String(formKategoriId));
    if (formFile) fd.append("file", formFile); // pastikan backend multer pakai fieldname "file"

    try {
      if (modalMode === "add") {
        await apiUpload(MATERI_URL, fd);
 // true = multipart (lihat catatan di bawah)
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Materi ditambahkan.", timer: 1500 });
      } else if (selectedMateri) {
       await apiUploadPut(`${MATERI_URL}/${selectedMateri.id}`, fd);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Materi diupdate.", timer: 1500 });
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal", text: err?.message || "Terjadi kesalahan." });
    }
  };

  const handleDelete = async (m: Materi) => {
    const confirm = await Swal.fire({
      title: "Hapus Materi?",
      text: `Yakin ingin menghapus "${m.judul}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await apiDelete(`${MATERI_URL}/${m.id}`);
      Swal.fire({ icon: "success", title: "Terhapus!", text: "Materi berhasil dihapus.", timer: 1500 });
      fetchData();
    } catch {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal menghapus materi." });
    }
  };

  const kategoriText = (m: Materi) => {
    return m.kategori?.nama || kategoriLabelById.get(m.kategoriId) || "-";
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

          <button
            onClick={() => setShowLogoutModal(true)}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2 rounded-full text-xs shadow transition"
          >
            Log Out
          </button>
        </div>
      </header>

      {/* Logout modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-xl p-8 w-[360px] text-center">
            <h2 className="text-xl font-semibold text-[#004220] mb-3">Log Out</h2>
            <p className="text-gray-600 text-sm mb-6">Akhiri sesi login?</p>
            <div className="flex justify-center gap-3">
              <button onClick={() => setShowLogoutModal(false)} className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg">
                Batal
              </button>
              <button onClick={handleLogout} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg">
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* BODY */}
      <div className="mx-auto max-w-7xl px-6 py-6 flex gap-6">
        <AdminSidebar userName={userData?.name} userEmail={userData?.email} />

        <main className="flex-1 min-w-0">
          <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm">
            Kelola Materi Pembelajaran
          </div>

          {/* Filter bar + Add */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari Materi"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64"
                />
              </div>

              <select
                value={selectedKategoriId}
                onChange={(e) => setSelectedKategoriId(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
                disabled={kategori.length === 0}
                title={kategori.length === 0 ? "Endpoint kategori belum tersedia" : ""}
              >
                <option value="all">Kategori (All)</option>
                {kategori.map((k) => (
                  <option key={k.id} value={String(k.id)}>
                    {k.nama}
                  </option>
                ))}
              </select>

              {/* Import Data (nanti) */}
              {/* <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Import Data</button> */}
            </div>

            <button
              onClick={openAddModal}
              className="bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2 rounded-full flex items-center shadow-sm transition font-semibold text-sm"
            >
              <FaPlus className="mr-2" /> Add Materi
            </button>
          </div>

          {/* Table */}
          <section className="mt-6 bg-white rounded-2xl shadow-sm border overflow-hidden">
            {loading && materi.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Memuat data...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Tidak ada data materi</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3 px-4 text-left">No</th>
                      <th className="py-3 px-4 text-left">Materi</th>
                      <th className="py-3 px-4 text-left">Kategori</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, i) => (
                      <tr key={m.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{i + 1}</td>
                        <td className="py-3 px-4">{m.judul}</td>
                        <td className="py-3 px-4">{kategoriText(m)}</td>
                        <td className="py-3 px-4 text-center">
                          {/* Detail (eye) nanti */}
                          <button onClick={() => openEditModal(m)} className="text-blue-600 hover:underline mr-3">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(m)} className="text-red-600 hover:underline">
                            Hapus
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <div className="mt-3 text-sm text-gray-600">
            Menampilkan {filtered.length} dari {materi.length} materi
          </div>
        </main>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{modalMode === "add" ? "Tambah Materi" : "Edit Materi"}</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Judul <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formJudul}
                  onChange={(e) => setFormJudul(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Contoh: Materi 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Deskripsi</label>
                <textarea
                  value={formDeskripsi}
                  onChange={(e) => setFormDeskripsi(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  rows={3}
                  placeholder="Opsional"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Kategori <span className="text-red-500">*</span>
                </label>
                <select
                  value={formKategoriId}
                  onChange={(e) => setFormKategoriId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Pilih Kategori</option>
                  {kategori.map((k) => (
                    <option key={k.id} value={String(k.id)}>
                      {k.nama}
                    </option>
                  ))}
                </select>
                {kategori.length === 0 && (
                  <div className="text-xs text-gray-500 mt-1">
                    Endpoint kategori belum ada—buat dulu `GET /api/admin/kategori-materi` atau sementara hardcode.
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">File (PDF/PPT/dll)</label>
                <input
                  type="file"
                  onChange={(e) => setFormFile(e.target.files?.[0] || null)}
                  className="w-full text-sm"
                />
                <div className="text-xs text-gray-500 mt-1">
                  Kalau tidak upload saat edit, file lama tetap dipakai.
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border rounded-lg hover:bg-gray-50">
                Batal
              </button>
              <button onClick={handleSave} className="px-4 py-2 bg-[#004220] text-white rounded-lg hover:bg-[#003318]">
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
