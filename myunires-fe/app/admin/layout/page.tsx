"use client";

import { useAuth } from "@/lib/useAuth";
import { getUser, clearAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutModal from "@/components/LogoutModal";


export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth(["ADMIN"]); // hanya admin yg boleh masuk
  const [userData, setUserData] = useState<any>(null);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) setUserData(currentUser);
  }, []);

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F8F8F8]">

      {/* === HEADER === */}
      <header className="flex justify-between items-center px-10 py-4 bg-white shadow">
        <div className="flex items-center gap-4">
          <img src="/lg_umy.svg" alt="UMY" className="h-8" />
          <img src="/lg_unires.svg" alt="Unires" className="h-8" />
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          Log Out
        </button>
      </header>

      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />

      {/* === SUBHEADER HIJAU === */}
      <div className="bg-[#004220] text-white py-4 relative">
        <h1 className="text-center text-lg font-semibold">Dashboard Admin</h1>

        {/* Profile */}
        <div className="flex items-center ml-7 mt-4">
          <div className="bg-yellow-400 text-black w-11 h-11 flex items-center justify-center rounded-full font-bold text-lg">
            {userData?.name ? userData.name.charAt(0).toUpperCase() : "A"}
          </div>
          <div className="ml-3 flex flex-col">
            <p className="font-medium">{userData?.name || "Loading..."}</p>
            <p className="text-sm">{userData?.email || ""}</p>
          </div>
        </div>
      </div>

      {/* === PAGE CONTENT === */}
      <main className="flex-1 px-6 py-10">
        {children}
      </main>

      {/* === FOOTER === */}
      <footer className="bg-[#004220] text-center text-white py-4 text-sm mt-10">
        © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
      </footer>
    </div>
  );
}
