"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/useAuth";
import { getUser, clearAuth, apiGet, apiPost, apiPut, apiDelete } from "@/lib/api";
import AdminSidebar from "@/components/adminSidebar";

const ALLOWED_ROLES = ["ADMIN"];

type MusyrifListItem = {
  id: number;
  name: string;
  email: string;
  lantai: string; // nama lantai atau "-"
  createdAt: string;
};

type Lantai = {
  id: number;
  nama: string;
  gedung?: string; // dari getAllLantai kamu (map), ada field gedung (nama gedung)
  createdAt?: string;
};

export default function AdminMusyrifPage() {
  const router = useRouter();
  const { user } = useAuth(ALLOWED_ROLES);

  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [musyrifList, setMusyrifList] = useState<MusyrifListItem[]>([]);
  const [lantaiList, setLantaiList] = useState<Lantai[]>([]);
  const [loading, setLoading] = useState(true);

  // filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLantai, setSelectedLantai] = useState("all"); // value: nama lantai

  // modal
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedMusyrif, setSelectedMusyrif] = useState<MusyrifListItem | null>(null);

  // form
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formLantaiId, setFormLantaiId] = useState<number | null>(null);

  const didFetch = useRef(false);

  useEffect(() => {
    setUserData(getUser());
  }, []);

  useEffect(() => {
    if (!user) return;
    if (didFetch.current) return;
    didFetch.current = true;
    fetchData();
  }, [user]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resMusyrif, resLantai] = await Promise.all([
        apiGet<any>("/api/admin/musyrif"),
        apiGet<any>("/api/admin/lantai"),
      ]);

      setMusyrifList(Array.isArray(resMusyrif.data) ? resMusyrif.data : []);
      setLantaiList(Array.isArray(resLantai.data) ? resLantai.data : []);
    } catch (err) {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal memuat data musyrif." });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...musyrifList];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (m) =>
          (m.name || "").toLowerCase().includes(q) ||
          (m.email || "").toLowerCase().includes(q)
      );
    }

    if (selectedLantai !== "all") {
      result = result.filter((m) => (m.lantai || "-") === selectedLantai);
    }

    return result;
  }, [musyrifList, searchTerm, selectedLantai]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedMusyrif(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormLantaiId(null);
    setShowModal(true);
  };

  const openEditModal = (m: MusyrifListItem) => {
    setModalMode("edit");
    setSelectedMusyrif(m);
    setFormName(m.name || "");
    setFormEmail(m.email || "");
    setFormPassword("");

    // cari lantaiId dari nama lantai
    const match = lantaiList.find((l) => l.nama === m.lantai);
    setFormLantaiId(match?.id ?? null);

    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formName || !formEmail) {
      Swal.fire({ icon: "error", title: "Validasi", text: "Nama dan Email wajib diisi." });
      return;
    }
    if (modalMode === "add" && !formPassword) {
      Swal.fire({ icon: "error", title: "Validasi", text: "Password wajib diisi saat tambah musyrif." });
      return;
    }

    const payload: any = {
      name: formName,
      email: formEmail,
      lantaiId: formLantaiId || null,
    };

    if (modalMode === "add") payload.password = formPassword;
    if (modalMode === "edit" && formPassword) payload.password = formPassword;

    try {
      if (modalMode === "add") {
        await apiPost("/api/admin/musyrif", payload);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Musyrif ditambahkan.", timer: 1800 });
      } else if (selectedMusyrif) {
        await apiPut(`/api/admin/musyrif/${selectedMusyrif.id}`, payload);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Musyrif diupdate.", timer: 1800 });
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Gagal", text: err?.message || "Terjadi kesalahan." });
    }
  };

  const handleDelete = async (m: MusyrifListItem) => {
    const confirm = await Swal.fire({
      title: "Hapus Musyrif?",
      text: `Yakin ingin menghapus ${m.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      try {
        await apiDelete(`/api/admin/musyrif/${m.id}`);
        Swal.fire({ icon: "success", title: "Terhapus!", text: "Musyrif berhasil dihapus.", timer: 1800 });
        fetchData();
      } catch (err) {
        Swal.fire({ icon: "error", title: "Error", text: "Gagal menghapus musyrif." });
      }
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
      <div className="mx-auto max-w-7xl px-6 py-6 flex gap-6">
        <AdminSidebar userName={userData?.name} userEmail={userData?.email} />

        <main className="flex-1 min-w-0">
          {/* Title hijau */}
          <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm">
            Kelola Data Musyrif
          </div>

          {/* Filter bar + Add */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari Musyrif"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64"
                />
              </div>

              <select
                value={selectedLantai}
                onChange={(e) => setSelectedLantai(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Lantai (All)</option>
                {lantaiList.map((l) => (
                  <option key={l.id} value={l.nama}>
                    {l.nama}{l.gedung ? ` - ${l.gedung}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={openAddModal}
              className="bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2 rounded-full flex items-center shadow-sm transition font-semibold text-sm"
            >
              <FaPlus className="mr-2" /> Add Musyrif
            </button>
          </div>

          {/* Table */}
          <section className="mt-6 bg-white rounded-2xl shadow-sm border overflow-hidden">
            {loading && musyrifList.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Memuat data...</div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Tidak ada data musyrif</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3 px-4 text-left">No</th>
                      <th className="py-3 px-4 text-left">Nama</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Lantai</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((m, i) => (
                      <tr key={m.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{i + 1}</td>
                        <td className="py-3 px-4">{m.name}</td>
                        <td className="py-3 px-4">{m.email}</td>
                        <td className="py-3 px-4">{m.lantai || "-"}</td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => openEditModal(m)}
                            className="text-blue-600 hover:underline mr-3"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(m)}
                            className="text-red-600 hover:underline"
                          >
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
            Menampilkan {filtered.length} dari {musyrifList.length} musyrif
          </div>
        </main>
      </div>

      {/* Modal Add/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">
              {modalMode === "add" ? "Tambah Musyrif" : "Edit Musyrif"}
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Password {modalMode === "add" && <span className="text-red-500">*</span>}
                  {modalMode === "edit" && (
                    <span className="text-xs text-gray-500"> (kosongkan jika tidak diubah)</span>
                  )}
                </label>
                <input
                  type="password"
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lantai</label>
                <select
                  value={formLantaiId || ""}
                  onChange={(e) => setFormLantaiId(Number(e.target.value) || null)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Pilih Lantai</option>
                  {lantaiList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.nama}{l.gedung ? ` - ${l.gedung}` : ""}
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
