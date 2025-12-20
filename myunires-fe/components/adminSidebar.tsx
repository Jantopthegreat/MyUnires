"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type AdminSidebarProps = {
  userName?: string;
  userEmail?: string;
  onLogoutClick?: () => void;
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

export default function AdminSidebar({
  userName = "Admin",
  userEmail = "",
  onLogoutClick,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const initial = (userName?.trim()?.[0] || "A").toUpperCase();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile: tombol buka drawer saja (tanpa profile) */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="md:hidden fixed left-4 top-20 z-40 inline-flex items-center justify-center rounded-lg border bg-white px-3 py-2 text-sm shadow"
        aria-label="Open sidebar"
      >
        ☰
      </button>

      {/* Overlay (mobile) */}
      <div
        className={[
          "fixed inset-0 z-40 bg-black/40 md:hidden transition-opacity",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
        onClick={() => setOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={[
          "fixed z-50 inset-y-0 left-0 bg-white border-r",
          "w-[260px] max-w-[85vw]",
          "transform transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
          "md:translate-x-0 md:static md:z-auto md:flex-shrink-0",
          "flex flex-col",
        ].join(" ")}
      >
        {/* Header: profile NYATU di sidebar (semua ukuran) */}
        <div className="px-4 py-5 flex items-center gap-3 border-b">
          <div className="bg-yellow-400 text-black w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
            {initial}
          </div>
          <div className="leading-tight min-w-0">
            <p className="text-sm font-semibold text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-600 truncate">{userEmail}</p>
          </div>

          {/* Close button (mobile) */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="ml-auto md:hidden rounded-lg border px-3 py-2 text-sm"
            aria-label="Close sidebar"
          >
            ✕
          </button>
        </div>

        <nav className="px-3 py-4 overflow-y-auto h-full">
          <ul className="space-y-1">
            {menu.map((item) => {
              const isActive =
                pathname === item.href ||
                (item.href !== "/admin" && pathname.startsWith(item.href));

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={[
                      "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition",
                      "whitespace-nowrap",
                      isActive
                        ? "bg-[#004220] text-white shadow-sm"
                        : "text-gray-700 hover:bg-gray-100",
                    ].join(" ")}
                  >
                    <span className="text-lg shrink-0">{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        <div className="border-t p-3 flex justify-end">
          <button
            type="button"
            onClick={() => onLogoutClick?.()}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-full text-xs shadow transition"
          >
            Log Out
          </button>
        </div>
      </aside>
    </>
  );
}
