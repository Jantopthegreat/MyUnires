"use client";

import React from "react";

export type AssignmentRow = {
  id: string;
  assignment: string; // nama assignment, mis: "Tafhim dan Tahsin"
  materi: string;     // mis: "Materi 1"
};

export default function AssignmentsTable({
  rows,
  loading,
  onView,
  onEdit,
  onDelete,
}: {
  rows: AssignmentRow[];
  loading?: boolean;
  onView?: (r: AssignmentRow) => void;
  onEdit?: (r: AssignmentRow) => void;
  onDelete?: (r: AssignmentRow) => void;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-emerald-900/30 shadow-sm">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-emerald-50 text-emerald-900">
            <th className="w-16 px-4 py-3 text-left font-semibold">No</th>
            <th className="px-4 py-3 text-left font-semibold">Assignment</th>
            <th className="px-4 py-3 text-left font-semibold">Materi</th>
            <th className="w-32 px-4 py-3 text-left font-semibold">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                Memuat data…
              </td>
            </tr>
          ) : rows.length === 0 ? (
            <tr>
              <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
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
                <td className="px-4 py-3">{r.assignment}</td>
                <td className="px-4 py-3">{r.materi}</td>
                <td className="px-2 py-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onView?.(r)}
                      title="Lihat"
                      className="rounded-md p-1 text-emerald-900 hover:bg-emerald-900/5"
                    >
                      {/* eye */}
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7-11-7-11-7z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onEdit?.(r)}
                      title="Edit"
                      className="rounded-md p-1 text-emerald-900 hover:bg-emerald-900/5"
                    >
                      {/* pencil */}
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                      </svg>
                    </button>
                    <button
                      onClick={() => onDelete?.(r)}
                      title="Hapus"
                      className="rounded-md p-1 text-red-600 hover:bg-red-50"
                    >
                      {/* trash */}
                      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
