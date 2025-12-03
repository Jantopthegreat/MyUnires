import React from "react";

interface AssignmentAddEditModalProps {
  open: boolean;
  mode: "add" | "edit";
  formData: any;
  setFormData: (data: any) => void;
  kategoriList: Array<{ id: number; nama: string }>;
  materiList: Array<{ id: number; judul: string; kategoriId: number }>;
  selectedKategoriForm: string;
  setSelectedKategoriForm: (val: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}

const AssignmentAddEditModal: React.FC<AssignmentAddEditModalProps> = ({
  open,
  mode,
  formData,
  setFormData,
  kategoriList,
  materiList,
  selectedKategoriForm,
  setSelectedKategoriForm,
  onSubmit,
  onClose,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-[500px] text-left">
        <h2 className="text-2xl font-bold mb-6 text-[#004220] text-center">
          {mode === "add" ? "Tambah Assignment" : "Edit Assignment"}
        </h2>
        <div className="mb-3">
          <label className="block text-sm mb-1 font-semibold text-[#004220]">
            Kategori Materi
          </label>
          <select
            value={selectedKategoriForm}
            onChange={(e) => setSelectedKategoriForm(e.target.value)}
            className="border rounded-xl px-3 py-2 w-full"
          >
            <option value="">Pilih Kategori</option>
            {kategoriList.map((kategori) => (
              <option key={kategori.id} value={kategori.id}>
                {kategori.nama}
              </option>
            ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1 font-semibold text-[#004220]">
            Materi
          </label>
          <select
            value={formData.materiId}
            onChange={(e) =>
              setFormData({ ...formData, materiId: e.target.value })
            }
            className="border rounded-xl px-3 py-2 w-full"
          >
            <option value="">Pilih Materi</option>
            {materiList
              .filter((m) => String(m.kategoriId) === selectedKategoriForm)
              .map((materi) => (
                <option key={materi.id} value={materi.id}>
                  {materi.judul}
                </option>
              ))}
          </select>
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1 font-semibold text-[#004220]">
            Judul Assignment
          </label>
          <input
            type="text"
            value={formData.judul}
            onChange={(e) =>
              setFormData({ ...formData, judul: e.target.value })
            }
            className="border rounded-xl px-3 py-2 w-full"
          />
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1 font-semibold text-[#004220]">
            Pertanyaan
          </label>
          <input
            type="text"
            value={formData.pertanyaan}
            onChange={(e) =>
              setFormData({ ...formData, pertanyaan: e.target.value })
            }
            className="border rounded-xl px-3 py-2 w-full"
          />
        </div>
        <div className="mb-3 grid grid-cols-2 gap-2">
          <div>
            <label className="block text-sm mb-1 font-semibold text-[#004220]">
              Opsi A
            </label>
            <input
              type="text"
              value={formData.opsiA}
              onChange={(e) =>
                setFormData({ ...formData, opsiA: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold text-[#004220]">
              Opsi B
            </label>
            <input
              type="text"
              value={formData.opsiB}
              onChange={(e) =>
                setFormData({ ...formData, opsiB: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold text-[#004220]">
              Opsi C
            </label>
            <input
              type="text"
              value={formData.opsiC}
              onChange={(e) =>
                setFormData({ ...formData, opsiC: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 font-semibold text-[#004220]">
              Opsi D
            </label>
            <input
              type="text"
              value={formData.opsiD}
              onChange={(e) =>
                setFormData({ ...formData, opsiD: e.target.value })
              }
              className="border rounded px-3 py-2 w-full"
            />
          </div>
        </div>
        <div className="mb-3">
          <label className="block text-sm mb-1 font-semibold text-[#004220]">
            Jawaban Benar
          </label>
          <select
            value={formData.jawabanBenar}
            onChange={(e) =>
              setFormData({ ...formData, jawabanBenar: e.target.value })
            }
            className="border rounded-xl px-3 py-2 w-full"
          >
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
            <option value="D">D</option>
          </select>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-full font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            className="bg-[#004220] hover:bg-green-700 text-white px-6 py-2 rounded-full font-semibold"
          >
            {mode === "add" ? "Tambah" : "Simpan"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentAddEditModal;
