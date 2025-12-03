import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import Swal from "sweetalert2";

interface TahfidzData {
  id: number;
  residentId: number;
  resident: string;
  nim: string;
  email: string;
  usroh: string | null;
  usrohId: number | null;
  target: string;
  surah: string;
  status: string;
  nilaiHuruf: string | null;
  tanggal: string;
}

interface Usroh {
  id: number;
  nama: string;
}

export function useTahfidzData() {
  const [tahfidzData, setTahfidzData] = useState<TahfidzData[]>([]);
  const [filteredData, setFilteredData] = useState<TahfidzData[]>([]);
  const [usrohList, setUsrohList] = useState<Usroh[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsroh, setSelectedUsroh] = useState("all");

  useEffect(() => {
    fetchUsrohList();
  }, []);

  useEffect(() => {
    fetchTahfidzData();
  }, [searchTerm, selectedUsroh]);

  const fetchTahfidzData = async () => {
    try {
      setLoading(true);
      
      // Build query params
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedUsroh !== "all") params.usrohId = selectedUsroh;

      const response = await apiGet<any>("/api/musyrif/tahfidz", params);

      if (response.success) {
        setTahfidzData(response.data);
        setFilteredData(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching tahfidz data:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: error.message || "Tidak dapat mengambil data nilai tahfidz",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsrohList = async () => {
    try {
      const response = await apiGet<any>("/api/musyrif/usroh");
      if (response.success) {
        setUsrohList(response.data);
      }
    } catch (error) {
      console.error("Error fetching usroh:", error);
    }
  };

  return {
    tahfidzData,
    filteredData,
    usrohList,
    loading,
    searchTerm,
    setSearchTerm,
    selectedUsroh,
    setSelectedUsroh,
    refetchTahfidzData: fetchTahfidzData,
  };
}
