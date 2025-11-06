"use client";

import React from "react";
import Image from "next/image";
import ScheduleTable, { ScheduleItem } from "./ScheduleTable";
import { useRouter } from "next/navigation"; // ✅ pakai router untuk navigasi

function QuickTile({
  title,
  onClick,
  icon,
}: {
  title: string;
  onClick?: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="flex h-32 w-full flex-col items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
    >
      <div className="mb-3 rounded-lg bg-emerald-50 p-3 ring-1 ring-emerald-100">
        {icon}
      </div>
      <span className="text-sm font-semibold text-slate-900">{title}</span>
    </button>
  );
}

export default function Page() {
  const router = useRouter(); // ✅ inisialisasi router

  // nanti ganti dengan data user dari session/login kamu
  const user = { name: "AsistenMusyrif", email: "asistenmusyrif@umy.ac.id" };

  const schedule: ScheduleItem[] = [
    { time: "04.00 – 04.30", activity: "Shalat Malam dan Sahur (Disunnahkan berpuasa senin & kamis atau Puasa Daud)", tone: "amber" },
    { time: "04.30 – 05.00", activity: "Shalat subuh, doa dan kultum", tone: "sky" },
    { time: "05.00 – 06.00", activity: "Materi dan kegiatan (terjadwal selama 4 kali)", tone: "emerald" },
    { time: "06.00 – 06.45", activity: "Bersih-bersih dan persiapan ke kampus", tone: "sky" },
    { time: "06.45 – 17.00", activity: "Berada di kampus", tone: "emerald" },
    { time: "17.00 – 17.30", activity: "Persiapan Shalat maghrib", tone: "rose" },
    { time: "17.30 – 18.00", activity: "Shalat Maghrib dan Kultum", tone: "rose" },
    { time: "18.00 – 19.00", activity: "Tadarus al-Qur'an (setiap hari)", tone: "sky" },
    { time: "19.00 – 19.30", activity: "Shalat Isya' dan Kultum", tone: "emerald" },
    { time: "19.30 – 21.00", activity: "Materi dan kegiatan (terjadwal selama 3 kali)", tone: "amber" },
    { time: "21.00 – 22.00", activity: "Belajar dan Mengerjakan Tugas", tone: "emerald" },
    { time: "22.00 – 04.00", activity: "Tidur", tone: "sky" },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* HEADER ATAS: logo kiri sejajar + tombol logout kanan, lalu subbar profil */}
      <header>
        {/* Bar atas putih: logo & tombol Log Out */}
        <div className="bg-white">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex h-16 items-center justify-between">
              {/* Kiri: logo UMY & UNIRES sejajar */}
              <div className="flex items-center gap-8">
                <Image src="/umy.png" alt="UMY" width={140} height={32} className="h-8 w-auto" priority />
                <Image src="/unires.png" alt="UNIRES" width={120} height={28} className="h-7 w-auto" />
              </div>

              {/* Kanan: tombol Log Out bulat */}
              <button
                onClick={() => alert("Log out")}
                className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>

        {/* Subbar hijau muda: kartu profil di kiri */}
        <div className="bg-emerald-50">
          <div className="mx-auto max-w-6xl px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-amber-400 text-emerald-900 font-bold grid place-items-center">
                AM
              </div>
              <div className="leading-tight text-emerald-900">
                <div className="text-sm font-semibold">{user.name}</div>
                <div className="text-xs">{user.email}</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Judul tengah besar */}
        <h2 className="text-emerald-900 text-2xl md:text-3xl font-extrabold text-center">
          Kegiatan Harian di UNIRES
        </h2>

        {/* Tabel jadwal */}
        <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-sm ring-1 ring-slate-100">
          <ScheduleTable items={schedule} />
        </div>

        {/* Tiga tombol aksi */}
        <div className="mx-auto mt-10 grid max-w-3xl grid-cols-1 gap-8 sm:grid-cols-3">
          {/* Resident Per Usroh */}
          <QuickTile
            title="Resident Per Usroh"
            onClick={() => router.push("/dashboard/asisten-musyrif/resident-per-usroh")}
            icon={
              <svg className="h-7 w-7 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            }
          />

          {/* ✅ Input Nilai Tahfidz → navigate ke halaman input */}
          <QuickTile
            title="Input Nilai Tahfidz"
            onClick={() => router.push("/dashboard/asisten-musyrif/input-nilai-tahfidz")}
            icon={
              <svg className="h-7 w-7 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="14" rx="2" />
                <path d="M8 10h8M8 14h6M7 4v2M17 4v2" />
              </svg>
            }
          />

          {/* Buat Assignment (opsional, sementara alert atau arahkan ke rute lain jika sudah ada) */}
          <QuickTile
            title="Buat Assignment"
            onClick={() => router.push("/dashboard/asisten-musyrif/buat-assignment")}
            icon={
              <svg className="h-7 w-7 text-emerald-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H7l-4-4V5a2 2 0 0 1 2-2h10" />
                <path d="M17 3v4h4" />
                <path d="M12 11h6M12 15h6M8 11h.01M8 15h.01" />
              </svg>
            }
          />
        </div>
      </main>

      {/* strip hijau bawah */}
      <div className="h-6 bg-emerald-900" />
    </div>
  );
}
