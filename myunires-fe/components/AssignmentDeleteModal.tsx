import React from "react";

interface AssignmentDeleteModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const AssignmentDeleteModal: React.FC<AssignmentDeleteModalProps> = ({
  open,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-[400px] text-center">
        <h2 className="text-xl font-bold mb-4 text-[#E50914]">
          Hapus Assignment
        </h2>
        <p className="text-gray-700 text-sm mb-6">
          Apakah Anda yakin ingin menghapus assignment ini?
        </p>
        <div className="flex justify-center gap-4 mt-6">
          <button
            onClick={onCancel}
            className="bg-gray-400 hover:bg-gray-500 text-white px-6 py-2 rounded-full"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="bg-[#E50914] hover:bg-red-700 text-white px-6 py-2 rounded-full"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDeleteModal;
