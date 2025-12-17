// src/lib/hooks/useResidentData.ts
import { useState, useEffect, useCallback, useMemo } from "react";
import { apiGet } from "@/lib/api";
import Swal from "sweetalert2";

// ==========================================================
// TIPE DATA LOKAL
// ==========================================================

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface Resident {
  id: number;
  userId: number;
  name: string;
  email: string;
  nim: string;
  noUnires: string;
  jurusan: string;
  angkatan: number;
  usroh: string;
  usrohId: number | null;
  asrama: string;
  lantaiId: number | null;
  noTelp: string;
}

interface Usroh {
  id: number;
  nama: string;
}

interface Lantai {
  id: number;
  nama: string;
}

// ==========================================================
// HOOK useResidentData
// ==========================================================

export function useResidentData() {
  // --- STATE DATA UTAMA ---
  const [residents, setResidents] = useState<Resident[]>([]);
  const [usrohList, setUsrohList] = useState<Usroh[]>([]);
  const [lantaiList, setLantaiList] = useState<Lantai[]>([]);
  const [loading, setLoading] = useState(true);

  // --- STATE FILTER ---
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsroh, setSelectedUsroh] = useState("all");
  const [selectedLantai, setSelectedLantai] = useState("all");

// --------------------------------------------------------------------------
// I. FUNGSI FETCH DATA (Admin Endpoints)
// --------------------------------------------------------------------------

  /**
   * Mengambil data daftar resident.
   */
  const fetchResidents = useCallback(async () => {
    try {
      setLoading(true);
      // ✅ Admin Endpoint
      const response = await apiGet<ApiResponse<Resident[]>>("/api/admin/resident");

      if (response.success && Array.isArray(response.data)) {
        setResidents(response.data);
      } else {
        throw new Error(response.message || "Data resident tidak ditemukan.");
      }
    } catch (error: any) {
      console.error("Error fetching residents:", error);
      setResidents([]);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: error.message || "Tidak dapat mengambil data resident",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Mengambil daftar Usroh dan Lantai (Admin Endpoint)
   */
  const fetchUsrohList = useCallback(async () => {
    try {
      const response = await apiGet<ApiResponse<Usroh[]>>("/api/admin/usroh");
      if (response.success && Array.isArray(response.data)) setUsrohList(response.data);
    } catch (error) {
      console.error("Error fetching usroh:", error);
    }
  }, []);

  const fetchLantaiList = useCallback(async () => {
    try {
      const response = await apiGet<ApiResponse<Lantai[]>>("/api/admin/lantai");
      if (response.success && Array.isArray(response.data)) setLantaiList(response.data);
    } catch (error) {
      console.error("Error fetching lantai:", error);
    }
  }, []);

// --------------------------------------------------------------------------
// II. SIDE EFFECT (Initial Load)
// --------------------------------------------------------------------------

  // Fetch data saat hook digunakan
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      fetchResidents();
      fetchUsrohList();
      fetchLantaiList();
    }
  }, [fetchResidents, fetchUsrohList, fetchLantaiList]);

// --------------------------------------------------------------------------
// III. LOGIKA FILTERING (Menggunakan useMemo)
// --------------------------------------------------------------------------

  /**
   * Menghitung data resident yang telah difilter.
   * Akan dihitung ulang hanya jika residents atau state filter berubah.
   */
  const filteredResidents = useMemo(() => {
    let filtered = residents;

    // 1. Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (r) =>
          r.name.toLowerCase().includes(term) ||
          r.nim.toLowerCase().includes(term) ||
          r.email.toLowerCase().includes(term)
      );
    }

    // 2. Filter by usroh (berdasarkan usrohId)
    if (selectedUsroh !== "all") {
      const usrohId = Number(selectedUsroh);
      filtered = filtered.filter((r) => r.usrohId === usrohId);
    }

    // 3. Filter by lantai (berdasarkan lantaiId)
    if (selectedLantai !== "all") {
      const lantaiId = Number(selectedLantai);
      filtered = filtered.filter((r) => r.lantaiId === lantaiId);
    }

    return filtered;
  }, [residents, searchTerm, selectedUsroh, selectedLantai]);

// --------------------------------------------------------------------------
// IV. RETURN HOOK
// --------------------------------------------------------------------------

  return {
    // Data
    residents, // (Data mentah, jika diperlukan)
    filteredResidents, // Hasil kalkulasi useMemo (Siap display)
    usrohList,
    lantaiList,
    loading,

    // Filter States
    searchTerm,
    setSearchTerm,
    selectedUsroh,
    setSelectedUsroh,
    selectedLantai,
    setSelectedLantai,

    // Actions
    refetchResidents: fetchResidents,
  };
}
