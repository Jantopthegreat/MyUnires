"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import { useAuth } from "@/lib/useAuth";
import { getUser, clearAuth, apiGet, apiPost, apiPut, apiDelete, apiUpload} from "@/lib/api";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";
import AdminSidebar from "@/components/adminSidebar";

const ALLOWED_ROLES = ["ADMIN"];

// Type untuk list resident (sesuai response backend getAllResident)
type ResidentListItem = {
  id: number;
  name: string;
  email: string;
  nim: string;
  jurusan: string;
  angkatan: number;
  noTelp: string;
  usroh: string; // string nama usroh
  lantai: string;
  createdAt: string;
};

type Usroh = {
  id: number;
  nama: string;
};

export default function AdminResidentPage() {
  const router = useRouter();
  const { user } = useAuth(ALLOWED_ROLES);

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userData, setUserData] = useState<any>(null);

  // Data states
  const [residents, setResidents] = useState<ResidentListItem[]>([]);
  const [usrohList, setUsrohList] = useState<Usroh[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsroh, setSelectedUsroh] = useState("all");

  // Modal add/edit
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedResident, setSelectedResident] = useState<ResidentListItem | null>(null);

  // Modal detail
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [detailResident, setDetailResident] = useState<ResidentListItem | null>(null);

  // Modal import
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importLoading, setImportLoading] = useState(false);

  // Form states
  const [formName, setFormName] = useState("");
  const [formNim, setFormNim] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState(""); // hanya dipakai saat EDIT
  const [formJurusan, setFormJurusan] = useState("");
  const [formAngkatan, setFormAngkatan] = useState("");
  const [formNoTelp, setFormNoTelp] = useState("");
  const [formUsrohId, setFormUsrohId] = useState<number | null>(null);

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

  const filteredResidents = useMemo(() => {
    let result = [...residents];

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter(
        (r) =>
          (r.name || "").toLowerCase().includes(q) ||
          (r.nim || "").toLowerCase().includes(q) ||
          (r.email || "").toLowerCase().includes(q)
      );
    }

    if (selectedUsroh !== "all") {
      result = result.filter((r) => r.usroh === selectedUsroh);
    }

    return result;
  }, [residents, searchTerm, selectedUsroh]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [resResident, resUsroh] = await Promise.all([
        apiGet<any>("/api/admin/resident"),
        apiGet<any>("/api/admin/usroh"),
      ]);

      setResidents(Array.isArray(resResident.data) ? resResident.data : []);
      setUsrohList(Array.isArray(resUsroh.data) ? resUsroh.data : []);
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal memuat data resident." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  const openAddModal = () => {
    setModalMode("add");
    setSelectedResident(null);
    setFormName("");
    setFormNim("");
    setFormEmail("");
    setFormPassword(""); // reset aja
    setFormJurusan("");
    setFormAngkatan("");
    setFormNoTelp("");
    setFormUsrohId(null);
    setShowModal(true);
  };

  const openEditModal = (resident: ResidentListItem) => {
    setModalMode("edit");
    setSelectedResident(resident);

    setFormName(resident.name || "");
    setFormNim(resident.nim || "");
    setFormEmail(resident.email || "");
    setFormPassword(""); // kosongkan supaya opsional
    setFormJurusan(resident.jurusan || "");
    setFormAngkatan(String(resident.angkatan || ""));
    setFormNoTelp(resident.noTelp || "");

    const usrohMatch = usrohList.find((u) => u.nama === resident.usroh);
    setFormUsrohId(usrohMatch?.id || null);

    setShowModal(true);
  };

  const openDetailModal = (resident: ResidentListItem) => {
    setDetailResident(resident);
    setShowDetailModal(true);
  };

  const handleSave = async () => {
    if (!formName || !formNim || !formEmail || !formJurusan || !formAngkatan) {
      Swal.fire({
        icon: "error",
        title: "Validasi",
        text: "Nama, NIM, Email, Jurusan, dan Angkatan wajib diisi.",
      });
      return;
    }

    const payload: any = {
      name: formName,
      email: formEmail,
      nim: formNim,
      jurusan: formJurusan,
      angkatan: Number(formAngkatan),
      noTelp: formNoTelp || null,
      usrohId: formUsrohId || null,
      lantaiId: null,
    };

    // Password hanya boleh dikirim saat EDIT (opsional)
    if (modalMode === "edit" && formPassword) {
      payload.password = formPassword;
    }

    try {
      if (modalMode === "add") {
        await apiPost("/api/admin/resident", payload);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Resident ditambahkan.", timer: 2000 });
      } else if (selectedResident) {
        await apiPut(`/api/admin/resident/${selectedResident.id}`, payload);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Resident diupdate.", timer: 2000 });
      }

      setShowModal(false);
      fetchData();
    }  catch (err: any) {
  console.log("ERR", err?.response?.data);
  Swal.fire({
    icon: "error",
    title: "Gagal",
    text: err?.response?.data?.message || "Terjadi kesalahan.",
  });
}

  };

  const handleDelete = async (resident: ResidentListItem) => {
    const confirm = await Swal.fire({
      title: "Hapus Resident?",
      text: `Yakin ingin menghapus ${resident.name}?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await apiDelete(`/api/admin/resident/${resident.id}`);
      Swal.fire({ icon: "success", title: "Terhapus!", text: "Resident berhasil dihapus.", timer: 2000 });
      setShowDetailModal(false);
      setDetailResident(null);
      fetchData();
    } catch (err: any) {
      Swal.fire({ icon: "error", title: "Error", text: "Gagal menghapus resident." });
    }
  };

  const handleImportExcel = async () => {
  try {
    if (!importFile) {
      Swal.fire({ icon: "error", title: "Validasi", text: "Pilih file Excel dulu." });
      return;
    }

    setImportLoading(true);

    const fd = new FormData();
    fd.append("file", importFile); // harus sama dengan upload.single("file")

    const json = await apiUpload<any>("/api/admin/resident/import", fd);

    Swal.fire({ icon: "success", title: "Berhasil", text: json?.message || "Import berhasil", timer: 2000 });

    setShowImportModal(false);
    setImportFile(null);
    fetchData();
  } catch (err: any) {
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: err?.message || "Terjadi kesalahan.",
    });
  } finally {
    setImportLoading(false);
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
          <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm">
            Kelola Data Resident
          </div>

          {/* Filter bar + buttons */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari Resident"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64"
                />
              </div>

              <select
                value={selectedUsroh}
                onChange={(e) => setSelectedUsroh(e.target.value)}
                className="px-3 py-2 border rounded-lg text-sm"
              >
                <option value="all">Usroh (All)</option>
                {usrohList.map((u) => (
                  <option key={u.id} value={u.nama}>
                    {u.nama}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setShowImportModal(true)}
                className="bg-white border hover:bg-gray-50 text-gray-800 px-5 py-2 rounded-full shadow-sm transition font-semibold text-sm"
              >
                Import Excel
              </button>

              <button
                onClick={openAddModal}
                className="bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2 rounded-full flex items-center shadow-sm transition font-semibold text-sm"
              >
                <FaPlus className="mr-2" /> Add Resident
              </button>
            </div>
          </div>

          {/* Table */}
          <section className="mt-6 bg-white rounded-2xl shadow-sm border overflow-hidden">
            {loading && residents.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Memuat data...</div>
            ) : filteredResidents.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Tidak ada data resident</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3 px-4 text-left">No</th>
                      <th className="py-3 px-4 text-left">Nama</th>
                      <th className="py-3 px-4 text-left">NIM</th>
                      <th className="py-3 px-4 text-left">Usroh</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredResidents.map((r, i) => (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{i + 1}</td>
                        <td className="py-3 px-4">{r.name}</td>
                        <td className="py-3 px-4">{r.nim}</td>
                        <td className="py-3 px-4">{r.usroh || "-"}</td>

                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-4">
                            <button
                              onClick={() => openDetailModal(r)}
                              className="hover:opacity-80"
                              title="Detail"
                            >
                              <img src="/eye_icon.svg" alt="Detail" className="w-5 h-5" />
                            </button>

                            <button onClick={() => openEditModal(r)} className="text-blue-600 hover:underline">
                              Edit
                            </button>

                            <button onClick={() => handleDelete(r)} className="text-red-600 hover:underline">
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
            Menampilkan {filteredResidents.length} dari {residents.length} resident
          </div>
        </main>
      </div>

      {/* Modal Import Excel */}
      {showImportModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold mb-2">Import Resident (Excel)</h2>
            <p className="text-xs text-gray-500 mb-4">
              Kolom wajib: name, email, nim, jurusan, angkatan.
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

      {/* Modal Detail */}
      {showDetailModal && detailResident && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Detail Resident</h2>
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  setDetailResident(null);
                }}
                className="text-sm text-gray-600 hover:underline"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-500">Nama</div>
                <div className="font-medium">{detailResident.name || "-"}</div>
              </div>

              <div>
                <div className="text-gray-500">Email</div>
                <div className="font-medium">{detailResident.email || "-"}</div>
              </div>

              <div>
                <div className="text-gray-500">NIM</div>
                <div className="font-medium">{detailResident.nim || "-"}</div>
              </div>

              <div>
                <div className="text-gray-500">Jurusan</div>
                <div className="font-medium">{detailResident.jurusan || "-"}</div>
              </div>

              <div>
                <div className="text-gray-500">Angkatan</div>
                <div className="font-medium">{detailResident.angkatan || "-"}</div>
              </div>

              <div>
                <div className="text-gray-500">No Telp</div>
                <div className="font-medium">{detailResident.noTelp || "-"}</div>
              </div>

              <div>
                <div className="text-gray-500">Usroh</div>
                <div className="font-medium">{detailResident.usroh || "-"}</div>
              </div>

              <div>
                <div className="text-gray-500">Lantai</div>
                <div className="font-medium">{detailResident.lantai || "-"}</div>
              </div>

              <div className="col-span-2">
                <div className="text-gray-500">Created At</div>
                <div className="font-medium">{detailResident.createdAt || "-"}</div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDetailModal(false);
                  openEditModal(detailResident);
                }}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-blue-700 border-blue-200"
              >
                Edit
              </button>

              <button
                onClick={() => handleDelete(detailResident)}
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
            <h2 className="text-lg font-semibold mb-4">{modalMode === "add" ? "Tambah Resident" : "Edit Resident"}</h2>

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

              {/* Password: hanya saat EDIT */}
              {modalMode === "edit" ? (
                <div>
                  <label className="block text-sm font-medium mb-1">
                    Password <span className="text-xs text-gray-500">(kosongkan jika tidak diubah)</span>
                  </label>
                  <input
                    type="password"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full border rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              ) : (
                <div className="text-xs text-gray-500 border rounded-lg px-3 py-2 bg-gray-50">
                  Password akan dibuat oleh resident saat aktivasi akun melalui email.
                </div>
              )}

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
                <label className="block text-sm font-medium mb-1">No Telp</label>
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
                  onChange={(e) => setFormUsrohId(Number(e.target.value) || null)}
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
