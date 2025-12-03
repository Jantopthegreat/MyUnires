"use client";
import { useRef } from "react";
import { FaSearch } from "react-icons/fa";

interface Usroh {
  id: number;
  nama: string;
}

interface Lantai {
  id: number;
  nama: string;
}

interface ResidentFilterBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedUsroh: string;
  onUsrohChange: (value: string) => void;
  selectedLantai: string;
  onLantaiChange: (value: string) => void;
  usrohList: Usroh[];
  lantaiList: Lantai[];
  onImport: (file: File) => void;
}

export default function ResidentFilterBar({
  searchTerm,
  onSearchChange,
  selectedUsroh,
  onUsrohChange,
  selectedLantai,
  onLantaiChange,
  usrohList,
  lantaiList,
  onImport,
}: ResidentFilterBarProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImport(file);
      // Reset input
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="outline-none text-sm w-40 bg-transparent"
          />
        </div>

        {/* Usroh Filter */}
        <select
          value={selectedUsroh}
          onChange={(e) => onUsrohChange(e.target.value)}
          className="border border-gray-300 rounded-xl text-gray-400 px-3 py-2 text-sm shadow-sm bg-white outline-none"
        >
          <option value="all">Usroh (All)</option>
          {usrohList.map((usroh) => (
            <option key={usroh.id} value={usroh.id}>
              {usroh.nama}
            </option>
          ))}
        </select>

        {/* Asrama/Lantai Filter */}
        <select
          value={selectedLantai}
          onChange={(e) => onLantaiChange(e.target.value)}
          className="border border-gray-300 rounded-xl text-gray-400 px-3 py-2 text-sm shadow-sm bg-white outline-none"
        >
          <option value="all">Asrama (All)</option>
          {lantaiList.map((lantai) => (
            <option key={lantai.id} value={lantai.id}>
              {lantai.nama}
            </option>
          ))}
        </select>
      </div>

      {/* Tombol Impor Data */}
      <div>
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
      </div>
    </section>
  );
}
