"use client";
import { useState, useEffect } from "react";
import { FaSearch, FaPlus } from "react-icons/fa";
import Sidebar from "@/components/Sidebar";
import CustomSelect from "@/components/CustomSelect";
import Swal from "sweetalert2";
import { clearAuth } from "@/lib/api";

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
  createdAt?: string;
  soalImageUrl?: string | null;
  materi?: {
    id: number;
    judul: string;
    kategori: {
      id: number;
      nama: string;
    };
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

export default function AssignmentPage() {
  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // State untuk data dari backend
  const [assignments, setAssignments] = useState<AssignmentData[]>([]);
  const [filteredAssignments, setFilteredAssignments] = useState<
    AssignmentData[]
  >([]);
  const [kategoriList, setKategoriList] = useState<KategoriOption[]>([]);
  const [materiList, setMateriList] = useState<MateriOption[]>([]);
  // Untuk filter bar
  const [filteredMateriListFilterBar, setFilteredMateriListFilterBar] = useState<MateriOption[]>([]);
  const [filteredMateriList, setFilteredMateriList] = useState<MateriOption[]>(
    []
  );

  // State untuk filter
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedKategoriFilter, setSelectedKategoriFilter] =
    useState("Kategori (All)");
  const [selectedMateriFilter, setSelectedMateriFilter] =
    useState("Materi (All)");

  // State untuk semua modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);

  // State untuk data yang dipilih
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentData | null>(null);

  // State untuk form
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

  // State untuk form kategori selection
  const [selectedKategoriForm, setSelectedKategoriForm] = useState("");
  const [soalImageFile, setSoalImageFile] = useState<File | null>(null);
  const [soalImagePreview, setSoalImagePreview] = useState<string | null>(null);

  // State untuk soal dinamis (untuk UI multiple questions)
  const [questions, setQuestions] = useState(["", "", ""]);

  // Fetch data saat component mount
  useEffect(() => {
    fetchKategori();
    fetchMateri();
    fetchAssignments();
  }, []);

  // Filter materi berdasarkan kategori yang dipilih di form
  useEffect(() => {
    if (selectedKategoriForm) {
      const filtered = materiList.filter((m) => m.kategoriId === Number(selectedKategoriForm));
      setFilteredMateriList(filtered);
    } else {
      setFilteredMateriList(materiList);
    }
  }, [selectedKategoriForm, materiList]);

  // Filter materi di filter bar berdasarkan kategori
  useEffect(() => {
    if (selectedKategoriFilter && selectedKategoriFilter !== "all" && selectedKategoriFilter !== "Kategori (All)") {
      const filtered = materiList.filter(
        (m) => m.kategoriId === Number(selectedKategoriFilter)
      );
      setFilteredMateriListFilterBar(filtered);
    } else {
      setFilteredMateriListFilterBar(materiList);
    }
  }, [selectedKategoriFilter, materiList]);

  // Filter assignments berdasarkan search dan filter
  useEffect(() => {
    let filtered = [...assignments];

    // Search filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(
        (a) =>
          a.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.pertanyaan.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.materi?.judul.toLowerCase().includes(searchQuery.toLowerCase()) ||
          a.materi?.kategori?.nama
            .toLowerCase()
            .includes(searchQuery.toLowerCase())
      );
    }

    // Kategori filter
    if (selectedKategoriFilter && selectedKategoriFilter !== "Kategori (All)") {
      filtered = filtered.filter(
        (a) => a.materi?.kategori?.nama === selectedKategoriFilter
      );
    }

    // Materi filter
    if (selectedMateriFilter && selectedMateriFilter !== "Materi (All)") {
      filtered = filtered.filter(
        (a) => a.materi?.judul === selectedMateriFilter
      );
    }

    setFilteredAssignments(filtered);
  }, [searchQuery, selectedKategoriFilter, selectedMateriFilter, assignments]);

  // Fetch assignments dari backend
  const fetchAssignments = async () => {
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        "http://localhost:3001/api/musyrif/assignments",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );


      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setAssignments(Array.isArray(data) ? data : []);
      } else {
        console.error("Response not OK:", response.status);
      }
    } catch (error) {
      console.error("Error fetching assignments:", error);
    }
  };

  // Fetch kategori materi dari backend
  const fetchKategori = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/musyrif/kategori",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        setKategoriList(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error("Error fetching kategori:", error);
    }
  };

  // Fetch materi dari backend
  const fetchMateri = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        "http://localhost:3001/api/musyrif/materi/all",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const data = result.data || result;
        // Pastikan kategoriId number
        const materiWithNumberKategoriId = Array.isArray(data)
          ? data.map((m) => ({ ...m, kategoriId: Number(m.kategoriId) }))
          : [];
        setMateriList(materiWithNumberKategoriId);
      }
    } catch (error) {
      console.error("Error fetching materi:", error);
    }
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, ""]);
  };

  const handleChangeQuestion = (index: number, value: string) => {
    const updated = [...questions];
    updated[index] = value;
    setQuestions(updated);
  };

  const handleView = (assignment: AssignmentData) => {
    setSelectedAssignment(assignment);
    setShowViewModal(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSoalImageFile(file);
      setSoalImagePreview(URL.createObjectURL(file));
    }
  };

  const removeImageSelection = () => {
    setSoalImageFile(null);
    setSoalImagePreview(null);
    setFormData((prev) => ({ ...prev, soalImageUrl: undefined }));
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
      jawabanBenar: assignment.jawabanBenar,
    });
    if (assignment.materi) {
      setSelectedKategoriForm(String(assignment.materi.kategori.id));
    }
    setSoalImageFile(null);
    setSoalImagePreview(assignment.soalImageUrl || null);
    setFormData((prev) => ({ ...prev, soalImageUrl: assignment.soalImageUrl || undefined }));
    setShowEditModal(true);
  };

  const handleDelete = (assignment: AssignmentData) => {
    setSelectedAssignment(assignment);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedAssignment) return;

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `http://localhost:3001/api/musyrif/assignments/${selectedAssignment.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Assignment berhasil dihapus",
          showConfirmButton: true,
          confirmButtonColor: "#22c55e",
          confirmButtonText: "OK",
          timer: 3000,
        });
        fetchAssignments();
        setShowDeleteModal(false);
        setSelectedAssignment(null);
      } else {
        throw new Error("Gagal menghapus assignment");
      }
    } catch (error) {
      console.error("Error deleting assignment:", error);
      Swal.fire("Error", "Gagal menghapus assignment", "error");
    }
  };

  const handleSubmitAdd = async () => {
    // Validasi
    if (
      !formData.materiId ||
      !formData.judul ||
      !formData.pertanyaan ||
      !formData.opsiA ||
      !formData.opsiB ||
      !formData.opsiC ||
      !formData.opsiD
    ) {
      Swal.fire(
        "Error",
        "Semua field harus diisi, termasuk Kategori dan Materi!",
        "error"
      );
      return;
    }

    let uploadedImageUrl: string | undefined = undefined;
    try {
      const token = localStorage.getItem("token");
      if (soalImageFile) {
        const fd = new FormData();
        fd.append('file', soalImageFile);
        const uploadResp = await fetch('http://localhost:3001/api/musyrif/assignments/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (uploadResp.ok) {
          const uploadJson = await uploadResp.json();
          uploadedImageUrl = uploadJson.url; // e.g., /uploads/assignments/abc.jpg
        } else {
          console.error('Upload failed:', uploadResp.status);
          throw new Error('Gagal mengupload gambar');
        }
      }

      const payload = {
        ...formData,
        materiId: Number(formData.materiId),
        ...(uploadedImageUrl && { soalImageUrl: uploadedImageUrl }),
      };
      console.log("📝 Creating assignment - payload:", payload);

      const response = await fetch(
        "http://localhost:3001/api/musyrif/assignments",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Assignment berhasil ditambahkan",
          showConfirmButton: true,
          confirmButtonColor: "#22c55e",
          confirmButtonText: "OK",
          timer: 3000,
        });
        fetchAssignments();
        setShowAddModal(false);
        resetForm();
      } else {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch (parseErr) {
          console.error("Failed to parse error response JSON", parseErr);
        }
        console.error("Create assignment failed:", response.status, response.statusText, errorData);
        throw new Error(errorData?.message || `Failed to save (status ${response.status})`);
      }
    } catch (error: any) {
      console.error("Error saving assignment:", error);

      // If we uploaded an image, prompt user to retry without the image
      if (uploadedImageUrl) {
        const result = await Swal.fire({
          icon: "error",
          title: "Gagal menyimpan dengan gambar",
          text: "Server mengembalikan error saat menyimpan assignment yang berisi gambar. Coba simpan tanpa gambar?",
          showCancelButton: true,
          confirmButtonText: "Simpan tanpa gambar",
          cancelButtonText: "Batal",
        });

        if (result.isConfirmed) {
          try {
            const token = localStorage.getItem("token");
            const retryPayload = {
              ...formData,
              materiId: Number(formData.materiId),
            };
            console.log("📝 Retrying create without image - payload:", retryPayload);
            const retryResp = await fetch("http://localhost:3001/api/musyrif/assignments", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(retryPayload),
            });

            if (retryResp.ok) {
              Swal.fire({ icon: "success", title: "Assignment berhasil ditambahkan tanpa gambar", timer: 2000 });
              fetchAssignments();
              setShowAddModal(false);
              resetForm();
              return;
            } else {
              let retryErr: any = null;
              try {
                retryErr = await retryResp.json();
              } catch (e) {
                console.error("Failed to parse retry error JSON", e);
              }
              console.error("Retry without image failed:", retryResp.status, retryResp.statusText, retryErr);
              Swal.fire("Error", retryErr?.message || `Gagal menyimpan (status ${retryResp.status})`, "error");
              return;
            }
          } catch (retryError: any) {
            console.error("Retry without image error:", retryError);
            Swal.fire("Error", retryError.message || "Gagal menyimpan assignment", "error");
            return;
          }
        }
      }

      Swal.fire("Error", error.message || "Gagal menyimpan assignment", "error");
    }
  };

  const handleSubmitEdit = async () => {
    if (!selectedAssignment) return;

    // Validasi
    if (
      !formData.materiId ||
      !formData.judul ||
      !formData.pertanyaan ||
      !formData.opsiA ||
      !formData.opsiB ||
      !formData.opsiC ||
      !formData.opsiD
    ) {
      Swal.fire(
        "Error",
        "Semua field harus diisi, termasuk Kategori dan Materi!",
        "error"
      );
      return;
    }

    try {
      const token = localStorage.getItem("token");
      let uploadedImageUrl: string | undefined = undefined;
      if (soalImageFile) {
        const fd = new FormData();
        fd.append('file', soalImageFile);
        const uploadResp = await fetch('http://localhost:3001/api/musyrif/assignments/upload', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (uploadResp.ok) {
          const uploadJson = await uploadResp.json();
          uploadedImageUrl = uploadJson.url;
        } else {
          console.error('Upload failed:', uploadResp.status);
          throw new Error('Gagal mengupload gambar');
        }
      }
      const payload = {
        ...formData,
        materiId: Number(formData.materiId),
        ...(soalImagePreview === null && formData.soalImageUrl === undefined ? { soalImageUrl: null } : {}),
        ...(uploadedImageUrl ? { soalImageUrl: uploadedImageUrl } : {}),
      };
      console.log("📝 Updating assignment - payload:", payload);

      const response = await fetch(
        `http://localhost:3001/api/musyrif/assignments/${selectedAssignment.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        }
      );

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Assignment berhasil diupdate",
          showConfirmButton: true,
          confirmButtonColor: "#22c55e",
          confirmButtonText: "OK",
          timer: 3000,
        });
        fetchAssignments();
        setShowEditModal(false);
        setSelectedAssignment(null);
        resetForm();
      } else {
        let errorData: any = null;
        try {
          errorData = await response.json();
        } catch (parseErr) {
          console.error("Failed to parse error response JSON", parseErr);
        }
        console.error("Update assignment failed:", response.status, response.statusText, errorData);
        throw new Error(errorData?.message || `Failed to update (status ${response.status})`);
      }
    } catch (error: any) {
      console.error("Error updating assignment:", error);
      Swal.fire(
        "Error",
        error.message || "Gagal mengupdate assignment",
        "error"
      );
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
    });
    setSelectedKategoriForm("");
    setQuestions(["", "", ""]);
    setSoalImageFile(null);
    setSoalImagePreview(null);
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ===== HEADER ===== */}
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-6 border-b">
        <div className="flex items-center gap-3">
          <img src="/lg_umy.svg" alt="UMY" className="h-10 object-contain" />
          <img
            src="/lg_unires.svg"
            alt="UNIRES"
            className="h-10 object-contain"
          />
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          Logout
        </button>
      </header>

      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
          <div className="bg-[#d1d4d0] rounded-3xl shadow-lg p-8 w-[400px] text-center">
            <h2 className="text-2xl font-semibold text-[#004220] mb-4">
              Log Out
            </h2>
            <p className="text-gray-700 text-sm mb-1">
              Tindakan ini akan mengakhiri sesi login Anda.
            </p>
            <p className="text-gray-700 text-sm mb-6">
              Apakah Anda ingin melanjutkan?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-[#FFC107] hover:bg-[#ffb300] text-white font-semibold px-6 py-2 rounded-full shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  clearAuth();
                  window.location.href = "/login";
                }}
                className="bg-[#E50914] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full shadow-md"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "ml-64" : "ml-12"
        }`}
      >
        <div className="h-16" />

        <header className="px-6 py-4">
          <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">
            Buat Assignment
          </h1>
        </header>

        {/* ===== FILTER BAR ===== */}
        <section className="flex flex-wrap items-center justify-between px-6 mb-5">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 shadow-sm bg-white">
              <FaSearch className="text-gray-400 mr-2" />
              <input
                type="text"
                placeholder="Cari Assignment"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="outline-none text-sm w-40 bg-transparent"
              />
            </div>

            <CustomSelect
              iconSrc="/filter_icon.svg"
              options={["Kategori (All)", ...kategoriList.map((k) => k.nama)]}
              value={selectedKategoriFilter}
              onChange={(value) => {
                setSelectedKategoriFilter(value);
                setSelectedMateriFilter("Materi (All)"); // Reset materi filter
              }}
            />
            <CustomSelect
              iconSrc="/filter_icon.svg"
              options={[
                "Materi (All)",
                ...filteredMateriListFilterBar.map((m) => m.judul),
              ]}
              value={selectedMateriFilter}
              onChange={setSelectedMateriFilter}
            />
          </div>

          {/* Tombol Tambah Assignment */}
          <button
            onClick={() => {
              resetForm();
              setShowAddModal(true);
            }}
            className="flex items-center gap-2 bg-green-500 border border-gray-300 rounded-xl px-4 py-2 text-sm text-white hover:bg-green-600 shadow-sm transition"
          >
            <div className=" border-2 border-white rounded-full p-1.5 flex items-center justify-center">
              <FaPlus className="text-white text-xs" />
            </div>
            Add Assignment
          </button>
        </section>

        {/* ===== TABLE ===== */}
        <section className="px-6 pb-6">
          <div className="bg-white rounded-lg shadow border border-[#004220] overflow-hidden">
            {filteredAssignments.length === 0 ? (
              <div className="text-center py-10 text-gray-500">
                {searchQuery
                  ? "Tidak ada assignment yang ditemukan"
                  : "Belum ada data assignment"}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <div className="max-h-[600px] overflow-y-auto">
                  <table className="w-full text-sm border-collapse">
                    <thead className="text-[#004220] border-b border-[#004220] bg-white sticky top-0 z-10">
                      <tr>
                        <th className="py-3 text-left px-4 bg-white">No</th>
                        <th className="py-3 text-left px-4 bg-white">Kategori</th>
                        <th className="py-3 text-left px-4 bg-white">Materi</th>
                        <th className="py-3 text-center px-4 bg-white">Aksi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAssignments.map((assignment, i) => (
                        <tr
                          key={assignment.id}
                          className="text-[#004220] border-b border-[#004220] hover:bg-[#F7F9F8] transition"
                        >
                          <td className="py-3 px-4">{i + 1}</td>
                          <td className="py-3 px-4">
                            {assignment.materi?.kategori?.nama || "-"}
                          </td>
                          <td className="py-3 px-4">
                            {assignment.materi?.judul || "-"}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-3">
                              <img
                                src="/eye_icon.svg"
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
          {/* Info jumlah data */}
          <div className="mt-3 text-sm text-gray-600">
            Menampilkan {filteredAssignments.length} dari {assignments.length} assignment
          </div>
        </section>
      </main>

      {/* ===== MODAL VIEW ASSIGNMENT ===== */}
      {showViewModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-gray-200">
            {/* Header Modal */}
            <div className="bg-[#004220] px-8 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Detail Assignment
                </h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setSelectedAssignment(null);
                  }}
                  className="text-white hover:text-gray-200 transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body Modal */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-6">
                {/* Kategori & Materi */}
                <div className="grid grid-cols-2 gap-5">
                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                      Kategori
                    </label>
                    <p className="text-base font-semibold text-[#004220]">
                      {selectedAssignment.materi?.kategori?.nama || "-"}
                    </p>
                  </div>

                  <div className="border border-gray-300 rounded-md p-4 bg-gray-50">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                      Materi
                    </label>
                    <p className="text-base font-semibold text-[#004220]">
                      {selectedAssignment.materi?.judul || "-"}
                    </p>
                  </div>
                </div>

                {/* Judul Assignment */}
                <div className="border-l-4 border-[#004220] bg-gray-50 px-5 py-4">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-2 block">
                    Judul Assignment
                  </label>
                  <p className="text-gray-900 font-semibold text-base">
                    {selectedAssignment.judul}
                  </p>
                </div>

                {/* Pertanyaan */}
                <div className="bg-white border border-gray-300 rounded-md p-5">
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
                    Pertanyaan
                  </label>
                  <p className="text-gray-800 leading-relaxed">
                    {selectedAssignment.pertanyaan}
                  </p>
                </div>

                {/* Gambar Soal */}
                {selectedAssignment.soalImageUrl && (
                  <div className="mt-3 border border-gray-200 rounded-md p-3 bg-gray-50">
                    <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                      Gambar Soal
                    </label>
                    <img src={selectedAssignment.soalImageUrl} alt="Gambar Soal" className="max-w-full max-h-60 rounded" />
                  </div>
                )}

                {/* Pilihan Jawaban */}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
                    Pilihan Jawaban
                  </label>
                  <div className="space-y-3">
                    {["A", "B", "C", "D"].map((option) => {
                      const isCorrect =
                        selectedAssignment.jawabanBenar === option;
                      const optionText =
                        selectedAssignment[
                          `opsi${option}` as keyof AssignmentData
                        ];
                      return (
                        <div
                          key={option}
                          className={`flex items-start gap-3 p-4 rounded-md border ${
                            isCorrect
                              ? "bg-green-50 border-[#004220] border-2"
                              : "bg-white border-gray-300"
                          }`}
                        >
                          <div
                            className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm ${
                              isCorrect
                                ? "bg-[#004220] text-white"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {option}
                          </div>
                          <p
                            className={`flex-1 pt-1 ${
                              isCorrect
                                ? "font-semibold text-[#004220]"
                                : "text-gray-700"
                            }`}
                          >
                            {String(optionText)}
                          </p>
                          {isCorrect && (
                            <span className="text-xs font-semibold text-[#004220] bg-green-100 px-3 py-1 rounded-md">
                              ✓ BENAR
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => {
                  setShowViewModal(false);
                  setSelectedAssignment(null);
                }}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-md transition"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL TAMBAH ASSIGNMENT ===== */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
          <div className="bg-white rounded-xl p-8 w-[420px] shadow-lg max-h-[80vh] overflow-y-auto">
            <h2 className="text-lg font-semibold text-[#4A6FA5] mb-6">
              Tambah Assignment
            </h2>

            <div className="space-y-4">
              {/* Kategori Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Kategori Assignment <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedKategoriForm}
                  onChange={(e) => {
                    setSelectedKategoriForm(e.target.value);
                  }}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6FA5]"
                >
                  <option value="">Pilih Kategori</option>
                  {kategoriList.map((k) => (
                    <option key={k.id} value={k.id}>
                      {k.nama}
                    </option>
                  ))}
                </select>
              </div>

              {/* Materi Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Materi <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.materiId}
                  onChange={(e) => {
                    setFormData({ ...formData, materiId: e.target.value });
                  }}
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6FA5]"
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
                {/* Info jika kategori belum dipilih */}
                {selectedKategoriForm === "" && (
                  <p className="text-xs text-gray-500 mt-1">
                    Pilih kategori untuk filter materi (opsional)
                  </p>
                )}
              </div>

              {/* Judul Assignment */}
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
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6FA5]"
                />
              </div>

              {/* Pertanyaan */}
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
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6FA5]"
                />
              </div>

              {/* Upload Gambar Soal */}
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
                {soalImagePreview && (
                  <div className="mt-2">
                    <img src={soalImagePreview} alt="Preview" className="max-h-40 rounded" />
                    <div className="mt-1">
                      <button onClick={removeImageSelection} className="text-red-600 text-sm">Hapus Gambar</button>
                    </div>
                  </div>
                )}
              </div>

              {/* Opsi A-D */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Opsi A <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Opsi A"
                    value={formData.opsiA}
                    onChange={(e) =>
                      setFormData({ ...formData, opsiA: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6FA5]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Opsi B <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Opsi B"
                    value={formData.opsiB}
                    onChange={(e) =>
                      setFormData({ ...formData, opsiB: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6FA5]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Opsi C <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Opsi C"
                    value={formData.opsiC}
                    onChange={(e) =>
                      setFormData({ ...formData, opsiC: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6FA5]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Opsi D <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Opsi D"
                    value={formData.opsiD}
                    onChange={(e) =>
                      setFormData({ ...formData, opsiD: e.target.value })
                    }
                    className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6FA5]"
                  />
                </div>
              </div>

              {/* Jawaban Benar */}
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Jawaban Benar <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.jawabanBenar}
                  onChange={(e) =>
                    setFormData({ ...formData, jawabanBenar: e.target.value })
                  }
                  className="mt-1 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6FA5]"
                >
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                  <option value="D">D</option>
                </select>
              </div>

              {/* Soal Inputs (UI Legacy - bisa di-hide atau disesuaikan) */}
              <div className="hidden">
                <label className="block text-sm font-medium text-gray-700">
                  Soal <span className="text-red-500">*</span>
                </label>
                {questions.map((q, index) => (
                  <input
                    key={index}
                    value={q}
                    onChange={(e) =>
                      handleChangeQuestion(index, e.target.value)
                    }
                    placeholder={`${index + 1}.`}
                    className="mt-2 w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#4A6FA5]"
                  />
                ))}
                <button
                  type="button"
                  onClick={handleAddQuestion}
                  className="w-full mt-2 border border-gray-300 text-gray-600 text-sm py-2 rounded-lg hover:bg-gray-100 transition"
                >
                  Tambah Kolom Soal
                </button>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-600 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-[#4A6FA5] text-white rounded-lg text-sm hover:bg-[#3b5c8a]"
                onClick={handleSubmitAdd}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL EDIT ===== */}
      {showEditModal && selectedAssignment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden border border-gray-200">
            {/* Header Modal */}
            <div className="bg-[#004220] px-8 py-5 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-white">
                  Edit Assignment
                </h2>
                <button
                  onClick={() => {
                    setShowEditModal(false);
                    setSelectedAssignment(null);
                    resetForm();
                  }}
                  className="text-white hover:text-gray-200 transition"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body Modal */}
            <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
              <div className="space-y-5">
                {/* Kategori & Materi */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Kategori <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={selectedKategoriForm}
                      onChange={(e) => setSelectedKategoriForm(e.target.value)}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] transition"
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
                      className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] transition disabled:bg-gray-100 disabled:cursor-not-allowed"
                      disabled={!selectedKategoriForm}
                    >
                      <option value="">Pilih Materi</option>
                      {filteredMateriList.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.judul}
                        </option>
                      ))}
                    </select>
                    {!selectedKategoriForm && (
                      <p className="text-xs text-gray-500 mt-1">
                        Pilih kategori terlebih dahulu
                      </p>
                    )}
                  </div>
                </div>

                {/* Judul Assignment */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Judul Assignment <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Masukkan judul assignment"
                    value={formData.judul}
                    onChange={(e) =>
                      setFormData({ ...formData, judul: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] transition"
                  />
                </div>

                {/* Pertanyaan */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Pertanyaan <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    placeholder="Masukkan pertanyaan"
                    value={formData.pertanyaan}
                    onChange={(e) =>
                      setFormData({ ...formData, pertanyaan: e.target.value })
                    }
                    rows={3}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] transition resize-none"
                  />
                </div>

                {/* Upload Gambar Soal (Edit) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Gambar Soal (opsional)</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full border rounded-md px-3 py-2 text-sm"
                  />
                  {soalImagePreview && (
                    <div className="mt-2">
                      <img src={soalImagePreview} alt="Preview" className="max-h-40 rounded" />
                      <div className="mt-1">
                        <button onClick={removeImageSelection} className="text-red-600 text-sm">Hapus Gambar</button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pilihan Jawaban */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">
                    Pilihan Jawaban <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {["A", "B", "C", "D"].map((option) => (
                      <div key={option}>
                        <label className="block text-xs font-medium text-gray-600 mb-1.5">
                          Opsi {option}
                        </label>
                        <input
                          type="text"
                          placeholder={`Masukkan opsi ${option}`}
                          value={
                            formData[
                              `opsi${option}` as keyof FormData
                            ] as string
                          }
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [`opsi${option}`]: e.target.value,
                            })
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] transition"
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Jawaban Benar */}
                <div className="bg-green-50 border border-[#004220] rounded-md p-4">
                  <label className="block text-sm font-semibold text-[#004220] mb-2">
                    Jawaban Benar <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.jawabanBenar}
                    onChange={(e) =>
                      setFormData({ ...formData, jawabanBenar: e.target.value })
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] transition bg-white"
                  >
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                    <option value="D">D</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Footer Modal */}
            <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  setSelectedAssignment(null);
                  resetForm();
                }}
                className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition"
              >
                Batal
              </button>
              <button
                onClick={handleSubmitEdit}
                className="px-5 py-2 bg-[#004220] hover:bg-[#003318] text-white font-medium rounded-md transition"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== MODAL DELETE ===== */}
      {showDeleteModal && selectedAssignment && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-[350px] text-center">
            <h2 className="text-lg font-semibold text-[#004220] mb-4">
              Hapus Assignment?
            </h2>
            <p className="text-gray-600 mb-6">
              Apakah kamu yakin ingin menghapus{" "}
              <span className="font-semibold">{selectedAssignment.judul}</span>?
            </p>
            <div className="flex justify-center gap-4">
              <button
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedAssignment(null);
                }}
              >
                Batal
              </button>
              <button
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
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
