"use client";

import { useAuth } from "@/lib/useAuth";
import { getUser, clearAuth } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import LogoutModal from "@/components/LogoutModal";

export default function AdminDashboard() {
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

  const features = [
    {
      title: "Data Resident",
      icon: "/data_resident.svg",
      href: "/admin/resident",
    },
    {
      title: "Data Asisten Musyrif",
      icon: "/data_asisten.svg",
      href: "/admin/asisten",
    },
    {
      title: "Data Musyrif",
      icon: "/data_musyrif.svg",
      href: "/admin/musyrif",
    },
    {
      title: "Materi Pembelajaran",
      icon: "/materi.svg",
      href: "/admin/materi",
    },
    {
      title: "Target Hafalan",
      icon: "/target.svg",
      href: "/admin/target",
    },
    {
      title: "Sub Target",
      icon: "/subtarget.svg",
      href: "/admin/subtarget",
    },
    {
      title: "Asrama",
      icon: "/asrama.svg",
      href: "/admin/asrama",
    },
  ];

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
        <h1 className="text-center text-lg font-semibold">
          Dashboard Admin
        </h1>

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

      {/* === MENU GRID === */}
      <div className="flex justify-center flex-wrap gap-10 mt-14 mb-16">
        {features.map((f) => (
          <a
            key={f.title}
            href={f.href}
            className="flex flex-col items-center text-center bg-[#D9D9D9] hover:bg-[#C9DCCC] transition rounded-xl w-44 h-36 justify-center shadow"
          >
            <img src={f.icon} alt={f.title} className="h-14 mb-3" />
            <p className="text-[#0D6B44] font-semibold text-sm">{f.title}</p>
          </a>
        ))}
      </div>

      {/* === FOOTER === */}
      <footer className="bg-[#004220] text-center text-white py-4 text-sm">
        © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
      </footer>

    </div>
  );
}
