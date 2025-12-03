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
  kategoriList,
  materiList,
}: {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  kategoriList: { id: number; nama: string }[];
  materiList: { id: number; judul: string; kategoriId: number }[];
}) {
  const [assignmentId, setAssignmentId] = useState("");
  const [materiId, setMateriId] = useState("");
  const [questions, setQuestions] = useState<string[]>(["", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Dropdown loading not needed, always ready
  const loadingDD = false;

  // Remove dropdown fetch logic, use props instead

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
            <svg
              viewBox="0 0 24 24"
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M6 6l12 12M18 6l-12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-5">
          {/* Assignment */}
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Kategori Materi <span className="text-red-600">*</span>
            </label>
            <select
              value={assignmentId}
              onChange={(e) => setAssignmentId(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Pilih Kategori</option>
              {kategoriList.map((k) => (
                <option key={k.id} value={k.id.toString()}>
                  {k.nama}
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
              className="w-full rounded-xl border border-slate-300 px-3 py-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">Pilih Materi</option>
              {materiList
                .filter(
                  (m) =>
                    assignmentId === "" ||
                    m.kategoriId.toString() === assignmentId
                )
                .map((m) => (
                  <option key={m.id} value={m.id.toString()}>
                    {m.judul}
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
