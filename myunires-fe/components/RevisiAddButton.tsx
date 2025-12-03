import React from "react";
import { FaPlus } from "react-icons/fa";

export default function RevisiAddButton({ onClick }: { onClick: () => void }) {
  return (
    <section className="px-6 mb-5 flex justify-end">
      <button
        onClick={onClick}
        className="flex items-center gap-2 bg-[#004220] text-white rounded-xl px-4 py-2 text-sm hover:bg-[#005a2c] shadow-sm transition"
      >
        <FaPlus className="h-4 w-4" />
        Tambah Nilai
      </button>
    </section>
  );
}
