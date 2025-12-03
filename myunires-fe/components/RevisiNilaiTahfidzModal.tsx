"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";

interface Resident {
  id: number;
  name: string;
  nim: string;
}

interface TargetHafalan {
  id: number;
  nama: string;
  surah: string;
  ayatMulai: number;
  ayatAkhir: number;
}

interface NilaiTahfidzData {
  id?: number;
  residentId: number;
  targetHafalanId: number;
  status: string;
  nilaiHuruf: string | null;
  resident?: string;
  nim?: string;
  target?: string;
}

interface RevisiNilaiTahfidzModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
  mode: "add" | "edit";
  data: NilaiTahfidzData | null;
  residents: Resident[];
  targetHafalan: TargetHafalan[];
}

const NILAI_OPTIONS = ["A", "A-", "B+", "B", "B-", "C+", "C"];
const STATUS_OPTIONS = ["SELESAI", "BELUM SELESAI"];

export default function RevisiNilaiTahfidzModal({
  isOpen,
  onClose,
  onSave,
  mode,
  data,
  residents,
  targetHafalan,
}: RevisiNilaiTahfidzModalProps) {
  const [form, setForm] = useState({
    residentId: 0,
    targetHafalanId: 0,
    status: "PROGRESS",
    nilaiHuruf: "",
  });

  useEffect(() => {
    console.log("🔍 Modal Debug - Residents:", residents);
    console.log("🔍 Modal Debug - Target Hafalan:", targetHafalan);
    console.log("🔍 Modal Debug - Mode:", mode);
    console.log("🔍 Modal Debug - Data:", data);
  }, [residents, targetHafalan, mode, data]);

  useEffect(() => {
    if (mode === "edit" && data) {
      setForm({
        residentId: data.residentId,
        targetHafalanId: data.targetHafalanId,
        status: data.status,
        nilaiHuruf: data.nilaiHuruf || "",
      });
    } else {
      // Reset untuk mode add
      setForm({
        residentId: 0,
        targetHafalanId: 0,
        status: "BELUM SELESAI",
        nilaiHuruf: "",
      });
    }
  }, [mode, data, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Validasi
    if (
      !form.residentId ||
      !form.targetHafalanId ||
      !form.status ||
      !form.nilaiHuruf
    ) {
      Swal.fire({
        icon: "error",
        title: "Validasi Gagal",
        text: "Semua field wajib diisi!",
        confirmButtonColor: "#dc2626",
      });
      return;
    }

    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-[550px] max-h-[90vh] overflow-y-auto border-2 border-[#004220]">
        <h2 className="text-2xl font-bold mb-6 text-[#004220] border-b-2 border-[#004220] pb-3">
          {mode === "add" ? "Tambah Nilai Tahfidz" : "Revisi Nilai Tahfidz"}
        </h2>

        {mode === "edit" && (
          <div className="mb-4 p-3 bg-blue-50 border-l-4 border-blue-500 text-blue-700 text-sm">
            <p className="font-semibold">📝 Mode Revisi</p>
            <p className="mt-1">
              Resident sudah terpilih. Anda dapat mengubah Target Hafalan,
              Status, dan Nilai.
            </p>
          </div>
        )}

        {/* Resident Dropdown */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-[#004220] block mb-2">
            Nama Resident <span className="text-red-600">*</span>
          </label>
          <select
            value={form.residentId}
            onChange={(e) =>
              setForm({ ...form, residentId: Number(e.target.value) })
            }
            disabled={mode === "edit"}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-800 font-medium"
          >
            <option value={0}>-- Pilih Resident --</option>
            {residents.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} - {r.nim}
              </option>
            ))}
          </select>
        </div>

        {/* Target Hafalan Dropdown */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-[#004220] block mb-2">
            Target Hafalan <span className="text-red-600">*</span>
          </label>
          <select
            value={form.targetHafalanId}
            onChange={(e) =>
              setForm({ ...form, targetHafalanId: Number(e.target.value) })
            }
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] text-gray-800 font-medium"
          >
            <option value={0}>-- Pilih Target Hafalan --</option>
            {targetHafalan.map((t) => (
              <option key={t.id} value={t.id}>
                {t.nama} - {t.surah} (Ayat {t.ayatMulai}-{t.ayatAkhir})
              </option>
            ))}
          </select>
        </div>

        {/* Status Dropdown */}
        <div className="mb-5">
          <label className="text-sm font-semibold text-[#004220] block mb-2">
            Status <span className="text-red-600">*</span>
          </label>
          <select
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] text-gray-800 font-medium"
          >
            {STATUS_OPTIONS.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
        </div>

        {/* Nilai Huruf Dropdown */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-[#004220] block mb-2">
            Nilai Huruf <span className="text-red-600">*</span>
          </label>
          <select
            value={form.nilaiHuruf}
            onChange={(e) => setForm({ ...form, nilaiHuruf: e.target.value })}
            className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] text-gray-800 font-medium"
          >
            <option value="">-- Pilih Nilai --</option>
            {NILAI_OPTIONS.map((nilai) => (
              <option key={nilai} value={nilai}>
                {nilai}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 mt-8 pt-4 border-t-2 border-gray-200">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 transition"
          >
            Batal
          </button>
          <button
            onClick={handleSubmit}
            className="px-6 py-2.5 rounded-lg bg-[#004220] text-white font-semibold hover:bg-[#005a2c] transition shadow-md"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}
