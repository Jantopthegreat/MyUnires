import express from "express";
import multer from "multer";
import {
  getResidentsByAsisten,
  getAllNilaiTahfidzByAsisten,
  getNilaiTahfidzByResident,
  createOrUpdateNilaiTahfidz,
  getMateri,
  getAllKategoriMateri,
  getAllUsroh,
  getAllTargetHafalan,
  // assignment handlers re-exported
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  updateAssignment,
  deleteAssignment,
  uploadAssignmentImage,
} from "../controllers/asistenMusyrifController.js";
import { verifyToken, isAsisten } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Setup multer untuk upload assignment images dengan preservasi filename
const assignmentFileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/assignments/');
  },
  filename: (req, file, cb) => {
    // Preserve original filename dengan extension
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});
const uploadAssignmentFile = multer({ 
  storage: assignmentFileStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

// Resident binaan
router.get("/residents", verifyToken, isAsisten, getResidentsByAsisten);

// Nilai Tahfidz
router.get("/tahfidz/detail", verifyToken, isAsisten, getAllNilaiTahfidzByAsisten);
router.get("/tahfidz/:residentId", verifyToken, isAsisten, getNilaiTahfidzByResident);
router.post("/tahfidz", verifyToken, isAsisten, createOrUpdateNilaiTahfidz);

// Materi (read-only)
router.get("/materi", verifyToken, isAsisten, getMateri);

// Kategori materi (untuk dropdown)
router.get("/kategori", verifyToken, isAsisten, getAllKategoriMateri);

// Usroh list (untuk dropdown filter)
router.get("/usroh", verifyToken, isAsisten, getAllUsroh);

// Target Hafalan list (untuk dropdown)
router.get("/target-hafalan", verifyToken, isAsisten, getAllTargetHafalan);

// ===== ASSIGNMENT (Asisten Musyrif CRUD) =====
router.get("/assignments", verifyToken, isAsisten, getAllAssignments);
router.get("/assignments/:id", verifyToken, isAsisten, getAssignmentById);
router.post("/assignments", verifyToken, isAsisten, createAssignment);
router.put("/assignments/:id", verifyToken, isAsisten, updateAssignment);
router.delete("/assignments/:id", verifyToken, isAsisten, deleteAssignment);
router.post("/assignments/upload", verifyToken, isAsisten, uploadAssignmentFile.single('file'), uploadAssignmentImage);

export default router;
