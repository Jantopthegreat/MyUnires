// src/controllers/residentController.js
import { prisma } from "../config/prisma.js";
import bcrypt from "bcrypt";
import fs from "fs";

/* ==========================================================
   ✅ A. PROFIL & AKUN
   ========================================================== */

/**
 * 🔹 Ambil profil resident (berdasarkan token user login)
 */
export const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const resident = await prisma.resident.findUnique({
      where: { userId },
      include: {
        user: { select: { name: true, email: true } },
        usroh: { select: { nama: true } },
        lantai: { select: { nama: true } },
      },
    });

    if (!resident)
      return res.status(404).json({ message: "Data resident tidak ditemukan." });

    res.status(200).json({
      success: true,
      message: "Data profil berhasil diambil.",
      data: {
        id: resident.id,
        name: resident.user.name,
        email: resident.user.email,
        nim: resident.nim,
        jurusan: resident.jurusan,
        angkatan: resident.angkatan,
        noTelp: resident.noTelp,
        usroh: resident.usroh?.nama || "-",
        lantai: resident.lantai?.nama || "-",
      },
    });
  } catch (error) {
    console.error("❌ Error getProfile:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * 🔹 Update profil resident
 */
export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, nim, jurusan, angkatan, noTelp } = req.body;

    const resident = await prisma.resident.findUnique({ where: { userId } });
    if (!resident) return res.status(404).json({ message: "Resident tidak ditemukan." });

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: userId },
        data: { name },
      });

      await tx.resident.update({
        where: { userId },
        data: { nim, jurusan, angkatan: Number(angkatan), noTelp },
      });
    });

    res.status(200).json({ success: true, message: "Profil berhasil diperbarui." });
  } catch (error) {
    console.error("❌ Error updateProfile:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * 🔹 Ganti password akun resident
 */
export const changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: "User tidak ditemukan." });

    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.status(400).json({ message: "Password lama salah." });

    const hashed = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({ where: { id: userId }, data: { password: hashed } });

    res.status(200).json({ success: true, message: "Password berhasil diperbarui." });
  } catch (error) {
    console.error("❌ Error changePassword:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/* ==========================================================
   ✅ B. MATERI
   ========================================================== */

/**
 * 🔹 Ambil semua kategori materi
 */
export const getAllKategori = async (req, res) => {
  try {
    const kategori = await prisma.kategoriMateri.findMany({
      orderBy: { nama: "asc" },
      select: {
        id: true,
        nama: true,
      },
    });

    res.status(200).json({
      success: true,
      message: "Data kategori berhasil diambil.",
      data: kategori,
    });
  } catch (error) {
    console.error("❌ Error getAllKategori:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const getAllMateri = async (req, res) => {
  try {
    const { kategoriId } = req.query;

    const where = {};
    
    // Filter by kategori jika ada
    if (kategoriId && kategoriId !== "all") {
      where.kategoriId = Number(kategoriId);
    }

    const materi = await prisma.materi.findMany({
      where,
      include: { 
        kategori: { 
          select: { 
            id: true, 
            nama: true 
          } 
        } 
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Data materi berhasil diambil.",
      data: materi,
    });
  } catch (error) {
    console.error("❌ Error getAllMateri:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const getMateriById = async (req, res) => {
  try {
    const { id } = req.params;

    const materi = await prisma.materi.findUnique({
      where: { id: Number(id) },
      include: { kategori: true },
    });

    if (!materi)
      return res.status(404).json({ message: "Materi tidak ditemukan." });

    res.status(200).json({
      success: true,
      message: "Detail materi berhasil diambil.",
      data: materi,
    });
  } catch (error) {
    console.error("❌ Error getMateriById:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/* ==========================================================
   ✅ C. ASSIGNMENT (QUIZ)
   ========================================================== */

export const getAssignments = async (req, res) => {
  try {
    const { kategoriId, materiId } = req.query;

    const where = {};

    // Filter by kategori (melalui materi)
    if (kategoriId && kategoriId !== "all") {
      where.materi = {
        kategoriId: Number(kategoriId),
      };
    }

    // Filter by materi
    if (materiId && materiId !== "all") {
      where.materiId = Number(materiId);
    }

    const assignments = await prisma.assignment.findMany({
      where,
      include: {
        materi: {
          select: {
            id: true,
            judul: true,
            kategori: {
              select: {
                id: true,
                nama: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Data assignment berhasil diambil.",
      data: assignments,
    });
  } catch (error) {
    console.error("❌ Error getAssignments:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const submitJawaban = async (req, res) => {
  try {
    const userId = req.user.id;
    const { assignmentId, jawabanUser } = req.body;

    // Get resident by userId
    const resident = await prisma.resident.findUnique({
      where: { userId },
    });

    if (!resident) {
      return res.status(404).json({ 
        success: false,
        message: "Data resident tidak ditemukan." 
      });
    }

    const assignment = await prisma.assignment.findUnique({
      where: { id: Number(assignmentId) },
    });
    if (!assignment) return res.status(404).json({ message: "Assignment tidak ditemukan." });

    const isCorrect = jawabanUser === assignment.jawabanBenar;

    // Cek apakah sudah pernah menjawab assignment ini
    const existingJawaban = await prisma.jawaban.findFirst({
      where: {
        residentId: resident.id,
        assignmentId: assignment.id,
      },
    });

    if (existingJawaban) {
      return res.status(400).json({
        success: false,
        message: "Anda sudah mengerjakan assignment ini sebelumnya.",
      });
    }

    await prisma.jawaban.create({
      data: {
        residentId: resident.id,
        assignmentId: assignment.id,
        jawabanUser,
        isCorrect,
      },
    });

    res.status(201).json({
      success: true,
      message: "Jawaban berhasil disimpan.",
      data: { isCorrect },
    });
  } catch (error) {
    console.error("❌ Error submitJawaban:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const getHasilKuis = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get resident by userId
    const resident = await prisma.resident.findUnique({
      where: { userId },
    });

    if (!resident) {
      return res.status(404).json({ 
        success: false,
        message: "Data resident tidak ditemukan." 
      });
    }

    const jawaban = await prisma.jawaban.findMany({
      where: { residentId: resident.id },
      include: { assignment: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Hasil kuis berhasil diambil.",
      data: jawaban,
    });
  } catch (error) {
    console.error("❌ Error getHasilKuis:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/* ==========================================================
   ✅ D. NILAI AKADEMIK
   ========================================================== */

export const getNilai = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get resident by userId
    const resident = await prisma.resident.findUnique({
      where: { userId },
    });

    if (!resident) {
      return res.status(404).json({ 
        success: false,
        message: "Data resident tidak ditemukan." 
      });
    }

    const nilai = await prisma.nilai.findMany({
      where: { residentId: resident.id },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Data nilai berhasil diambil.",
      data: nilai,
    });
  } catch (error) {
    console.error("❌ Error getNilai:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/* ==========================================================
   ✅ E. NILAI TAHFIDZ
   ========================================================== */

export const getTargetHafalan = async (req, res) => {
  try {
    const target = await prisma.targetHafalan.findMany({
      include: { subTarget: true },
    });

    res.status(200).json({
      success: true,
      message: "Data target hafalan berhasil diambil.",
      data: target,
    });
  } catch (error) {
    console.error("❌ Error getTargetHafalan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const getNilaiTahfidz = async (req, res) => {
  try {
    const userId = req.user.id;

    // Get resident by userId
    const resident = await prisma.resident.findUnique({
      where: { userId },
    });

    if (!resident) {
      return res.status(404).json({ 
        success: false,
        message: "Data resident tidak ditemukan." 
      });
    }

    const nilai = await prisma.nilaiTahfidz.findMany({
      where: { residentId: resident.id },
      include: { targetHafalan: true },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Nilai tahfidz berhasil diambil.",
      data: nilai,
    });
  } catch (error) {
    console.error("❌ Error getNilaiTahfidz:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/* ==========================================================
   ✅ F. LEADERBOARD
   ========================================================== */

/**
 * 🔹 Get leaderboard berdasarkan progres hafalan dan assignment
 * Ranking berdasarkan:
 * 1. Jumlah hafalan SELESAI (prioritas utama)
 * 2. Jumlah assignment benar (jika hafalan sama)
 */
export const getLeaderboard = async (req, res) => {
  try {
    // Ambil semua resident dengan data hafalan dan assignment
    const residents = await prisma.resident.findMany({
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
        usroh: {
          select: {
            nama: true,
          },
        },
        nilaiTahfidz: {
          where: {
            status: "SELESAI",
          },
        },
        jawaban: {
          where: {
            isCorrect: true,
          },
        },
      },
    });

    // Map data resident
    const leaderboard = residents.map((resident) => {
      const hafalanSelesai = resident.nilaiTahfidz.length;
      const assignmentBenar = resident.jawaban.length;

      return {
        id: resident.id,
        name: resident.user.name,
        email: resident.user.email,
        nim: resident.nim,
        usroh: resident.usroh?.nama || "-",
        hafalanSelesai,
        assignmentBenar,
      };
    });

    // Sort berdasarkan hafalan selesai (descending), lalu assignment benar (descending)
    leaderboard.sort((a, b) => {
      if (b.hafalanSelesai !== a.hafalanSelesai) {
        return b.hafalanSelesai - a.hafalanSelesai; // Prioritas: hafalan selesai
      }
      return b.assignmentBenar - a.assignmentBenar; // Jika sama, lihat assignment
    });

    // Tambahkan ranking
    const rankedLeaderboard = leaderboard.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));

    res.status(200).json({
      success: true,
      message: "Leaderboard berhasil diambil.",
      data: rankedLeaderboard,
    });
  } catch (error) {
    console.error("❌ Error getLeaderboard:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
