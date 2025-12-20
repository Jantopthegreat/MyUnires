"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type ScheduleItem = {
  start: string; // "04:00"
  end: string; // "04:30"
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

function diffMs(a: Date, b: Date) {
  return b.getTime() - a.getTime();
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
      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-2 rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600"
          style={{ width: `${clampPct(value)}%` }}
        />
      </div>
    </div>
  );
}

function GlassCard({
  title,
  children,
  right,
}: {
  title: string;
  children: React.ReactNode;
  right?: React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/15 bg-white/10 backdrop-blur-xl shadow-[0_20px_60px_rgba(0,0,0,0.25)] overflow-hidden">
      <div className="px-6 py-5 border-b border-white/10 flex items-center justify-between gap-3">
        <h3 className="text-sm font-semibold text-white">{title}</h3>
        {right}
      </div>
      <div className="px-6 py-5">{children}</div>
    </div>
  );
}

export default function ResidentSmartDashboard() {
  // === 1) Jadwal kegiatan (dari tabel foto kamu)
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

  // waktu realtime
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  // === 2) Prayer times (Aladhan)
  const CITY = "Yogyakarta";
  const COUNTRY = "Indonesia";
  const METHOD = 11; // metode kalkulasi (bisa kamu ganti)

  const [prayers, setPrayers] = useState<PrayerTimes | null>(null);
  const [prayerError, setPrayerError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setPrayerError(null);
        // Aladhan: byCity (sederhana)
        const url = `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(
          CITY
        )}&country=${encodeURIComponent(COUNTRY)}&method=${METHOD}`;

        const res = await fetch(url);
        const json = await res.json();

        if (!active) return;

        const t = json?.data?.timings;
        if (!t) throw new Error("Gagal memuat jadwal sholat.");

        // Ambil yang kita butuh
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

  // ===== LOGIC: kegiatan sekarang / terdekat
  const activityStatus = useMemo(() => {
    // buat interval date untuk hari ini
    // note: item "22:00-04:00" berarti end besok
    const intervals = schedule.map((it) => {
      const start = parseHMToDateToday(it.start, now);
      let end = parseHMToDateToday(it.end, now);
      if (it.end === "04:00" && it.start === "22:00") {
        end = new Date(end.getTime() + 24 * 3600 * 1000);
      }
      return { ...it, startDate: start, endDate: end };
    });

    // handle waktu dini hari (00:00-03:59) supaya "22:00-04:00" dianggap aktif
    const n = now;
    const early = n.getHours() < 4;
    const adjustedNow = early ? new Date(n.getTime() + 24 * 3600 * 1000) : n;

    // cari yang sedang berlangsung
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
        timeLeftMs: current.endDate.getTime() - adjustedNow.getTime(),
        pct,
      };
    }

    // kalau tidak ada, cari yang berikutnya
    const upcoming = intervals
      .map((x) => ({
        ...x,
        diff: x.startDate.getTime() - adjustedNow.getTime(),
      }))
      .filter((x) => x.diff > 0)
      .sort((a, b) => a.diff - b.diff)[0];

    // fallback: kalau tidak ketemu, ambil pertama besok
    if (!upcoming) {
      const first = intervals[0];
      const startTomorrow = new Date(
        first.startDate.getTime() + 24 * 3600 * 1000
      );
      return {
        mode: "upcoming" as const,
        item: {
          ...first,
          startDate: startTomorrow,
          endDate: new Date(first.endDate.getTime() + 24 * 3600 * 1000),
        },
        timeLeftMs: startTomorrow.getTime() - adjustedNow.getTime(),
        pct: 0,
      };
    }

    return {
      mode: "upcoming" as const,
      item: upcoming,
      timeLeftMs: upcoming.startDate.getTime() - adjustedNow.getTime(),
      pct: 0,
    };
  }, [schedule, now]);

  // ===== LOGIC: sholat terdekat
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

    // jika sudah lewat semua, next = Fajr besok
    const upcoming = list.find((x) => x.at.getTime() > now.getTime());
    if (upcoming) {
      return { ...upcoming, inMs: upcoming.at.getTime() - now.getTime() };
    }
    const fajrTomorrow = new Date(list[0].at.getTime() + 24 * 3600 * 1000);
    return {
      name: "Fajr" as const,
      at: fajrTomorrow,
      inMs: fajrTomorrow.getTime() - now.getTime(),
    };
  }, [prayers, now]);

  return (
    <div className="w-full">
      {/* background section (kalau kamu taruh di page putih, card tetap keren) */}
      <div className="rounded-3xl bg-gradient-to-br from-[#004220] via-[#0b5a3a] to-black p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
          <div>
            <p className="text-white/70 text-xs">Hari ini</p>
            <h2 className="text-white text-2xl sm:text-3xl font-bold tracking-tight">
              {formatHM(now)}
            </h2>
            <p className="text-white/70 text-sm mt-1">
              Fokus kegiatan & sholat terdekat
            </p>
          </div>

          <div className="flex gap-2">
            <Link
              href="/resident/progresHafalan"
              className="text-xs font-semibold text-white/90 hover:text-white bg-white/10 border border-white/15 px-4 py-2 rounded-full transition"
            >
              Progres Hafalan
            </Link>
            <Link
              href="/resident/nilaiTahfidz"
              className="text-xs font-semibold text-white/90 hover:text-white bg-white/10 border border-white/15 px-4 py-2 rounded-full transition"
            >
              Nilai Tahfidz
            </Link>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Kegiatan terdekat / sedang berlangsung */}
          <GlassCard
            title={
              activityStatus.mode === "current"
                ? "Kegiatan Saat Ini"
                : "Kegiatan Terdekat"
            }
            right={
              <span className="text-[11px] px-3 py-1 rounded-full bg-white/10 border border-white/15 text-white/80">
                {activityStatus.mode === "current"
                  ? "Sedang berjalan"
                  : "Berikutnya"}
              </span>
            }
          >
            <div className="space-y-3">
              <div>
                <p className="text-white text-lg font-semibold leading-snug">
                  {activityStatus.item.activity}
                </p>
                <p className="mt-1 text-white/70 text-sm">
                  {activityStatus.item.start} – {activityStatus.item.end}
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-white/80 text-xs">
                    {activityStatus.mode === "current"
                      ? "Sisa waktu"
                      : "Mulai dalam"}
                  </p>
                  <p className="text-white font-semibold text-sm tabular-nums">
                    {humanizeMs(activityStatus.timeLeftMs)}
                  </p>
                </div>

                <div className="mt-3">
                  <ProgressLine value={activityStatus.pct} />
                  {activityStatus.mode === "current" ? (
                    <p className="mt-2 text-[11px] text-white/60">
                      Progress {Math.round(activityStatus.pct)}%
                    </p>
                  ) : (
                    <p className="mt-2 text-[11px] text-white/60">
                      Siapkan diri sebelum kegiatan dimulai
                    </p>
                  )}
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Sholat terdekat */}
          <GlassCard
            title="Sholat Terdekat"
            right={
              <span className="text-[11px] px-3 py-1 rounded-full bg-emerald-400/15 border border-emerald-300/20 text-emerald-50">
                {CITY}
              </span>
            }
          >
            {prayerError ? (
              <div className="text-sm text-red-200 bg-red-500/10 border border-red-500/20 rounded-2xl p-4">
                {prayerError}
              </div>
            ) : !prayers || !nextPrayer ? (
              <div className="text-sm text-white/70">
                Memuat jadwal sholat...
              </div>
            ) : (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white/10 border border-white/15 p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-white/70 text-xs">Sholat berikutnya</p>
                      <p className="text-white text-xl font-semibold mt-1">
                        {nextPrayer.name}
                      </p>
                      <p className="text-white/70 text-sm mt-1">
                        Jam {formatHM(nextPrayer.at)}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-white/70 text-xs">Mulai dalam</p>
                      <p className="text-white font-semibold text-sm tabular-nums mt-1">
                        {humanizeMs(nextPrayer.inMs)}
                      </p>
                    </div>
                  </div>
                </div>

                {/* list prayer times */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {(["Fajr", "Dhuhr", "Asr", "Maghrib", "Isha"] as const).map(
                    (k) => (
                      <div
                        key={k}
                        className="rounded-2xl bg-white/10 border border-white/15 px-3 py-3 text-center"
                      >
                        <p className="text-white/70 text-[11px]">{k}</p>
                        <p className="text-white font-semibold text-sm mt-1 tabular-nums">
                          {prayers[k]}
                        </p>
                      </div>
                    )
                  )}
                </div>

                <p className="text-[11px] text-white/60">
                  Jadwal sholat diambil otomatis berdasarkan kota (API) dan bisa
                  berubah tiap hari. [web:1512]
                </p>
              </div>
            )}
          </GlassCard>
        </div>
      </div>
    </div>
  );
}
