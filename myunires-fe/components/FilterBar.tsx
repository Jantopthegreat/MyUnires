import React from "react";
import { FaSearch } from "react-icons/fa";

interface Usroh {
  id: number;
  nama: string;
}

interface FilterBarProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  selectedUsroh: string;
  setSelectedUsroh: (val: string) => void;
  usrohList: Usroh[];
}

const FilterBar: React.FC<FilterBarProps> = ({
  searchTerm,
  setSearchTerm,
  selectedUsroh,
  setSelectedUsroh,
  usrohList,
}) => {
  return (
    <section className="flex flex-wrap items-center justify-between px-6 mb-5">
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="flex items-center border border-gray-300 rounded-xl px-3 py-2 shadow-sm bg-white">
          <FaSearch className="text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Cari Resident"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="outline-none text-sm w-40 bg-transparent"
          />
        </div>
        {/* Usroh Filter */}
        <select
          value={selectedUsroh}
          onChange={(e) => setSelectedUsroh(e.target.value)}
          className="border border-gray-300 rounded-xl px-4 py-2 text-sm text-gray-400 shadow-sm bg-white outline-none focus:ring-2 focus:ring-[#004220]"
        >
          <option value="all">Usroh (All)</option>
          {usrohList.map((usroh) => (
            <option key={usroh.id} value={String(usroh.id)}>
              {usroh.nama}
            </option>
          ))}
        </select>
      </div>
    </section>
  );
};

export default FilterBar;
