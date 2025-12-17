import React from "react";

interface AssignmentData {
  id: number;
  materiId: number;
  judul: string;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawabanBenar: string;
  soalImageUrl?: string | null;
  createdAt?: string;
  materi?: {
    id: number;
    judul: string;
    kategori: {
      id: number;
      nama: string;
    };
  };
}

interface AssignmentViewModalProps {
  open: boolean;
  assignment: AssignmentData | null;
  onClose: () => void;
}

const AssignmentViewModal: React.FC<AssignmentViewModalProps> = ({
  open,
  assignment,
  onClose,
}) => {
  if (!open || !assignment) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-[500px] text-left">
        <h2 className="text-2xl font-bold mb-6 text-[#004220] text-center">
          Detail Assignment
        </h2>
        <div className="space-y-2">
          <div>
            <span className="font-semibold text-[#004220]">Judul:</span>
            <span className="ml-2 text-gray-800">{assignment.judul}</span>
          </div>
          <div>
            <span className="font-semibold text-[#004220]">Pertanyaan:</span>
            <span className="ml-2 text-gray-800">{assignment.pertanyaan}</span>
          </div>
          <div>
            <span className="font-semibold text-[#004220]">Materi:</span>
            <span className="ml-2 text-gray-800">
              {assignment.materi?.judul || "-"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-[#004220]">Kategori:</span>
            <span className="ml-2 text-gray-800">
              {assignment.materi?.kategori?.nama || "-"}
            </span>
          </div>
          <div>
            <span className="font-semibold text-[#004220]">Opsi A:</span>
            <span className="ml-2 text-gray-800">{assignment.opsiA}</span>
          </div>
          <div>
            <span className="font-semibold text-[#004220]">Opsi B:</span>
            <span className="ml-2 text-gray-800">{assignment.opsiB}</span>
          </div>
          <div>
            <span className="font-semibold text-[#004220]">Opsi C:</span>
            <span className="ml-2 text-gray-800">{assignment.opsiC}</span>
          </div>
          <div>
            <span className="font-semibold text-[#004220]">Opsi D:</span>
            <span className="ml-2 text-gray-800">{assignment.opsiD}</span>
          </div>
          <div>
            <span className="font-semibold text-[#004220]">Jawaban Benar:</span>
            <span className="ml-2 text-gray-800">
              {assignment.jawabanBenar}
            </span>
          </div>
          {assignment.soalImageUrl && (
            <div>
              <span className="font-semibold text-[#004220]">Gambar Soal:</span>
              <div className="mt-2">
                <img src={assignment.soalImageUrl} alt="Soal" className="max-w-full h-auto rounded border" />
              </div>
            </div>
          )}
        </div>
        <div className="flex justify-end mt-8">
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-full font-semibold"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentViewModal;
