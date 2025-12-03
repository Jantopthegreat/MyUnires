import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/authRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import residentRoutes from "./routes/residentRoutes.js";
import asistenMusyrifRoutes from "./routes/asistenMusyrifRoutes.js";
import musyrifRoutes from "./routes/musyrifRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

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
