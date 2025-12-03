"use client";
import { useState, useEffect, ChangeEvent } from "react";

// 🔹 Tipe data Resident
interface Resident {
  name: string;
  usroh: string;
  nilai: string;
}

// 🔹 Props untuk komponen EditModal_Musyrif
interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Resident) => void;
  data: Resident | null;
}

export default function EditModal_Musyrif({
  isOpen,
  onClose,
  onSave,
  data,
}: EditModalProps) {
  const [form, setForm] = useState<Resident>({ name: "", usroh: "", nilai: "" });

  useEffect(() => {
    if (data) setForm(data);
  }, [data]);

  if (!isOpen) return null;

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!form.name || !form.usroh || !form.nilai) {
      alert("Semua field wajib diisi!");
      return;
    }
    onSave(form); // kirim data ke parent
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-lg p-6 w-[400px]">
        <h2 className="text-lg font-semibold mb-4">Tambah Nilai Resident</h2>

        <div className="mb-3">
          <label className="text-sm font-medium">
            Nama Lengkap <span className="text-red-500">*</span>
          </label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 mt-1"
            placeholder="Masukkan Nama Lengkap Resident"
          />
        </div>

        <div className="mb-3">
          <label className="text-sm font-medium">
            Usroh <span className="text-red-500">*</span>
          </label>
          <input
            name="usroh"
            value={form.usroh}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 mt-1"
            placeholder="Masukkan Usroh"
          />
        </div>

        <div className="mb-3">
          <label className="text-sm font-medium">
            Nilai <span className="text-red-500">*</span>
          </label>
          <input
            name="nilai"
            value={form.nilai}
            onChange={handleChange}
            className="w-full border rounded-md px-3 py-2 mt-1"
            placeholder="Masukkan Nilai A/B/C/D/E"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border text-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md bg-[#004220] text-white"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
