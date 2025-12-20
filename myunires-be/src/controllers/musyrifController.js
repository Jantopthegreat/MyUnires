// src/controllers/musyrifController.js
import { prisma } from "../config/prisma.js";
import xlsx from "xlsx";

/* ==========================================================
   🧑‍🏫 MUSYRIF CONTROLLER

   ========================================================== */


   // ✅ Profile Musyrif (untuk Sidebar)
export const getProfileMusyrif = async (req, res) => {
  try {
    // req.user.id dari verifyToken
    const musyrif = await prisma.musyrif.findUnique({
      where: { userId: req.user.id },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    if (!musyrif) {
      return res.status(404).json({ success: false, message: "Profile musyrif tidak ditemukan." });
    }

    return res.status(200).json({
      success: true,
      data: {
        id: musyrif.user.id,
        name: musyrif.user.name,
        email: musyrif.user.email,
      },
    });
  } catch (error) {
    console.error("❌ Error getProfileMusyrif:", error);
    return res.status(500).json({ success: false, message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Ambil semua resident (dengan filter opsional)
 * Hanya tampilkan resident di lantai yang dikelola musyrif
 */
export const getAllResidents = async (req, res) => {
  try {
    const { usrohId, search } = req.query;

    // Get musyrif's lantai
    const musyrif = await prisma.musyrif.findUnique({
      where: { userId: req.user.id },
    });

    if (!musyrif || !musyrif.lantaiId) {
      return res.status(404).json({ 
        success: false,
        message: "Lantai binaan tidak ditemukan." 
      });
    }

    // Filter hanya resident di lantai musyrif
    const where = {
      lantaiId: musyrif.lantaiId,
    };
    
    // Filter by usroh jika dipilih (dalam lantai yang sama)
    if (usrohId && usrohId !== 'all') {
      where.usrohId = Number(usrohId);
    }

    // Search by name atau NIM
    if (search) {
      where.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { nim: { contains: search } },
      ];
    }

    const residents = await prisma.resident.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        usroh: { select: { id: true, nama: true } },
        lantai: { 
          select: { 
            id: true, 
            nama: true,
            gedung: { select: { nama: true } }
          } 
        },
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Daftar resident berhasil diambil.",
      data: residents.map((r) => ({
        id: r.id,
        userId: r.user.id,
        name: r.user.name,
        email: r.user.email,
        nim: r.nim,
        noUnires: r.nim, // atau bisa custom field
        jurusan: r.jurusan,
        angkatan: r.angkatan,
        usroh: r.usroh?.nama || "-",
        usrohId: r.usroh?.id || null,
        asrama: r.lantai ? `${r.lantai.gedung.nama} ${r.lantai.nama}` : "-",
        lantaiId: r.lantai?.id || null,
        noTelp: r.noTelp || "-",
      })),
    });
  } catch (error) {
    console.error("❌ Error getAllResidents:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Ambil data usroh untuk dropdown
 */
/**
 * ✅ Ambil data usroh (hanya di lantai musyrif)
 */
export const getAllUsroh = async (req, res) => {
  try {
    // Get musyrif's lantai
    const musyrif = await prisma.musyrif.findUnique({
      where: { userId: req.user.id },
    });

    if (!musyrif || !musyrif.lantaiId) {
      return res.status(404).json({ 
        success: false,
        message: "Lantai binaan tidak ditemukan." 
      });
    }

    // Hanya usroh di lantai musyrif
    const usroh = await prisma.usroh.findMany({
      where: {
        lantaiId: musyrif.lantaiId,
      },
      select: { id: true, nama: true },
      orderBy: { nama: "asc" },
    });

    res.status(200).json({
      success: true,
      data: usroh,
    });
  } catch (error) {
    console.error("❌ Error getAllUsroh:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Ambil data lantai (hanya lantai musyrif sendiri)
 */
export const getAllLantai = async (req, res) => {
  try {
    // Get musyrif's lantai
    const musyrif = await prisma.musyrif.findUnique({
      where: { userId: req.user.id },
      include: {
        lantai: {
          include: {
            gedung: { select: { nama: true } },
          },
        },
      },
    });

    if (!musyrif || !musyrif.lantai) {
      return res.status(404).json({ 
        success: false,
        message: "Lantai binaan tidak ditemukan." 
      });
    }

    // Return hanya lantai musyrif (dalam array untuk kompatibilitas)
    res.status(200).json({
      success: true,
      data: [{
        id: musyrif.lantai.id,
        nama: `${musyrif.lantai.gedung.nama} ${musyrif.lantai.nama}`,
      }],
    });
  } catch (error) {
    console.error("❌ Error getAllLantai:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};;

/**
 * ✅ Import residents dari Excel
 */
export const importResidentsFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "File Excel tidak ditemukan." 
      });
    }

    console.log("📁 File received:", req.file.originalname);

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet);

    console.log("📊 Data parsed from Excel:", data.length, "rows");
    console.log("📋 First row sample:", data[0]);

    if (!data.length) {
      return res.status(400).json({ 
        success: false,
        message: "File Excel kosong." 
      });
    }

    const imported = [];
    const errors = [];

    // Import bcrypt di awal
    const bcrypt = await import("bcrypt");

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      console.log(`\n🔄 Processing row ${i + 2}:`, row);
      
      try {
        // Validasi data dengan field yang lebih flexible
        const name = row.name || row.Name || row.nama || row.Nama;
        const email = row.email || row.Email;
        const password = row.password || row.Password;
        const nim = row.nim || row.NIM || row.Nim;
        const jurusan = row.jurusan || row.Jurusan;
        const angkatan = row.angkatan || row.Angkatan;
        const noTelp = row.noTelp || row.NoTelp || row.no_telp || row.notelp || row.NoHP;
        const usrohId = row.usrohId || row.UsrohId || row.usroh_id;
        const lantaiId = row.lantaiId || row.LantaiId || row.lantai_id;

        if (!name || !email || !password || !nim) {
          const missingFields = [];
          if (!name) missingFields.push("name");
          if (!email) missingFields.push("email");
          if (!password) missingFields.push("password");
          if (!nim) missingFields.push("nim");
          
          errors.push({
            row: i + 2,
            data: row,
            error: `Data tidak lengkap. Field yang kurang: ${missingFields.join(", ")}`,
          });
          console.log(`❌ Row ${i + 2} - Missing fields:`, missingFields);
          continue;
        }

        // Cek apakah email sudah ada
        const existingUser = await prisma.user.findUnique({
          where: { email: email },
        });

        if (existingUser) {
          errors.push({
            row: i + 2,
            data: row,
            error: `Email ${email} sudah terdaftar`,
          });
          console.log(`❌ Row ${i + 2} - Email already exists:`, email);
          continue;
        }

        // Validasi usrohId jika ada
        let validUsrohId = null;
        if (usrohId) {
          const usrohExists = await prisma.usroh.findUnique({
            where: { id: Number(usrohId) },
          });
          
          if (usrohExists) {
            validUsrohId = Number(usrohId);
            console.log(`✅ Row ${i + 2} - Valid usrohId: ${validUsrohId}`);
          } else {
            console.log(`⚠️ Row ${i + 2} - Invalid usrohId: ${usrohId}, akan di-skip`);
          }
        }

        // Validasi lantaiId jika ada
        let validLantaiId = null;
        if (lantaiId) {
          const lantaiExists = await prisma.lantai.findUnique({
            where: { id: Number(lantaiId) },
          });
          
          if (lantaiExists) {
            validLantaiId = Number(lantaiId);
            console.log(`✅ Row ${i + 2} - Valid lantaiId: ${validLantaiId}`);
          } else {
            console.log(`⚠️ Row ${i + 2} - Invalid lantaiId: ${lantaiId}, akan di-skip`);
          }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(String(password), 10);

        console.log(`✅ Creating user for row ${i + 2}...`);

        // Buat user dan resident
        const newResident = await prisma.user.create({
          data: {
            name: String(name),
            email: String(email),
            password: hashedPassword,
            role: "RESIDENT",
            resident: {
              create: {
                nim: String(nim),
                jurusan: jurusan ? String(jurusan) : "Belum Diisi",
                angkatan: angkatan ? Number(angkatan) : new Date().getFullYear(),
                noTelp: noTelp ? String(noTelp) : null,
                usrohId: validUsrohId,
                lantaiId: validLantaiId,
              },
            },
          },
          include: {
            resident: true,
          },
        });

        imported.push(newResident);
        console.log(`✅ Row ${i + 2} - Successfully created:`, newResident.email);
        console.log(`   - Usroh: ${validUsrohId || 'tidak diset'}, Lantai: ${validLantaiId || 'tidak diset'}, NoTelp: ${noTelp || 'tidak diset'}`);
        
      } catch (err) {
        errors.push({
          row: i + 2,
          data: row,
          error: err.message,
          stack: err.stack,
        });
        console.log(`❌ Row ${i + 2} - Error:`, err.message);
        console.error(err.stack);
      }
    }

    console.log(`\n📊 Import Summary:`);
    console.log(`  ✅ Imported: ${imported.length}`);
    console.log(`  ❌ Failed: ${errors.length}`);

    res.status(200).json({
      success: true,
      message: `Berhasil import ${imported.length} dari ${data.length} data.`,
      imported: imported.length,
      total: data.length,
      errors: errors.length > 0 ? errors : null,
    });
  } catch (error) {
    console.error("❌ Error importResidentsFromExcel:", error);
    res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan server.",
      error: error.message,
    });
  }
};

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
        usroh: { select: { id: true, nama: true } },
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
        usrohId: r.usroh?.id || null,
        lantaiId: r.lantaiId || null,
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
 * Support search dan filter usroh
 * Return: 1 resident = 1 baris (agregat nilai)
 */
export const getAllNilaiTahfidzByMusyrif = async (req, res) => {
  try {
    const { search, usrohId } = req.query;

    const musyrif = await prisma.musyrif.findUnique({
      where: { userId: req.user.id },
    });

    if (!musyrif || !musyrif.lantaiId)
      return res.status(404).json({ message: "Lantai binaan tidak ditemukan." });

    // Build where clause untuk residents
    const residentWhere = {
      lantaiId: musyrif.lantaiId,
    };

    // Filter by usroh jika dipilih
    if (usrohId && usrohId !== 'all') {
      residentWhere.usrohId = Number(usrohId);
    }

    // Search by name atau NIM
    if (search) {
      residentWhere.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { nim: { contains: search } },
      ];
    }

    // Ambil semua residents dengan nilai tahfidz mereka
    const residents = await prisma.resident.findMany({
      where: residentWhere,
      include: {
        user: { select: { name: true, email: true } },
        usroh: { select: { id: true, nama: true } },
        nilaiTahfidz: {
          include: {
            targetHafalan: { select: { nama: true, surah: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { id: 'asc' },
    });

    // Filter hanya residents yang punya nilai tahfidz
    const residentsWithNilai = residents.filter(r => r.nilaiTahfidz.length > 0);

    // Format response: 1 resident = 1 baris dengan agregat
    const data = residentsWithNilai.map((r) => {
      const totalNilai = r.nilaiTahfidz.length;
      const nilaiSelesai = r.nilaiTahfidz.filter(n => n.status === 'SELESAI').length;
      const nilaiBelumSelesai = r.nilaiTahfidz.filter(n => n.status === 'BELUM SELESAI').length;
      
      // Ambil nilai terbaru sebagai representasi
      const latestNilai = r.nilaiTahfidz[0];
      
      return {
        id: r.id,
        residentId: r.id,
        resident: r.user.name,
        nim: r.nim,
        email: r.user.email,
        usroh: r.usroh?.nama || null,
        usrohId: r.usrohId,
        // Agregat data
        totalTarget: totalNilai,
        targetSelesai: nilaiSelesai,
        targetBelumSelesai: nilaiBelumSelesai,
        // Nilai terbaru untuk display
        target: latestNilai.targetHafalan.nama,
        surah: latestNilai.targetHafalan.surah,
        status: latestNilai.status,
        nilaiHuruf: latestNilai.nilaiHuruf,
        tanggal: latestNilai.createdAt,
      };
    });

    res.status(200).json({
      success: true,
      message: "Nilai tahfidz binaan berhasil diambil.",
      data: data,
    });
  } catch (error) {
    console.error("❌ Error getAllNilaiTahfidzByMusyrif:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Get ALL nilai tahfidz detail (1 baris = 1 nilai, bukan agregat)
 * Untuk halaman Revisi yang butuh detail per nilai
 */
export const getAllNilaiTahfidzDetail = async (req, res) => {
  try {
    const { search, usrohId } = req.query;

    const musyrif = await prisma.musyrif.findUnique({
      where: { userId: req.user.id },
    });

    if (!musyrif || !musyrif.lantaiId)
      return res.status(404).json({ message: "Lantai binaan tidak ditemukan." });

    // Build where clause
    const where = {
      resident: {
        lantaiId: musyrif.lantaiId,
      },
    };

    // Filter by usroh
    if (usrohId && usrohId !== 'all') {
      where.resident.usrohId = Number(usrohId);
    }

    // Search by name atau NIM
    if (search) {
      where.resident.OR = [
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { nim: { contains: search } },
      ];
    }

    // Ambil semua nilai tahfidz dengan detail
    const nilaiList = await prisma.nilaiTahfidz.findMany({
      where,
      include: {
        resident: {
          include: {
            user: { select: { name: true, email: true } },
            usroh: { select: { id: true, nama: true } },
          },
        },
        targetHafalan: { 
          select: { id: true, nama: true, surah: true, ayatMulai: true, ayatAkhir: true } 
        },
      },
      orderBy: [
        { resident: { id: 'asc' } },
        { targetHafalan: { id: 'asc' } },
      ],
    });

    // Format response: 1 nilai = 1 baris
    const data = nilaiList.map((nilai) => ({
      id: nilai.id,
      residentId: nilai.residentId,
      resident: nilai.resident.user.name,
      nim: nilai.resident.nim,
      email: nilai.resident.user.email,
      usroh: nilai.resident.usroh?.nama || null,
      usrohId: nilai.resident.usrohId,
      targetHafalanId: nilai.targetHafalanId,
      target: nilai.targetHafalan.nama,
      surah: nilai.targetHafalan.surah,
      ayatMulai: nilai.targetHafalan.ayatMulai,
      ayatAkhir: nilai.targetHafalan.ayatAkhir,
      status: nilai.status,
      nilaiHuruf: nilai.nilaiHuruf,
      tanggal: nilai.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Detail nilai tahfidz berhasil diambil.",
      data: data,
    });
  } catch (error) {
    console.error("❌ Error getAllNilaiTahfidzDetail:", error);
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

/**
 * ✅ Import nilai tahfidz dari Excel
 * Hanya bisa import untuk resident di lantai binaan musyrif
 */
export const importTahfidzFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ 
        success: false,
        message: "File Excel tidak ditemukan" 
      });
    }

    // Get musyrif info
    const musyrif = await prisma.musyrif.findUnique({
      where: { userId: req.user.id },
    });

    if (!musyrif || !musyrif.lantaiId) {
      return res.status(404).json({ 
        success: false,
        message: "Lantai binaan tidak ditemukan" 
      });
    }

    // Read Excel file
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    if (!jsonData || jsonData.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: "File Excel kosong" 
      });
    }

    const errors = [];
    let successCount = 0;
    let skippedCount = 0;

    for (let i = 0; i < jsonData.length; i++) {
      const row = jsonData[i];
      const rowNumber = i + 2; // Excel row (header di row 1)

      try {
        // Validasi field required
        if (!row.residentId || !row.targetHafalanId || !row.status || !row.nilaiHuruf) {
          errors.push({
            row: rowNumber,
            message: "Field residentId, targetHafalanId, status, dan nilaiHuruf wajib diisi",
          });
          continue;
        }

        // Cek apakah resident ada dan di lantai binaan musyrif
        const resident = await prisma.resident.findUnique({
          where: { id: Number(row.residentId) },
        });

        if (!resident) {
          errors.push({
            row: rowNumber,
            message: `Resident dengan ID ${row.residentId} tidak ditemukan`,
          });
          continue;
        }

        if (resident.lantaiId !== musyrif.lantaiId) {
          errors.push({
            row: rowNumber,
            message: `Resident ${resident.user?.name || row.residentId} bukan binaan Anda (beda lantai)`,
          });
          continue;
        }

        // Cek apakah target hafalan ada
        const targetHafalan = await prisma.targetHafalan.findUnique({
          where: { id: Number(row.targetHafalanId) },
        });

        if (!targetHafalan) {
          errors.push({
            row: rowNumber,
            message: `Target Hafalan dengan ID ${row.targetHafalanId} tidak ditemukan`,
          });
          continue;
        }

        // Cek apakah sudah ada nilai untuk kombinasi ini
        const existing = await prisma.nilaiTahfidz.findFirst({
          where: {
            residentId: Number(row.residentId),
            targetHafalanId: Number(row.targetHafalanId),
          },
        });

        if (existing) {
          // Update nilai yang sudah ada
          await prisma.nilaiTahfidz.update({
            where: { id: existing.id },
            data: {
              status: row.status,
              nilaiHuruf: row.nilaiHuruf,
            },
          });
          successCount++;
        } else {
          // Create nilai baru
          await prisma.nilaiTahfidz.create({
            data: {
              residentId: Number(row.residentId),
              targetHafalanId: Number(row.targetHafalanId),
              status: row.status,
              nilaiHuruf: row.nilaiHuruf,
            },
          });
          successCount++;
        }
      } catch (error) {
        errors.push({
          row: rowNumber,
          message: error.message || "Terjadi kesalahan",
        });
      }
    }

    // Response
    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Import selesai dengan ${errors.length} error`,
        successCount,
        skippedCount: errors.length,
        errors,
      });
    }

    res.status(200).json({
      success: true,
      message: "Import berhasil",
      successCount,
      skippedCount: 0,
    });
  } catch (error) {
    console.error("❌ Error importTahfidzFromExcel:", error);
    res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan server",
      error: error.message 
    });
  }
};

/**
 * ✅ Ambil daftar target hafalan (untuk import atau input manual)
 */
export const getTargetHafalan = async (req, res) => {
  try {
    const targetHafalan = await prisma.targetHafalan.findMany({
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Daftar target hafalan berhasil diambil.",
      data: targetHafalan,
    });
  } catch (error) {
    console.error("❌ Error getTargetHafalan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Ambil semua kategori materi
 */
export const getAllKategoriMateri = async (req, res) => {
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
      data: kategori,
    });
  } catch (error) {
    console.error("❌ Error getAllKategoriMateri:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Ambil semua materi (dengan filter kategori opsional)
 */
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
            nama: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    res.status(200).json({
      success: true,
      data: materi,
    });
  } catch (error) {
    console.error("❌ Error getAllMateri:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/* ==========================================================
   📝 ASSIGNMENT ROUTES (QUIZ)
   ========================================================== */

/**
 * ✅ Get all assignments dengan search
 */
export const getAllAssignments = async (req, res) => {
  try {
    const { search, kategoriId, materiId } = req.query;

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

    // Search by judul atau pertanyaan
    if (search) {
      where.OR = [
        { judul: { contains: search, mode: "insensitive" } },
        { pertanyaan: { contains: search, mode: "insensitive" } },
      ];
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

    console.log("✅ Assignments from DB:", assignments.map(a => ({ id: a.id, soalImageUrl: a.soalImageUrl }))); // Debug log

    res.status(200).json({
      success: true,
      data: assignments,
    });
  } catch (error) {
    console.error("❌ Error getAllAssignments:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Get assignment by ID
 */
export const getAssignmentById = async (req, res) => {
  try {
    const { id } = req.params;

    const assignment = await prisma.assignment.findUnique({
      where: { id: Number(id) },
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
    });

    if (!assignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment tidak ditemukan.",
      });
    }

    res.status(200).json({
      success: true,
      data: assignment,
    });
  } catch (error) {
    console.error("❌ Error getAssignmentById:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Create assignment baru
 */
export const createAssignment = async (req, res) => {
  try {
    console.log("📝 CREATE ASSIGNMENT - Request body:", req.body);
    
    const { materiId, judul, pertanyaan, opsiA, opsiB, opsiC, opsiD, jawabanBenar, soalImageUrl } = req.body;

    console.log("📝 Extracted fields:", { materiId, judul, pertanyaan, opsiA, opsiB, opsiC, opsiD, jawabanBenar });

    // Validasi input
    if (!materiId || !judul || !pertanyaan || !opsiA || !opsiB || !opsiC || !opsiD || !jawabanBenar) {
      console.log("❌ Validation failed - missing fields");
      return res.status(400).json({
        success: false,
        message: "Semua field wajib diisi.",
      });
    }

    // Validasi materi exists
    const materiExists = await prisma.materi.findUnique({
      where: { id: Number(materiId) },
    });

    if (!materiExists) {
      return res.status(404).json({
        success: false,
        message: "Materi tidak ditemukan.",
      });
    }

    // Validasi jawaban benar harus A/B/C/D
    if (!["A", "B", "C", "D"].includes(jawabanBenar)) {
      console.log("❌ Invalid jawabanBenar:", jawabanBenar);
      return res.status(400).json({
        success: false,
        message: "Jawaban benar harus A, B, C, atau D.",
      });
    }

    console.log("✅ Validation passed, creating assignment...");

    const assignment = await prisma.assignment.create({
      data: {
        materiId: Number(materiId),
        judul,
        pertanyaan,
        opsiA,
        opsiB,
        opsiC,
        opsiD,
        jawabanBenar,
        ...(soalImageUrl !== undefined && { soalImageUrl }),
      },
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
    });

    console.log("✅ Assignment created successfully:", assignment.id);

    res.status(201).json({
      success: true,
      message: "Assignment berhasil dibuat.",
      data: assignment,
    });
  } catch (error) {
    console.error("❌ Error createAssignment:", error);
    console.error("❌ Error message:", error.message);
    console.error("❌ Error stack:", error.stack);
    res.status(500).json({ 
      success: false,
      message: "Terjadi kesalahan server.",
      error: error.message 
    });
  }
};

/**
 * Upload assignment image (returns URL)
 */
export const uploadAssignmentImage = async (req, res) => {
  try {
    console.log('📁 uploadAssignmentImage called. req.file:', req.file && {
      originalname: req.file.originalname,
      filename: req.file.filename,
      size: req.file.size,
      mimetype: req.file.mimetype,
      destination: req.file.destination,
      path: req.file.path,
    });

    if (!req.file) {
      console.warn('⚠️ uploadAssignmentImage - no file in request');
      return res.status(400).json({ success: false, message: 'File is required.' });
    }

    const fileUrl = `/uploads/assignments/${req.file.filename}`;
    console.log('✅ File uploaded successfully, fileUrl=', fileUrl);
    res.status(200).json({ success: true, url: fileUrl });
  } catch (error) {
    console.error('❌ Error uploadAssignmentImage:', error);
    res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: error.message });
  }
};

/**
 * ✅ Update assignment
 */
export const updateAssignment = async (req, res) => {
  try {
    const { id } = req.params;
    const { materiId, judul, pertanyaan, opsiA, opsiB, opsiC, opsiD, jawabanBenar, soalImageUrl } = req.body;

    // Cek apakah assignment ada
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: Number(id) },
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment tidak ditemukan.",
      });
    }

    // Validasi materi jika diupdate
    if (materiId) {
      const materiExists = await prisma.materi.findUnique({
        where: { id: Number(materiId) },
      });

      if (!materiExists) {
        return res.status(404).json({
          success: false,
          message: "Materi tidak ditemukan.",
        });
      }
    }

    // Validasi jawaban benar jika diupdate
    if (jawabanBenar && !["A", "B", "C", "D"].includes(jawabanBenar)) {
      return res.status(400).json({
        success: false,
        message: "Jawaban benar harus A, B, C, atau D.",
      });
    }

    const assignment = await prisma.assignment.update({
      where: { id: Number(id) },
      data: {
        ...(materiId && { materiId: Number(materiId) }),
        ...(judul && { judul }),
        ...(pertanyaan && { pertanyaan }),
        ...(opsiA && { opsiA }),
        ...(opsiB && { opsiB }),
        ...(opsiC && { opsiC }),
        ...(opsiD && { opsiD }),
        ...(jawabanBenar && { jawabanBenar }),
        ...(soalImageUrl !== undefined && { soalImageUrl }),
      },
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
    });

    res.status(200).json({
      success: true,
      message: "Assignment berhasil diupdate.",
      data: assignment,
    });
  } catch (error) {
    console.error("❌ Error updateAssignment:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * ✅ Delete assignment
 */
export const deleteAssignment = async (req, res) => {
  try {
    const { id } = req.params;

    // Cek apakah assignment ada
    const existingAssignment = await prisma.assignment.findUnique({
      where: { id: Number(id) },
    });

    if (!existingAssignment) {
      return res.status(404).json({
        success: false,
        message: "Assignment tidak ditemukan.",
      });
    }

    // Delete assignment (jawaban akan otomatis terhapus karena onDelete: Cascade)
    await prisma.assignment.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      success: true,
      message: "Assignment berhasil dihapus.",
    });
  } catch (error) {
    console.error("❌ Error deleteAssignment:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};
