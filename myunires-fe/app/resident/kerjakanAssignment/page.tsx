"use client";

import { useState, useEffect, useMemo } from "react";
import { FaArrowLeft, FaClipboardList, FaCheckCircle } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import Sidebar_Resident from "@/components/Sidebar_Resident";

interface KategoriMateri {
  id: number;
  nama: string;
}

interface Materi {
  id: number;
  judul: string;
  kategori: KategoriMateri;
}

interface Assignment {
  id: number;
  judul: string;
  pertanyaan: string;
  opsiA: string;
  opsiB: string;
  opsiC: string;
  opsiD: string;
  jawabanBenar: string;
  materiId: number;
  materi: Materi;
}

export default function KerjakanAssignmentPage() {
  // desktop collapse
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);

  // mobile drawer
  const [mobileOpen, setMobileOpen] = useState(false);

  const [kategoriList, setKategoriList] = useState<KategoriMateri[]>([]);
  const [assignmentList, setAssignmentList] = useState<Assignment[]>([]);
  const [selectedKategori, setSelectedKategori] =
    useState<KategoriMateri | null>(null);
  const [loading, setLoading] = useState(true);

  // Quiz modal
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [quizResult, setQuizResult] = useState<{
    show: boolean;
    isCorrect: boolean;
    correctAnswer: string;
  } | null>(null);

  useEffect(() => {
    const fetchKategori = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3001/api/resident/kategori",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        const data = result.data || result.kategori || result;
        setKategoriList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching kategori:", error);
        setKategoriList([]);
      }
    };

    const fetchAssignments = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          "http://localhost:3001/api/resident/assignments",
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        const result = await response.json();
        const data = result.data || result.assignments || result;
        setAssignmentList(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setAssignmentList([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKategori();
    fetchAssignments();
  }, []);

  const filteredAssignments = useMemo(() => {
    if (!selectedKategori) return [];
    return assignmentList.filter(
      (a) => a.materi?.kategori?.id === selectedKategori.id
    );
  }, [selectedKategori, assignmentList]);

  const handleBackToKategori = () => {
    setSelectedKategori(null);
  };

  const handleStartQuiz = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSelectedAnswer("");
    setQuizResult(null);
    setShowQuizModal(true);
  };

  const handleSubmitAnswer = async () => {
    if (!selectedAnswer || !selectedAssignment) return;

    const isCorrect = selectedAnswer === selectedAssignment.jawabanBenar;

    setQuizResult({
      show: true,
      isCorrect,
      correctAnswer: selectedAssignment.jawabanBenar,
    });

    try {
      const token = localStorage.getItem("token");
      await fetch("http://localhost:3001/api/resident/assignment/submit", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          assignmentId: selectedAssignment.id,
          jawabanUser: selectedAnswer,
        }),
      });
    } catch (error) {
      console.error("Error submitting answer:", error);
    }
  };

  const handleCloseQuiz = () => {
    setShowQuizModal(false);
    setSelectedAssignment(null);
    setSelectedAnswer("");
    setQuizResult(null);
  };

  const optionText = (a: Assignment, opt: string) => {
    const key = `opsi${opt}` as keyof Assignment;
    return a[key] as string;
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5]">
      {/* HEADER (tanpa logout) */}
      <header className="h-16 bg-white border-b flex items-center sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Open menu"
            >
              <FiMenu size={18} className="text-[#0D6B44]" />
            </button>

            <img
              src="/lg_umy.svg"
              alt="UMY"
              className="h-6 sm:h-8 w-auto shrink-0"
            />
            <img
              src="/lg_unires.svg"
              alt="UNIRES"
              className="h-6 sm:h-8 w-auto shrink-0"
            />
          </div>

          <div className="text-right">
            <p className="text-xs text-gray-500">Resident</p>
            <p className="text-sm font-semibold text-[#004220] leading-tight">
              Assignment
            </p>
          </div>
        </div>
      </header>

      {/* SIDEBAR */}
      <Sidebar_Resident
        isOpen={isOpen}
        toggleSidebar={toggleSidebar}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* MAIN */}
      <main
        className={[
          "transition-all duration-300",
          isOpen ? "md:pl-64" : "md:pl-14",
        ].join(" ")}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6">
          {/* Title bar */}
          <div className="bg-[#004220] text-white text-center py-5 rounded-2xl text-xl font-semibold shadow-sm">
            Kerjakan Assignment
          </div>

          {/* CONTENT */}
          <section className="mt-6">
            {loading ? (
              <div className="bg-white rounded-2xl border shadow-sm py-16 text-center text-gray-500">
                Memuat data...
              </div>
            ) : !selectedKategori ? (
              <>
                {/* KATEGORI GRID */}
                {kategoriList.length === 0 ? (
                  <div className="bg-white rounded-2xl border shadow-sm py-12 text-center">
                    <p className="text-gray-600 font-semibold">
                      Tidak ada kategori assignment
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Cek koneksi atau hubungi administrator.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {kategoriList.map((k) => (
                      <button
                        key={k.id}
                        onClick={() => setSelectedKategori(k)}
                        className="group text-left bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs text-gray-500">Kategori</p>
                            <h3 className="text-[#004220] text-lg font-semibold mt-1">
                              {k.nama}
                            </h3>
                            <p className="text-sm text-gray-500 mt-2">
                              Lihat assignment untuk kategori ini.
                            </p>
                          </div>
                          <div className="h-11 w-11 rounded-xl bg-emerald-50 ring-1 ring-emerald-100 flex items-center justify-center shrink-0">
                            <FaClipboardList className="text-[#0D6B44] text-lg" />
                          </div>
                        </div>
                        <div className="mt-4 inline-flex items-center text-sm font-semibold text-[#0D6B44] group-hover:underline">
                          Buka
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <>
                {/* HEADER KATEGORI + BACK */}
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <button
                    onClick={handleBackToKategori}
                    className="inline-flex items-center gap-2 text-[#004220] hover:text-[#003318] font-semibold transition"
                  >
                    <FaArrowLeft />
                    Kembali
                  </button>

                  <div className="text-right">
                    <p className="text-xs text-gray-500">Kategori</p>
                    <p className="text-base font-semibold text-[#004220]">
                      {selectedKategori.nama}
                    </p>
                  </div>
                </div>

                <div className="mt-4 bg-white rounded-2xl border shadow-sm p-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-bold text-[#004220]">
                        {selectedKategori.nama}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {filteredAssignments.length} assignment tersedia
                      </p>
                    </div>

                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100 whitespace-nowrap">
                      Quiz
                    </span>
                  </div>
                </div>

                {/* ASSIGNMENT LIST */}
                <div className="mt-4">
                  {filteredAssignments.length === 0 ? (
                    <div className="bg-white rounded-2xl border shadow-sm py-12 text-center text-gray-500">
                      Belum ada assignment untuk kategori ini
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {filteredAssignments.map((a) => (
                        <div
                          key={a.id}
                          className="bg-white border rounded-2xl shadow-sm p-5 hover:shadow-md transition"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-11 w-11 rounded-xl bg-[#004220] flex items-center justify-center shrink-0">
                              <FaClipboardList className="text-white text-lg" />
                            </div>

                            <div className="min-w-0 flex-1">
                              <h3 className="text-lg font-semibold text-[#004220] leading-snug">
                                {a.judul}
                              </h3>
                              <div className="mt-1">
                                <span className="text-[11px] text-gray-600 bg-gray-100 px-2 py-1 rounded-full">
                                  {a.materi?.judul || "Materi"}
                                </span>
                              </div>
                            </div>
                          </div>

                          <p className="text-gray-700 text-sm mt-4 leading-relaxed line-clamp-2">
                            {a.pertanyaan}
                          </p>

                          <button
                            onClick={() => handleStartQuiz(a)}
                            className="mt-5 w-full inline-flex items-center justify-center rounded-xl bg-[#004220] hover:bg-[#003318] text-white font-semibold py-2.5 transition"
                          >
                            Kerjakan Quiz
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </section>
        </div>

        {/* QUIZ MODAL */}
        {showQuizModal && selectedAssignment && (
          <div className="fixed inset-0 z-[70] bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl max-h-[90vh] bg-white rounded-2xl shadow-xl border overflow-hidden">
              {/* modal header */}
              <div className="bg-[#004220] px-5 sm:px-6 py-4 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-white/80 text-xs">Quiz</p>
                  <h2 className="text-white text-lg sm:text-xl font-semibold truncate">
                    {selectedAssignment.judul}
                  </h2>
                </div>

                <button
                  onClick={handleCloseQuiz}
                  className="text-white/90 hover:text-white p-2 rounded-lg hover:bg-white/10 transition"
                  aria-label="Close"
                >
                  <span className="text-xl leading-none">×</span>
                </button>
              </div>

              {/* modal body scroll */}
              <div className="p-5 sm:p-6 overflow-y-auto max-h-[calc(90vh-132px)]">
                {!quizResult?.show ? (
                  <div className="space-y-4">
                    <div className="rounded-2xl bg-gray-50 border p-4">
                      <p className="text-xs font-semibold text-gray-500">
                        Materi
                      </p>
                      <p className="text-[#004220] font-semibold mt-1">
                        {selectedAssignment.materi?.judul || "-"}
                      </p>
                    </div>

                    <div className="rounded-2xl border p-4">
                      <p className="text-xs font-semibold text-gray-500">
                        Pertanyaan
                      </p>
                      <p className="text-gray-800 mt-2 leading-relaxed">
                        {selectedAssignment.pertanyaan}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-gray-500">
                        Pilih jawaban
                      </p>

                      {["A", "B", "C", "D"].map((opt) => {
                        const isSelected = selectedAnswer === opt;
                        return (
                          <button
                            key={opt}
                            onClick={() => setSelectedAnswer(opt)}
                            className={[
                              "w-full text-left rounded-2xl border p-4 transition",
                              isSelected
                                ? "border-[#004220] bg-emerald-50"
                                : "border-gray-200 bg-white hover:bg-gray-50",
                            ].join(" ")}
                          >
                            <div className="flex items-start gap-3">
                              <div
                                className={[
                                  "h-9 w-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0",
                                  isSelected
                                    ? "bg-[#004220] text-white"
                                    : "bg-gray-100 text-gray-700",
                                ].join(" ")}
                              >
                                {opt}
                              </div>
                              <p className="text-gray-800 leading-relaxed">
                                {optionText(selectedAssignment, opt)}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="py-6 text-center">
                    {quizResult.isCorrect ? (
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <FaCheckCircle className="text-emerald-500 text-6xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-emerald-600">
                          Jawaban Benar
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Mantap, jawaban kamu tepat.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex justify-center">
                          <div className="h-16 w-16 bg-red-50 border border-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-600 text-3xl font-bold">
                              ×
                            </span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-red-600">
                          Jawaban Salah
                        </h3>
                        <p className="text-gray-600 text-sm">
                          Jawaban benar:{" "}
                          <span className="font-bold text-[#004220]">
                            {quizResult.correctAnswer}
                          </span>
                        </p>

                        <div className="mt-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4 text-left">
                          <p className="text-xs font-semibold text-gray-500">
                            Pembahasan (jawaban benar)
                          </p>
                          <p className="text-sm text-gray-800 mt-2 leading-relaxed">
                            {optionText(
                              selectedAssignment,
                              quizResult.correctAnswer
                            )}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* modal footer */}
              <div className="bg-gray-50 border-t px-5 sm:px-6 py-4 flex justify-end gap-2">
                {!quizResult?.show ? (
                  <>
                    <button
                      onClick={handleCloseQuiz}
                      className="px-4 py-2 rounded-xl bg-white border hover:bg-gray-100 transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedAnswer}
                      className="px-4 py-2 rounded-xl bg-[#004220] hover:bg-[#003318] text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCloseQuiz}
                    className="px-4 py-2 rounded-xl bg-[#004220] hover:bg-[#003318] text-white font-semibold transition"
                  >
                    Tutup
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
