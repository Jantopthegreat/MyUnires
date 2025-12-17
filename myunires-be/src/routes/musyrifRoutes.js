import express from "express";
import multer from "multer";
import {
  getAllResidents,
  getAllUsroh,
  getAllLantai,
  importResidentsFromExcel,
  getResidentsByMusyrif,
  getAllNilaiTahfidzByMusyrif,
  getAllNilaiTahfidzDetail,
  getNilaiTahfidzByResident,
  createOrUpdateNilaiTahfidz,
  importTahfidzFromExcel,
  getTargetHafalan,
  getMateri,
  getAllAssignments,
  getAssignmentById,
  createAssignment,
  uploadAssignmentImage,
  updateAssignment,
  deleteAssignment,
  getAllMateri,
  getAllKategoriMateri,
} from "../controllers/musyrifController.js";
import { verifyToken, isMusyrif } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Setup multer untuk upload Excel
const storage = multer.memoryStorage();
const upload = multer({ storage });

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
  }
});

// ===== RESIDENT ROUTES =====
// Get all residents (dengan filter)
router.get("/residents/all", verifyToken, isMusyrif, getAllResidents);

// Get residents by musyrif (lantai binaan)
router.get("/residents", verifyToken, isMusyrif, getResidentsByMusyrif);

// Import dari Excel
router.post("/residents/import", verifyToken, isMusyrif, upload.single("file"), importResidentsFromExcel);

// ===== DROPDOWN DATA =====
router.get("/usroh", verifyToken, isMusyrif, getAllUsroh);
router.get("/lantai", verifyToken, isMusyrif, getAllLantai);
router.get("/target-hafalan", verifyToken, isMusyrif, getTargetHafalan); // Daftar target hafalan

// ===== NILAI TAHFIDZ =====
router.get("/tahfidz", verifyToken, isMusyrif, getAllNilaiTahfidzByMusyrif); // Agregat: 1 resident = 1 baris (untuk tabel utama)
router.get("/tahfidz/detail", verifyToken, isMusyrif, getAllNilaiTahfidzDetail); // Detail: 1 nilai = 1 baris (untuk revisi)
router.get("/tahfidz/:residentId", verifyToken, isMusyrif, getNilaiTahfidzByResident);
router.post("/tahfidz", verifyToken, isMusyrif, createOrUpdateNilaiTahfidz);
router.post("/tahfidz/import", verifyToken, isMusyrif, upload.single("file"), importTahfidzFromExcel); // Import Excel

// ===== MATERI =====
router.get("/materi", verifyToken, isMusyrif, getMateri);
router.get("/materi/all", verifyToken, isMusyrif, getAllMateri); // Untuk dropdown (support filter kategori)
router.get("/kategori", verifyToken, isMusyrif, getAllKategoriMateri); // Untuk dropdown kategori

// ===== ASSIGNMENT =====
router.get("/assignments", verifyToken, isMusyrif, getAllAssignments); // Get all dengan search
router.get("/assignments/:id", verifyToken, isMusyrif, getAssignmentById); // Get detail
router.post("/assignments", verifyToken, isMusyrif, createAssignment); // Create
router.post("/assignments/upload", verifyToken, isMusyrif, uploadAssignmentFile.single('file'), uploadAssignmentImage);
router.put("/assignments/:id", verifyToken, isMusyrif, updateAssignment); // Update
router.delete("/assignments/:id", verifyToken, isMusyrif, deleteAssignment); // Delete

export default router;
