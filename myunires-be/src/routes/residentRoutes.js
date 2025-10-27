import express from "express";
import { verifyToken, isResident } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  changePassword,
  getAllMateri,
  getMateriById,
  getAssignments,
  submitJawaban,
  getHasilKuis,
  getNilai,
  getTargetHafalan,
  getNilaiTahfidz,
} from "../controllers/residentController.js";

const router = express.Router();

// 🔹 Profil & Akun
router.get("/profile", verifyToken, isResident, getProfile);
router.put("/profile", verifyToken, isResident, updateProfile);
router.put("/change-password", verifyToken, isResident, changePassword);

// 🔹 Materi
router.get("/materi", verifyToken, isResident, getAllMateri);
router.get("/materi/:id", verifyToken, isResident, getMateriById);

// 🔹 Assignment
router.get("/assignment", verifyToken, isResident, getAssignments);
router.post("/assignment/submit", verifyToken, isResident, submitJawaban);
router.get("/assignment/result", verifyToken, isResident, getHasilKuis);

// 🔹 Nilai
router.get("/nilai", verifyToken, isResident, getNilai);

// 🔹 Tahfidz
router.get("/tahfidz/target", verifyToken, isResident, getTargetHafalan);
router.get("/tahfidz/nilai", verifyToken, isResident, getNilaiTahfidz);

export default router;
