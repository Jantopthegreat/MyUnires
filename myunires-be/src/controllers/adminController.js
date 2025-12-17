import { prisma } from "../config/prisma.js";
import { generateActivationToken, hashToken } from "../utils/token.js";
import { sendActivationEmail } from "../services/emailService.js";
import bcrypt from "bcrypt";
import XLSX from "xlsx";
import fs from "fs";


export const getTahfidzProgressByTarget = async (req, res) => {
  try {
    const DONE_STATUS = "SELESAI";

    const [residentCount, targets] = await Promise.all([
      prisma.resident.count(),
      prisma.targetHafalan.findMany({
        select: { id: true, nama: true, surah: true, ayatMulai: true, ayatAkhir: true },
        orderBy: { id: "asc" },
      }),
    ]);

    // Ambil semua pasangan (targetHafalanId, residentId) yang SELESAI
    // distinct supaya kalau ada duplikat tidak dobel hitung
    const selesaiPairs = await prisma.nilaiTahfidz.findMany({
      where: { status: DONE_STATUS },
      select: { targetHafalanId: true, residentId: true },
      distinct: ["targetHafalanId", "residentId"],
    });

    // hitung selesai per target
    const selesaiCountByTarget = new Map(); // targetId -> count
    for (const row of selesaiPairs) {
      selesaiCountByTarget.set(
        row.targetHafalanId,
        (selesaiCountByTarget.get(row.targetHafalanId) || 0) + 1
      );
    }

    const rows = targets.map((t) => {
      const selesai = selesaiCountByTarget.get(t.id) || 0;
      const belum = Math.max(0, residentCount - selesai);

      return {
        targetId: t.id,
        nama: t.nama,
        surah: t.surah,
        ayatMulai: t.ayatMulai,
        ayatAkhir: t.ayatAkhir,
        selesai,
        belum,
        totalResident: residentCount,
      };
    });

    return res.status(200).json({
      success: true,
      message: "Progress tahfidz per target berhasil diambil.",
      data: rows,
    });
  } catch (error) {
    console.error("Error getTahfidzProgressByTarget:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};



// ✅ Dashboard summary (counts)
export const getAdminSummary = async (req, res) => {
  try {
    const [residentCount, musyrifCount, asistenCount] = await Promise.all([
      prisma.resident.count(),
      prisma.musyrif.count(),
      prisma.asistenMusyrif.count(),
    ]);

    return res.status(200).json({
      success: true,
      message: "Ringkasan dashboard berhasil diambil.",
      data: {
        residentCount,
        musyrifCount,
        asistenCount,
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("Error getAdminSummary:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/* ==========================================================
   ✅ CRUD DATA RESIDENT (oleh Admin)
   ========================================================== */

/**
 * Ambil semua data Resident (include user, usroh, lantai)
 */
export const getAllResident = async (req, res) => {
  try {
    const residents = await prisma.resident.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        usroh: { select: { id: true, nama: true } },
        lantai: { select: { id: true, nama: true } },
      },
      orderBy: { id: "asc" },
    });

    if (!residents.length)
      return res.status(404).json({ message: "Belum ada data resident." });

    const formatted = residents.map((r) => ({
      id: r.id,
      name: r.user.name,
      email: r.user.email,
      nim: r.nim,
      jurusan: r.jurusan,
      angkatan: r.angkatan,
      noTelp: r.noTelp || "-",
      usroh: r.usroh ? r.usroh.nama : "-",
      lantai: r.lantai ? r.lantai.nama : "-",
      createdAt: r.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Data resident berhasil diambil.",
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error getAllResident:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Ambil satu resident berdasarkan ID
 */
export const getResidentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid." });

    const resident = await prisma.resident.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        usroh: { select: { id: true, nama: true } },
        lantai: { select: { id: true, nama: true } },
      },
    });

    if (!resident) return res.status(404).json({ message: "Resident tidak ditemukan." });

    res.status(200).json({
      success: true,
      message: "Data resident berhasil diambil.",
      data: resident,
    });
  } catch (error) {
    console.error("❌ Error getResidentById:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Tambah Resident baru
 */
export const createResident = async (req, res) => {
  try {
    const { name, email, nim, jurusan, angkatan, noTelp, usrohId, lantaiId } = req.body;

    if (!name || !email || !nim || !jurusan || !angkatan) {
      return res.status(400).json({ message: "Semua data wajib diisi (tanpa password)." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar." });

    const existingNIM = await prisma.resident.findFirst({ where: { nim } });
    if (existingNIM) return res.status(400).json({ message: "NIM sudah terdaftar." });

    const activationToken = generateActivationToken();
    const activationTokenHash = hashToken(activationToken);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: null,
          role: "RESIDENT",
          isActive: false,
        },
      });

      const newResident = await tx.resident.create({
        data: {
          userId: newUser.id,
          nim,
          jurusan,
          angkatan: Number(angkatan),
          noTelp: noTelp || null,
          usrohId: usrohId ? Number(usrohId) : null,
          lantaiId: lantaiId ? Number(lantaiId) : null,
        },
      });

      await tx.accountActivationToken.create({
        data: {
          userId: newUser.id,
          tokenHash: activationTokenHash,
          expiresAt: new Date(Date.now() + 60 * 60 * 1000),
        },
      });

      return { newUser, newResident };
    });

    // Kirim email (di luar transaksi)
    const feUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const activationLink = `${feUrl}/activate?token=${activationToken}`;

    try {
      await sendActivationEmail(email, activationLink);
    } catch (mailErr) {
      console.error("❌ Email activation gagal:", mailErr);
      // akun tetap dibuat; user bisa pakai fitur resend activation nanti
      return res.status(201).json({
        success: true,
        message:
          "Resident berhasil ditambahkan, tapi email aktivasi gagal dikirim. Silakan coba kirim ulang aktivasi.",
        data: result,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Resident berhasil ditambahkan. Link aktivasi sudah dikirim ke email.",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error createResident:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};



/**
 * Update data Resident
 */
export const updateResident = async (req, res) => {
  try {
    const { id } = req.params;
    // Pastikan id diubah menjadi Number
    const residentId = Number(id); 

    const { name, email, password, nim, jurusan, angkatan, noTelp, usrohId, lantaiId } = req.body;
    
    // --- 1. Pengecekan Duplikasi NIM (Mengabaikan Resident yang sedang di-edit) ---
    const existingNIM = await prisma.resident.findFirst({ 
      where: { 
        nim,
        // Kunci Solusi: Hanya cari NIM yang sama TAPI ID-nya berbeda dari ID yang sedang di-update
        id: {
          not: residentId,
        }
      } 
    });
    
    if (existingNIM) {
     return res.status(400).json({ message: "NIM sudah terdaftar pada resident lain." });
    }

    // 2. Cari resident yang akan di-update
    const resident = await prisma.resident.findUnique({
      where: { id: residentId },
      include: { user: true },
    });

    if (!resident) return res.status(404).json({ message: "Resident tidak ditemukan." });

    // --- 3. Pengecekan Duplikasi Email (Mengabaikan User yang sedang di-edit) ---
    const existingUser = await prisma.user.findFirst({
        where: {
            email,
            // Kecualikan user dari resident yang sedang di-update
            id: { not: resident.user.id },
        }
    });
    
    if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar pada resident/user lain." });


    // 4. Proses password (Hanya hash jika ada password baru dikirim)
    let hashedPassword = resident.user.password;
    if (password) hashedPassword = await bcrypt.hash(password, 10);
    
    // --- 5. Validasi Minimal Update Fields (Opsional, tapi disarankan) ---
    // Di mode Edit, Anda mungkin tidak ingin mewajibkan semua field.
    // Namun, jika Anda ingin mewajibkan Name, Email, NIM, Jurusan, Angkatan, tambahkan validasi di sini:
    // if (!name || !email || !nim || !jurusan || !angkatan) { ... }

    
    // 6. Jalankan transaksi update
    const updated = await prisma.$transaction(async (tx) => {
      
      // Data untuk User
      const userDataUpdate = {};
      if (name !== undefined) userDataUpdate.name = name;
      if (email !== undefined) userDataUpdate.email = email;
      // Hanya update password jika field 'password' di body request ada isinya (non-empty string)
      if (password) userDataUpdate.password = hashedPassword; 

      const updatedUser = await tx.user.update({
        where: { id: resident.user.id },
        data: userDataUpdate,
      });

      // Data untuk Resident
      // Kita perlu memastikan bahwa jika frontend mengirimkan string kosong ('') untuk field opsional (seperti noTelp), 
      // kita mengubahnya menjadi null sebelum masuk ke database, sesuai dengan skema Prisma.
      const residentDataUpdate = {
          nim,
          jurusan,
          angkatan: Number(angkatan),
          noTelp: noTelp === '' ? null : noTelp,
          usrohId: usrohId === '' ? null : usrohId, // Pastikan usrohId bertipe Number/null
          lantaiId: lantaiId === '' ? null : lantaiId, // Pastikan lantaiId bertipe Number/null
      };
      
      const updatedResident = await tx.resident.update({
        where: { id: residentId },
        data: residentDataUpdate,
      });

      return { updatedUser, updatedResident };
    });

    res.status(200).json({
      success: true,
      message: "Data resident berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updateResident:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Hapus Resident
 */
export const deleteResident = async (req, res) => {
  try {
    const { id } = req.params;

    const resident = await prisma.resident.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!resident) return res.status(404).json({ message: "Resident tidak ditemukan." });

    await prisma.$transaction(async (tx) => {
      await tx.nilai.deleteMany({ where: { residentId: Number(id) } });
      await tx.jawaban.deleteMany({ where: { residentId: Number(id) } });
      await tx.nilaiTahfidz.deleteMany({ where: { residentId: Number(id) } });
      await tx.resident.delete({ where: { id: Number(id) } });
      await tx.user.delete({ where: { id: resident.user.id } });

    });

    res.status(200).json({ success: true, message: "Resident berhasil dihapus." });
  } catch (error) {
    console.error("❌ Error deleteResident:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Import Resident dari Excel
 */
  export const importResident = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File Excel tidak ditemukan." });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "File Excel kosong." });
    }

    const created = [];
    const skipped = [];

    const feUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    for (const row of rows) {
      const { name, email, nim, jurusan, angkatan, noTelp, usrohId, lantaiId } = row;

      if (!name || !email || !nim || !jurusan || !angkatan) {
        skipped.push({ email, reason: "Kolom wajib kurang" });
        continue;
      }

      const emailStr = String(email);
      const nimStr = String(nim);

      const existing = await prisma.user.findUnique({ where: { email: emailStr } });
      if (existing) {
        skipped.push({ email: emailStr, reason: "Email sudah ada" });
        continue;
      }

      const existingNIM = await prisma.resident.findFirst({ where: { nim: nimStr } });
      if (existingNIM) {
        skipped.push({ email: emailStr, reason: "NIM sudah ada" });
        continue;
      }

      const activationToken = generateActivationToken();
      const activationTokenHash = hashToken(activationToken);

      // create user+resident+token
      await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: String(name),
            email: emailStr,
            password: null,
            role: "RESIDENT",
            isActive: false,
          },
        });

        await tx.resident.create({
          data: {
            userId: user.id,
            nim: nimStr,
            jurusan: String(jurusan),
            angkatan: Number(angkatan),
            noTelp: noTelp ? String(noTelp) : null,
            usrohId: usrohId ? Number(usrohId) : null,
            lantaiId: lantaiId ? Number(lantaiId) : null,
          },
        });

        await tx.accountActivationToken.create({
          data: {
            userId: user.id,
            tokenHash: activationTokenHash,
            expiresAt: new Date(Date.now() + 60 * 60 * 1000),
          },
        });
      });

      // kirim email per user
      const activationLink = `${feUrl}/activate?token=${activationToken}`;
      try {
        await sendActivationEmail(emailStr, activationLink);
        created.push({ name: String(name), email: emailStr });
      } catch (mailErr) {
        console.error(`❌ Email activation gagal (${emailStr}):`, mailErr);
        skipped.push({ email: emailStr, reason: "Gagal kirim email aktivasi" });
      }
    }

    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      success: true,
      message: `Berhasil mengimpor ${created.length} data resident.`,
      data: created,
      skipped,
    });
  } catch (error) {
    console.error("❌ Error importResident:", error);
    return res.status(500).json({ message: "Terjadi kesalahan saat import Excel." });
  }
};


/**
 * Ambil semua Asisten Musyrif (include user dan usroh)
 */
export const getAllAsistenMusyrif = async (req, res) => {
  try {
    const asisten = await prisma.asistenMusyrif.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        usroh: { select: { id: true, nama: true } },
      },
      orderBy: { id: "asc" },
    });

    if (!asisten.length) return res.status(404).json({ message: "Belum ada data asisten musyrif." });

    const formatted = asisten.map((a) => ({
      id: a.id,
      name: a.user.name,
      email: a.user.email,
      isActive: a.user.isActive,
      usroh: a.usroh ? a.usroh.nama : "-",
      createdAt: a.createdAt,
    }));

    return res.status(200).json({
      success: true,
      message: "Data asisten musyrif berhasil diambil.",
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error getAllAsistenMusyrif:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Ambil satu Asisten Musyrif berdasarkan ID
 */
export const getAsistenMusyrifById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid." });

    const asisten = await prisma.asistenMusyrif.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, name: true, email: true, isActive: true } },
        usroh: { select: { id: true, nama: true } },
      },
    });

    if (!asisten) return res.status(404).json({ message: "Asisten musyrif tidak ditemukan." });

    return res.status(200).json({
      success: true,
      message: "Data asisten musyrif berhasil diambil.",
      data: asisten,
    });
  } catch (error) {
    console.error("❌ Error getAsistenMusyrifById:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Tambah Asisten Musyrif baru (tanpa password, kirim email aktivasi)
 */
export const createAsistenMusyrif = async (req, res) => {
  try {
    let { name, nim, email, usrohId } = req.body;

    if (!name || !nim || !email) {
      return res.status(400).json({ message: "Nama, NIM, dan email wajib diisi (tanpa password)." });
    }

    email = String(email).trim().toLowerCase();

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar." });

    const activationToken = generateActivationToken();
    const activationTokenHash = hashToken(activationToken);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: null,
          role: "ASISTEN",
          isActive: false,
        },
      });

      const newAsisten = await tx.asistenMusyrif.create({
        data: {
          userId: newUser.id,
          // nim belum kamu simpan di tabel asisten; kalau di schema ada field nim, isi di sini
          usrohId: usrohId ? Number(usrohId) : null,
        },
      });

      await tx.accountActivationToken.create({
        data: {
          userId: newUser.id,
          tokenHash: activationTokenHash,
          expiresAt,
        },
      });

      return { newUser, newAsisten };
    });

    // kirim email di luar transaksi
    const feUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const activationLink = `${feUrl}/activate?token=${activationToken}`;

    try {
      await sendActivationEmail(email, activationLink);
      return res.status(201).json({
        success: true,
        message: "Asisten musyrif berhasil ditambahkan. Link aktivasi sudah dikirim ke email.",
        data: result,
      });
    } catch (mailErr) {
      console.error("❌ Email activation gagal:", mailErr);
      return res.status(201).json({
        success: true,
        message:
          "Asisten musyrif berhasil ditambahkan, tapi email aktivasi gagal dikirim. Silakan coba kirim ulang aktivasi.",
        data: result,
      });
    }
  } catch (error) {
    console.error("❌ Error createAsistenMusyrif:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Update Asisten Musyrif (tanpa update password)
 */
export const updateAsistenMusyrif = async (req, res) => {
  try {
    const { id } = req.params;
    let { name, email, usrohId } = req.body;

    const asisten = await prisma.asistenMusyrif.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!asisten) return res.status(404).json({ message: "Asisten musyrif tidak ditemukan." });

    if (email) email = String(email).trim().toLowerCase();

    // cek duplikasi email (kecuali user ini)
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, id: { not: asisten.user.id } },
      });
      if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar pada user lain." });
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: asisten.user.id },
        data: {
          ...(name !== undefined ? { name } : {}),
          ...(email !== undefined ? { email } : {}),
        },
      });

      const updatedAsisten = await tx.asistenMusyrif.update({
        where: { id: Number(id) },
        data: { usrohId: usrohId ? Number(usrohId) : null },
      });

      return { updatedUser, updatedAsisten };
    });

    return res.status(200).json({
      success: true,
      message: "Data asisten musyrif berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updateAsistenMusyrif:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Hapus Asisten Musyrif
 */
export const deleteAsistenMusyrif = async (req, res) => {
  try {
    const { id } = req.params;

    const asisten = await prisma.asistenMusyrif.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!asisten) return res.status(404).json({ message: "Asisten musyrif tidak ditemukan." });

    await prisma.$transaction(async (tx) => {
      // optional: invalidate token aktivasi yang belum kepakai
      await tx.accountActivationToken.updateMany({
        where: { userId: asisten.user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.asistenMusyrif.delete({ where: { id: Number(id) } });
      await tx.user.delete({ where: { id: asisten.user.id } });
    });

    return res.status(200).json({ success: true, message: "Asisten musyrif berhasil dihapus." });
  } catch (error) {
    console.error("❌ Error deleteAsistenMusyrif:", error);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Import Asisten Musyrif dari Excel (tanpa password, kirim email aktivasi)
 * Kolom: name | email | nim | usrohId   (nim opsional, sesuaikan file kamu)
 */
export const importAsistenMusyrif = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File Excel tidak ditemukan." });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "File Excel kosong." });
    }

    const created = [];
    const skipped = [];

    const feUrl = process.env.FRONTEND_URL || "http://localhost:3000";

    for (const row of rows) {
      const { name, email, nim, usrohId } = row;
      if (!name || !email) {
        skipped.push({ email, reason: "Kolom wajib kurang (name/email)" });
        continue;
      }

      const emailStr = String(email).trim().toLowerCase();

      const existing = await prisma.user.findUnique({ where: { email: emailStr } });
      if (existing) {
        skipped.push({ email: emailStr, reason: "Email sudah ada" });
        continue;
      }

      const activationToken = generateActivationToken();
      const tokenHash = hashToken(activationToken);
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

      // create user + asisten + token (transaction)
      const { user } = await prisma.$transaction(async (tx) => {
        const user = await tx.user.create({
          data: {
            name: String(name),
            email: emailStr,
            password: null,
            role: "ASISTEN",
            isActive: false,
          },
        });

        await tx.asistenMusyrif.create({
          data: {
            userId: user.id,
            usrohId: usrohId ? Number(usrohId) : null,
            // nim: nim ? String(nim) : null, // kalau ada field nim di model asisten
          },
        });

        await tx.accountActivationToken.create({
          data: { userId: user.id, tokenHash, expiresAt },
        });

        return { user };
      });

      // kirim email per user
      const activationLink = `${feUrl}/activate?token=${activationToken}`;
      try {
        await sendActivationEmail(user.email, activationLink);
        created.push({ name: user.name, email: user.email });
      } catch (mailErr) {
        console.error(`❌ Email activation gagal (${user.email}):`, mailErr);
        skipped.push({ email: user.email, reason: "Gagal kirim email aktivasi" });
      }
    }

    fs.unlinkSync(req.file.path);

    return res.status(201).json({
      success: true,
      message: `Berhasil mengimpor ${created.length} data asisten musyrif.`,
      data: created,
      skipped,
    });
  } catch (error) {
    console.error("❌ Error importAsistenMusyrif:", error);
    return res.status(500).json({ message: "Terjadi kesalahan saat import Excel." });
  }
};


/* ==========================================================
   ✅ CRUD DATA MUSYRIF (oleh Admin)
   ========================================================== */

/**
 * Ambil semua Musyrif (include data user & lantai)
 */
export const getAllMusyrif = async (req, res) => {
  try {
    const musyrif = await prisma.musyrif.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        lantai: { select: { id: true, nama: true } },
      },
      orderBy: { id: "asc" },
    });

    if (!musyrif.length)
      return res.status(404).json({ message: "Belum ada data musyrif." });

    const formatted = musyrif.map((m) => ({
      id: m.id,
      name: m.user.name,
      email: m.user.email,
      lantai: m.lantai ? m.lantai.nama : "-",
      createdAt: m.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Data musyrif berhasil diambil.",
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error getAllMusyrif:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Ambil satu Musyrif berdasarkan ID
 */
export const getMusyrifById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid." });

    const musyrif = await prisma.musyrif.findUnique({
      where: { id: Number(id) },
      include: {
        user: { select: { id: true, name: true, email: true } },
        lantai: { select: { id: true, nama: true } },
      },
    });

    if (!musyrif) return res.status(404).json({ message: "Musyrif tidak ditemukan." });

    res.status(200).json({
      success: true,
      message: "Data musyrif berhasil diambil.",
      data: musyrif,
    });
  } catch (error) {
    console.error("❌ Error getMusyrifById:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Tambah Musyrif baru
 */
export const createMusyrif = async (req, res) => {
  try {
    const { name, email, password, lantaiId } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Nama, email, dan password wajib diisi." });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return res.status(400).json({ message: "Email sudah terdaftar." });

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: { name, email, password: hashedPassword, role: "MUSYRIF" },
      });

      const newMusyrif = await tx.musyrif.create({
        data: { userId: newUser.id, lantaiId: lantaiId || null },
      });

      return { newUser, newMusyrif };
    });

    res.status(201).json({
      success: true,
      message: "Musyrif berhasil ditambahkan.",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error createMusyrif:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Update data Musyrif
 */
export const updateMusyrif = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, lantaiId } = req.body;

    const musyrif = await prisma.musyrif.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!musyrif) return res.status(404).json({ message: "Musyrif tidak ditemukan." });

    let hashedPassword = musyrif.user.password;
    if (password) hashedPassword = await bcrypt.hash(password, 10);

    const updated = await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: musyrif.user.id },
        data: { name, email, password: hashedPassword },
      });

      const updatedMusyrif = await tx.musyrif.update({
        where: { id: Number(id) },
        data: { lantaiId: lantaiId || null },
      });

      return { updatedUser, updatedMusyrif };
    });

    res.status(200).json({
      success: true,
      message: "Data musyrif berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updateMusyrif:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Hapus Musyrif
 */
export const deleteMusyrif = async (req, res) => {
  try {
    const { id } = req.params;

    const musyrif = await prisma.musyrif.findUnique({
      where: { id: Number(id) },
      include: { user: true },
    });

    if (!musyrif) return res.status(404).json({ message: "Musyrif tidak ditemukan." });

    await prisma.$transaction(async (tx) => {
      await tx.musyrif.delete({ where: { id: Number(id) } });
      await tx.user.delete({ where: { id: musyrif.user.id } });
    });

    res.status(200).json({ success: true, message: "Musyrif berhasil dihapus." });
  } catch (error) {
    console.error("❌ Error deleteMusyrif:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Import Musyrif dari Excel
 * Kolom: name | email | password | lantaiId
 */
export const importMusyrif = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "File Excel tidak ditemukan." });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(sheet);

    if (!rows.length) {
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ message: "File Excel kosong." });
    }

    const created = [];

    for (const row of rows) {
      const { name, email, password, lantaiId } = row;
      if (!name || !email || !password) continue;

      const existing = await prisma.user.findUnique({ where: { email } });
      if (existing) continue;

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: { name, email, password: hashedPassword, role: "MUSYRIF" },
      });

      await prisma.musyrif.create({
        data: { userId: user.id, lantaiId: lantaiId || null },
      });

      created.push({ name, email });
    }

    fs.unlinkSync(req.file.path);

    res.status(201).json({
      success: true,
      message: `Berhasil mengimpor ${created.length} data musyrif.`,
      data: created,
    });
  } catch (error) {
    console.error("❌ Error importMusyrif:", error);
    res.status(500).json({ message: "Terjadi kesalahan saat import Excel." });
  }
};

/* ==========================================================
   ✅ KELOLA GEDUNG, LANTAI, & USROH (oleh Admin)
   ========================================================== */

/* -----------------------------
   📦 CRUD GEDUNG
----------------------------- */

/**
 * Ambil semua gedung (beserta lantainya)
 */
export const getAllGedung = async (req, res) => {
  try {
    const gedung = await prisma.gedung.findMany({
      include: { lantai: true },
      orderBy: { id: "asc" },
    });

    if (!gedung.length)
      return res.status(404).json({ message: "Belum ada data gedung." });

    res.status(200).json({
      success: true,
      message: "Data gedung berhasil diambil.",
      data: gedung,
    });
  } catch (error) {
    console.error("❌ Error getAllGedung:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Tambah gedung baru
 */
export const createGedung = async (req, res) => {
  try {
    const { nama } = req.body;
    if (!nama) return res.status(400).json({ message: "Nama gedung wajib diisi." });

    const existing = await prisma.gedung.findFirst({ where: { nama } });
    if (existing) return res.status(400).json({ message: "Nama gedung sudah ada." });

    const newGedung = await prisma.gedung.create({ data: { nama } });

    res.status(201).json({
      success: true,
      message: "Gedung berhasil ditambahkan.",
      data: newGedung,
    });
  } catch (error) {
    console.error("❌ Error createGedung:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Update nama gedung
 */
export const updateGedung = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama } = req.body;

    const updatedGedung = await prisma.gedung.update({
      where: { id: Number(id) },
      data: { nama },
    });

    res.status(200).json({
      success: true,
      message: "Gedung berhasil diperbarui.",
      data: updatedGedung,
    });
  } catch (error) {
    console.error("❌ Error updateGedung:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Hapus gedung (otomatis hapus lantai di dalamnya)
 */
export const deleteGedung = async (req, res) => {
  try {
    const { id } = req.params;

    const gedung = await prisma.gedung.findUnique({
      where: { id: Number(id) },
      include: { lantai: true },
    });

    if (!gedung) return res.status(404).json({ message: "Gedung tidak ditemukan." });

    // Hapus semua lantai di gedung
    await prisma.$transaction(async (tx) => {
      await tx.lantai.deleteMany({ where: { gedungId: Number(id) } });
      await tx.gedung.delete({ where: { id: Number(id) } });
    });

    res.status(200).json({
      success: true,
      message: "Gedung dan semua lantai di dalamnya berhasil dihapus.",
    });
  } catch (error) {
    console.error("❌ Error deleteGedung:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/* -----------------------------
   🏢 CRUD LANTAI
----------------------------- */

/**
 * Ambil semua lantai (include nama gedung)
 */
export const getAllLantai = async (req, res) => {
  try {
    const lantai = await prisma.lantai.findMany({
      include: { gedung: true },
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Data lantai berhasil diambil.",
      data: lantai.map((l) => ({
        id: l.id,
        nama: l.nama,
        gedung: l.gedung.nama,
        createdAt: l.createdAt,
      })),
    });
  } catch (error) {
    console.error("❌ Error getAllLantai:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Tambah lantai baru
 */
export const createLantai = async (req, res) => {
  try {
    const { nama, gedungId } = req.body;
    if (!nama || !gedungId)
      return res.status(400).json({ message: "Nama lantai dan gedung wajib diisi." });

    const newLantai = await prisma.lantai.create({
      data: { nama, gedungId: Number(gedungId) },
    });

    res.status(201).json({
      success: true,
      message: "Lantai berhasil ditambahkan.",
      data: newLantai,
    });
  } catch (error) {
    console.error("❌ Error createLantai:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Update lantai
 */
export const updateLantai = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, gedungId } = req.body;

    const updatedLantai = await prisma.lantai.update({
      where: { id: Number(id) },
      data: { nama, gedungId: Number(gedungId) },
    });

    res.status(200).json({
      success: true,
      message: "Lantai berhasil diperbarui.",
      data: updatedLantai,
    });
  } catch (error) {
    console.error("❌ Error updateLantai:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Hapus lantai
 */
export const deleteLantai = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.lantai.delete({ where: { id: Number(id) } });

    res.status(200).json({ success: true, message: "Lantai berhasil dihapus." });
  } catch (error) {
    console.error("❌ Error deleteLantai:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/* -----------------------------
   🏠 CRUD USROH
----------------------------- */

/**
 * Ambil semua usroh
 */
export const getAllUsroh = async (req, res) => {
  try {
    const usroh = await prisma.usroh.findMany({
      include: {
        lantai: {
          select: {
            id: true,
            nama: true,
            gedung: { select: { id: true, nama: true } },
          },
        },
      },
      orderBy: { id: "asc" },
    });

    res.status(200).json({
      success: true,
      message: "Data usroh berhasil diambil.",
      data: usroh.map((u) => ({
        id: u.id,
        nama: u.nama,
        lantai: u.lantai ? u.lantai.nama : "-",
        gedung: u.lantai?.gedung ? u.lantai.gedung.nama : "-",
        createdAt: u.createdAt,
        // kalau FE kamu butuh struktur original juga, boleh return u langsung tanpa map
        // atau tambahkan lantaiObj: u.lantai
      })),
    });
  } catch (error) {
    console.error("❌ Error getAllUsroh:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};


/**
 * Tambah usroh baru
 */
export const createUsroh = async (req, res) => {
  try {
    const { nama, lantaiId } = req.body;
    if (!nama || !lantaiId)
      return res.status(400).json({ message: "Nama usroh dan lantai wajib diisi." });

    const newUsroh = await prisma.usroh.create({
      data: { nama, lantaiId: Number(lantaiId) },
    });

    res.status(201).json({
      success: true,
      message: "Usroh berhasil ditambahkan.",
      data: newUsroh,
    });
  } catch (error) {
    console.error("❌ Error createUsroh:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Update usroh
 */
export const updateUsroh = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, lantaiId } = req.body;

    const updatedUsroh = await prisma.usroh.update({
      where: { id: Number(id) },
      data: { nama, lantaiId: Number(lantaiId) },
    });

    res.status(200).json({
      success: true,
      message: "Usroh berhasil diperbarui.",
      data: updatedUsroh,
    });
  } catch (error) {
    console.error("❌ Error updateUsroh:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Hapus usroh
 */
export const deleteUsroh = async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.usroh.delete({ where: { id: Number(id) } });

    res.status(200).json({ success: true, message: "Usroh berhasil dihapus." });
  } catch (error) {
    console.error("❌ Error deleteUsroh:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/* ==========================================================
   ✅ KELOLA MATERI PEMBELAJARAN (oleh Admin)
   ========================================================== */

import path from "path";

/**
 * Ambil semua materi
 */
export const getAllMateri = async (req, res) => {
  try {
    const materi = await prisma.materi.findMany({
  include: {
    kategori: { select: { id: true, nama: true } },
  },
  orderBy: { id: "asc" },
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

/**
 * Tambah materi baru
 * Bisa berupa deskripsi + file upload
 */
export const createMateri = async (req, res) => {
  try {
    const { judul, deskripsi } = req.body;

    if (!judul) return res.status(400).json({ message: "Judul materi wajib diisi." });

    // Jika ada file yang diupload (PDF, PPT, dll)
    let fileUrl = null;
    if (req.file) {
      fileUrl = `/uploads/materi/${req.file.filename}`;
    }

    const newMateri = await prisma.materi.create({
      data: {
        judul,
        deskripsi: deskripsi || null,
        fileUrl,
      },
    });

    res.status(201).json({
      success: true,
      message: "Materi berhasil ditambahkan.",
      data: newMateri,
    });
  } catch (error) {
    console.error("❌ Error createMateri:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Update materi (judul, deskripsi, atau file)
 */
export const updateMateri = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, deskripsi } = req.body;

    const materi = await prisma.materi.findUnique({ where: { id: Number(id) } });
    if (!materi) return res.status(404).json({ message: "Materi tidak ditemukan." });

    let fileUrl = materi.fileUrl;
    if (req.file) {
      fileUrl = `/uploads/materi/${req.file.filename}`;
    }

    const updatedMateri = await prisma.materi.update({
      where: { id: Number(id) },
      data: {
        judul: judul || materi.judul,
        deskripsi: deskripsi || materi.deskripsi,
        fileUrl,
      },
    });

    res.status(200).json({
      success: true,
      message: "Materi berhasil diperbarui.",
      data: updatedMateri,
    });
  } catch (error) {
    console.error("❌ Error updateMateri:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Hapus materi
 */
export const deleteMateri = async (req, res) => {
  try {
    const { id } = req.params;

    const materi = await prisma.materi.findUnique({ where: { id: Number(id) } });
    if (!materi) return res.status(404).json({ message: "Materi tidak ditemukan." });

    // Hapus file dari server jika ada
    if (materi.fileUrl) {
      const filePath = path.join("public", materi.fileUrl);
      if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    }

    await prisma.materi.delete({ where: { id: Number(id) } });

    res.status(200).json({
      success: true,
      message: "Materi berhasil dihapus.",
    });
  } catch (error) {
    console.error("❌ Error deleteMateri:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};


/* ==========================================================
   ✅ CRUD TARGET HAFALAN & SUBTARGET (oleh Admin)
   ========================================================== */

   export const getAllTargetHafalan = async (req, res) => {
  try {
    const targets = await prisma.targetHafalan.findMany({
      include: {
        subTargets: true,
      },
      orderBy: { id: "asc" },
    });

    if (!targets.length)
      return res.status(404).json({ message: "Belum ada data target hafalan." });

    res.status(200).json({
      success: true,
      message: "Data target hafalan berhasil diambil.",
      data: targets,
    });
  } catch (error) {
    console.error("❌ Error getAllTargetHafalan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const getTargetHafalanById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid." });

    const target = await prisma.targetHafalan.findUnique({
      where: { id: Number(id) },
      include: { subTargets: true },
    });

    if (!target)
      return res.status(404).json({ message: "Target hafalan tidak ditemukan." });

    res.status(200).json({
      success: true,
      message: "Data target hafalan berhasil diambil.",
      data: target,
    });
  } catch (error) {
    console.error("❌ Error getTargetHafalanById:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const createTargetHafalan = async (req, res) => {
  try {
    const { nama, surah, ayatMulai, ayatAkhir } = req.body;

    if (!nama || !surah || !ayatMulai || !ayatAkhir) {
      return res.status(400).json({ message: "Semua field wajib diisi." });
    }

    const target = await prisma.targetHafalan.create({
      data: {
        nama,
        surah,
        ayatMulai: Number(ayatMulai),
        ayatAkhir: Number(ayatAkhir),
      },
    });

    res.status(201).json({
      success: true,
      message: "Target hafalan berhasil ditambahkan.",
      data: target,
    });
  } catch (error) {
    console.error("❌ Error createTargetHafalan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const updateTargetHafalan = async (req, res) => {
  try {
    const { id } = req.params;
    const { nama, surah, ayatMulai, ayatAkhir } = req.body;

    const target = await prisma.targetHafalan.findUnique({ where: { id: Number(id) } });
    if (!target) return res.status(404).json({ message: "Target hafalan tidak ditemukan." });

    const updated = await prisma.targetHafalan.update({
      where: { id: Number(id) },
      data: {
        nama,
        surah,
        ayatMulai: Number(ayatMulai),
        ayatAkhir: Number(ayatAkhir),
      },
    });

    res.status(200).json({
      success: true,
      message: "Data target hafalan berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updateTargetHafalan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const deleteTargetHafalan = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid." });

    const target = await prisma.targetHafalan.findUnique({
      where: { id: Number(id) },
    });

    if (!target) {
      return res.status(404).json({ message: "Target hafalan tidak ditemukan." });
    }

    await prisma.$transaction(async (tx) => {
      // schema kamu: model SubTargets, FK = targetId
      await tx.subTargets.deleteMany({ where: { targetId: Number(id) } });
      await tx.targetHafalan.delete({ where: { id: Number(id) } });
    });

    res.status(200).json({
      success: true,
      message: "Target hafalan dan sub-target terkait berhasil dihapus.",
    });
  } catch (error) {
    console.error("❌ Error deleteTargetHafalan:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};


/**
 * =============================
 * CRUD SUBTARGET (Admin)
 * Model Prisma: SubTargets -> prisma.subTargets
 * FK: targetId
 * Relasi: targetHafalan
 * =============================
 */

/**
 * Ambil semua SubTarget (beserta Target Hafalannya)
 */
export const getAllSubTarget = async (req, res) => {
  try {
    const subTargets = await prisma.subTargets.findMany({
      include: {
        targetHafalan: {
          select: {
            id: true,
            nama: true,
            surah: true,
            ayatMulai: true,
            ayatAkhir: true,
          },
        },
      },
      orderBy: { id: "asc" },
    });

    if (!subTargets.length) {
      return res.status(404).json({ message: "Belum ada data sub-target." });
    }

    res.status(200).json({
      success: true,
      message: "Data sub-target berhasil diambil.",
      data: subTargets,
    });
  } catch (error) {
    console.error("❌ Error getAllSubTarget:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Ambil SubTarget berdasarkan ID (beserta Target Hafalannya)
 */
export const getSubTargetById = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid." });

    const subTarget = await prisma.subTargets.findUnique({
      where: { id: Number(id) },
      include: {
        targetHafalan: {
          select: {
            id: true,
            nama: true,
            surah: true,
            ayatMulai: true,
            ayatAkhir: true,
          },
        },
      },
    });

    if (!subTarget) {
      return res.status(404).json({ message: "Sub-target tidak ditemukan." });
    }

    res.status(200).json({
      success: true,
      message: "Data sub-target berhasil diambil.",
      data: subTarget,
    });
  } catch (error) {
    console.error("❌ Error getSubTargetById:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Tambahkan SubTarget baru
 * body: { nama, targetId }
 */
export const createSubTarget = async (req, res) => {
  try {
    const { nama, targetId } = req.body;

    if (!nama || !targetId) {
      return res.status(400).json({ message: "Nama dan ID target hafalan wajib diisi." });
    }

    const target = await prisma.targetHafalan.findUnique({
      where: { id: Number(targetId) },
    });

    if (!target) {
      return res.status(404).json({ message: "Target hafalan tidak ditemukan." });
    }

    const subTarget = await prisma.subTargets.create({
      data: {
        nama,
        targetId: Number(targetId),
      },
    });

    res.status(201).json({
      success: true,
      message: "Sub-target berhasil ditambahkan.",
      data: subTarget,
    });
  } catch (error) {
    console.error("❌ Error createSubTarget:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Update SubTarget
 * body: { nama?, targetId? }
 */
export const updateSubTarget = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid." });

    const { nama, targetId } = req.body;

    const existing = await prisma.subTargets.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Sub-target tidak ditemukan." });
    }

    // kalau targetId dikirim, pastikan target ada
    if (targetId) {
      const target = await prisma.targetHafalan.findUnique({
        where: { id: Number(targetId) },
      });
      if (!target) return res.status(404).json({ message: "Target hafalan tidak ditemukan." });
    }

    const updated = await prisma.subTargets.update({
      where: { id: Number(id) },
      data: {
        nama: nama ?? existing.nama,
        targetId: targetId ? Number(targetId) : existing.targetId,
      },
    });

    res.status(200).json({
      success: true,
      message: "Data sub-target berhasil diperbarui.",
      data: updated,
    });
  } catch (error) {
    console.error("❌ Error updateSubTarget:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

/**
 * Hapus SubTarget
 */
export const deleteSubTarget = async (req, res) => {
  try {
    const { id } = req.params;
    if (isNaN(id)) return res.status(400).json({ message: "ID tidak valid." });

    const existing = await prisma.subTargets.findUnique({
      where: { id: Number(id) },
    });

    if (!existing) {
      return res.status(404).json({ message: "Sub-target tidak ditemukan." });
    }

    await prisma.subTargets.delete({
      where: { id: Number(id) },
    });

    res.status(200).json({
      success: true,
      message: "Sub-target berhasil dihapus.",
    });
  } catch (error) {
    console.error("❌ Error deleteSubTarget:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};



// ✅ Ambil semua nilai tahfidz (include resident & target hafalan)
export const getAllNilaiTahfidz = async (req, res) => {
  try {
    const nilaiList = await prisma.nilaiTahfidz.findMany({
      include: {
        resident: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
        },
        targetHafalan: { select: { id: true, nama: true, surah: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!nilaiList.length)
      return res.status(404).json({ message: "Belum ada data nilai tahfidz." });

    const formatted = nilaiList.map((n) => ({
      id: n.id,
      resident: n.resident?.user?.name || "-",
      email: n.resident?.user?.email || "-",
      target: n.targetHafalan?.nama || "-",
      surah: n.targetHafalan?.surah || "-",
      status: n.status,
      nilaiHuruf: n.nilaiHuruf || "-",
      createdAt: n.createdAt,
    }));

    res.status(200).json({
      success: true,
      message: "Data nilai tahfidz berhasil diambil.",
      data: formatted,
    });
  } catch (error) {
    console.error("❌ Error getAllNilaiTahfidz:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

// ✅ Ambil nilai tahfidz berdasarkan ID resident
export const getNilaiTahfidzByResident = async (req, res) => {
  try {
    const { residentId } = req.params;

    const nilaiList = await prisma.nilaiTahfidz.findMany({
      where: { residentId: Number(residentId) },
      include: {
        targetHafalan: { select: { id: true, nama: true, surah: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    if (!nilaiList.length)
      return res.status(404).json({ message: "Resident belum memiliki nilai tahfidz." });

    res.status(200).json({
      success: true,
      message: "Data nilai tahfidz per resident berhasil diambil.",
      data: nilaiList,
    });
  } catch (error) {
    console.error("❌ Error getNilaiTahfidzByResident:", error);
    res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};



// ✅ Export semua nilai tahfidz ke file Excel
export const exportNilaiTahfidz = async (req, res) => {
  try {
    const nilaiList = await prisma.nilaiTahfidz.findMany({
      include: {
        resident: {
          include: { user: { select: { name: true, email: true } } },
        },
        targetHafalan: { select: { nama: true, surah: true } },
      },
    });

    const data = nilaiList.map((n) => ({
      Nama: n.resident?.user?.name || "-",
      Email: n.resident?.user?.email || "-",
      Target: n.targetHafalan?.nama || "-",
      Surah: n.targetHafalan?.surah || "-",
      Status: n.status,
      NilaiHuruf: n.nilaiHuruf || "-",
      Tanggal: n.createdAt.toISOString().split("T")[0],
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "NilaiTahfidz");

    const filename = `exports/nilai_tahfidz_${Date.now()}.xlsx`;
    XLSX.writeFile(workbook, filename);

    res.download(filename, (err) => {
      if (!err) fs.unlinkSync(filename);
    });
  } catch (error) {
    console.error("❌ Error exportNilaiTahfidz:", error);
    res.status(500).json({ message: "Gagal mengekspor data nilai tahfidz." });
  }
};
