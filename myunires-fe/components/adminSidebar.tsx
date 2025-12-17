"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type AdminSidebarProps = {
  userName?: string;
  userEmail?: string;
};

const menu = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "🏠" },
  { label: "Data Resident", href: "/admin/resident", icon: "👥" },
  { label: "Data Asisten Musyrif", href: "/admin/asisten", icon: "🎓" },
  { label: "Data Musyrif", href: "/admin/pembina", icon: "👨‍🏫" },
  { label: "Materi Pembelajaran", href: "/admin/materi", icon: "📚" },
  { label: "Target Hafalan", href: "/admin/target-hafalan", icon: "🎯" },
  { label: "Sub Target", href: "/admin/subtarget", icon: "📋" },
  { label: "Asrama", href: "/admin/asrama", icon: "🏢" },
];

export default function AdminSidebar({ userName = "Admin", userEmail = "" }: AdminSidebarProps) {
  const pathname = usePathname();
  const initial = (userName?.trim()?.[0] || "A").toUpperCase();

  return (
    <aside className="w-[260px] bg-white border-r flex-shrink-0">
      {/* Profile block (sesuai foto: avatar bulat kuning + nama + email) */}
      <div className="px-4 py-5 flex items-center gap-3 border-b">
        <div className="bg-yellow-400 text-black w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
          {initial}
        </div>
        <div className="leading-tight min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">{userName}</p>
          <p className="text-xs text-gray-600 truncate">{userEmail}</p>
        </div>
      </div>

      {/* Menu list */}
      <nav className="px-3 py-4">
        <ul className="space-y-1">
          {menu.map((item) => {
            // Active jika exact match atau starts with (kecuali /admin agar tidak selalu aktif)
            const isActive =
              pathname === item.href ||
              (item.href !== "/admin" && pathname.startsWith(item.href));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={[
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition",
                    isActive
                      ? "bg-[#004220] text-white shadow-sm"
                      : "text-gray-700 hover:bg-gray-100",
                  ].join(" ")}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
