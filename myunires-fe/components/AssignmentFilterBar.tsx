import React from "react";
import { FaSearch } from "react-icons/fa";

interface KategoriOption {
  id: number;
  nama: string;
}
interface MateriOption {
  id: number;
  judul: string;
  kategoriId: number;
}

interface AssignmentFilterBarProps {
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  kategoriList: KategoriOption[];
  selectedKategoriFilter: string;
  setSelectedKategoriFilter: (val: string) => void;
  materiList: MateriOption[];
  selectedMateriFilter: string;
  setSelectedMateriFilter: (val: string) => void;
}

const AssignmentFilterBar: React.FC<AssignmentFilterBarProps> = ({
  searchQuery,
  setSearchQuery,
  kategoriList,
  selectedKategoriFilter,
  setSelectedKategoriFilter,
  materiList,
  selectedMateriFilter,
  setSelectedMateriFilter,
}) => {
  return (
    <section className="flex flex-wrap items-center justify-between px-6 mb-5">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
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
        {/* Kategori Filter */}
        <select
          value={selectedKategoriFilter}
          onChange={(e) => setSelectedKategoriFilter(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-400 shadow-sm bg-white outline-none focus:ring-2 focus:ring-[#004220]"
        >
          <option value="Kategori (All)">Kategori (All)</option>
          {kategoriList.map((kategori) => (
            <option key={kategori.id} value={kategori.nama}>
              {kategori.nama}
            </option>
          ))}
        </select>
        {/* Materi Filter */}
        <select
          value={selectedMateriFilter}
          onChange={(e) => setSelectedMateriFilter(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-400 shadow-sm bg-white outline-none focus:ring-2 focus:ring-[#004220]"
        >
          <option value="Materi (All)">Materi (All)</option>
          {materiList.map((materi) => (
            <option key={materi.id} value={materi.judul}>
              {materi.judul}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export default AssignmentFilterBar;
