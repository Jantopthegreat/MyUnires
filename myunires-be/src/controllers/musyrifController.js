// src/controllers/musyrifController.js
import { prisma } from "../config/prisma.js";

/* ==========================================================
   🧑‍🏫 MUSYRIF CONTROLLER

   ========================================================== */

/**
 * ✅ Ambil semua resident di lantai binaan musyrif
 */
export const getResidentsByMusyrif = async (req, res) => {
  try {
    const musyrif = await prisma.musyrif.findUnique({
      where: { userId: req.user.id },
      include: { lantai: true },
    });

    if (!musyrif || !musyrif.lantaiId) {
      return res.status(404).json({
        message: "Musyrif tidak memiliki lantai binaan.",
      });
    }

    const residents = await prisma.resident.findMany({
      where: { lantaiId: musyrif.lantaiId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        usroh: { select: { nama: true } },
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Daftar resident binaan berhasil diambil.",
      data: residents.map((r) => ({
        id: r.id,
        name: r.user.name,
        email: r.user.email,
        nim: r.nim,
        jurusan: r.jurusan,
        angkatan: r.angkatan,
        usroh: r.usroh?.nama || "-",
        noTelp: r.noTelp || "-",
      })),
    });
  } catch (error) {
    console.error("❌ Error getResidentsByMusyrif:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Lihat semua nilai tahfidz dari resident binaannya
 */
export const getAllNilaiTahfidzByMusyrif = async (req, res) => {
  try {
    const musyrif = await prisma.musyrif.findUnique({
      where: { userId: req.user.id },
    });

    if (!musyrif || !musyrif.lantaiId)
      return res.status(404).json({ message: "Lantai binaan tidak ditemukan." });

    const nilaiTahfidz = await prisma.nilaiTahfidz.findMany({
      where: {
        resident: { lantaiId: musyrif.lantaiId },
      },
      include: {
        resident: {
          include: { user: { select: { name: true, email: true } } },
        },
        targetHafalan: { select: { nama: true, surah: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Nilai tahfidz binaan berhasil diambil.",
      data: nilaiTahfidz.map((n) => ({
        id: n.id,
        resident: n.resident.user.name,
        email: n.resident.user.email,
        target: n.targetHafalan.nama,
        surah: n.targetHafalan.surah,
        status: n.status,
        nilaiHuruf: n.nilaiHuruf,
        tanggal: n.createdAt,
      })),
    });
  } catch (error) {
    console.error("❌ Error getAllNilaiTahfidzByMusyrif:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Lihat nilai tahfidz resident tertentu
 */
export const getNilaiTahfidzByResident = async (req, res) => {
  try {
    const { residentId } = req.params;

    const nilaiTahfidz = await prisma.nilaiTahfidz.findMany({
      where: { residentId: Number(residentId) },
      include: {
        targetHafalan: { select: { nama: true, surah: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!nilaiTahfidz.length)
      return res.status(404).json({ message: "Belum ada nilai tahfidz untuk resident ini." });

    res.status(200).json({
      success: true,
      message: "Data nilai tahfidz berhasil diambil.",
      data: nilaiTahfidz,
    });
  } catch (error) {
    console.error("❌ Error getNilaiTahfidzByResident:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Tambah / update nilai tahfidz (oleh musyrif)
 */
export const createOrUpdateNilaiTahfidz = async (req, res) => {
  try {
    const { residentId, targetHafalanId, status, nilaiHuruf } = req.body;

    if (!residentId || !targetHafalanId || !status || !nilaiHuruf) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    // cek apakah sudah ada nilai untuk kombinasi resident & target
    const existing = await prisma.nilaiTahfidz.findFirst({
      where: { residentId, targetHafalanId },
    });

    let result;
    if (existing) {
      // update nilai lama
      result = await prisma.nilaiTahfidz.update({
        where: { id: existing.id },
        data: { status, nilaiHuruf },
      });
    } else {
      // buat nilai baru
      result = await prisma.nilaiTahfidz.create({
        data: {
          residentId,
          targetHafalanId,
          status,
          nilaiHuruf,
        },
      });
    }

    res.status(200).json({
      success: true,
      message: existing
        ? "Nilai tahfidz berhasil diperbarui."
        : "Nilai tahfidz berhasil ditambahkan.",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error createOrUpdateNilaiTahfidz:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Ambil daftar materi (read-only)
 */
export const getMateri = async (req, res) => {
  try {
    const materi = await prisma.materi.findMany({
      include: { kategori: { select: { nama: true } } },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      message: "Daftar materi berhasil diambil.",
      data: materi,
    });
  } catch (error) {
    console.error("❌ Error getMateri:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
