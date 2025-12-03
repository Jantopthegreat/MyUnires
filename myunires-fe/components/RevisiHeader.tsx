import Sidebar from "@/components/Sidebar";
import LogoutModal from "@/components/LogoutModal";
import { FaArrowLeft } from "react-icons/fa";
import React from "react";

export default function RevisiHeader({
  isOpen,
  toggleSidebar,
  showLogoutModal,
  setShowLogoutModal,
  onLogout,
}: {
  isOpen: boolean;
  toggleSidebar: () => void;
  showLogoutModal: boolean;
  setShowLogoutModal: (v: boolean) => void;
  onLogout: () => void;
}) {
  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-6 border-b">
        <div className="flex items-center gap-3">
          <img src="/lg_umy.svg" alt="UMY" className="h-10 object-contain" />
          <img
            src="/lg_unires.svg"
            alt="UNIRES"
            className="h-10 object-contain"
          />
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          Logout
        </button>
      </header>
      <Sidebar isOpen={isOpen} toggleSidebar={toggleSidebar} />
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={onLogout}
      />
    </>
  );
}
