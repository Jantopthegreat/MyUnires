"use client";

import { useRouter, usePathname } from "next/navigation";
import { getUser } from "@/lib/api";
import { useEffect, useState } from "react";

export default function SidebarAdmin() {
  const router = useRouter();
  const pathname = usePathname();
  const [userData, setUserData] = useState<any>(null);

  useEffect(() => {
    const user = getUser();
    if (user) setUserData(user);
  }, []);

  const menuItems = [
    { title: "Dashboard", href: "/admin/dashboard" },
    { title: "Data Resident", href: "/admin/resident" },
    { title: "Data Asisten Musyrif", href: "/admin/asisten" },
    { title: "Data Musyrif", href: "/admin/musyrif" },
    { title: "Materi Pembelajaran", href: "/admin/materi" },
    { title: "Target Hafalan", href: "/admin/hafalan" },
    { title: "Sub Target", href: "/admin/subtarget" },
    { title: "Asrama", href: "/admin/asrama" },
  ];

  return (
    <aside className="w-64 bg-white min-h-screen shadow fixed left-0 top-0 pt-20">
      
      {/* USER INFO */}
      <div className="px-5 mb-6">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 bg-yellow-400 rounded-full flex items-center justify-center font-bold">
            {userData?.name?.charAt(0) || "A"}
          </div>
          <div>
            <p className="font-semibold text-sm text-[#004220]">
              {userData?.name || "Admin"}
            </p>
            <p className="text-xs text-gray-500">
              {userData?.email || ""}
            </p>
          </div>
        </div>
      </div>

      {/* MENU */}
      <nav className="px-3">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <div
              key={item.href}
              onClick={() => router.push(item.href)}
              className={`px-4 py-3 rounded-lg cursor-pointer mb-1 transition
                ${
                  isActive
                    ? "bg-[#0D6B44] text-white"
                    : "text-[#0D6B44] hover:bg-[#E6F3EA]"
                }`}
            >
              {item.title}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
