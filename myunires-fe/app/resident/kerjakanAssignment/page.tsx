"use client";
import { useState, useEffect } from "react";
import { FaArrowLeft, FaClipboardList, FaCheckCircle } from "react-icons/fa";
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
  const [isOpen, setIsOpen] = useState(true);
  const toggleSidebar = () => setIsOpen((prev) => !prev);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const [kategoriList, setKategoriList] = useState<KategoriMateri[]>([]);
  const [assignmentList, setAssignmentList] = useState<Assignment[]>([]);
  const [selectedKategori, setSelectedKategori] =
    useState<KategoriMateri | null>(null);
  const [filteredAssignments, setFilteredAssignments] = useState<Assignment[]>(
    []
  );
  const [loading, setLoading] = useState(true);

  // Quiz Modal States
  const [showQuizModal, setShowQuizModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] =
    useState<Assignment | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string>("");
  const [quizResult, setQuizResult] = useState<{
    show: boolean;
    isCorrect: boolean;
    correctAnswer: string;
  } | null>(null);

  // Fetch kategori and assignments
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

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

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

        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);

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

  // Filter assignments by kategori
  useEffect(() => {
    if (selectedKategori) {
      const filtered = assignmentList.filter(
        (a) => a.materi?.kategori?.id === selectedKategori.id
      );
      setFilteredAssignments(filtered);
    }
  }, [selectedKategori, assignmentList]);

  const handleKategoriClick = (kategori: KategoriMateri) => {
    setSelectedKategori(kategori);
  };

  const handleBackToKategori = () => {
    setSelectedKategori(null);
    setFilteredAssignments([]);
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

    // Tampilkan hasil
    setQuizResult({
      show: true,
      isCorrect,
      correctAnswer: selectedAssignment.jawabanBenar,
    });

    // Submit ke backend (opsional)
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
  return (
    <div className="min-h-screen flex bg-white">
      {/* ===== HEADER LOGO ===== */}
      <header className="fixed top-0 left-0 right-0 bg-white z-30 h-16 flex items-center justify-between px-6 border-b">
        <div className="flex items-center gap-3">
          <img src="/lg_umy.svg" alt="UMY" className="h-10 object-contain" />
          <img
            src="/lg_unires.svg"
            alt="UNIRES"
            className="h-10 object-contain"
          />
        </div>
        <button
          onClick={() => setShowLogoutModal(true)}
          className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-md transition"
        >
          Logout
        </button>
      </header>

      {/* ===== LOGOUT MODAL ===== */}
      {showLogoutModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-white/90 z-50">
          <div className="bg-[#d1d4d0] rounded-3xl shadow-lg p-8 w-[400px] text-center">
            <h2 className="text-2xl font-semibold text-[#004220] mb-4">
              Log Out
            </h2>
            <p className="text-gray-700 text-sm mb-1">
              Tindakan ini akan mengakhiri sesi login Anda.
            </p>
            <p className="text-gray-700 text-sm mb-6">
              Apakah Anda ingin melanjutkan?
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="bg-[#FFC107] hover:bg-[#ffb300] text-white font-semibold px-6 py-2 rounded-full shadow-md"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem("token");
                  window.location.href = "/login";
                }}
                className="bg-[#E50914] hover:bg-red-700 text-white font-semibold px-6 py-2 rounded-full shadow-md"
              >
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== SIDEBAR ===== */}
      <Sidebar_Resident isOpen={isOpen} toggleSidebar={toggleSidebar} />

      {/* ===== MAIN CONTENT ===== */}
      <main
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          isOpen ? "ml-64" : "ml-12"
        }`}
      >
        {/* Spacer supaya tidak ketabrak header */}
        <div className="h-16" />

        {/* Header hijau */}
        <header className="px-6 py-4 mb-5">
          <h1 className="bg-[#004220] text-white text-center py-6 rounded-md text-lg font-semibold">
            Assignment
          </h1>
        </header>

        {/* ===== Content ===== */}
        <section className="px-6 pb-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="text-gray-500">Memuat data...</div>
            </div>
          ) : !selectedKategori ? (
            /* ===== Kategori List ===== */
            <div className="px-6 py-4 mb-5 space-y-4">
              {kategoriList.length === 0 ? (
                <div className="text-center py-10">
                  <p className="text-gray-500 mb-2">
                    Tidak ada kategori assignment tersedia
                  </p>
                  <p className="text-sm text-gray-400">
                    Silakan cek koneksi atau hubungi administrator
                  </p>
                </div>
              ) : (
                kategoriList.map((kategori) => (
                  <button
                    key={kategori.id}
                    onClick={() => handleKategoriClick(kategori)}
                    className="w-full bg-white text-[#004220] text-center py-3 rounded-md text-lg font-semibold border border-[#004220] hover:bg-[#004220] hover:text-white transition-all duration-200"
                  >
                    {kategori.nama}
                  </button>
                ))
              )}
            </div>
          ) : (
            /* ===== Assignment List ===== */
            <div className="px-6 py-4">
              {/* Back Button */}
              <button
                onClick={handleBackToKategori}
                className="mb-5 flex items-center gap-2 text-[#004220] hover:text-[#003318] font-medium transition"
              >
                <FaArrowLeft />
                Kembali ke Kategori
              </button>

              {/* Kategori Title */}
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-[#004220] mb-2">
                  {selectedKategori.nama}
                </h2>
                <p className="text-gray-600">
                  {filteredAssignments.length} assignment tersedia
                </p>
              </div>

              {/* Assignment Cards */}
              {filteredAssignments.length === 0 ? (
                <div className="text-center py-10 text-gray-500">
                  Belum ada assignment untuk kategori ini
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {filteredAssignments.map((assignment) => (
                    <div
                      key={assignment.id}
                      className="bg-white border border-gray-300 rounded-lg p-5 hover:shadow-lg transition-all duration-200"
                    >
                      {/* Assignment Icon & Title */}
                      <div className="flex items-start gap-3 mb-3">
                        <div className="bg-[#004220] p-3 rounded-md">
                          <FaClipboardList className="text-white text-xl" />
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-[#004220] mb-1">
                            {assignment.judul}
                          </h3>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {assignment.materi?.judul || "Materi"}
                          </span>
                        </div>
                      </div>

                      {/* Assignment Question Preview */}
                      <p className="text-gray-700 text-sm mb-4 leading-relaxed line-clamp-2">
                        {assignment.pertanyaan}
                      </p>

                      {/* Start Quiz Button */}
                      <button
                        onClick={() => handleStartQuiz(assignment)}
                        className="w-full bg-[#004220] hover:bg-[#003318] text-white font-medium py-2 px-4 rounded-md transition"
                      >
                        Kerjakan Quiz
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>

        {/* ===== QUIZ MODAL ===== */}
        {showQuizModal && selectedAssignment && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden border border-gray-200">
              {/* Header */}
              <div className="bg-[#004220] px-8 py-5 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {selectedAssignment.judul}
                  </h2>
                  <button
                    onClick={handleCloseQuiz}
                    className="text-white hover:text-gray-200 transition"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Body */}
              <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
                {!quizResult?.show ? (
                  <div className="space-y-5">
                    {/* Materi Info */}
                    <div className="bg-gray-50 border border-gray-300 rounded-md p-4">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1 block">
                        Materi
                      </label>
                      <p className="text-base font-semibold text-[#004220]">
                        {selectedAssignment.materi?.judul || "-"}
                      </p>
                    </div>

                    {/* Pertanyaan */}
                    <div className="bg-white border border-gray-300 rounded-md p-5">
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
                        Pertanyaan
                      </label>
                      <p className="text-gray-800 leading-relaxed text-base">
                        {selectedAssignment.pertanyaan}
                      </p>
                    </div>

                    {/* Pilihan Jawaban */}
                    <div>
                      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-3 block">
                        Pilih Jawaban Anda
                      </label>
                      <div className="space-y-3">
                        {["A", "B", "C", "D"].map((option) => {
                          const optionText = selectedAssignment[
                            `opsi${option}` as keyof Assignment
                          ] as string;
                          const isSelected = selectedAnswer === option;

                          return (
                            <button
                              key={option}
                              onClick={() => setSelectedAnswer(option)}
                              className={`w-full flex items-start gap-3 p-4 rounded-md border-2 transition-all text-left ${
                                isSelected
                                  ? "bg-[#004220] border-[#004220] text-white"
                                  : "bg-white border-gray-300 hover:border-[#004220]"
                              }`}
                            >
                              <div
                                className={`flex-shrink-0 w-8 h-8 rounded-md flex items-center justify-center font-semibold text-sm ${
                                  isSelected
                                    ? "bg-white text-[#004220]"
                                    : "bg-gray-200 text-gray-700"
                                }`}
                              >
                                {option}
                              </div>
                              <p
                                className={`flex-1 pt-1 ${
                                  isSelected ? "font-medium" : ""
                                }`}
                              >
                                {optionText}
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Quiz Result */
                  <div className="text-center py-10">
                    {quizResult.isCorrect ? (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <FaCheckCircle className="text-green-500 text-6xl" />
                        </div>
                        <h3 className="text-2xl font-bold text-green-600">
                          Jawaban Benar!
                        </h3>
                        <p className="text-gray-600">
                          Selamat! Jawaban Anda benar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex justify-center">
                          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <span className="text-red-500 text-4xl font-bold">
                              ✗
                            </span>
                          </div>
                        </div>
                        <h3 className="text-2xl font-bold text-red-600">
                          Jawaban Salah
                        </h3>
                        <p className="text-gray-600">
                          Jawaban yang benar adalah:{" "}
                          <span className="font-bold text-[#004220]">
                            {quizResult.correctAnswer}
                          </span>
                        </p>
                        <div className="bg-green-50 border border-green-300 rounded-md p-4 mt-4">
                          <p className="text-sm text-gray-700">
                            <strong>Jawaban Benar:</strong>{" "}
                            {
                              selectedAssignment[
                                `opsi${quizResult.correctAnswer}` as keyof Assignment
                              ] as string
                            }
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="bg-gray-50 px-8 py-4 border-t border-gray-200 flex justify-end gap-3">
                {!quizResult?.show ? (
                  <>
                    <button
                      onClick={handleCloseQuiz}
                      className="px-5 py-2 bg-white border border-gray-300 hover:bg-gray-100 text-gray-700 font-medium rounded-md transition"
                    >
                      Batal
                    </button>
                    <button
                      onClick={handleSubmitAnswer}
                      disabled={!selectedAnswer}
                      className="px-5 py-2 bg-[#004220] hover:bg-[#003318] text-white font-medium rounded-md transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Submit Jawaban
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleCloseQuiz}
                    className="px-5 py-2 bg-[#004220] hover:bg-[#003318] text-white font-medium rounded-md transition"
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
