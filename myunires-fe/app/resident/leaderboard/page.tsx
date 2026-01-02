"use client";

import { useState, useEffect, useMemo } from "react";
import Sidebar_Resident from "@/components/Sidebar_Resident";
import {
  FaMedal,
  FaSearch,
  FaTrophy,
  FaBook,
  FaClipboardCheck,
} from "react-icons/fa";
import { FiMenu } from "react-icons/fi";

interface LeaderboardData {
  id: number;
  rank: number;
  name: string;
  email: string;
  nim: string;
  usroh: string;
  hafalanSelesai: number;
  assignmentBenar: number;
}

export default function LeaderboardPage() {
  // desktop collapse
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "hafalan" | "assignment"
  >("all");

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3001/api/resident/leaderboard",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        const result = await response.json();
        const data = result.data || result.leaderboard || result;
        const arr = Array.isArray(data) ? data : [];

        setLeaderboardData(arr);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboardData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  const filteredData = useMemo(() => {
    let filtered = [...leaderboardData];

    // filter by selected metric
    if (filterType === "hafalan") {
      filtered = filtered.filter((item) => item.hafalanSelesai > 0);
      filtered.sort((a, b) => b.hafalanSelesai - a.hafalanSelesai);
    } else if (filterType === "assignment") {
      filtered = filtered.filter((item) => item.assignmentBenar > 0);
      filtered.sort((a, b) => b.assignmentBenar - a.assignmentBenar);
    } else {
      // default: rank ascending
      filtered.sort((a, b) => a.rank - b.rank);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.nim.toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [leaderboardData, searchQuery, filterType]);

  const top3 = useMemo(() => filteredData.slice(0, 3), [filteredData]);

  const medalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-700";
    return "text-gray-400";
  };

  const pill = (active: boolean) =>
    active
      ? "bg-[#004220] text-white"
      : "bg-gray-100 text-gray-700 hover:bg-gray-200";

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* HEADER (tanpa logout) */}
      <header className="h-16 bg-white border-b flex items-center sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <FiMenu size={18} className="text-[#0D6B44]" />
            </button>

            <img
              src="/lg_umy.svg"
              alt="UMY"
              className="h-6 sm:h-8 w-auto shrink-0"
            />
            <img
              src="/lg_unires.svg"
              alt="UNIRES"
              className="h-6 sm:h-8 w-auto shrink-0"
            />
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Resident</p>
            <p className="text-sm font-semibold text-[#004220] leading-tight">
              Leaderboard
            </p>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <Sidebar_Resident
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN */}
      <main
        className={[
          "transition-all duration-300",
          isOpen ? "md:pl-64" : "md:pl-14",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          {/* Title bar */}
          <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm">
            Leaderboard
          </div>

          {/* Filters + Search */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* tabs */}
            <div className="bg-white rounded-2xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-3">Filter</p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilterType("all")}
                  className={[
                    "px-4 py-2 rounded-xl text-sm font-semibold transition inline-flex items-center gap-2",
                    pill(filterType === "all"),
                  ].join(" ")}
                >
                  <FaTrophy />
                  Semua
                </button>
                <button
                  onClick={() => setFilterType("hafalan")}
                  className={[
                    "px-4 py-2 rounded-xl text-sm font-semibold transition inline-flex items-center gap-2",
                    pill(filterType === "hafalan"),
                  ].join(" ")}
                >
                  <FaBook />
                  Hafalan
                </button>
                <button
                  onClick={() => setFilterType("assignment")}
                  className={[
                    "px-4 py-2 rounded-xl text-sm font-semibold transition inline-flex items-center gap-2",
                    pill(filterType === "assignment"),
                  ].join(" ")}
                >
                  <FaClipboardCheck />
                  Assignment
                </button>
              </div>
            </div>

            {/* search */}
            <div className="lg:col-span-2 bg-white rounded-2xl border shadow-sm p-4">
              <p className="text-xs text-gray-500 mb-3">Cari resident</p>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau NIM..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#004220]/30 focus:border-[#004220] transition"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
                    aria-label="Clear"
                  >
                    ✕
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-xs text-gray-500 mt-2">
                  Ditemukan {filteredData.length} hasil untuk "{searchQuery}"
                </p>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <section className="mt-6">
            {loading ? (
              <div className="bg-white rounded-2xl border shadow-sm py-16 text-center text-gray-500">
                Memuat data...
              </div>
            ) : filteredData.length === 0 ? (
              <div className="bg-white rounded-2xl border shadow-sm py-12 text-center text-gray-500">
                <p className="mb-2">Tidak ada data yang ditemukan</p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-[#004220] hover:underline text-sm"
                  >
                    Reset pencarian
                  </button>
                )}
              </div>
            ) : (
              <>
                {/* TOP 3 */}
                {top3.length >= 3 && (
                  <div className="bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="bg-[#004220] text-white px-5 py-4 font-semibold">
                      Top 3 Leaderboard
                    </div>

                    <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 bg-gradient-to-br from-yellow-50 to-orange-50">
                      {top3.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-2xl border shadow-sm p-5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <FaMedal
                                className={`${medalColor(item.rank)} text-2xl`}
                              />
                              <span className="text-sm font-semibold text-gray-700">
                                #{item.rank}
                              </span>
                            </div>

                            <span className="text-[11px] px-3 py-1 rounded-full bg-gray-100 text-gray-700">
                              {item.usroh}
                            </span>
                          </div>

                          <div className="mt-3">
                            <p className="text-lg font-semibold text-gray-900">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">{item.nim}</p>
                          </div>

                          <div className="mt-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Hafalan
                              </span>
                              <span className="text-sm font-semibold text-blue-700 inline-flex items-center gap-2">
                                <FaBook /> {item.hafalanSelesai}
                              </span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                Assignment
                              </span>
                              <span className="text-sm font-semibold text-emerald-700 inline-flex items-center gap-2">
                                <FaClipboardCheck /> {item.assignmentBenar}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* LIST
                    Desktop: table-like
                    Mobile: card list */}
                <div className="mt-6">
                  {/* Mobile cards */}
                  <div className="grid grid-cols-1 gap-3 md:hidden">
                    {filteredData.map((item) => (
                      <div
                        key={item.id}
                        className="bg-white rounded-2xl border shadow-sm p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <div className="inline-flex items-center gap-2">
                              <span className="h-8 w-8 rounded-xl bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                                {item.rank}
                              </span>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500">
                                  {item.nim} • {item.usroh}
                                </p>
                              </div>
                            </div>
                          </div>

                          <FaMedal
                            className={`${medalColor(item.rank)} text-xl`}
                          />
                        </div>

                        <div className="mt-3 flex gap-2 flex-wrap">
                          <span className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-blue-700">
                            <FaBook /> {item.hafalanSelesai}
                          </span>
                          <span className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700">
                            <FaClipboardCheck /> {item.assignmentBenar}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop table */}
                  <div className="hidden md:block bg-white rounded-2xl border shadow-sm overflow-hidden">
                    <div className="bg-gray-50 border-b px-6 py-3 grid grid-cols-12 gap-4 font-semibold text-sm text-gray-700">
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-5">Resident</div>
                      <div className="col-span-3 text-center">Hafalan</div>
                      <div className="col-span-3 text-center">Assignment</div>
                    </div>

                    <div className="divide-y">
                      {filteredData.map((item) => (
                        <div
                          key={item.id}
                          className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition"
                        >
                          <div className="col-span-1">
                            <div
                              className={[
                                "w-9 h-9 flex items-center justify-center rounded-xl font-bold text-sm",
                                item.rank <= 3
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-700",
                              ].join(" ")}
                            >
                              {item.rank}
                            </div>
                          </div>

                          <div className="col-span-5 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {item.nim} • {item.usroh}
                            </p>
                          </div>

                          <div className="col-span-3 text-center">
                            <span className="inline-flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full text-xs font-semibold text-blue-700">
                              <FaBook /> {item.hafalanSelesai}
                            </span>
                          </div>

                          <div className="col-span-3 text-center">
                            <span className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full text-xs font-semibold text-emerald-700">
                              <FaClipboardCheck /> {item.assignmentBenar}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </section>
        </div>
      </main>
    </div>
  );
}
