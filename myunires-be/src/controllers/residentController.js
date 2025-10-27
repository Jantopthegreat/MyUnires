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

export const getAllMateri = async (req, res) => {
  try {
    const materi = await prisma.materi.findMany({
      include: { kategori: { select: { nama: true } } },
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
    const assignments = await prisma.assignment.findMany({
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
    const residentId = req.user.residentId;
    const { assignmentId, jawabanUser } = req.body;

    const assignment = await prisma.assignment.findUnique({
      where: { id: Number(assignmentId) },
    });
    if (!assignment) return res.status(404).json({ message: "Assignment tidak ditemukan." });

    const isCorrect = jawabanUser === assignment.jawabanBenar;

    await prisma.jawaban.create({
      data: {
        residentId,
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
    const residentId = req.user.residentId;

    const jawaban = await prisma.jawaban.findMany({
      where: { residentId },
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
    const residentId = req.user.residentId;

    const nilai = await prisma.nilai.findMany({
      where: { residentId },
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
    const residentId = req.user.residentId;

    const nilai = await prisma.nilaiTahfidz.findMany({
      where: { residentId },
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
