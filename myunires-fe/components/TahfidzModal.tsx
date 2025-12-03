import React from "react";
import { NilaiTahfidzData } from "@/components/TahfidzTable";

interface Resident {
  id: number;
  nama: string;
  nim: string;
  email: string;
  usroh?: string;
}

interface TargetHafalan {
  id: number;
  nama: string;
}

interface TahfidzModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  mode: "add" | "edit";
  data: NilaiTahfidzData | null;
  residents: Resident[];
  targetHafalan: TargetHafalan[];
}


import { useState, useEffect } from "react";

const TahfidzModal: React.FC<TahfidzModalProps> = ({
  isOpen,
  onClose,
  onSave,
  mode,
  data,
  residents,
  targetHafalan,
}) => {
  const [form, setForm] = useState({
    residentId: "",
    targetHafalanId: "",
    surah: "",
    nilaiHuruf: "",
    tanggal: "",
  });

  useEffect(() => {
    if (mode === "edit" && data) {
      setForm({
        residentId: String(data.residentId),
        targetHafalanId: String(data.targetHafalanId),
        surah: data.surah || "",
        nilaiHuruf: data.nilaiHuruf || "",
        tanggal: data.tanggal ? data.tanggal.slice(0, 10) : "",
      });
    } else {
      setForm({
        residentId: "",
        targetHafalanId: "",
        surah: "",
        nilaiHuruf: "",
        tanggal: "",
      });
    }
  }, [isOpen, mode, data]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...form,
      residentId: Number(form.residentId),
      targetHafalanId: Number(form.targetHafalanId),
      tanggal: form.tanggal,
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-[400px]">
        <h2 className="text-xl font-bold mb-4 text-[#004220]">
          {mode === "add" ? "Tambah Nilai Tahfidz" : "Edit Nilai Tahfidz"}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Resident</label>
            <select
              name="residentId"
              value={form.residentId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Pilih Resident</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.nama} ({r.nim})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Target Hafalan</label>
            <select
              name="targetHafalanId"
              value={form.targetHafalanId}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Pilih Target Hafalan</option>
              {targetHafalan.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.nama}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Surah</label>
            <input
              type="text"
              name="surah"
              value={form.surah}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Nilai Huruf</label>
            <select
              name="nilaiHuruf"
              value={form.nilaiHuruf}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            >
              <option value="">Pilih Nilai</option>
              <option value="A">A</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B">B</option>
              <option value="B-">B-</option>
              <option value="C+">C+</option>
              <option value="C">C</option>
              <option value="C-">C-</option>
              <option value="D">D</option>
              <option value="E">E</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Tanggal Penilaian</label>
            <input
              type="date"
              name="tanggal"
              value={form.tanggal}
              onChange={handleChange}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>
          <div className="flex justify-end gap-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#004220] hover:bg-[#005a2c] text-white px-4 py-2 rounded"
            >
              {mode === "add" ? "Simpan" : "Update"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TahfidzModal;
