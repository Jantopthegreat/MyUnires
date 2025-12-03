"use client";
import { useRef } from "react";
import { FaSearch } from "react-icons/fa";

interface Usroh {
  id: number;
  nama: string;
}

interface TahfidzFilterBarProps {
  searchTerm: string;
  selectedUsroh: string;
  usrohList: Usroh[];
  onFilter: (search: string, usroh: string) => void;
  onImport: (file: File) => void;
  onAdd: () => void;
}

export default function TahfidzFilterBar({
  searchTerm,
  selectedUsroh,
  usrohList,
  onFilter,
  onImport,
  onAdd,
}: TahfidzFilterBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <section className="flex flex-wrap items-center justify-between px-6 mb-5">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search box */}
        <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 shadow-sm bg-white">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Cari Resident"
            value={searchTerm}
            onChange={(e) => onFilter(e.target.value, selectedUsroh)}
            className="outline-none text-sm w-40 bg-transparent"
          />
        </div>

        {/* Usroh Filter */}
        <select
          value={selectedUsroh}
          onChange={(e) => onFilter(searchTerm, e.target.value)}
          className="border border-gray-300 rounded-xl text-gray-400 px-3 py-2 text-sm shadow-sm bg-white outline-none"
        >
          <option value="all">Usroh (All)</option>
          {usrohList.map((usroh) => (
            <option key={usroh.id} value={usroh.id.toString()}>
              {usroh.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Tombol Impor Data & Tambah */}
      <div className="flex gap-2 items-center">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleImportClick}
          className="flex items-center border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-400 hover:bg-gray-100 shadow-sm transition"
        >
          <img src="/import_data.svg" alt="Import" className="h-4 w-4 mr-2" />
          Impor Data
        </button>
        <button
          onClick={onAdd}
          className="flex items-center gap-2 bg-[#004220] text-white rounded-xl px-4 py-2 text-sm hover:bg-[#005a2c] shadow-sm transition"
        >
          Tambah Nilai
        </button>
      </div>
    </section>
  );
}
