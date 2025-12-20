"use client";

import { useState, useEffect } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import Swal from "sweetalert2";

import Sidebar_AsistenMusyrif from "@/components/sidebar_asistenMusyrif";
import CustomSelect from "@/components/CustomSelect";

import { apiGet, apiPost, apiPut, apiUpload, apiDelete } from "@/lib/api";

interface AssignmentData {
  id: number;
  materiId: number;
  judul: string;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawabanBenar: string;
  soalImageUrl?: string | null;
  materi?: {
    id: number;
    judul: string;
    kategori?: { id: number; nama: string };
  };
}

interface KategoriOption {
  id: number;
  nama: string;
}

interface MateriOption {
  id: number;
  judul: string;
  kategoriId: number;
}

interface FormData {
  materiId: string;
  judul: string;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawabanBenar: string;
  soalImageUrl?: string | null;
}

export default function BuatAssignmentPage() {
  // sidebar states
  const [isOpen, setIsOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // data states
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<
    AssignmentData[]
  >([]);
  const [kategoriList, setKategoriList] = useState<KategoriOption[]>([]);
  const [materiList, setMateriList] = useState<MateriOption[]>([]);
  const [filteredMateriListFilterBar, setFilteredMateriListFilterBar] =
    useState<MateriOption[]>([]);
  const [filteredMateriList, setFilteredMateriList] = useState<MateriOption[]>(
    []
  );

  // filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategoriFilter, setSelectedKategoriFilter] =
    useState<string>("Kategori All");
  const [selectedMateriFilter, setSelectedMateriFilter] =
    useState<string>("Materi All");

  // modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // selection
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentData | null>(null);

  // form states
  const [formData, setFormData] = useState<FormData>({
    materiId: "",
    judul: "",
    pertanyaan: "",
    opsiA: "",
    opsiB: "",
    opsiC: "",
    opsiD: "",
    jawabanBenar: "A",
    soalImageUrl: undefined,
  });

  const [selectedKategoriForm, setSelectedKategoriForm] = useState<string>("");
  const [soalImageFile, setSoalImageFile] = useState<File | null>(null);
  const [soalImagePreview, setSoalImagePreview] = useState<string | null>(null);

  // initial fetch
  useEffect(() => {
    fetchKategori();
    fetchMateri();
    fetchAssignments();
  }, []);

  // filter materi by kategori (form)
  useEffect(() => {
    if (!selectedKategoriForm) {
      setFilteredMateriList(materiList);
      return;
    }
    const filtered = materiList.filter(
      (m) => m.kategoriId === Number(selectedKategoriForm)
    );
    setFilteredMateriList(filtered);
  }, [selectedKategoriForm, materiList]);

  // filter materi by kategori (filter bar)
  useEffect(() => {
    if (!selectedKategoriFilter || selectedKategoriFilter === "Kategori All") {
      setFilteredMateriListFilterBar(materiList);
      return;
    }
    const filtered = materiList.filter(
      (m) => m.kategoriId === Number(selectedKategoriFilter)
    );
    setFilteredMateriListFilterBar(filtered);
  }, [selectedKategoriFilter, materiList]);

  // filter assignments by search + kategori + materi
  useEffect(() => {
    let filtered = [...assignments];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.judul?.toLowerCase().includes(q) ||
          a.pertanyaan?.toLowerCase().includes(q) ||
          a.materi?.judul?.toLowerCase().includes(q) ||
          a.materi?.kategori?.nama?.toLowerCase().includes(q)
      );
    }

    if (selectedKategoriFilter && selectedKategoriFilter !== "Kategori All") {
      filtered = filtered.filter(
        (a) => String(a.materi?.kategori?.id) === String(selectedKategoriFilter)
      );
    }

    if (selectedMateriFilter && selectedMateriFilter !== "Materi All") {
      filtered = filtered.filter(
        (a) => String(a.materi?.id) === String(selectedMateriFilter)
      );
    }

    setFilteredAssignments(filtered);
  }, [searchQuery, selectedKategoriFilter, selectedMateriFilter, assignments]);

  const fetchAssignments = async () => {
    try {
      const res = await apiGet<any>("/api/asisten/assignments");
      const data = res?.data ?? res ?? [];
      setAssignments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching assignments:", error);
      setAssignments([]);
    }
  };

  const fetchKategori = async () => {
    try {
      const res = await apiGet<any>("/api/asisten/kategori");
      const data = res?.data ?? res ?? [];
      setKategoriList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching kategori:", error);
      setKategoriList([]);
    }
  };

  const fetchMateri = async () => {
    try {
      const res = await apiGet<any>("/api/asisten/materi");
      const data = res?.data ?? res ?? [];

      const materiWithNumberKategoriId: MateriOption[] = Array.isArray(data)
        ? data.map((m: any) => ({ ...m, kategoriId: Number(m.kategoriId) }))
        : [];

      setMateriList(materiWithNumberKategoriId);
    } catch (error) {
      console.error("Error fetching materi:", error);
      setMateriList([]);
    }
  };

  const resetForm = () => {
    setFormData({
      materiId: "",
      judul: "",
      pertanyaan: "",
      opsiA: "",
      opsiB: "",
      opsiC: "",
      opsiD: "",
      jawabanBenar: "A",
      soalImageUrl: undefined,
    });
    setSelectedKategoriForm("");
    setSoalImageFile(null);
    setSoalImagePreview(null);
  };

  const handleView = (assignment: AssignmentData) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const handleEdit = (assignment: AssignmentData) => {
    setSelectedAssignment(assignment);

    setFormData({
      materiId: String(assignment.materiId),
      judul: assignment.judul,
      pertanyaan: assignment.pertanyaan,
      opsiA: assignment.opsiA,
      opsiB: assignment.opsiB,
      opsiC: assignment.opsiC,
      opsiD: assignment.opsiD,
      jawabanBenar: assignment.jawabanBenar || "A",
      soalImageUrl: assignment.soalImageUrl ?? undefined,
    });

    if (assignment.materi?.kategori?.id) {
      setSelectedKategoriForm(String(assignment.materi.kategori.id));
    } else {
      setSelectedKategoriForm("");
    }

    setSoalImageFile(null);
    setSoalImagePreview(assignment.soalImageUrl || null);

    setShowEditModal(true);
  };

  const handleDelete = (assignment: AssignmentData) => {
    setSelectedAssignment(assignment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAssignment) return;

    try {
      await apiDelete(`/api/asisten/assignments/${selectedAssignment.id}`);

      Swal.fire({
        icon: "success",
        title: "Assignment berhasil dihapus",
        showConfirmButton: true,
        confirmButtonColor: "#22c55e",
        confirmButtonText: "OK",
        timer: 2500,
      });

      fetchAssignments();
      setShowDeleteModal(false);
      setSelectedAssignment(null);
    } catch (error) {
      console.error("Error deleting assignment:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal menghapus assignment",
        text: "Terjadi kesalahan saat menghapus data.",
      });
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSoalImageFile(file);
    setSoalImagePreview(URL.createObjectURL(file));
  };

  const removeImageSelection = () => {
    setSoalImageFile(null);
    setSoalImagePreview(null);
    setFormData((prev) => ({ ...prev, soalImageUrl: undefined }));
  };

  const uploadImage = async (): Promise<string | undefined> => {
    if (!soalImageFile) return formData.soalImageUrl ?? undefined;

    const fd = new FormData();
    fd.append("file", soalImageFile);

    const uploadResult = await apiUpload<{ success: boolean; url: string }>(
      "/api/asisten/assignments/upload",
      fd
    );

    return uploadResult?.url;
  };

  const handleSubmitAdd = async () => {
    if (
      !formData.materiId ||
      !formData.judul ||
      !formData.pertanyaan ||
      !formData.opsiA ||
      !formData.opsiB ||
      !formData.opsiC ||
      !formData.opsiD
    ) {
      Swal.fire({
        icon: "error",
        title: "Validasi gagal",
        text: "Semua field harus diisi, termasuk Kategori dan Materi!",
      });
      return;
    }

    try {
      const uploadedImageUrl = await uploadImage();

      await apiPost("/api/asisten/assignments", {
        materiId: Number(formData.materiId),
        judul: formData.judul,
        pertanyaan: formData.pertanyaan,
        opsiA: formData.opsiA,
        opsiB: formData.opsiB,
        opsiC: formData.opsiC,
        opsiD: formData.opsiD,
        jawabanBenar: formData.jawabanBenar,
        soalImageUrl: uploadedImageUrl,
      });

      Swal.fire({
        icon: "success",
        title: "Assignment berhasil ditambahkan",
        confirmButtonColor: "#22c55e",
        timer: 2000,
      });

      fetchAssignments();
      setShowAddModal(false);
      resetForm();
    } catch (error: any) {
      console.error("Error saving assignment:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal menyimpan assignment",
        text: error?.message || "Terjadi kesalahan saat menyimpan data.",
      });
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedAssignment) return;

    if (
      !formData.materiId ||
      !formData.judul ||
      !formData.pertanyaan ||
      !formData.opsiA ||
      !formData.opsiB ||
      !formData.opsiC ||
      !formData.opsiD
    ) {
      Swal.fire({
        icon: "error",
        title: "Validasi gagal",
        text: "Semua field harus diisi, termasuk Kategori dan Materi!",
      });
      return;
    }

    try {
      const uploadedImageUrl = await uploadImage();

      await apiPut(`/api/asisten/assignments/${selectedAssignment.id}`, {
        materiId: Number(formData.materiId),
        judul: formData.judul,
        pertanyaan: formData.pertanyaan,
        opsiA: formData.opsiA,
        opsiB: formData.opsiB,
        opsiC: formData.opsiC,
        opsiD: formData.opsiD,
        jawabanBenar: formData.jawabanBenar,
        soalImageUrl: uploadedImageUrl,
      });

      Swal.fire({
        icon: "success",
        title: "Assignment berhasil diupdate",
        confirmButtonColor: "#22c55e",
        timer: 2000,
      });

      fetchAssignments();
      setShowEditModal(false);
      setSelectedAssignment(null);
      resetForm();
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal mengupdate assignment",
        text: error?.message || "Terjadi kesalahan saat update data.",
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* HEADER (tanpa logout) */}
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-4 sm:px-6 border-b">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
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
              Buat Assignment
            </h1>
          </header>

          {/* FILTER BAR */}
          <section className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3">
              <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 shadow-sm bg-white w-full sm:w-[280px]">
                <FaSearch className="text-gray-400 mr-2" />
                <input
                  type="text"
                  placeholder="Cari Assignment"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="outline-none text-sm w-full bg-transparent"
                />
              </div>

              <CustomSelect
                iconSrc="/filtericon.svg"
                options={["Kategori All", ...kategoriList.map((k) => k.nama)]}
                value={selectedKategoriFilter}
                onChange={(value: string) => {
                  setSelectedKategoriFilter(value);
                  setSelectedMateriFilter("Materi All");
                }}
              />

              <CustomSelect
                iconSrc="/filtericon.svg"
                options={[
                  "Materi All",
                  ...filteredMateriListFilterBar.map((m) => m.judul),
                ]}
                value={selectedMateriFilter}
                onChange={(value: string) => setSelectedMateriFilter(value)}
              />
            </div>

            <button
              onClick={() => {
                resetForm();
                setShowAddModal(true);
              }}
              className="w-full sm:w-auto flex items-center justify-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl hover:bg-emerald-700 transition font-semibold text-sm shadow-sm"
            >
              <span className="border-2 border-white rounded-full p-1.5 flex items-center justify-center">
                <FaPlus className="text-white text-xs" />
              </span>
              Add Assignment
            </button>
          </section>

          {/* TABLE */}
          <section className="pb-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-10 text-gray-500 text-sm">
                  {searchQuery
                    ? "Tidak ada assignment yang ditemukan"
                    : "Belum ada data assignment"}
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
                            Kategori
                          </th>
                          <th className="py-3 text-left px-4 bg-white whitespace-nowrap">
                            Materi
                          </th>
                          <th className="py-3 text-center px-4 bg-white whitespace-nowrap">
                            Aksi
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {filteredAssignments.map((assignment, i) => (
                          <tr
                            key={assignment.id}
                            className="text-[#004220] border-b border-gray-100 hover:bg-[#F7F9F8] transition"
                          >
                            <td className="py-3 px-4 whitespace-nowrap">
                              {i + 1}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {assignment.materi?.kategori?.nama || "-"}
                            </td>
                            <td className="py-3 px-4 whitespace-nowrap">
                              {assignment.materi?.judul || "-"}
                            </td>
                            <td className="py-3 px-4 text-center whitespace-nowrap">
                              <div className="flex items-center justify-center gap-3">
                                <img
                                  src="/eyeicon.svg"
                                  alt="view"
                                  className="h-5 w-5 cursor-pointer hover:opacity-70"
                                  onClick={() => handleView(assignment)}
                                />
                                <img
                                  src="/edit.svg"
                                  alt="edit"
                                  className="h-5 w-5 cursor-pointer hover:opacity-70"
                                  onClick={() => handleEdit(assignment)}
                                />
                                <img
                                  src="/delete.svg"
                                  alt="delete"
                                  className="h-5 w-5 cursor-pointer hover:opacity-70"
                                  onClick={() => handleDelete(assignment)}
                                />
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
              Menampilkan {filteredAssignments.length} dari {assignments.length}{" "}
              assignment
            </div>

            <div className="mt-4 text-xs text-gray-500">
              © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
            </div>
          </section>
        </div>
      </main>

      {/* ================= MODAL: VIEW ================= */}
      {showViewModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="bg-[#004220] px-6 sm:px-8 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Detail Assignment
                </h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAssignment(null);
                  }}
                  className="text-white hover:text-gray-200 transition"
                  aria-label="Close"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-180px)] space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                    Kategori
                  </label>
                  <p className="text-base font-semibold text-[#004220]">
                    {selectedAssignment.materi?.kategori?.nama || "-"}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                    Materi
                  </label>
                  <p className="text-base font-semibold text-[#004220]">
                    {selectedAssignment.materi?.judul || "-"}
                  </p>
                </div>
              </div>

              <div className="border-l-4 border-[#004220] bg-gray-50 px-5 py-4 rounded-xl">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                  Judul Assignment
                </label>
                <p className="text-gray-900 font-semibold text-base">
                  {selectedAssignment.judul}
                </p>
              </div>

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
                  Pertanyaan
                </label>
                <p className="text-gray-800 leading-relaxed">
                  {selectedAssignment.pertanyaan}
                </p>
              </div>

              {selectedAssignment.soalImageUrl ? (
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
                    Gambar Soal
                  </label>
                  <img
                    src={selectedAssignment.soalImageUrl}
                    alt="Soal"
                    className="max-w-full h-auto rounded-xl border border-gray-100"
                  />
                </div>
              ) : null}

              <div className="bg-white border border-gray-200 rounded-xl p-5">
                <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
                  Pilihan Jawaban
                </label>

                <div className="space-y-2">
                  {(["A", "B", "C", "D"] as const).map((option) => {
                    const isCorrect =
                      selectedAssignment.jawabanBenar === option;
                    const text = selectedAssignment[
                      `opsi${option}` as keyof AssignmentData
                    ] as string;

                    return (
                      <div
                        key={option}
                        className={[
                          "flex items-center p-3 rounded-xl border",
                          isCorrect
                            ? "bg-emerald-50 border-emerald-200"
                            : "bg-gray-50 border-gray-200",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "font-semibold text-sm mr-3 px-2 py-1 rounded-lg text-white",
                            isCorrect ? "bg-emerald-600" : "bg-gray-600",
                          ].join(" ")}
                        >
                          {option}
                        </span>

                        <span className="text-gray-800">{text}</span>

                        {isCorrect ? (
                          <span className="ml-auto text-emerald-700 font-semibold text-sm">
                            Jawaban Benar
                          </span>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAssignment(null);
                }}
                className="px-5 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-xl transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD ================= */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="bg-[#004220] px-6 sm:px-8 py-5 border-b border-gray-200">
              <h2 className="text-lg sm:text-xl font-semibold text-white">
                Tambah Assignment
              </h2>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-150px)]">
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kategori Assignment <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedKategoriForm}
                    onChange={(e) => setSelectedKategoriForm(e.target.value)}
                    className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                  >
                    <option value="">Pilih Kategori</option>
                    {kategoriList.map((k) => (
                      <option key={k.id} value={k.id}>
                        {k.nama}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Materi <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.materiId}
                    onChange={(e) =>
                      setFormData({ ...formData, materiId: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                    disabled={!selectedKategoriForm}
                  >
                    <option value="">Pilih Materi</option>
                    {filteredMateriList.length === 0 ? (
                      <option value="" disabled>
                        Tidak ada materi untuk kategori ini
                      </option>
                    ) : (
                      filteredMateriList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.judul}
                        </option>
                      ))
                    )}
                  </select>

                  {!selectedKategoriForm ? (
                    <p className="text-xs text-gray-500 mt-1">
                      Pilih kategori dulu untuk memunculkan materi.
                    </p>
                  ) : null}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Judul Assignment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan judul assignment"
                    value={formData.judul}
                    onChange={(e) =>
                      setFormData({ ...formData, judul: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Pertanyaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Masukkan pertanyaan"
                    value={formData.pertanyaan}
                    onChange={(e) =>
                      setFormData({ ...formData, pertanyaan: e.target.value })
                    }
                    rows={3}
                    className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Gambar Soal (opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="mt-1 w-full text-sm"
                  />

                  {soalImagePreview ? (
                    <div className="mt-2">
                      <img
                        src={soalImagePreview}
                        alt="Preview"
                        className="max-h-40 rounded-xl border border-gray-200"
                      />
                      <button
                        onClick={removeImageSelection}
                        className="mt-2 text-red-600 text-sm"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <div key={opt}>
                      <label className="block text-sm font-medium text-gray-700">
                        Opsi {opt} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder={`Opsi ${opt}`}
                        value={(formData as any)[`opsi${opt}`]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`opsi${opt}`]: e.target.value,
                          } as any)
                        }
                        className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                      />
                    </div>
                  ))}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Jawaban Benar <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.jawabanBenar}
                    onChange={(e) =>
                      setFormData({ ...formData, jawabanBenar: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-100"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitAdd}
                className="px-4 py-2 rounded-xl bg-[#004220] text-white hover:bg-[#003318]"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: EDIT ================= */}
      {showEditModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-gray-200">
            <div className="bg-[#004220] px-6 sm:px-8 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-lg sm:text-xl font-semibold text-white">
                  Edit Assignment
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAssignment(null);
                    resetForm();
                  }}
                  className="text-white hover:text-gray-200 transition"
                  aria-label="Close"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            <div className="p-6 sm:p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedKategoriForm}
                      onChange={(e) => setSelectedKategoriForm(e.target.value)}
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                    >
                      <option value="">Pilih Kategori</option>
                      {kategoriList.map((k) => (
                        <option key={k.id} value={k.id}>
                          {k.nama}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Materi <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.materiId}
                      onChange={(e) =>
                        setFormData({ ...formData, materiId: e.target.value })
                      }
                      className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                      disabled={!selectedKategoriForm}
                    >
                      <option value="">Pilih Materi</option>
                      {filteredMateriList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.judul}
                        </option>
                      ))}
                    </select>

                    {!selectedKategoriForm ? (
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih kategori terlebih dahulu.
                      </p>
                    ) : null}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Judul Assignment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.judul}
                    onChange={(e) =>
                      setFormData({ ...formData, judul: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pertanyaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={formData.pertanyaan}
                    onChange={(e) =>
                      setFormData({ ...formData, pertanyaan: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220] resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gambar Soal (opsional)
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm"
                  />

                  {soalImagePreview ? (
                    <div className="mt-2">
                      <img
                        src={soalImagePreview}
                        alt="Preview"
                        className="max-h-40 rounded-xl border border-gray-200"
                      />
                      <button
                        onClick={removeImageSelection}
                        className="mt-2 text-red-600 text-sm"
                      >
                        Hapus Gambar
                      </button>
                    </div>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {(["A", "B", "C", "D"] as const).map((opt) => (
                    <div key={opt}>
                      <label className="block text-xs font-medium text-gray-600 mb-1.5">
                        Opsi {opt}
                      </label>
                      <input
                        type="text"
                        value={(formData as any)[`opsi${opt}`]}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`opsi${opt}`]: e.target.value,
                          } as any)
                        }
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220]"
                      />
                    </div>
                  ))}
                </div>

                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                  <label className="block text-sm font-semibold text-[#004220] mb-2">
                    Jawaban Benar <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.jawabanBenar}
                    onChange={(e) =>
                      setFormData({ ...formData, jawabanBenar: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#004220] bg-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 px-6 sm:px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAssignment(null);
                  resetForm();
                }}
                className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-xl transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitEdit}
                className="px-5 py-2 bg-[#004220] hover:bg-[#003318] text-white rounded-xl transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE ================= */}
      {showDeleteModal && selectedAssignment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50 p-4">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full max-w-sm text-center">
            <h2 className="text-lg font-semibold text-[#004220] mb-3">
              Hapus Assignment?
            </h2>
            <p className="text-gray-600 mb-6">
              Yakin ingin menghapus{" "}
              <span className="font-semibold">{selectedAssignment.judul}</span>?
            </p>
            <div className="flex justify-center gap-3">
              <button
                className="px-4 py-2 bg-gray-200 rounded-xl hover:bg-gray-300"
                onClick={() => setShowDeleteModal(false)}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                onClick={handleConfirmDelete}
              >
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
