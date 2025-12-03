import express from "express";
import { verifyToken, isResident } from "../middlewares/authMiddleware.js";
import {
  getProfile,
  updateProfile,
  changePassword,
  getAllKategori,
  getAllMateri,
  getMateriById,
  getAssignments,
  submitJawaban,
  getHasilKuis,
  getNilai,
  getTargetHafalan,
  getNilaiTahfidz,
  getLeaderboard,
} from "../controllers/residentController.js";

const router = express.Router();

router.get("/", (req, res) => {
  res.json({ message: "✅ Resident API ready!" });
});

// 🔹 Profil & Akun
router.get("/profile", verifyToken, isResident, getProfile);
// router.get("/profile", getProfile);
router.put("/profile", verifyToken, isResident, updateProfile);
router.put("/change-password", verifyToken, isResident, changePassword);

// 🔹 Materi
router.get("/kategori", verifyToken, isResident, getAllKategori);
router.get("/materi", verifyToken, isResident, getAllMateri);
router.get("/materi/:id", verifyToken, isResident, getMateriById);

// 🔹 Assignment
router.get("/assignments", verifyToken, isResident, getAssignments);
router.post("/assignment/submit", verifyToken, isResident, submitJawaban);
router.get("/assignment/result", verifyToken, isResident, getHasilKuis);

// 🔹 Nilai
router.get("/nilai", verifyToken, isResident, getNilai);

// 🔹 Tahfidz
router.get("/tahfidz/target", verifyToken, isResident, getTargetHafalan);
router.get("/tahfidz/nilai", verifyToken, isResident, getNilaiTahfidz);

// 🔹 Leaderboard
router.get("/leaderboard", verifyToken, isResident, getLeaderboard);

export default router;
