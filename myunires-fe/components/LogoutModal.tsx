import React from "react";

interface LogoutModalProps {
  open: boolean;
  onCancel: () => void;
  onLogout: () => void;
}

const LogoutModal: React.FC<LogoutModalProps> = ({
  open,
  onCancel,
  onLogout,
}) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
      <div className="bg-[#d1d4d0] rounded-3xl shadow-lg p-8 w-[400px] text-center">
        <h2 className="text-2xl font-semibold text-[#004220] mb-4">Log Out</h2>
        <p className="text-gray-700 text-sm mb-1">
          Tindakan ini akan mengakhiri sesi login Anda.
        </p>
        <p className="text-gray-700 text-sm mb-6">
          Apakah Anda ingin melanjutkan?
        </p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onCancel}
            className="bg-[#FFC107] hover:bg-[#ffb300] text-white font-semibold px-6 py-2 rounded-full shadow-md"
          >
            Cancel
          </button>
          <button
            onClick={onLogout}
            className="bg-[#E50914] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full shadow-md"
          >
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;
