"use client";

import { useAuth } from "@/lib/useAuth";
import { getUser, clearAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutModal from "@/components/LogoutModal";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user } = useAuth(["ADMIN"]);
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

  const initial = (userData?.name?.trim()?.[0] || "A").toUpperCase();

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F8F8]">
      {/* === HEADER === */}
      <header className="sticky top-0 z-40 bg-white shadow-sm">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              <img src="/lg_umy.svg" alt="UMY" className="h-7 sm:h-8 w-auto" />
              <img src="/lg_unires.svg" alt="Unires" className="h-7 sm:h-8 w-auto" />
            </div>

            <button
              onClick={() => setShowLogoutModal(true)}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold px-3 sm:px-4 py-2 rounded-md transition text-sm sm:text-base"
            >
              Log Out
            </button>
          </div>
        </div>
      </header>

      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />

      {/* === SUBHEADER HIJAU === */}
      <div className="bg-[#004220] text-white">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-base sm:text-lg font-semibold text-center sm:text-left">
              Dashboard Admin
            </h1>

            {/* Profile (jadi kanan di tablet/desktop, rapi di mobile) */}
            <div className="flex items-center gap-3">
              <div className="bg-yellow-400 text-black w-10 h-10 sm:w-11 sm:h-11 flex items-center justify-center rounded-full font-bold text-base sm:text-lg">
                {initial}
              </div>
              <div className="min-w-0">
                <p className="font-medium leading-tight truncate">
                  {userData?.name || "Loading..."}
                </p>
                <p className="text-sm text-white/80 leading-tight truncate">
                  {userData?.email || ""}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* === PAGE CONTENT === */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          {children}
        </div>
      </main>

      {/* === FOOTER === */}
      <footer className="bg-[#004220] text-center text-white py-4 text-xs sm:text-sm">
        © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
      </footer>
    </div>
  );
}
