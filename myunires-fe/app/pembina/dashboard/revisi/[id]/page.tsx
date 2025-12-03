"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import RevisiHeader from "@/components/RevisiHeader";
import RevisiResidentInfo from "@/components/RevisiResidentInfo";
import RevisiAddButton from "@/components/RevisiAddButton";
import RevisiNilaiTable from "@/components/RevisiNilaiTable";
import RevisiNilaiTahfidzModal from "@/components/RevisiNilaiTahfidzModal";
import Swal from "sweetalert2";
import { clearAuth } from "@/lib/api";

interface NilaiTahfidzData {
  id: number;
  residentId: number;
  resident: string;
  nim: string;
  email: string;
  usroh: string | null;
  usrohId: number | null;
  target: string;
  surah: string;
  ayatMulai: number;
  ayatAkhir: number;
  status: string;
  nilaiHuruf: string | null;
  tanggal: string;
  targetHafalanId: number;
}

interface TargetHafalan {
  id: number;
  nama: string;
  surah: string;
  ayatMulai: number;
  ayatAkhir: number;
}

export default function RevisiDetailPage() {
  const params = useParams();
  const router = useRouter();
  const residentId = params.id as string;

  const [isOpen, setIsOpen] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // Data states
  const [residentName, setResidentName] = useState("");
  const [nilaiList, setNilaiList] = useState<NilaiTahfidzData[]>([]);
  const [targetHafalan, setTargetHafalan] = useState<TargetHafalan[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedNilai, setSelectedNilai] = useState<NilaiTahfidzData | null>(
    null
  );

  // Fetch data on mount
  useEffect(() => {
    fetchData();
  }, [residentId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Token tidak ditemukan. Silakan login kembali.",
        });
        return;
      }

      // Fetch nilai tahfidz detail untuk resident ini
      const nilaiRes = await fetch(
        "http://localhost:3001/api/musyrif/tahfidz/detail",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const nilaiData = await nilaiRes.json();

      // Filter nilai untuk resident ini saja
      const residentNilai = (nilaiData.data || []).filter(
        (item: NilaiTahfidzData) => item.residentId === Number(residentId)
      );

      // Set resident name dari data pertama
      if (residentNilai.length > 0) {
        setResidentName(residentNilai[0].resident);
      }

      // Fetch target hafalan
      const targetRes = await fetch(
        "http://localhost:3001/api/musyrif/target-hafalan",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const targetData = await targetRes.json();

      console.log("🔍 Debug - Resident Nilai:", residentNilai);
      console.log("🔍 Debug - Target Hafalan:", targetData);

      setNilaiList(residentNilai);
      setTargetHafalan(targetData.data || []);
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

  const handleAdd = () => {
    setModalMode("add");
    setSelectedNilai(null);
    setShowModal(true);
  };

  const handleEdit = (nilai: NilaiTahfidzData) => {
    setModalMode("edit");
    setSelectedNilai(nilai);
    setShowModal(true);
  };

  const handleSave = async (formData: any) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        Swal.fire({
          icon: "error",
          title: "Error",
          text: "Token tidak ditemukan. Silakan login kembali.",
        });
        return;
      }

      // Force resident ID untuk form ini
      const dataToSave = {
        ...formData,
        residentId: Number(residentId),
      };

      const response = await fetch(
        "http://localhost:3001/api/musyrif/tahfidz",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(dataToSave),
        }
      );

      const result = await response.json();

      if (response.ok) {
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: result.message || "Data berhasil disimpan.",
          confirmButtonColor: "#22c55e",
          timer: 2000,
        });

        setShowModal(false);
        fetchData(); // Refresh data
      } else {
        Swal.fire({
          icon: "error",
          title: "Gagal",
          text: result.message || "Terjadi kesalahan saat menyimpan data.",
        });
      }
    } catch (error) {
      console.error("Error saving data:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: "Gagal menyimpan data ke server.",
      });
    }
  };

  const handleViewDetail = (nilai: NilaiTahfidzData) => {
    const tanggal = new Date(nilai.tanggal).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

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
            <p><strong>Target Hafalan:</strong> ${nilai.target}</p>
            <p><strong>Surah:</strong> ${nilai.surah}</p>
            <p><strong>Ayat:</strong> ${nilai.ayatMulai} - ${
        nilai.ayatAkhir
      }</p>
            <p><strong>Status:</strong> 
              <span class="px-2 py-1 rounded text-xs font-semibold ml-2 ${
                nilai.status === "SELESAI"
                  ? "bg-green-100 text-green-700"
                  : "bg-yellow-100 text-yellow-800"
              }">
                ${nilai.status}
              </span>
            </p>
            <p><strong>Nilai Huruf:</strong> 
              <span class="px-2 py-1 rounded text-xs font-semibold ml-2 ${
                nilai.nilaiHuruf === "A" || nilai.nilaiHuruf === "A-"
                  ? "bg-green-100 text-green-800"
                  : nilai.nilaiHuruf?.startsWith("B")
                  ? "bg-blue-100 text-blue-800"
                  : nilai.nilaiHuruf?.startsWith("C")
                  ? "bg-yellow-100 text-yellow-800"
                  : nilai.nilaiHuruf === "D"
                  ? "bg-orange-100 text-orange-800"
                  : nilai.nilaiHuruf === "E"
                  ? "bg-red-100 text-red-800"
                  : "bg-gray-100 text-gray-800"
              }">
                ${nilai.nilaiHuruf || "Belum Dinilai"}
              </span>
            </p>
            <p><strong>Tanggal Penilaian:</strong> ${tanggal}</p>
          </div>
        </div>
      `,
      confirmButtonColor: "#004220",
      width: "600px",
    });
  };

  return (
    <div className="min-h-screen flex bg-white">
      <RevisiHeader
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        showLogoutModal={showLogoutModal}
        setShowLogoutModal={setShowLogoutModal}
        onLogout={() => {
          clearAuth();
          window.location.href = "/login";
        }}
      />
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-12"
        }`}
      >
        <div className="h-16" />
        <RevisiResidentInfo
          residentName={residentName}
          onBack={() => router.back()}
        />
        <RevisiAddButton onClick={handleAdd} />
        <RevisiNilaiTable
          nilaiList={nilaiList}
          loading={loading}
          handleViewDetail={handleViewDetail}
          handleEdit={handleEdit}
        />
      </main>
      <RevisiNilaiTahfidzModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSave={handleSave}
        mode={modalMode}
        data={selectedNilai}
        residents={[{ id: Number(residentId), name: residentName, nim: "" }]}
        targetHafalan={targetHafalan}
      />
    </div>
  );
}
