// src/controllers/asistenController.js
import { prisma } from "../config/prisma.js";
// Re-export assignment handlers dari musyrifController agar asisten punya akses CRUD assignment
export { getAllAssignments, getAssignmentById, createAssignment, updateAssignment, deleteAssignment, uploadAssignmentImage, getAllKategoriMateri } from "./musyrifController.js";

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
          include: {
            user: { select: { name: true, email: true } },
            usroh: { select: { id: true, nama: true } },
          },
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
        nim: n.resident.nim || "-",
        email: n.resident.user.email,
        usrohId: n.resident.usroh?.id,
        usroh: n.resident.usroh?.nama,
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

    const asisten = await prisma.asistenMusyrif.findUnique({
      where: { userId: req.user.id },
      select: { usrohId: true },
    });

    if (!asisten?.usrohId) {
      return res.status(404).json({ message: "Asisten tidak memiliki usroh binaan." });
    }

    const nilaiTahfidz = await prisma.nilaiTahfidz.findMany({
      where: {
        residentId: Number(residentId),
        resident: { usrohId: asisten.usrohId }, // ✅ enforce ownership via relation filter
      },
      include: {
        targetHafalan: { select: { nama: true, surah: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!nilaiTahfidz.length) {
      return res.status(404).json({
        message: "Belum ada nilai tahfidz (atau resident bukan binaan usroh kamu).",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data nilai tahfidz berhasil diambil.",
      data: nilaiTahfidz,
    });
  } catch (error) {
    console.error("❌ Error getNilaiTahfidzByResident:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};



/**
 * ✅ Tambah / update nilai tahfidz (oleh asisten musyrif)
 */
export const createOrUpdateNilaiTahfidz = async (req, res) => {
  try {
    const residentIdNum = Number(req.body.residentId);
    const targetIdNum = Number(req.body.targetHafalanId);
    const status = String(req.body.status || "").trim();
    const nilaiHuruf = req.body.nilaiHuruf ?? null;

    if (!residentIdNum || !targetIdNum || !status) {
      return res.status(400).json({
        message: "residentId, targetHafalanId, dan status wajib diisi.",
      });
    }

    const asisten = await prisma.asistenMusyrif.findUnique({
      where: { userId: req.user.id },
      select: { usrohId: true },
    });

    if (!asisten?.usrohId) {
      return res.status(404).json({ message: "Asisten tidak memiliki usroh binaan." });
    }

    const resident = await prisma.resident.findFirst({
      where: { id: residentIdNum, usrohId: asisten.usrohId },
      select: { id: true },
    });

    if (!resident) {
      return res.status(403).json({ message: "Resident ini bukan binaan usroh kamu." });
    }

    const result = await prisma.nilaiTahfidz.upsert({
      where: {
        // nama field ini biasanya otomatis jadi residentId_targetHafalanId
        residentId_targetHafalanId: {
          residentId: residentIdNum,
          targetHafalanId: targetIdNum,
        },
      },
      update: { status, nilaiHuruf },
      create: {
        residentId: residentIdNum,
        targetHafalanId: targetIdNum,
        status,
        nilaiHuruf,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Nilai tahfidz berhasil disimpan.",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error createOrUpdateNilaiTahfidz (asisten):", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
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

/**
 * ✅ Lihat semua usroh (untuk dropdown filter)
 */
export const getAllUsroh = async (req, res) => {
  try {
    const usrohList = await prisma.usroh.findMany({
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Daftar usroh berhasil diambil.",
      data: usrohList,
    });
  } catch (error) {
    console.error("❌ Error getAllUsroh (asisten):", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Lihat semua target hafalan (untuk dropdown)
 */
export const getAllTargetHafalan = async (req, res) => {
  try {
    const targetList = await prisma.targetHafalan.findMany({
      select: { id: true, nama: true, surah: true, ayatMulai: true, ayatAkhir: true },
      orderBy: { nama: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Daftar target hafalan berhasil diambil.",
      data: targetList,
    });
  } catch (error) {
    console.error("❌ Error getAllTargetHafalan (asisten):", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const getTahfidzProgressByTargetAsisten = async (req, res) => {
  try {
    const asisten = await prisma.asistenMusyrif.findUnique({
      where: { userId: req.user.id },
      select: { usrohId: true },
    });

    if (!asisten?.usrohId) {
      return res.status(404).json({ message: "Asisten tidak memiliki usroh binaan." });
    }

    // total resident binaan
    const totalResident = await prisma.resident.count({
      where: { usrohId: asisten.usrohId },
    });

    // hitung yang selesai per target (ubah status selesai sesuai standar kamu)
    const selesaiGrouped = await prisma.nilaiTahfidz.groupBy({
      by: ["targetHafalanId"],
      where: {
        resident: { usrohId: asisten.usrohId },
        status: "SELESAI", // kalau status kamu beda, ganti di sini
      },
      _count: { _all: true },
    });

    const selesaiMap = new Map(
      selesaiGrouped.map((x) => [x.targetHafalanId, x._count._all])
    );

    // ambil master target
    const targets = await prisma.targetHafalan.findMany({
      select: { id: true, nama: true, surah: true, ayatMulai: true, ayatAkhir: true },
      orderBy: { id: "asc" },
    });

    const rows = targets.map((t) => {
      const selesai = selesaiMap.get(t.id) ?? 0;
      const belum = Math.max(0, totalResident - selesai);

      return {
        targetId: t.id,
        nama: t.nama,
        surah: t.surah,
        ayatMulai: t.ayatMulai,
        ayatAkhir: t.ayatAkhir,
        selesai,
        belum,
      };
    });

    return res.status(200).json({
      success: true,
      data: rows,
      meta: { totalResident },
    });
  } catch (error) {
    console.error("❌ Error getTahfidzProgressByTargetAsisten:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

