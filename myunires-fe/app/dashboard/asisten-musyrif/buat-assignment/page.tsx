"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { apiGet /*, apiDelete*/ } from "@/lib/api";
import AssignmentsTable, { type AssignmentRow } from "@/components/AssignmentsTable";
import AddAssignmentModal from "@/components/AddAssignmentModal";

type FilterOpt = { label: string; value: string };

const ASSIGNMENT_FILTERS: FilterOpt[] = [
  { label: "Assignment (All)", value: "All" },
];
const MATERI_FILTERS: FilterOpt[] = [
  { label: "Materi (All)", value: "All" },
];

type Paginated<T> = { data: T[]; total: number; page: number; limit: number };

export default function BuatAssignmentPage() {
  const router = useRouter();
  const user = { name: "AsistenMusyrif", email: "asistenmusyrif@umy.ac.id" };

  // filters
  const [search, setSearch] = useState("");
  const [assignmentFilter, setAssignmentFilter] = useState<FilterOpt>(ASSIGNMENT_FILTERS[0]);
  const [materiFilter, setMateriFilter] = useState<FilterOpt>(MATERI_FILTERS[0]);

  // data
  const [rows, setRows] = useState<AssignmentRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // modal
  const [openModal, setOpenModal] = useState(false);

  const params = useMemo(
    () => ({
      search,
      assignment: assignmentFilter.value,
      materi: materiFilter.value,
      page: 1,
      limit: 10,
    }),
    [search, assignmentFilter, materiFilter]
  );

  const fetchAssignments = () => {
    setLoading(true);
    setError(null);
    // Ubah endpoint sesuai backend-mu: mis. GET /assignments
    apiGet<Paginated<AssignmentRow>>("/assignments", params)
      .then((res) => setRows(res.data ?? []))
      .catch((e: any) => {
        setError(e?.message ?? "Gagal memuat data");
        setRows([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  return (
    <div className="min-h-screen bg-white">
      {/* TOP BAR */}
      <div className="bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-8">
              <Image src="/umy.png" alt="UMY" width={140} height={32} className="h-8 w-auto" priority />
              <Image src="/unires.png" alt="UNIRES" width={120} height={28} className="h-7 w-auto" />
            </div>
            <button
              onClick={() => alert("Log out")}
              className="rounded-full bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Log Out
            </button>
          </div>
        </div>
      </div>

      {/* BODY: sidebar + content */}
      <div className="mx-auto max-w-6xl px-4 py-6 grid grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="col-span-12 md:col-span-3">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-full bg-amber-400 text-emerald-900 font-bold grid place-items-center">
              AM
            </div>
            <div className="leading-tight text-emerald-900">
              <div className="text-sm font-semibold">{user.name}</div>
              <div className="text-xs">{user.email}</div>
            </div>
          </div>
          <nav className="mt-6 space-y-2 text-sm">
            <button
              onClick={() => router.push("/dashboard/asisten-musyrif")}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-emerald-900 hover:bg-emerald-900/5"
            >
              Dashboard
            </button>
            <button
              onClick={() => router.push("/dashboard/asisten-musyrif/resident-per-usroh")}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-emerald-900 hover:bg-emerald-900/5"
            >
              Resident Per Usroh
            </button>
            <button
              onClick={() => router.push("/dashboard/asisten-musyrif/input-nilai-tahfidz")}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-emerald-900 hover:bg-emerald-900/5"
            >
              Input Nilai Tahfidz
            </button>
            <div className="flex items-center gap-2 rounded-lg px-3 py-2 bg-emerald-900 text-white">
              Buat Assignment
            </div>
          </nav>
        </aside>

        {/* Content */}
        <section className="col-span-12 md:col-span-9">
          {/* Title hijau */}
          <div className="mx-auto mb-6 max-w-xl">
            <div className="rounded-2xl bg-emerald-900 px-6 py-4 text-center text-white text-2xl font-semibold">
              Buat Assignment
            </div>
          </div>

          {/* Toolbar */}
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari Data"
                className="w-full rounded-lg border border-slate-300 px-9 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
                <svg className="h-5 w-5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.3-4.3" />
                </svg>
              </span>
            </div>

            <select
              value={assignmentFilter.value}
              onChange={(e) =>
                setAssignmentFilter(ASSIGNMENT_FILTERS.find((o) => o.value === e.target.value) ?? ASSIGNMENT_FILTERS[0])
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {ASSIGNMENT_FILTERS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <select
              value={materiFilter.value}
              onChange={(e) =>
                setMateriFilter(MATERI_FILTERS.find((o) => o.value === e.target.value) ?? MATERI_FILTERS[0])
              }
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {MATERI_FILTERS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            {/* tombol tambah di kanan */}
            <div className="sm:ml-auto">
              <button
                onClick={() => setOpenModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                Add Assignment
              </button>
            </div>
          </div>

          {/* Table */}
          <AssignmentsTable
            rows={rows}
            loading={loading}
            onView={(r) => alert(`Lihat: ${r.assignment} - ${r.materi}`)}
            onEdit={(r) => alert(`Edit: ${r.assignment} - ${r.materi}`)}
            onDelete={(r) => {
              // TODO: sambungkan ke api delete
              // apiDelete(`/assignments/${r.id}`).then(fetchAssignments);
              alert(`Hapus: ${r.assignment}`);
            }}
          />

          {error && (
            <p className="mt-3 text-sm text-red-600">Gagal memuat data: {error}</p>
          )}
        </section>
      </div>

      {/* Modal */}
      <AddAssignmentModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSaved={() => {
          setOpenModal(false);
          fetchAssignments();
        }}
      />

      {/* strip bawah */}
      <div className="h-6 bg-emerald-900" />
    </div>
  );
}
