"use client";

import { useState, useEffect } from "react";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

export default function DashboardResidentPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Fetch user data dari localStorage atau API
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          window.location.href = "/login";
          return;
        }

        // Fetch user profile dari backend (endpoint resident)
        const response = await fetch(
          "http://localhost:3001/api/resident/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (data.success) {
          setUserData(data.data);
        } else {
          // Jika gagal, mungkin token expired
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        localStorage.removeItem("token");
        window.location.href = "/login";
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
  const schedule = [
    {
      time: "04:00 – 04:30",
      activity:
        "Shalat Malam dan Sahur (Disunnahkan berpuasa senin & kamis atau Puasa Daud)",
    },
    { time: "04:30 – 05:00", activity: "Shalat Subuh, do’a dan kultum" },
    {
      time: "05:00 – 06:00",
      activity: "Materi dan kegiatan (terjadwal selama 4 kali)",
    },
    {
      time: "06:00 – 06:45",
      activity: "Bersih-bersih dan persiapan ke kampus",
    },
    { time: "06:45 – 17:00", activity: "Berada di kampus" },
    { time: "17:00 – 17:30", activity: "Persiapan Shalat Maghrib" },
    { time: "17:30 – 18:30", activity: "Shalat Maghrib dan Kultum" },
    { time: "18:30 – 19:00", activity: "Tadarus al-Qur’an (setiap hari)" },
    { time: "19:00 – 19:30", activity: "Shalat Isya’ dan Kultum" },
    {
      time: "19:30 – 21:00",
      activity: "Materi dan kegiatan (terjadwal selama 3 kali)",
    },
    { time: "21:00 – 22:00", activity: "Belajar dan Mengerjakan Tugas" },
    { time: "22:00 – 04:00", activity: "Tidur" },
  ];

  // Fungsi untuk menentukan warna tiap baris berdasarkan jam
  const getRowColor = (time: string): string => {
    if (time.startsWith("04:") || time.startsWith("05:")) return "bg-[#FCF5C7]";
    if (
      time.startsWith("06:") ||
      time.startsWith("07:") ||
      time.startsWith("08:")
    )
      return "bg-[#D6EADF]";
    if (
      time.startsWith("17:") ||
      time.startsWith("18:") ||
      time.startsWith("19:")
    )
      return "bg-[#FCE1E4]";
    if (time.startsWith("21:") || time.startsWith("22:")) return "bg-[#DAEAF6]";
    return "bg-white";
  };
  const features = [
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* HEADER */}
      <header className="flex justify-between items-center px-10 py-4 bg-white shadow">
        <div className="flex items-center gap-4">
          <img src="/lg_umy.svg" alt="UMY" className="h-8" />
          <img src="/lg_unires.svg" alt="Unires" className="h-8" />
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
                onClick={handleLogout}
                className="bg-[#E50914] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full shadow-md"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBHEADER */}
      <div className="bg-[#004220] text-white py-3 px-3 relative">
        <h1 className="absolute top-2 left-1/2 -translate-x-1/2 text-lg font-semibold mt-3">
          Dashboard Resident
        </h1>

        <div className="flex items-center ml-7 mt-6 mb-2">
          {loading ? (
            <div className="bg-gray-300 animate-pulse w-11 h-11 rounded-full"></div>
          ) : (
            <div className="bg-yellow-400 text-[#000000] w-11 h-11 flex items-center justify-center rounded-full font-bold text-lg">
              {userData ? getInitial(userData.name) : "?"}
            </div>
          )}
          <div className="ml-3 flex flex-col justify-center leading-tight">
            {loading ? (
              <>
                <div className="bg-gray-300 animate-pulse h-4 w-32 rounded mb-1"></div>
                <div className="bg-gray-300 animate-pulse h-3 w-40 rounded"></div>
              </>
            ) : (
              <>
                <p className="font-medium text-white text-sm">
                  {userData?.name || "Unknown User"}
                </p>
                <p className="text-white text-xs">
                  {userData?.email || "no-email@example.com"}
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* JUDUL */}
      <h2 className="text-center text-[#0D6B44] text-2xl font-bold mb-3 mt-7">
        Kegiatan Harian di UNIIRES
      </h2>

      {/* TABEL */}
      <div className="flex justify-center mb-10">
        {/* Bungkus table dengan div agar border-radius diterapkan di luar */}
        <div className="rounded-xl overflow-hidden border border-[#004220] w-[650px]">
          <table className="text-sm w-full border-collapse">
            <thead className="bg-[#004220]/70 text-white">
              <tr>
                <th className="py-2 px-4 w-1/3 border-b border-[#004220]">
                  Waktu
                </th>
                <th className="py-2 px-4 border-b border-[#004220]">
                  Kegiatan
                </th>
              </tr>
            </thead>
            <tbody className="text-center text-[#0D6B44]">
              {schedule.map((item, i) => (
                <tr
                  key={i}
                  className={`${getRowColor(
                    item.time
                  )} border-b border-[#004220] last:border-b-0`}
                >
                  <td className="py-2 px-4 border-r border-[#004220]">
                    {item.time}
                  </td>
                  <td className="py-2 px-4">{item.activity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* === BUTTON FITUR === */}
      <div className="flex justify-center flex-wrap gap-8 mb-16">
        {features.map((f) => (
          <a
            key={f.title}
            href={f.href}
            className="flex flex-col items-center text-center bg-[#D9D9D9] hover:bg-[#CFE8D7] transition  rounded-md w-44 h-36 justify-center "
          >
            <img src={f.icon} alt={f.title} className="h-15 mb-3" />
            <p className="text-[#0D6B44] font-semibold text-sm">{f.title}</p>
          </a>
        ))}
      </div>

      {/* FOOTER */}
      <footer className="bg-[#004220] text-center text-white py-4 text-sm">
        © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
      </footer>
    </div>
  );
}
