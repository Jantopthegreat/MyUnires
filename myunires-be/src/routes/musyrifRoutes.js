import express from "express";
import {
  getResidentsByMusyrif,
  getAllNilaiTahfidzByMusyrif,
  getNilaiTahfidzByResident,
  createOrUpdateNilaiTahfidz,
  getMateri,
} from "../controllers/musyrifController.js";
import { verifyToken, isMusyrif } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Resident binaan
router.get("/residents", verifyToken, isMusyrif, getResidentsByMusyrif);

// Nilai tahfidz
router.get("/tahfidz", verifyToken, isMusyrif, getAllNilaiTahfidzByMusyrif);
router.get("/tahfidz/:residentId", verifyToken, isMusyrif, getNilaiTahfidzByResident);
router.post("/tahfidz", verifyToken, isMusyrif, createOrUpdateNilaiTahfidz);

// Materi (read-only)
router.get("/materi", verifyToken, isMusyrif, getMateri);

export default router;
