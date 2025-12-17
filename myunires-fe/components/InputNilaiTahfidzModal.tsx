"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import type { Resident } from "@/types/resident";
import type { Usroh } from "@/types/usroh";
import type { TahfidzGradeInput } from "@/types/tahfidz";

const ALLOWED = ["A", "B", "C", "D", "E"] as const;
type GradeLetter = (typeof ALLOWED)[number];

// Ubah path sesuai backendmu bila perlu
const RESIDENTS_PATH = "/residents";
const USROH_PATH = "/usroh";
const POST_TAHFIDZ_PATH = "/tahfidz-scores";

export default function InputNilaiTahfidzModal({
  open,
  onClose,
  onSaved,
  resident,                 // ✅ sekarang bisa preselect resident
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  resident?: Resident | null;
}) {
  // data dropdown
  const [residents, setResidents] = useState<Resident[]>([]);
  const [usrohList, setUsrohList] = useState<Usroh[]>([]);
  const [loadingDD, setLoadingDD] = useState(false);

  // form state
  const [residentId, setResidentId] = useState<string>(resident?.id?.toString() ?? "");
  const [usrohId, setUsrohId] = useState<string>("");
  const [grade, setGrade] = useState<GradeLetter | "">("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // load dropdown ketika modal dibuka
  useEffect(() => {
    if (!open) return;
    setLoadingDD(true);
    setError(null);
    Promise.all([
      apiGet<Resident[]>(RESIDENTS_PATH),
      apiGet<Usroh[]>(USROH_PATH),
    ])
      .then(([rs, us]) => {
        setResidents(rs ?? []);
        setUsrohList(us ?? []);
      })
      .catch((e: any) => setError(e?.message ?? "Gagal memuat data dropdown"))
      .finally(() => setLoadingDD(false));
  }, [open]);

  // sinkron resident preselect (jika dipanggil dari baris tabel)
  useEffect(() => {
    if (resident?.id) setResidentId(resident.id.toString());
    else setResidentId("");
  }, [resident?.id]);

  // validasi form
  const canSave = useMemo(
    () => Boolean(residentId && usrohId && grade && ALLOWED.includes(grade as GradeLetter)),
    [residentId, usrohId, grade]
  );

  const onChangeGrade = (v: string) => {
    const upper = v.trim().toUpperCase();
    if (upper === "") return setGrade("");
    if (ALLOWED.includes(upper as GradeLetter)) setGrade(upper as GradeLetter);
  };

  const submit = async () => {
    if (!canSave) return;
    setSubmitting(true);
    setError(null);
    const payload: TahfidzGradeInput = { residentId, usrohId, grade: grade as GradeLetter };
    try {
      await apiPost(POST_TAHFIDZ_PATH, payload);
      onSaved?.();
      onClose();
      // reset
      if (!resident) setResidentId("");
      setUsrohId("");
      setGrade("");
    } catch (e: any) {
      setError(e?.message ?? "Gagal menyimpan nilai");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        {/* header */}
        <div className="relative border-b border-slate-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-sky-600">Tambah Nilai Resident</h3>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-full p-1 text-slate-500 hover:bg-slate-100"
            aria-label="Tutup"
          >
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        {/* body */}
        <div className="px-6 py-5 space-y-5">
          {/* Nama Lengkap */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nama Lengkap <span className="text-red-600">*</span>
            </label>
            <select
              value={residentId}
              onChange={(e) => setResidentId(e.target.value)}
              disabled={loadingDD || Boolean(resident)}  // ✅ disable kalau preselect
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{loadingDD ? "Memuat..." : "Masukkan Nama Lengkap"}</option>
              {residents.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} — {r.uniresNumber}
                </option>
              ))}
            </select>
          </div>

          {/* Usroh */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Usroh <span className="text-red-600">*</span>
            </label>
            <select
              value={usrohId}
              onChange={(e) => setUsrohId(e.target.value)}
              disabled={loadingDD}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{loadingDD ? "Memuat..." : "Masukkan Usroh"}</option>
              {usrohList.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>
          </div>

          {/* Nilai */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Nilai <span className="text-red-600">*</span>
            </label>
            <input
              value={grade}
              onChange={(e) => onChangeGrade(e.target.value)}
              placeholder="Masukkan Nilai dengan abjad ( A / B / C / D / E )"
              maxLength={1}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <p className="mt-1 text-xs text-slate-500">Hanya huruf A, B, C, D, atau E.</p>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* footer */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            disabled={submitting}
          >
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={!canSave || submitting}
            className="rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-sky-700 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
