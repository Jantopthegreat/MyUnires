"use client";

import { useEffect, useMemo, useState } from "react";
import { apiGet, getToken, clearAuth } from "@/lib/api";

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
}

type ScheduleItem = {
  start: string;
  end: string;
  activity: string;
};

type PrayerTimes = {
  Fajr: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatHM(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function parseHMToDateToday(hm: string, base = new Date()) {
  const [h, m] = hm.split(":").map(Number);
  const d = new Date(base);
  d.setHours(h, m, 0, 0);
  return d;
}

function humanizeMs(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  if (h > 0) return `${h} jam ${m} menit`;
  if (m > 0) return `${m} menit ${ss} detik`;
  return `${ss} detik`;
}

function clampPct(n: number) {
  return Math.max(0, Math.min(100, n));
}

function ProgressLine({ value }: { value: number }) {
  return (
    <div className="w-full">
      <div className="h-2 w-full rounded-full bg-black/5 overflow-hidden">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-500 to-emerald-700"
          style={{ width: `${clampPct(value)}%` }}
        />
      </div>
    </div>
  );
}

function Card({
  title,
  badge,
  children,
}: {
  title: string;
  badge?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-5 border-b flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        {badge}
      </div>
      <div className="px-6 py-5">{children}</div>
    </section>
  );
}

export default function DashboardResidentPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // realtime clock
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // fetch profile
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // optional: cek token dulu biar cepat redirect
        const token = getToken();
        if (!token) {
          // router.push("/login");
          window.location.href = "/login";
          return;
        }

        const data = await apiGet<any>("/api/resident/profile");

        // ikutin pola responmu: { success: boolean, data: ... }
        if (data?.success) {
          setUserData(data.data);
        } else {
          clearAuth(); // hapus token (dan user kalau kamu simpan)
          // router.push("/login");
          window.location.href = "/login";
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        clearAuth();
        // router.push("/login");
        window.location.href = "/login";
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const initial = useMemo(() => {
    const name = userData?.name || "";
    return name ? name.charAt(0).toUpperCase() : "?";
  }, [userData]);

  // ===== Jadwal kegiatan (dari tabel foto)
  const schedule: ScheduleItem[] = useMemo(
    () => [
      {
        start: "04:00",
        end: "04:30",
        activity:
          "Shalat Malam dan Sahur (Disunnahkan berpuasa senin & kamis atau Puasa Daud)",
      },
      {
        start: "04:30",
        end: "05:00",
        activity: "Shalat Subuh, do’a dan kultum",
      },
      {
        start: "05:00",
        end: "06:00",
        activity: "Materi dan kegiatan (terjadwal selama 4 kali)",
      },
      {
        start: "06:00",
        end: "06:45",
        activity: "Bersih-bersih dan persiapan ke kampus",
      },
      { start: "06:45", end: "17:00", activity: "Berada di kampus" },
      { start: "17:00", end: "17:30", activity: "Persiapan Shalat Maghrib" },
      { start: "17:30", end: "18:30", activity: "Shalat Maghrib dan Kultum" },
      {
        start: "18:30",
        end: "19:00",
        activity: "Tadarus al-Qur’an (setiap hari)",
      },
      { start: "19:00", end: "19:30", activity: "Shalat Isya’ dan Kultum" },
      {
        start: "19:30",
        end: "21:00",
        activity: "Materi dan kegiatan (terjadwal selama 3 kali)",
      },
      {
        start: "21:00",
        end: "22:00",
        activity: "Belajar dan Mengerjakan Tugas",
      },
      { start: "22:00", end: "04:00", activity: "Tidur" }, // lintas hari
    ],
    []
  );

  const activityStatus = useMemo(() => {
    const intervals = schedule.map((it) => {
      const startDate = parseHMToDateToday(it.start, now);
      let endDate = parseHMToDateToday(it.end, now);

      // khusus tidur lintas hari
      if (it.start === "22:00" && it.end === "04:00") {
        endDate = new Date(endDate.getTime() + 24 * 3600 * 1000);
      }

      return { ...it, startDate, endDate };
    });

    // kalau masih dini hari (<04:00), anggap "sekarang" = besok untuk cocokkan interval tidur
    const adjustedNow =
      now.getHours() < 4 ? new Date(now.getTime() + 24 * 3600 * 1000) : now;

    const current = intervals.find(
      (x) => adjustedNow >= x.startDate && adjustedNow < x.endDate
    );
    if (current) {
      const total = current.endDate.getTime() - current.startDate.getTime();
      const passed = adjustedNow.getTime() - current.startDate.getTime();
      const pct = total > 0 ? (passed / total) * 100 : 0;

      return {
        mode: "current" as const,
        item: current,
        label: "Sedang berjalan",
        timeMs: current.endDate.getTime() - adjustedNow.getTime(),
        pct,
      };
    }

    const upcoming = intervals
      .map((x) => ({
        ...x,
        diff: x.startDate.getTime() - adjustedNow.getTime(),
      }))
      .filter((x) => x.diff > 0)
      .sort((a, b) => a.diff - b.diff)[0];

    if (!upcoming) {
      // fallback: besok ambil schedule pertama
      const first = intervals[0];
      const startTomorrow = new Date(
        first.startDate.getTime() + 24 * 3600 * 1000
      );
      const endTomorrow = new Date(first.endDate.getTime() + 24 * 3600 * 1000);
      return {
        mode: "upcoming" as const,
        item: { ...first, startDate: startTomorrow, endDate: endTomorrow },
        label: "Berikutnya",
        timeMs: startTomorrow.getTime() - adjustedNow.getTime(),
        pct: 0,
      };
    }

    return {
      mode: "upcoming" as const,
      item: upcoming,
      label: "Berikutnya",
      timeMs: upcoming.startDate.getTime() - adjustedNow.getTime(),
      pct: 0,
    };
  }, [schedule, now]);

  // ===== Prayer Times (API Aladhan by city) [web:1512]
  const CITY = "Yogyakarta";
  const COUNTRY = "Indonesia";
  const METHOD = 11;

  const [prayers, setPrayers] = useState<PrayerTimes | null>(null);
  const [prayerError, setPrayerError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setPrayerError(null);
        const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
          CITY
        )}&country=${encodeURIComponent(COUNTRY)}&method=${METHOD}`;

        const res = await fetch(url);
        const json = await res.json();

        if (!active) return;

        const t = json?.data?.timings;
        if (!t) throw new Error("Gagal memuat jadwal sholat.");

        setPrayers({
          Fajr: t.Fajr,
          Dhuhr: t.Dhuhr,
          Asr: t.Asr,
          Maghrib: t.Maghrib,
          Isha: t.Isha,
        });
      } catch (e: any) {
        if (!active) return;
        setPrayers(null);
        setPrayerError(e?.message || "Gagal memuat jadwal sholat.");
      }
    })();

    return () => {
      active = false;
    };
  }, [CITY, COUNTRY, METHOD]);

  const nextPrayer = useMemo(() => {
    if (!prayers) return null;

    const order: Array<keyof PrayerTimes> = [
      "Fajr",
      "Dhuhr",
      "Asr",
      "Maghrib",
      "Isha",
    ];
    const list = order.map((k) => ({
      name: k,
      at: parseHMToDateToday(prayers[k], now),
    }));

    const upcoming = list.find((x) => x.at.getTime() > now.getTime());
    if (upcoming)
      return { ...upcoming, inMs: upcoming.at.getTime() - now.getTime() };

    const fajrTomorrow = new Date(list[0].at.getTime() + 24 * 3600 * 1000);
    return {
      name: "Fajr" as const,
      at: fajrTomorrow,
      inMs: fajrTomorrow.getTime() - now.getTime(),
    };
  }, [prayers, now]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#F5F5F5]">
      {/* HEADER */}
      <header className="h-16 bg-white border-b flex items-center sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 flex items-center justify-between gap-3">
          {/* logos */}
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <img
              src="/lg_umy.svg"
              alt="UMY"
              className="h-6 sm:h-8 w-auto shrink-0"
            />
            <img
              src="/lg_unires.svg"
              alt="Unires"
              className="h-6 sm:h-8 w-auto shrink-0"
            />
          </div>

          {/* logout */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="whitespace-nowrap bg-red-600 hover:bg-red-700 text-white font-semibold px-4 sm:px-5 py-2 rounded-full text-xs sm:text-sm shadow transition"
          >
            Logout
          </button>
        </div>
      </header>

      {/* LOGOUT MODAL */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[60] bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center">
            <h2 className="text-xl font-semibold text-[#004220] mb-3">
              Log Out
            </h2>
            <p className="text-gray-600 text-sm mb-6">Akhiri sesi login?</p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="px-5 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBHEADER */}
      <section className="mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
        <div className="bg-[#004220] text-white rounded-3xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-400/15 rounded-full blur-3xl" />

          <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-semibold">
                Dashboard Resident
              </h1>
              <p className="text-white/80 text-sm mt-1">
                Ringkasan kegiatan & sholat terdekat
              </p>
            </div>

            <div className="flex items-center gap-3">
              {loading ? (
                <div className="bg-white/20 animate-pulse w-11 h-11 rounded-full" />
              ) : (
                <div className="bg-yellow-400 text-black w-11 h-11 flex items-center justify-center rounded-full font-bold text-lg">
                  {initial}
                </div>
              )}

              <div className="leading-tight">
                <p className="text-sm font-medium">
                  {userData?.name || "Resident"}
                </p>
                <p className="text-xs text-white/80">{userData?.email || ""}</p>
              </div>

              <div className="ml-2 px-3 py-2 rounded-2xl bg-white/10 border border-white/15">
                <p className="text-[11px] text-white/70">Jam</p>
                <p className="text-sm font-semibold tabular-nums">
                  {formatHM(now)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CARDS */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Kegiatan */}
          <Card
            title={
              activityStatus.mode === "current"
                ? "Kegiatan Saat Ini"
                : "Kegiatan Terdekat"
            }
            badge={
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                {activityStatus.label}
              </span>
            }
          >
            <div className="space-y-4">
              <div>
                <p className="text-gray-900 text-lg font-semibold leading-snug">
                  {activityStatus.item.activity}
                </p>
                <p className="mt-1 text-sm text-gray-500">
                  {activityStatus.item.start} – {activityStatus.item.end}
                </p>
              </div>

              <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs text-gray-500">
                    {activityStatus.mode === "current"
                      ? "Sisa waktu"
                      : "Mulai dalam"}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 tabular-nums">
                    {humanizeMs(activityStatus.timeMs)}
                  </p>
                </div>

                <div className="mt-3">
                  <ProgressLine value={activityStatus.pct} />
                  <p className="mt-2 text-[11px] text-gray-500">
                    {activityStatus.mode === "current"
                      ? `Progress ${Math.round(activityStatus.pct)}%`
                      : "Siapkan diri sebelum kegiatan dimulai"}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Sholat */}
          <Card
            title="Sholat Terdekat"
            badge={
              <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                {CITY}
              </span>
            }
          >
            {prayerError ? (
              <div className="rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                {prayerError}
              </div>
            ) : !prayers || !nextPrayer ? (
              <div className="text-sm text-gray-500">
                Memuat jadwal sholat...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl bg-gray-50 border border-gray-100 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs text-gray-500">Sholat berikutnya</p>
                      <p className="text-xl font-semibold text-gray-900 mt-1">
                        {nextPrayer.name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        Jam {formatHM(nextPrayer.at)}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Mulai dalam</p>
                      <p className="text-sm font-semibold text-gray-900 tabular-nums mt-1">
                        {humanizeMs(nextPrayer.inMs)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const).map(
                    (k) => (
                      <div
                        key={k}
                        className="rounded-2xl bg-white border border-gray-100 px-3 py-3 text-center shadow-sm"
                      >
                        <p className="text-[11px] text-gray-500">{k}</p>
                        <p className="text-sm font-semibold text-gray-900 mt-1 tabular-nums">
                          {prayers[k]}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <p className="text-[11px] text-gray-400">
                  Jadwal sholat diambil dari Aladhan Prayer Times API.
                  [web:1512]
                </p>
              </div>
            )}
          </Card>
        </div>

        {/* QUICK FEATURES (lebih modern) */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
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
              title: "Materi",
              icon: "/Materi_Pem.svg",
              href: "/resident/MateriPembelajaran",
            },
            {
              title: "Assignment",
              icon: "/Ker_Ass.svg",
              href: "/resident/kerjakanAssignment",
            },
            {
              title: "Leaderboard",
              icon: "/leaderboard.svg",
              href: "/resident/leaderboard",
            },
          ].map((f) => (
            <a
              key={f.title}
              href={f.href}
              className="group rounded-2xl bg-white border border-gray-100 shadow-sm p-4 hover:shadow-md transition"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center">
                  <img
                    src={f.icon}
                    alt={f.title}
                    className="h-6 w-6 opacity-90 group-hover:opacity-100"
                  />
                </div>
                <p className="text-sm font-semibold text-gray-900 leading-snug">
                  {f.title}
                </p>
              </div>
              <p className="mt-2 text-[11px] text-gray-500">Buka menu</p>
            </a>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto bg-[#004220] text-center text-white py-4 text-sm">
        © 2025 Universitas Muhammadiyah Yogyakarta - Asrama Unires
      </footer>
    </div>
  );
}
