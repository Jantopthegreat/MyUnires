// src/controllers/asistenController.js
import { prisma } from "../config/prisma.js";

/* ==========================================================
   👨‍🎓 ASISTEN MUSYRIF CONTROLLER
   - Melihat resident binaan (dalam usroh)
   - Menilai hafalan tahfidz mereka
   - Melihat nilai tahfidz & nilai akademik
   ========================================================== */

/**
 * ✅ Ambil semua resident dalam usroh binaan asisten
 */
export const getResidentsByAsisten = async (req, res) => {
  try {
    const asisten = await prisma.asistenMusyrif.findUnique({
      where: { userId: req.user.id },
    });

    if (!asisten || !asisten.usrohId) {
      return res.status(404).json({
        message: "Asisten tidak memiliki usroh binaan.",
      });
    }

    const residents = await prisma.resident.findMany({
      where: { usrohId: asisten.usrohId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        usroh: { select: { nama: true } },
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Daftar resident dalam usroh berhasil diambil.",
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
    console.error("❌ Error getResidentsByAsisten:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Lihat nilai tahfidz seluruh resident dalam usroh binaan
 */
export const getAllNilaiTahfidzByAsisten = async (req, res) => {
  try {
    const asisten = await prisma.asistenMusyrif.findUnique({
      where: { userId: req.user.id },
    });

    if (!asisten || !asisten.usrohId)
      return res.status(404).json({ message: "Asisten tidak memiliki usroh binaan." });

    const nilaiTahfidz = await prisma.nilaiTahfidz.findMany({
      where: {
        resident: { usrohId: asisten.usrohId },
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
      message: "Nilai tahfidz resident dalam usroh berhasil diambil.",
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
    console.error("❌ Error getAllNilaiTahfidzByAsisten:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Lihat nilai tahfidz resident tertentu (dalam usroh asisten)
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
 * ✅ Tambah / update nilai tahfidz (oleh asisten musyrif)
 */
export const createOrUpdateNilaiTahfidz = async (req, res) => {
  try {
    const { residentId, targetHafalanId, status, nilaiHuruf } = req.body;

    if (!residentId || !targetHafalanId || !status || !nilaiHuruf) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    const existing = await prisma.nilaiTahfidz.findFirst({
      where: { residentId, targetHafalanId },
    });

    let result;
    if (existing) {
      result = await prisma.nilaiTahfidz.update({
        where: { id: existing.id },
        data: { status, nilaiHuruf },
      });
    } else {
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
    console.error("❌ Error createOrUpdateNilaiTahfidz (asisten):", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Lihat materi (read-only)
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
    console.error("❌ Error getMateri (asisten):", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
