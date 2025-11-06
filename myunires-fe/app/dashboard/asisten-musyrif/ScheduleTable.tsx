"use client";

import React from "react";

export type ScheduleItem = {
  time: string;
  activity: string;
  /** tone: menentukan warna baris; pilih: "rose" | "amber" | "emerald" | "sky" */
  tone?: "rose" | "amber" | "emerald" | "sky";
};

const toneToClass = (tone?: ScheduleItem["tone"]) => {
  switch (tone) {
    case "rose":
      return "bg-rose-50";
    case "amber":
      return "bg-amber-50";
    case "emerald":
      return "bg-emerald-50";
    case "sky":
      return "bg-sky-50";
    default:
      return "bg-white";
  }
};

export default function ScheduleTable({ items }: { items: ScheduleItem[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left text-slate-600">
            <th className="w-40 px-4 py-3 font-semibold uppercase tracking-wide text-xs">
              Waktu
            </th>
            <th className="px-4 py-3 font-semibold uppercase tracking-wide text-xs">
              Kegiatan
            </th>
          </tr>
        </thead>
        <tbody>
          {items.map((row, idx) => (
            <tr
              key={`${row.time}-${idx}`}
              className={`${toneToClass(row.tone)} border-t border-slate-100`}
            >
              <td className="px-4 py-3 font-medium text-slate-800 whitespace-nowrap">
                {row.time}
              </td>
              <td className="px-4 py-3 text-slate-700">{row.activity}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
