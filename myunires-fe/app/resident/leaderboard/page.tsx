"use client";

import { useState, useEffect } from "react";
import Sidebar_Resident from "@/components/Sidebar_Resident";
import {
  FaMedal,
  FaSearch,
  FaUserCircle,
  FaTrophy,
  FaBook,
  FaClipboardCheck,
} from "react-icons/fa";

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
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData[]>([]);
  const [filteredData, setFilteredData] = useState<LeaderboardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<
    "all" | "hafalan" | "assignment"
  >("all");

  // Fetch leaderboard data
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

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

        const result = await response.json();
        const data = result.data || result.leaderboard || result;
        setLeaderboardData(Array.isArray(data) ? data : []);
        setFilteredData(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching leaderboard:", error);
        setLeaderboardData([]);
        setFilteredData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboard();
  }, []);

  // Filter and search
  useEffect(() => {
    let filtered = [...leaderboardData];

    // Apply filter type
    if (filterType === "hafalan") {
      filtered.sort((a, b) => b.hafalanSelesai - a.hafalanSelesai);
    } else if (filterType === "assignment") {
      filtered.sort((a, b) => b.assignmentBenar - a.assignmentBenar);
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(
        (item) =>
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.nim.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredData(filtered);
  }, [searchQuery, filterType, leaderboardData]);

  const getMedalColor = (rank: number) => {
    if (rank === 1) return "text-yellow-500";
    if (rank === 2) return "text-gray-400";
    if (rank === 3) return "text-amber-700";
    return "";
  };

  const getProfileColor = (rank: number) => {
    if (rank === 1) return "text-yellow-400";
    if (rank === 2) return "text-gray-300";
    if (rank === 3) return "text-amber-700";
    return "text-gray-400";
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* ===== HEADER LOGO ===== */}
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-6 border-b">
        <div className="flex items-center gap-3">
          <img src="/lg_umy.svg" alt="UMY" className="h-10 object-contain" />
          <img
            src="/lg_unires.svg"
            alt="UNIRES"
            className="h-10 object-contain"
          />
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          Logout
        </button>
      </header>

      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
          <div className="bg-[#d1d4d0] rounded-3xl shadow-lg p-8 w-[400px] text-center">
            <h2 className="text-2xl font-semibold text-[#004220] mb-4">
              Log Out
            </h2>
            <p className="text-gray-700 text-sm mb-1">
              Tindakan ini akan mengakhiri sesi login Anda.
            </p>
            <p className="text-gray-700 text-sm mb-6">
              Apakah Anda ingin melanjutkan?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-[#FFC107] hover:bg-[#ffb300] text-white font-semibold px-6 py-2 rounded-full shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="bg-[#E50914] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full shadow-md"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      <Sidebar_Resident isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "ml-64" : "ml-12"
        }`}
      >
        <div className="h-16" /> {/* Spacer supaya tidak ketabrak header */}
        {/* ===== HEADER HIJAU ===== */}
        <header className="px-6 py-4">
          <h1 className="bg-[#004220] text-white text-center py-4 rounded-md text-lg font-semibold shadow-sm">
            Leaderboard
          </h1>
        </header>
        {/* ===== FILTER TABS ===== */}
        <div className="px-6 py-4">
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterType === "all"
                  ? "bg-[#004220] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FaTrophy className="inline mr-2" />
              Semua
            </button>
            <button
              onClick={() => setFilterType("hafalan")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterType === "hafalan"
                  ? "bg-[#004220] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FaBook className="inline mr-2" />
              Hafalan
            </button>
            <button
              onClick={() => setFilterType("assignment")}
              className={`px-4 py-2 rounded-md font-medium transition ${
                filterType === "assignment"
                  ? "bg-[#004220] text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              <FaClipboardCheck className="inline mr-2" />
              Assignment
            </button>
          </div>
        </div>
        {/* ===== KONTEN ===== */}
        <section className="flex flex-col items-center justify-center px-6 space-y-8 mb-10">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-500">Memuat data...</div>
            </div>
          ) : (
            <>
              {/* === Kartu Progres Terbaik (Top 3) === */}
              {filteredData.length >= 3 && (
                <div className="w-full max-w-5xl">
                  <div className="bg-[#004220] text-white text-center py-3 rounded-t-lg font-semibold">
                    🏆 Top 3 Leaderboard 🏆
                  </div>
                  <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-6 rounded-b-lg shadow-lg">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {filteredData.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          className="bg-white rounded-lg p-5 shadow-md hover:shadow-xl transition-all border-2 border-gray-200"
                        >
                          {/* Ranking Badge */}
                          <div className="flex justify-center mb-3">
                            <div
                              className={`w-14 h-14 rounded-full flex items-center justify-center ${
                                item.rank === 1
                                  ? "bg-yellow-100"
                                  : item.rank === 2
                                  ? "bg-gray-100"
                                  : "bg-orange-100"
                              }`}
                            >
                              <FaMedal
                                className={`${getMedalColor(
                                  item.rank
                                )} text-3xl`}
                              />
                            </div>
                          </div>

                          {/* Nama & Info */}
                          <div className="text-center mb-4">
                            <p className="font-bold text-gray-800 text-lg mb-1">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500 mb-1">
                              {item.nim}
                            </p>
                            <p className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded inline-block">
                              {item.usroh}
                            </p>
                          </div>

                          {/* Stats */}
                          <div className="border-t border-gray-200 pt-3 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Hafalan:
                              </span>
                              <span className="font-semibold text-blue-600">
                                <FaBook className="inline mr-1" />
                                {item.hafalanSelesai}
                              </span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm text-gray-600">
                                Assignment:
                              </span>
                              <span className="font-semibold text-green-600">
                                <FaClipboardCheck className="inline mr-1" />
                                {item.assignmentBenar}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* === Search Bar === */}
              <div className="w-full max-w-5xl">
                <div className="relative">
                  <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Cari nama atau NIM resident..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#004220] focus:border-[#004220] transition"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 font-bold"
                    >
                      ✕
                    </button>
                  )}
                </div>
                {searchQuery && (
                  <p className="text-sm text-gray-500 mt-2">
                    Ditemukan {filteredData.length} hasil untuk "{searchQuery}"
                  </p>
                )}
              </div>

              {/* === Daftar Ranking === */}
              <div className="w-full max-w-5xl">
                {filteredData.length === 0 ? (
                  <div className="text-center py-10 text-gray-500 bg-white rounded-lg border border-gray-200">
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
                  <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                    {/* Table Header */}
                    <div className="bg-gray-50 border-b border-gray-200 px-6 py-3 grid grid-cols-12 gap-4 font-semibold text-sm text-gray-700">
                      <div className="col-span-1">Rank</div>
                      <div className="col-span-5">Resident</div>
                      <div className="col-span-3 text-center">Hafalan</div>
                      <div className="col-span-3 text-center">Assignment</div>
                    </div>

                    {/* Table Body */}
                    <div className="divide-y divide-gray-200">
                      {filteredData.map((item) => (
                        <div
                          key={item.id}
                          className="px-6 py-4 grid grid-cols-12 gap-4 items-center hover:bg-gray-50 transition"
                        >
                          {/* Rank */}
                          <div className="col-span-1">
                            <div
                              className={`w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm ${
                                item.rank <= 3
                                  ? "bg-yellow-100 text-yellow-700"
                                  : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {item.rank}
                            </div>
                          </div>

                          {/* Resident Info */}
                          <div className="col-span-5">
                            <p className="font-semibold text-gray-800">
                              {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.nim} • {item.usroh}
                            </p>
                          </div>

                          {/* Hafalan */}
                          <div className="col-span-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-blue-50 px-3 py-1 rounded-full">
                              <FaBook className="text-blue-600 text-sm" />
                              <span className="font-semibold text-blue-700">
                                {item.hafalanSelesai}
                              </span>
                            </div>
                          </div>

                          {/* Assignment */}
                          <div className="col-span-3 text-center">
                            <div className="inline-flex items-center gap-1 bg-green-50 px-3 py-1 rounded-full">
                              <FaClipboardCheck className="text-green-600 text-sm" />
                              <span className="font-semibold text-green-700">
                                {item.assignmentBenar}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
