import jwt from "jsonwebtoken";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Token tidak ditemukan" });

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch {
    res.status(403).json({ message: "Token tidak valid" });
  }
};

/**
 * ✅ Hanya bisa diakses oleh Admin
 */
export const isAdmin = (req, res, next) => {
  try {
    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ message: "Akses ditolak: hanya admin yang bisa mengakses" });
    }
    next();
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Terjadi kesalahan server" });
  }
};

/**
 * ✅ Hanya bisa diakses oleh Musyrif
 */
export const isMusyrif = (req, res, next) => {
  if (req.user.role !== "MUSYRIF")
    return res.status(403).json({ message: "Akses hanya untuk musyrif." });
  next();
};

/**
 * ✅ Hanya bisa diakses oleh Asisten Musyrif
 */
export const isAsisten = (req, res, next) => {
  if (req.user.role !== "ASISTEN")
    return res.status(403).json({ message: "Akses hanya untuk asisten musyrif." });
  next();
};

/**
 * ✅ Hanya bisa diakses oleh Resident
 */
export const isResident = (req, res, next) => {
  if (req.user.role !== "RESIDENT")
    return res.status(403).json({ message: "Akses hanya untuk resident." });
  next();
};