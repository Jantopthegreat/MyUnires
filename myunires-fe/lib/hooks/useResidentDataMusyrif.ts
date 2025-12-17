import { useState, useEffect } from "react";
import { apiGet } from "@/lib/api";
import Swal from "sweetalert2";

interface Resident {
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

export function useResidentDataMusyrif() {
  const [residents, setResidents] = useState<Resident[]>([]);
  const [filteredResidents, setFilteredResidents] = useState<Resident[]>([]);
  const [usrohList, setUsrohList] = useState<Usroh[]>([]);
  const [lantaiList, setLantaiList] = useState<Lantai[]>([]);
  const [loading, setLoading] = useState(true);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsroh, setSelectedUsroh] = useState("all");
  const [selectedLantai, setSelectedLantai] = useState("all");

  useEffect(() => {
    fetchResidents();
    fetchUsrohList();
    fetchLantaiList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    filterResidents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, selectedUsroh, selectedLantai, residents]);

  const fetchResidents = async () => {
    try {
      setLoading(true);
      const response = await apiGet<any>("/api/musyrif/residents");
      if (response.success) {
        setResidents(response.data);
        setFilteredResidents(response.data);
      }
    } catch (error: any) {
      console.error("Error fetching residents (musyrif):", error);
      Swal.fire({
        icon: "error",
        title: "Gagal Memuat Data",
        text: error.message || "Tidak dapat mengambil data resident",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUsrohList = async () => {
    try {
      const response = await apiGet<any>("/api/musyrif/usroh");
      if (response.success) setUsrohList(response.data);
    } catch (error) {
      console.error("Error fetching usroh (musyrif):", error);
    }
  };

  const fetchLantaiList = async () => {
    try {
      const response = await apiGet<any>("/api/musyrif/lantai");
      if (response.success) setLantaiList(response.data);
    } catch (error) {
      console.error("Error fetching lantai (musyrif):", error);
    }
  };

  const filterResidents = () => {
    let filtered = [...residents];

    if (searchTerm) {
      filtered = filtered.filter(
        (r) =>
          r.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.nim?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          r.email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedUsroh !== "all") {
      filtered = filtered.filter(
        (r) => r.usrohId !== null && String(r.usrohId) === String(selectedUsroh)
      );
    }

    if (selectedLantai !== "all") {
      filtered = filtered.filter(
        (r) => r.lantaiId !== null && String(r.lantaiId) === String(selectedLantai)
      );
    }

    setFilteredResidents(filtered);
  };

  return {
    residents,
    filteredResidents,
    usrohList,
    lantaiList,
    loading,
    searchTerm,
    setSearchTerm,
    selectedUsroh,
    setSelectedUsroh,
    selectedLantai,
    setSelectedLantai,
    refetchResidents: fetchResidents,
  };
}
