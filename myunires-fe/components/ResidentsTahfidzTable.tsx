"use client";

import React from "react";

/** Bentuk data baris tabel (sesuaikan kalau field backend-mu berbeda) */
export type ResidentRow = {
  id: number;
  name: string;         // Nama Lengkap
  usrohName?: string;    // Nama Usroh
  uniresNumber?: string; // No Unires
};

export default function ResidentsTahfidzTable({
  rows,
  loading,
  onInput,
}: {
  rows: ResidentRow[];
  loading?: boolean;
  /** dipanggil saat tombol di kolom Aksi diklik */
  onInput?: (r: ResidentRow) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-900/30 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-emerald-50 text-emerald-900">
            <th className="w-16 px-4 py-3 text-left font-semibold">No</th>
            <th className="px-4 py-3 text-left font-semibold">Nama</th>
            <th className="px-4 py-3 text-left font-semibold">Nama Usroh</th>
            <th className="w-40 px-4 py-3 text-left font-semibold">No Unires</th>
            <th className="w-24 px-4 py-3 text-left font-semibold">Aksi</th>
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                Memuat data…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                Tidak ada data.
              </td>
            </tr>
          ) : (
            rows.map((r, i) => (
              <tr
                key={r.id}
                className="border-t border-slate-200/70 hover:bg-emerald-50/40"
              >
                <td className="px-4 py-3">{i + 1}</td>
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.usrohName || "-"}</td>
                <td className="px-4 py-3">{r.uniresNumber || "-"}</td>
                <td className="px-2 py-3">
                  <button
                    onClick={() => onInput?.(r)}
                    title="Input nilai"
                    className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-emerald-900 hover:bg-emerald-900/5 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    {/* Ikon (mata) */}
                    <svg
                      viewBox="0 0 24 24"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
