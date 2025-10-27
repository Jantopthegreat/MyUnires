import express from "express";
import {
  getResidentsByAsisten,
  getAllNilaiTahfidzByAsisten,
  getNilaiTahfidzByResident,
  createOrUpdateNilaiTahfidz,
  getMateri,
} from "../controllers/asistenMusyrifController.js";
import { verifyToken, isAsisten } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Resident binaan
router.get("/residents", verifyToken, isAsisten, getResidentsByAsisten);

// Nilai Tahfidz
router.get("/tahfidz", verifyToken, isAsisten, getAllNilaiTahfidzByAsisten);
router.get("/tahfidz/:residentId", verifyToken, isAsisten, getNilaiTahfidzByResident);
router.post("/tahfidz", verifyToken, isAsisten, createOrUpdateNilaiTahfidz);

// Materi (read-only)
router.get("/materi", verifyToken, isAsisten, getMateri);

export default router;
