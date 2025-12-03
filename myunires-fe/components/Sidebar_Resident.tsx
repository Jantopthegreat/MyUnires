"use client";

import { FiMenu, FiX } from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";

type Props = {
  isOpen: boolean;
  toggleSidebar: () => void;
};

interface UserData {
  id: number;
  name: string;
  email: string;
  nim?: string;
  jurusan?: string;
  angkatan?: number;
}

export default function Sidebar_Resident({ isOpen, toggleSidebar }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const response = await fetch(
          "http://localhost:3001/api/resident/profile",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        const data = await response.json();
        if (data.success) {
          setUserData(data.data);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Get initial huruf pertama dari nama
  const getInitial = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  // Daftar menu untuk resident
  const menuItems = [
    {
      title: "Dashboard",
      icon: "/dashboard.svg", // kamu bisa ganti file SVG-nya ke icon home
      href: "/resident/dashboard",
    },
    {
      title: "Nilai Tahfidz",
      icon: "/Nilai_Tahfidz.svg",
      href: "/resident/nilaiTahfidz",
    },
    {
      title: "Progres Hafalan",
      icon: "/Progres_Hafalan.svg",
      href: "/resident/progresHafalan",
    },
    {
      title: "Materi Pembelajaran",
      icon: "/Materi_Pem.svg",
      href: "/resident/MateriPembelajaran",
    },
    {
      title: "Kerjakan Assignment",
      icon: "/Ker_Ass.svg",
      href: "/resident/kerjakanAssignment",
    },
    {
      title: "Leaderboard",
      icon: "/leaderboard.svg",
      href: "/resident/leaderboard",
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
            {loading ? (
              <div
                className="bg-gray-300 animate-pulse w-11 h-11 rounded-full flex-shrink-0"
                style={{ aspectRatio: "1/1" }}
              ></div>
            ) : (
              <div
                className="bg-yellow-400 text-[#000000] w-11 h-11 flex items-center justify-center rounded-full font-bold text-lg flex-shrink-0"
                style={{ aspectRatio: "1/1" }}
              >
                {userData ? getInitial(userData.name) : "?"}
              </div>
            )}
            <div className="ml-3 leading-tight">
              {loading ? (
                <>
                  <div className="bg-gray-300 animate-pulse h-4 w-24 rounded mb-1"></div>
                  <div className="bg-gray-300 animate-pulse h-3 w-32 rounded"></div>
                </>
              ) : (
                <>
                  <p className="font-medium text-sm text-[#004220]">
                    {userData?.name || "Unknown"}
                  </p>
                  <p className="text-xs text-[#004220]">
                    {userData?.email || "no-email"}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Menu navigasi */}
          <nav className="mt-2 flex-1">
            <ul className="text-sm font-medium flex flex-col px-3">
              {menuItems.map((item, i) => {
                const isActive = pathname === item.href;
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
