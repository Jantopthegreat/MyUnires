"use client";

import { FiMenu, FiX } from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getUser } from "@/lib/api";

type Props = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

export default function Sidebar({ isOpen, toggleSidebar }: Props) {
  const router = useRouter();
  const pathname = usePathname(); // ambil path URL aktif
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUserData(currentUser);
    }
  }, []);

  // Fungsi untuk mendapatkan initial dari nama
  const getInitial = (name: string): string => {
    if (!name) return "M";
    return name.charAt(0).toUpperCase();
  };

  // Daftar menu navigasi
  const menuItems = [
    {
      title: "Dashboard",
      icon: "/dashboard.svg", // kamu bisa ganti file SVG-nya ke icon home
      href: "/pembina/dashboard",
    },
    {
      title: "Resident Per Lantai",
      icon: "/res_perlantai.svg",
      href: "/pembina/dashboard/resident",
    },
    {
      title: "Nilai Tahfidz",
      icon: "/tinjau_nilaiTahfidz.svg",
      href: "/pembina/dashboard/tahfidz",
    },
    {
      title: "Revisi Nilai",
      icon: "/rev_nilaiTahfidz.svg",
      href: "/pembina/dashboard/revisi",
    },
    {
      title: "Buat Assignment",
      icon: "/assigment.svg",
      href: "/pembina/dashboard/assignment",
    },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 bottom-0 z-20 flex flex-col bg-white transition-all duration-300 ease-in-out
        ${isOpen ? "w-64" : "w-12"}`}
    >
      {/* Tombol toggle */}
      <div className="mt-4 flex">
        {isOpen ? (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-gray-100"
          >
            <FiX size={18} className="text-[#0D6B44]" />
          </button>
        ) : (
          <button
            onClick={toggleSidebar}
            className="p-1 rounded hover:bg-gray-100"
          >
            <FiMenu size={18} className="text-[#0D6B44]" />
          </button>
        )}
      </div>

      {/* Isi sidebar */}
      {isOpen && (
        <div className="flex flex-col flex-1 mt-4">
          {/* User info */}
          <div className="flex items-center px-5 mb-4 mt-2">
            <div className="bg-yellow-400 text-black w-11 h-11 flex items-center justify-center rounded-full font-bold text-lg">
              {userData ? getInitial(userData.name) : "M"}
            </div>
            <div className="ml-3 leading-tight">
              <p className="font-medium text-sm text-[#004220]">
                {userData ? userData.name : "Loading..."}
              </p>
              <p className="text-xs text-[#004220]">
                {userData ? userData.email : ""}
              </p>
            </div>
          </div>

          {/* Menu navigasi */}
          <nav className="mt-2 flex-1">
            <ul className="text-sm font-medium flex flex-col px-3">
              {menuItems.map((item, i) => {
                const isActive = pathname === item.href; // deteksi halaman aktif
                return (
                  <li
                    key={i}
                    onClick={() => router.push(item.href)}
                    className={`flex items-center gap-3 py-3 px-4 rounded-md cursor-pointer transition
                      ${
                        isActive
                          ? "bg-[#0D6B44] text-white"
                          : "text-[#0D6B44] hover:bg-[#E6F3EA]"
                      }`}
                  >
                    <img src={item.icon} className="h-5" alt={item.title} />
                    <span>{item.title}</span>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      )}

      {/* Footer sidebar */}
      <footer className="bg-[#004220] h-10 fixed bottom-0 left-0 right-0 z-10" />
    </aside>
  );
}
