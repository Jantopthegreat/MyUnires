"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { FaPlus, FaSearch } from "react-icons/fa";
import Swal from "sweetalert2";
import { useRouter } from "next/navigation";

import AdminSidebar from "@/components/adminSidebar";
import { useAuth } from "@/lib/useAuth";
import { apiDelete, apiGet, apiPost, apiPut, clearAuth, getUser } from "@/lib/api";

const ALLOWED_ROLES = ["ADMIN"];

const GEDUNG_URL = "/api/admin/gedung";
const LANTAI_URL = "/api/admin/lantai";
const USROH_URL = "/api/admin/usroh";

type Gedung = { id: number; nama: string };
type Lantai = { id: number; nama: string; gedung?: string; gedungId?: number; createdAt?: string };

// Sesuai backend kamu: lantai & gedung sudah string
type UsrohRow = {
  id: number;
  nama: string;
  lantai: string; // "Lantai 1"
  gedung: string; // "Gedung Putra"
  createdAt: string;
};

export default function AdminAsramaPage() {
  const router = useRouter();
  const { user } = useAuth(ALLOWED_ROLES);

  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [gedung, setGedung] = useState<Gedung[]>([]);
  const [lantai, setLantai] = useState<Lantai[]>([]);
  const [rows, setRows] = useState<UsrohRow[]>([]);
  const [loading, setLoading] = useState(true);

  // search + filters
  const [searchTerm, setSearchTerm] = useState("");
  const [filterGedung, setFilterGedung] = useState<string>("all"); // pakai nama gedung
  const [filterLantai, setFilterLantai] = useState<string>("all"); // pakai nama lantai
  const [filterUsrohId, setFilterUsrohId] = useState<string>("all"); // pakai id usroh

  // modal add/edit (usroh)
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selected, setSelected] = useState<UsrohRow | null>(null);

  // form
  const [formNama, setFormNama] = useState("");
  const [formLantaiId, setFormLantaiId] = useState<string>(""); // create/update usroh butuh lantaiId (number)

  const didFetch = useRef(false);

  useEffect(() => setUserData(getUser()), []);

  useEffect(() => {
    if (!user) return;
    if (didFetch.current) return;
    didFetch.current = true;
    fetchAll();
  }, [user]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [resG, resL, resU] = await Promise.all([
        apiGet<any>(GEDUNG_URL),
        apiGet<any>(LANTAI_URL),
        apiGet<any>(USROH_URL),
      ]);

      setGedung(Array.isArray(resG.data) ? resG.data : []);
      setLantai(Array.isArray(resL.data) ? resL.data : []);
      setRows(Array.isArray(resU.data) ? resU.data : []);
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Error", text: e?.message || "Gagal memuat data asrama." });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  // opsi filter (pakai string dari rows, biar pasti match)
  const gedungOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.gedung && r.gedung !== "-" && set.add(r.gedung));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const lantaiOptions = useMemo(() => {
    const set = new Set<string>();
    rows.forEach((r) => r.lantai && r.lantai !== "-" && set.add(r.lantai));
    return ["all", ...Array.from(set)];
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = [...rows];

    if (filterGedung !== "all") result = result.filter((r) => r.gedung === filterGedung);
    if (filterLantai !== "all") result = result.filter((r) => r.lantai === filterLantai);
    if (filterUsrohId !== "all") result = result.filter((r) => String(r.id) === filterUsrohId);

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      result = result.filter((r) => {
        return (
          (r.gedung || "").toLowerCase().includes(q) ||
          (r.lantai || "").toLowerCase().includes(q) ||
          (r.nama || "").toLowerCase().includes(q)
        );
      });
    }

    return result;
  }, [rows, filterGedung, filterLantai, filterUsrohId, searchTerm]);

  // modal handlers
  const openAddModal = () => {
    setModalMode("add");
    setSelected(null);
    setFormNama("");
    setFormLantaiId("");
    setShowModal(true);
  };

  const openEditModal = (r: UsrohRow) => {
    setModalMode("edit");
    setSelected(r);
    setFormNama(r.nama || "");
    // lantaiId nggak ada di row karena backend flatten; user pilih ulang saat edit
    setFormLantaiId("");
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formNama.trim() || !formLantaiId) {
      Swal.fire({ icon: "error", title: "Validasi", text: "Nama usroh dan lantai wajib diisi." });
      return;
    }

    const payload = { nama: formNama.trim(), lantaiId: Number(formLantaiId) };

    try {
      if (modalMode === "add") {
        await apiPost<any>(USROH_URL, payload);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Usroh ditambahkan.", timer: 1200 });
      } else if (selected) {
        await apiPut<any>(`${USROH_URL}/${selected.id}`, payload);
        Swal.fire({ icon: "success", title: "Berhasil!", text: "Usroh diupdate.", timer: 1200 });
      }
      setShowModal(false);
      fetchAll();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Gagal", text: e?.message || "Terjadi kesalahan." });
    }
  };

  const handleDelete = async (r: UsrohRow) => {
    const confirm = await Swal.fire({
      title: "Hapus Usroh?",
      text: `Yakin ingin menghapus "${r.nama}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await apiDelete<any>(`${USROH_URL}/${r.id}`);
      Swal.fire({ icon: "success", title: "Terhapus!", text: "Usroh berhasil dihapus.", timer: 1200 });
      fetchAll();
    } catch (e: any) {
      Swal.fire({ icon: "error", title: "Error", text: e?.message || "Gagal menghapus usroh." });
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
            Kelola Asrama
          </div>

          {/* Search + actions */}
          <div className="mt-6 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  type="text"
                  placeholder="Cari Data"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 pr-3 py-2 border rounded-lg text-sm w-64"
                />
              </div>

              {/* Import Data (opsional) */}
              {/* <button className="px-4 py-2 border rounded-lg text-sm hover:bg-gray-50">Import Data</button> */}
            </div>

            <button
              onClick={openAddModal}
              className="bg-[#16a34a] hover:bg-[#15803d] text-white px-5 py-2 rounded-full flex items-center shadow-sm transition font-semibold text-sm"
            >
              <FaPlus className="mr-2" /> Add Data
            </button>
          </div>

          {/* Filters */}
          <div className="mt-4 flex flex-wrap gap-3">
            <select
              value={filterGedung}
              onChange={(e) => setFilterGedung(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Gedung (All)</option>
              {gedungOptions
                .filter((x) => x !== "all")
                .map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
            </select>

            <select
              value={filterLantai}
              onChange={(e) => setFilterLantai(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Lantai (All)</option>
              {lantaiOptions
                .filter((x) => x !== "all")
                .map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
            </select>

            <select
              value={filterUsrohId}
              onChange={(e) => setFilterUsrohId(e.target.value)}
              className="px-3 py-2 border rounded-lg text-sm"
            >
              <option value="all">Usroh (All)</option>
              {rows.map((r) => (
                <option key={r.id} value={String(r.id)}>
                  {r.nama}
                </option>
              ))}
            </select>
          </div>

          {/* Table */}
          <section className="mt-6 bg-white rounded-2xl shadow-sm border overflow-hidden">
            {loading && rows.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Memuat data...</div>
            ) : filteredRows.length === 0 ? (
              <div className="text-center py-10 text-gray-500">Tidak ada data</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="py-3 px-4 text-left">No</th>
                      <th className="py-3 px-4 text-left">Gedung</th>
                      <th className="py-3 px-4 text-left">Lantai</th>
                      <th className="py-3 px-4 text-left">Usroh</th>
                      <th className="py-3 px-4 text-center">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRows.map((r, i) => (
                      <tr key={r.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{i + 1}</td>
                        <td className="py-3 px-4">{r.gedung || "-"}</td>
                        <td className="py-3 px-4">{r.lantai || "-"}</td>
                        <td className="py-3 px-4">{r.nama}</td>
                        <td className="py-3 px-4 text-center">
                          <button onClick={() => openEditModal(r)} className="text-blue-600 hover:underline mr-3">
                            Edit
                          </button>
                          <button onClick={() => handleDelete(r)} className="text-red-600 hover:underline">
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
            Menampilkan {filteredRows.length} dari {rows.length} data usroh
          </div>
        </main>
      </div>

      {/* Modal Add/Edit Usroh */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto">
            <h2 className="text-lg font-semibold mb-4">{modalMode === "add" ? "Tambah Usroh" : "Edit Usroh"}</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Nama Usroh <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formNama}
                  onChange={(e) => setFormNama(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                  placeholder="Contoh: Abu Bakar Ash-Shiddiq"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Lantai <span className="text-red-500">*</span>
                </label>
                <select
                  value={formLantaiId}
                  onChange={(e) => setFormLantaiId(e.target.value)}
                  className="w-full border rounded-lg px-3 py-2 text-sm"
                >
                  <option value="">Pilih Lantai</option>
                  {lantai.map((l) => (
                    <option key={l.id} value={String(l.id)}>
                      {/* dari getAllLantai kamu sudah include nama gedung (string) [file:41] */}
                      {l.gedung ? `${l.gedung} - ${l.nama}` : l.nama}
                    </option>
                  ))}
                </select>
                {modalMode === "edit" && (
                  <div className="text-xs text-gray-500 mt-1">
                    Karena response usroh kamu sudah di-flatten, saat edit perlu pilih ulang lantai.
                  </div>
                )}
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
