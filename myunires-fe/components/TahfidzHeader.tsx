import React from "react";

interface TahfidzHeaderProps {
  onLogout: () => void;
}

const TahfidzHeader: React.FC<TahfidzHeaderProps> = ({ onLogout }) => (
  <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-6 border-b">
    <div className="flex items-center gap-3">
      <img src="/lg_umy.svg" alt="UMY" className="h-10 object-contain" />
      <img src="/lg_unires.svg" alt="UNIRES" className="h-10 object-contain" />
    </div>
    <button
      onClick={onLogout}
      className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
    >
      Logout
    </button>
  </header>
);

export default TahfidzHeader;
