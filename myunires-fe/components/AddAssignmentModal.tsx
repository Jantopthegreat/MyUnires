"use client";

import React, { useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";

/** Opsi dropdown */
type Option = { id: string; name: string };

const ASSIGNMENT_OPTS_FALLBACK: Option[] = [
  { id: "a1", name: "Tafhim dan Tahsin" },
  { id: "a2", name: "Tahfidz" },
  { id: "a3", name: "Kemuhammadiyahan" },
];

const MATERI_OPTS_FALLBACK: Option[] = [
  { id: "m1", name: "Materi 1" },
  { id: "m2", name: "Materi 2" },
  { id: "m3", name: "Materi 3" },
  { id: "m4", name: "Materi 4" },
];

// Ubah endpoint sesuai backend-mu bila berbeda
const LIST_ASSIGNMENT_OPTIONS = "/assignment-options";
const LIST_MATERI_OPTIONS = "/materi";
const POST_ASSIGNMENT = "/assignments";

export default function AddAssignmentModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
}) {
  const [assignmentOpts, setAssignmentOpts] = useState<Option[]>([]);
  const [materiOpts, setMateriOpts] = useState<Option[]>([]);
  const [loadingDD, setLoadingDD] = useState(false);

  const [assignmentId, setAssignmentId] = useState("");
  const [materiId, setMateriId] = useState("");
  const [questions, setQuestions] = useState<string[]>(["", "", ""]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load dropdown saat modal dibuka
  useEffect(() => {
    if (!open) return;
    setLoadingDD(true);
    setError(null);

    Promise.all([
      apiGet<Option[]>(LIST_ASSIGNMENT_OPTIONS).catch(() => ASSIGNMENT_OPTS_FALLBACK),
      apiGet<Option[]>(LIST_MATERI_OPTIONS).catch(() => MATERI_OPTS_FALLBACK),
    ])
      .then(([a, m]) => {
        setAssignmentOpts(Array.isArray(a) ? a : ASSIGNMENT_OPTS_FALLBACK);
        setMateriOpts(Array.isArray(m) ? m : MATERI_OPTS_FALLBACK);
      })
      .finally(() => setLoadingDD(false));
  }, [open]);

  const canSave = useMemo(() => {
    const hasQuestion = questions.some((q) => q.trim() !== "");
    return Boolean(assignmentId && materiId && hasQuestion);
  }, [assignmentId, materiId, questions]);

  const addQuestion = () => setQuestions((qs) => [...qs, ""]);
  const updateQuestion = (idx: number, v: string) =>
    setQuestions((qs) => qs.map((q, i) => (i === idx ? v : q)));

  const submit = async () => {
    if (!canSave) return;
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        assignmentId,
        materiId,
        questions: questions.filter((q) => q.trim() !== ""),
      };
      await apiPost(POST_ASSIGNMENT, payload);
      onSaved?.();
      onClose();
      // reset
      setAssignmentId("");
      setMateriId("");
      setQuestions(["", "", ""]);
    } catch (e: any) {
      setError(e?.message ?? "Gagal menyimpan assignment");
    } finally {
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        {/* Header */}
        <div className="relative border-b border-slate-200 px-6 py-4">
          <h3 className="text-xl font-semibold text-sky-600">
            Tambah Assignment Resident
          </h3>
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

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Assignment */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Assignment <span className="text-red-600">*</span>
            </label>
            <select
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              disabled={loadingDD}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{loadingDD ? "Memuat..." : "Masukkan Assignment"}</option>
              {assignmentOpts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Materi */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Materi <span className="text-red-600">*</span>
            </label>
            <select
              value={materiId}
              onChange={(e) => setMateriId(e.target.value)}
              disabled={loadingDD}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">{loadingDD ? "Memuat..." : "Masukkan Materi"}</option>
              {materiOpts.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>

          {/* Soal dinamis */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Soal <span className="text-red-600">*</span>
            </label>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <textarea
                  key={idx}
                  value={q}
                  onChange={(e) => updateQuestion(idx, e.target.value)}
                  placeholder={`${idx + 1}.`}
                  rows={2}
                  className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              ))}
              <button
                onClick={addQuestion}
                type="button"
                className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
              >
                Tambah Kolom Soal
              </button>
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
        </div>

        {/* Footer */}
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
