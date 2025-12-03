import React from "react";
import { FaArrowLeft } from "react-icons/fa";

export default function RevisiResidentInfo({
  residentName,
  onBack,
}: {
  residentName: string;
  onBack: () => void;
}) {
  return (
    <header className="px-6 py-4">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-[#004220] hover:text-[#005a2c] mb-4 font-semibold transition"
      >
        <FaArrowLeft className="h-4 w-4" />
        Kembali
      </button>
      <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">
        Revisi Nilai Tahfidz - {residentName || "Loading..."}
      </h1>
    </header>
  );
}
