import express from "express";
import multer from "multer";
import {
  getAllResident,
  getResidentById,
  createResident,
  updateResident,
  deleteResident,
  importResident,
  getAllAsistenMusyrif,
  getAsistenMusyrifById,
  createAsistenMusyrif,
  updateAsistenMusyrif,
  deleteAsistenMusyrif,
  importAsistenMusyrif,
  getAllMusyrif,
  getMusyrifById,
  createMusyrif,
  updateMusyrif,
  deleteMusyrif,
  importMusyrif,
  getAllGedung,
  createGedung,
  updateGedung,
  deleteGedung,
  getAllLantai,
  createLantai,
  updateLantai,
  deleteLantai,
  getAllUsroh,
  createUsroh,
  updateUsroh,
  deleteUsroh,
  getAllMateri,
  createMateri,
  updateMateri,
  deleteMateri,
  getAllTargetHafalan,
  getTargetHafalanById,
  createTargetHafalan,
  updateTargetHafalan,
  deleteTargetHafalan,
  getAllSubTarget,
  getSubTargetById,
  createSubTarget,
  updateSubTarget,
  deleteSubTarget,


} from "../controllers/adminController.js";
import { verifyToken, isAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// ✅ CRUD Resident
router.get("/resident", verifyToken, isAdmin, getAllResident);
router.get("/resident/:id", verifyToken, isAdmin, getResidentById);
router.post("/resident", verifyToken, isAdmin, createResident);
router.put("/resident/:id", verifyToken, isAdmin, updateResident);
router.delete("/resident/:id", verifyToken, isAdmin, deleteResident);
router.post("/resident/import", verifyToken, isAdmin, upload.single("file"), importResident);

// ✅ CRUD Asisten Musyrif
router.get("/asisten", verifyToken, isAdmin, getAllAsistenMusyrif);
router.get("/asisten/:id", verifyToken, isAdmin, getAsistenMusyrifById);
router.post("/asisten", verifyToken, isAdmin, createAsistenMusyrif);
router.put("/asisten/:id", verifyToken, isAdmin, updateAsistenMusyrif);
router.delete("/asisten/:id", verifyToken, isAdmin, deleteAsistenMusyrif);
router.post("/asisten/import", verifyToken, isAdmin, upload.single("file"), importAsistenMusyrif);

// ✅ CRUD  Musyrif
router.get("/musyrif", verifyToken, isAdmin, getAllMusyrif);
router.get("/musyrif/:id", verifyToken, isAdmin, getMusyrifById);
router.post("/musyrif", verifyToken, isAdmin, createMusyrif);
router.put("/musyrif/:id", verifyToken, isAdmin, updateMusyrif);
router.delete("/musyrif/:id", verifyToken, isAdmin, deleteMusyrif);
router.post("/musyrif/import", verifyToken, isAdmin, upload.single("file"), importMusyrif);

// ✅ CRUD Gedung
router.get("/gedung", verifyToken, isAdmin, getAllGedung);
router.post("/gedung", verifyToken, isAdmin, createGedung);
router.put("/gedung/:id", verifyToken, isAdmin, updateGedung);
router.delete("/gedung/:id", verifyToken, isAdmin, deleteGedung);

// ✅ CRUD Lantai
router.get("/lantai", verifyToken, isAdmin, getAllLantai);
router.post("/lantai", verifyToken, isAdmin, createLantai);
router.put("/lantai/:id", verifyToken, isAdmin, updateLantai);
router.delete("/lantai/:id", verifyToken, isAdmin, deleteLantai);

// ✅ CRUD Usroh
router.get("/usroh", verifyToken, isAdmin, getAllUsroh);
router.post("/usroh", verifyToken, isAdmin, createUsroh);
router.put("/usroh/:id", verifyToken, isAdmin, updateUsroh);
router.delete("/usroh/:id", verifyToken, isAdmin, deleteUsroh);

// ✅ CRUD Materi
const uploadMateri = multer({ dest: "uploads/materi/" });
router.get("/materi", verifyToken, isAdmin, getAllMateri);
router.post("/materi", verifyToken, isAdmin, uploadMateri.single("file"), createMateri);
router.put("/materi/:id", verifyToken, isAdmin, uploadMateri.single("file"), updateMateri);
router.delete("/materi/:id", verifyToken, isAdmin, deleteMateri);

// ✅ CRUD Tahfidz - Target Hafalan
router.get("/target-hafalan", verifyToken, isAdmin, getAllTargetHafalan);
router.get("/target-hafalan/:id", verifyToken, isAdmin, getTargetHafalanById);
router.post("/target-hafalan", verifyToken, isAdmin, createTargetHafalan);
router.put("/target-hafalan/:id", verifyToken, isAdmin, updateTargetHafalan);
router.delete("/target-hafalan/:id", verifyToken, isAdmin, deleteTargetHafalan);

// ✅ CRUD Tahfidz - SubTarget
router.get("/subtarget", verifyToken, isAdmin, getAllSubTarget);
router.get("/subtarget/:id", verifyToken, isAdmin, getSubTargetById);
router.post("/subtarget", verifyToken, isAdmin, createSubTarget);
router.put("/subtarget/:id", verifyToken, isAdmin, updateSubTarget);
router.delete("/subtarget/:id", verifyToken, isAdmin, deleteSubTarget);


export default router;
