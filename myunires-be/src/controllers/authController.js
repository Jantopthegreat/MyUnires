import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";
import { sendActivationEmail } from "../services/emailService.js";
import { generateActivationToken, hashToken } from "../utils/token.js";




/**
 * Login User
 */
// export const login = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // cari user berdasarkan email
//     const user = await prisma.user.findUnique({ where: { email } });
//     if (!user) return res.status(404).json({ message: "Email tidak ditemukan" });

//     // cek password
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) return res.status(400).json({ message: "Password salah" });

//     // buat token JWT
//     const token = jwt.sign(
//       { id: user.id, role: user.role },
//       process.env.JWT_SECRET,
//       { expiresIn: "1d" }
//     );

//     res.status(200).json({
//       message: "Login berhasil",
//       user: {
//         id: user.id,
//         name: user.name,
//         email: user.email,
//         role: user.role,
//       },
//       token,
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Terjadi kesalahan server" });
//   }
// };

/**
 * Logout (dummy endpoint, JWT cukup dihapus di client)
 */

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // cari user berdasarkan email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ message: "Email tidak ditemukan" });

    // NEW: blokir kalau belum aktivasi atau belum punya password
    if (!user.isActive || !user.password) {
      return res.status(403).json({
        message: "Akun belum diaktivasi. Silakan aktivasi akun terlebih dahulu.",
      });
    }

    // 2️⃣ Cek password TANPA bcrypt
    if (password !== user.password) {
      return res.status(400).json({ message: "Password salah" });
    }

    // 3️⃣ Generate JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    return res.status(200).json({
      message: "Login berhasil",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      token,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ message: "Logout berhasil (hapus token di client)" });
};


export const activateAccount = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ message: "Token dan password wajib diisi." });
    }

    const tokenHash = hashToken(token);

    const tokenRow = await prisma.accountActivationToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRow) return res.status(400).json({ message: "Token tidak valid." });
    if (tokenRow.usedAt) return res.status(400).json({ message: "Token sudah digunakan." });
    if (tokenRow.expiresAt < new Date()) return res.status(400).json({ message: "Token sudah expired." });

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: tokenRow.userId },
        data: { password: hashedPassword, isActive: true },
      });

      await tx.accountActivationToken.updateMany({
      where: { userId: tokenRow.userId, usedAt: null },
      data: { usedAt: new Date() },
    });

    });

    return res.status(200).json({
      success: true,
      message: "Akun berhasil diaktivasi. Silakan login.",
    });
  } catch (err) {
    console.error("❌ activateAccount:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};





export const resendActivation = async (req, res) => {
  console.log("[HIT] POST /resend-activation", req.method, req.originalUrl, req.body);

  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email wajib diisi." });

    // Hindari user enumeration (response generik)
    const generic = {
      success: true,
      message: "Jika email terdaftar dan belum aktif, link aktivasi akan dikirim.",
    };

    const user = await prisma.user.findUnique({ where: { email } });
    console.log("[RESEND] user found?", !!user);

    if (!user) return res.status(200).json(generic);

    console.log("[RESEND] isActive?", user.isActive);
    if (user.isActive) {
      return res.status(200).json({
        success: true,
        message: "Akun sudah aktif. Silakan login.",
      });
    }

    const token = generateActivationToken();
    const tokenHash = hashToken(token);
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      await tx.accountActivationToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      await tx.accountActivationToken.create({
        data: { userId: user.id, tokenHash, expiresAt },
      });
    });

    const feUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const activationLink = `${feUrl}/activate?token=${token}`;

    console.log("[RESEND] sending email...", { email, activationLink });
    const info = await sendActivationEmail(email, activationLink);

    console.log("[MAIL INFO]", {
      accepted: info?.accepted,
      rejected: info?.rejected,
      response: info?.response,
      messageId: info?.messageId,
    });

    return res.status(200).json(generic);
  } catch (err) {
    console.error("❌ resendActivation:", err);
    return res.status(500).json({ message: "Terjadi kesalahan server." });
  }
};

export const testEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email wajib diisi." });

    const activationLink = "https://example.com/activate?token=TEST_TOKEN";
    const info = await sendActivationEmail(email, activationLink);

    return res.status(200).json({
      success: true,
      message: "Test email triggered",
      accepted: info?.accepted,
      rejected: info?.rejected,
      response: info?.response,
      messageId: info?.messageId,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err?.message });
  }
};
