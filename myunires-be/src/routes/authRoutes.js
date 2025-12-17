import express from "express";
import { login, logout, activateAccount, resendActivation,testEmail } from "../controllers/authController.js";

const router = express.Router();

router.post("/login", login);
router.post("/logout", logout);
router.post("/activate", activateAccount);
router.post("/resend-activation", resendActivation);
router.post("/test-email", testEmail);




export default router;
