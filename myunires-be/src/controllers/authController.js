import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../config/prisma.js";

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

    // 1️⃣ Cari user berdasarkan email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(404).json({ message: "Email tidak ditemukan" });
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

    // 4️⃣ Response
    res.status(200).json({
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
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

export const logout = async (req, res) => {
  res.status(200).json({ message: "Logout berhasil (hapus token di client)" });
};
