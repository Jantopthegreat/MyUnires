import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import residentRoutes from "./routes/residentRoutes.js";
import asistenMusyrifRoutes from "./routes/asistenMusyrifRoutes.js";
import musyrifRoutes from "./routes/musyrifRoutes.js";

dotenv.config();
console.log("[ENV CHECK]", {
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL ? "OK" : "MISSING",
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_USER: process.env.SMTP_USER,
});

const app = express();
app.use(cors());
app.use(express.json());
// Serve static uploads
app.use('/uploads', express.static('uploads'));

// route utama
app.use("/api/auth", authRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/resident", residentRoutes);
app.use("/api/asisten", asistenMusyrifRoutes);
app.use("/api/musyrif", musyrifRoutes);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});

// Global error handler (catch errors from middleware like multer)
app.use((err, req, res, next) => {
  console.error('🔥 Global error handler caught:', err);
  if (res.headersSent) {
    return next(err);
  }
  res.status(500).json({ success: false, message: 'Terjadi kesalahan server.', error: err.message });
});
