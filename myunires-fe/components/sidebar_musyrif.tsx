"use client";

import {
  FiMenu,
  FiX,
  FiHome,
  FiUsers,
  FiAward,
  FiEdit3,
  FiLogOut,
} from "react-icons/fi";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import LogoutModal from "@/components/LogoutModal";
import { clearAuth } from "@/lib/api";

type Props = {
  isOpen: boolean;
  toggleSidebar: () => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
};

type UserData = {
  id: number;
  name: string;
  email: string;
};

export default function Sidebar({
  isOpen,
  toggleSidebar,
  mobileOpen,
  setMobileOpen,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch profile musyrif (pastikan backend ada GET /api/musyrif/profile)
  useEffect(() => {
    let active = true;

    (async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await fetch("http://localhost:3001/api/musyrif/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const json = await res.json();
        if (!active) return;
        if (json?.success) setUserData(json.data);
      } catch (e) {
        // no-op
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, []);

  const initial = useMemo(() => {
    const name = userData?.name || "";
    return name ? name.charAt(0).toUpperCase() : "M";
  }, [userData]);

  const menuItems = useMemo(
    () => [
      {
        title: "Dashboard",
        icon: <FiHome size={18} />,
        href: "/pembina/dashboard",
      },
      {
        title: "Data Resident",
        icon: <FiUsers size={18} />,
        href: "/pembina/dashboard/resident",
      },
      {
        title: "Nilai Tahfidz",
        icon: <FiAward size={18} />,
        href: "/pembina/dashboard/tahfidz",
      },
      {
        title: "Buat Assignment",
        icon: <FiEdit3 size={18} />,
        href: "/pembina/dashboard/assignment",
      },
    ],
    []
  );

  const go = (href: string) => {
    router.push(href);
    setMobileOpen(false);
  };

  // Logout yang benar-benar jalan saat user confirm di modal
  const handleLogout = () => {
    clearAuth();
    setShowLogoutModal(false);
    setMobileOpen(false);
    router.replace("/login");
  };

  const ProfileBlock = ({ compact }: { compact: boolean }) => (
    <div
      className={["rounded-2xl border bg-white", compact ? "p-2" : "p-3"].join(
        " "
      )}
    >
      <div
        className={[
          "flex items-center",
          compact ? "justify-center" : "gap-3",
        ].join(" ")}
      >
        {loading ? (
          <div className="bg-gray-200 animate-pulse w-11 h-11 rounded-full" />
        ) : (
          <div className="bg-yellow-400 text-black w-11 h-11 flex items-center justify-center rounded-full font-bold text-lg">
            {initial}
          </div>
        )}

        {!compact && (
          <div className="min-w-0 leading-tight">
            {loading ? (
              <>
                <div className="bg-gray-200 animate-pulse h-4 w-28 rounded mb-1" />
                <div className="bg-gray-200 animate-pulse h-3 w-36 rounded" />
              </>
            ) : (
              <>
                <p className="font-semibold text-sm text-[#004220] truncate">
                  {userData?.name || "Musyrif"}
                </p>
                <p className="text-xs text-[#004220]/80 truncate">
                  {userData?.email || ""}
                </p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const NavList = ({ compact }: { compact: boolean }) => (
    <nav className="mt-3">
      <ul className="space-y-1">
        {menuItems.map((item) => {
          // biar nested route ikut ke-highlight
          const active =
            pathname === item.href ||
            (item.href !== "/pembina/dashboard" &&
              pathname?.startsWith(item.href));

          return (
            <li key={item.href}>
              <button
                type="button"
                onClick={() => go(item.href)}
                className={[
                  "w-full flex items-center gap-3 rounded-xl px-3 py-2.5 transition",
                  active
                    ? "bg-[#0D6B44] text-white shadow-sm"
                    : "text-[#0D6B44] hover:bg-[#E6F3EA]",
                  compact ? "justify-center" : "justify-start",
                ].join(" ")}
                title={compact ? item.title : undefined}
              >
                <span className="shrink-0">{item.icon}</span>
                {!compact && (
                  <span className="text-sm font-semibold">{item.title}</span>
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </nav>
  );

  const BottomActions = ({ compact }: { compact: boolean }) => (
    <div className="mt-auto px-3 pb-3">
      <div className="rounded-2xl border bg-white overflow-hidden">
        <button
          type="button"
          onClick={() => setShowLogoutModal(true)} // buka modal dulu
          className={[
            "w-full flex items-center gap-3 px-3 py-3 transition",
            "text-red-700 hover:bg-red-50",
            compact ? "justify-center" : "justify-start",
          ].join(" ")}
          title={compact ? "Logout" : undefined}
        >
          <FiLogOut size={18} />
          {!compact && <span className="text-sm font-semibold">Logout</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* ===== MOBILE DRAWER ===== */}
      <div
        className={[
          "fixed inset-0 z-[60] md:hidden transition",
          mobileOpen ? "pointer-events-auto" : "pointer-events-none",
        ].join(" ")}
      >
        <div
          onClick={() => setMobileOpen(false)}
          className={[
            "absolute inset-0 bg-black/40 transition-opacity",
            mobileOpen ? "opacity-100" : "opacity-0",
          ].join(" ")}
        />

        <aside
          className={[
            "absolute left-0 top-16 bottom-0 w-[280px] bg-white border-r shadow-xl",
            "transition-transform duration-300 flex flex-col",
            mobileOpen ? "translate-x-0" : "-translate-x-full",
          ].join(" ")}
        >
          <div className="px-4 pt-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-[#004220]">
                Menu Musyrif
              </p>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-lg hover:bg-gray-100"
                aria-label="Close"
              >
                <FiX size={18} className="text-[#0D6B44]" />
              </button>
            </div>

            <div className="mt-4">
              <ProfileBlock compact={false} />
              <NavList compact={false} />
            </div>
          </div>

          <BottomActions compact={false} />
        </aside>
      </div>

      {/* ===== DESKTOP SIDEBAR ===== */}
      <aside
        className={[
          "hidden md:flex fixed top-16 left-0 bottom-0 z-20",
          "flex-col bg-white border-r transition-all duration-300",
          isOpen ? "w-64" : "w-14",
        ].join(" ")}
      >
        <div
          className={[
            "h-12 flex items-center",
            isOpen ? "px-4 justify-end" : "px-2 justify-center",
          ].join(" ")}
        >
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-lg hover:bg-emerald-50 transition"
            aria-label="Toggle sidebar"
          >
            {isOpen ? (
              <FiX size={18} className="text-[#0D6B44]" />
            ) : (
              <FiMenu size={18} className="text-[#0D6B44]" />
            )}
          </button>
        </div>

        <div className="px-3 pb-3">
          <ProfileBlock compact={!isOpen} />
          <NavList compact={!isOpen} />
        </div>

        <BottomActions compact={!isOpen} />
      </aside>

      {/* ===== LOGOUT MODAL ===== */}
      <LogoutModal
        open={showLogoutModal}
        onCancel={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
      />
    </>
  );
}
