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
  apiUpload,
} from "@/lib/api";

import AdminSidebar from "@/components/adminSidebar";

const ALLOWED_ROLES = ["ADMIN"];

type AsistenListItem = {
  id: number;
  name: string;
  email: string;
  usroh: string; // nama usroh atau "-"
  createdAt: string;
};

type Usroh = {
  id: number;
  nama: string;
  lantai?: string; // kalau backend kamu return
  createdAt?: string;
};

export default function AdminAsistenPage() {
  const router = useRouter();
  const { user } = useAuth(ALLOWED_ROLES);

  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [asistenList, setAsistenList] = useState<AsistenListItem[]>([]);
  const [usrohList, setUsrohList] = useState<Usroh[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  // filter
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsroh, setSelectedUsroh] = useState("all"); // value: nama usroh

  // modal
  // Modal detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailAsisten, setDetailAsisten] = useState<AsistenListItem | null>(
    null
  );

  const openDetailModal = (a: AsistenListItem) => {
    setDetailAsisten(a);
    setShowDetailModal(true);
  };

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedAsisten, setSelectedAsisten] =
    useState<AsistenListItem | null>(null);

  // form (sesuai createAsistenMusyrif: name, nim, email, password, usrohId) [file:41]
  const [formName, setFormName] = useState("");
  const [formNim, setFormNim] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formJurusan, setFormJurusan] = useState("");
  const [formAngkatan, setFormAngkatan] = useState("");
  const [formNoTelp, setFormNoTelp] = useState("");
  const [formUsrohId, setFormUsrohId] = useState<number | null>(null);

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
      const [resAsisten, resUsroh] = await Promise.all([
        apiGet<any>("/api/admin/asisten"),
        apiGet<any>("/api/admin/usroh"),
      ]);

      setAsistenList(Array.isArray(resAsisten.data) ? resAsisten.data : []);
      setUsrohList(Array.isArray(resUsroh.data) ? resUsroh.data : []);
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal memuat data asisten musyrif.",
      });
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    let result = [...asistenList];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (a) =>
          (a.name || "").toLowerCase().includes(q) ||
          (a.email || "").toLowerCase().includes(q)
      );
    }

    if (selectedUsroh !== "all") {
      result = result.filter((a) => (a.usroh || "-") === selectedUsroh);
    }

    return result;
  }, [asistenList, searchTerm, selectedUsroh]);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedAsisten(null);
    setFormName("");
    setFormNim("");
    setFormEmail("");
    setFormJurusan("");
    setFormAngkatan("");
    setFormNoTelp("");
    setFormUsrohId(null);
    setShowModal(true);
  };

  const openEditModal = async (a: AsistenListItem) => {
    setModalMode("edit");
    setSelectedAsisten(a);
    setFormName(a.name || "");
    setFormEmail(a.email || "");
    setFormNim("");

    const match = usrohList.find((u) => u.nama === a.usroh);
    setFormUsrohId(match?.id ?? null);

    setShowModal(true);
  };

  const handleImportExcel = async () => {
    try {
      if (!importFile) {
        Swal.fire({
          icon: "error",
          title: "Validasi",
          text: "Pilih file Excel dulu.",
        });
        return;
      }

      setImportLoading(true);
      const fd = new FormData();
      fd.append("file", importFile);

      const res = await apiUpload<any>("/api/admin/asisten/import", fd);

      const created = res?.created ?? res?.data?.created ?? [];
      const emailFailed = res?.emailFailed ?? res?.data?.emailFailed ?? [];
      const skipped = res?.skipped ?? res?.data?.skipped ?? [];

      Swal.fire({
        icon: "success",
        title: "Import selesai",
        html: `
        <div style="text-align:left;font-size:13px">
          <div><b>Created:</b> ${created.length}</div>
          <div><b>Email failed:</b> ${emailFailed.length}</div>
          <div><b>Skipped:</b> ${skipped.length}</div>
          <hr/>
          ${
            emailFailed.length
              ? `<div><b>Email gagal:</b><br/>${emailFailed
                  .slice(0, 10)
                  .map((x: any) => `- ${x.email}`)
                  .join("<br/>")}</div>`
              : ""
          }
          ${
            skipped.length
              ? `<div style="margin-top:8px"><b>Skipped:</b><br/>${skipped
                  .slice(0, 10)
                  .map((x: any) => `- row ${x.row}: ${x.reason}`)
                  .join("<br/>")}</div>`
              : ""
          }
          ${
            emailFailed.length > 10 || skipped.length > 10
              ? `<div style="margin-top:8px;color:#666">Menampilkan maksimal 10 item.</div>`
              : ""
          }
        </div>
      `,
      });

      setShowImportModal(false);
      setImportFile(null);
      fetchData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err?.response?.data?.message || err?.message || "Terjadi kesalahan.",
      });
    } finally {
      setImportLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formName || !formEmail || !formNim || !formJurusan || !formAngkatan) {
      Swal.fire({
        icon: "error",
        title: "Validasi",
        text: "Nama, NIM, Email, Jurusan, dan Angkatan wajib diisi.",
      });
      return;
    }

    const payload: any = {
      name: formName,
      nim: formNim,
      email: formEmail,
      jurusan: formJurusan,
      angkatan: Number(formAngkatan),
      noTelp: formNoTelp ? formNoTelp : null,
      usrohId: formUsrohId || null,
    };

    try {
      if (modalMode === "add") {
        await apiPost("/api/admin/asisten", payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Asisten dibuat. Link aktivasi dikirim ke email.",
          timer: 2000,
        });
      } else if (selectedAsisten) {
        await apiPut(`/api/admin/asisten/${selectedAsisten.id}`, payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Asisten diupdate.",
          timer: 1800,
        });
      }

      setShowModal(false);
      fetchData();
    } catch (err: any) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text:
          err?.response?.data?.message || err?.message || "Terjadi kesalahan.",
      });
    }
  };

  const handleDelete = async (a: AsistenListItem) => {
    const confirm = await Swal.fire({
      title: "Hapus Asisten?",
      text: `Yakin ingin menghapus ${a.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (confirm.isConfirmed) {
      try {
        await apiDelete(`/api/admin/asisten/${a.id}`);
        Swal.fire({
          icon: "success",
          title: "Terhapus!",
          text: "Asisten berhasil dihapus.",
          timer: 1800,
        });
        fetchData();
      } catch (err) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Gagal menghapus asisten.",
        });
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
            Kelola Data Asisten Musyrif
          </div>

          <div className="mt-6 flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-stretch">
            {/* KIRI: search + filter */}
            <div className="flex items-center gap-3 max-sm:w-full max-sm:flex-col max-sm:items-stretch">
              <div className="relative max-sm:w-full">
                <FaSearch
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  size={14}
                />
                <input
                  type="text"
                  placeholder="Cari Asisten"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64 max-sm:w-full"
                />
              </div>

              <select
                value={selectedUsroh}
                onChange={(e) => setSelectedUsroh(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm max-sm:w-full"
              >
                <option value="all">Usroh (All)</option>
                {usrohList.map((u) => (
                  <option key={u.id} value={u.nama}>
                    {u.nama}
                  </option>
                ))}
              </select>
            </div>

            {/* KANAN: tombol add */}
            <div className="flex items-center gap-3 max-sm:w-full max-sm:justify-end">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-white border hover:bg-gray-50 text-gray-800 px-5 py-2 rounded-full shadow-sm transition font-semibold text-sm max-sm:px-3 max-sm:text-xs"
              >
                Import Asisten
              </button>

              <button
                onClick={openAddModal}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2 rounded-full flex items-center shadow-sm transition font-semibold text-sm max-sm:px-3 max-sm:text-xs"
              >
                <FaPlus className="mr-2" /> Add Asisten
              </button>
            </div>
          </div>

          {/* Table */}
          <section className="mt-6 bg-white rounded-2xl shadow-sm border overflow-hidden">
            {loading && asistenList.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Memuat data...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                Tidak ada data asisten
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3 px-4 text-left">No</th>
                      <th className="py-3 px-4 text-left">Nama</th>
                      <th className="py-3 px-4 text-left">Email</th>
                      <th className="py-3 px-4 text-left">Usroh</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((a, i) => (
                      <tr key={a.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{i + 1}</td>
                        <td className="py-3 px-4">{a.name}</td>
                        <td className="py-3 px-4">{a.email}</td>
                        <td className="py-3 px-4">{a.usroh || "-"}</td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2">
                            <button
                              onClick={() => openDetailModal(a)}
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
                              onClick={() => openEditModal(a)}
                              className="text-blue-600 hover:underline"
                            >
                              Edit
                            </button>

                            <button
                              onClick={() => handleDelete(a)}
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
            Menampilkan {filtered.length} dari {asistenList.length} asisten
          </div>
        </main>
      </div>

      {showDetailModal && detailAsisten && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Detail Asisten Musyrif</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailAsisten(null);
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Nama</div>
                <div className="font-medium wrap-anywhere">
                  {detailAsisten.name || "-"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium break-all">
                  {detailAsisten.email || "-"}
                </div>
              </div>

              <div>
                <div className="text-gray-500">Usroh</div>
                <div className="font-medium wrap-anywhere">
                  {detailAsisten.usroh || "-"}
                </div>
              </div>

              <div className="col-span-2">
                <div className="text-gray-500">Created At</div>
                <div className="font-medium wrap-anywhere">
                  {detailAsisten.createdAt || "-"}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(detailAsisten);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-blue-700 border-blue-200"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(detailAsisten)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-[60] p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-2">
              Import Asisten (Excel)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Upload file .xlsx / .xls sesuai template.
            </p>

            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={(e) => setImportFile(e.target.files?.[0] || null)}
              className="w-full text-sm"
            />

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportFile(null);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                disabled={importLoading}
              >
                Batal
              </button>

              <button
                onClick={handleImportExcel}
                className="px-4 py-2 bg-[#004220] text-white rounded-lg hover:bg-[#003318] disabled:opacity-60"
                disabled={importLoading}
              >
                {importLoading ? "Uploading..." : "Upload"}
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
                ? "Tambah Asisten Musyrif"
                : "Edit Asisten Musyrif"}
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
                  NIM <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNim}
                  onChange={(e) => setFormNim(e.target.value)}
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
                  Jurusan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formJurusan}
                  onChange={(e) => setFormJurusan(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Angkatan <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  value={formAngkatan}
                  onChange={(e) => setFormAngkatan(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  No. Telp
                </label>
                <input
                  type="text"
                  value={formNoTelp}
                  onChange={(e) => setFormNoTelp(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Usroh</label>
                <select
                  value={formUsrohId || ""}
                  onChange={(e) =>
                    setFormUsrohId(Number(e.target.value) || null)
                  }
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Pilih Usroh</option>
                  {usrohList.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nama}
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

            {modalMode === "edit" ? (
              <p className="mt-3 text-[11px] text-gray-500">
                Catatan: NIM tidak muncul di list backend saat ini, jadi saat
                edit perlu diisi ulang (atau backend diperbaiki agar mengirim
                field NIM).{" "}
              </p>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
