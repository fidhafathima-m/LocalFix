// src/routes/technicianApplicationRoutes.ts
import express from "express";
import {
  saveStep,
  submitApplication,
  reviewApplication,
  sendApplicationOtp,
  verifyApplicationOtp,
  startApplication,
  getTechnicianApplication,
} from "../../controllers/technicians/technicianApplicationController";

const router = express.Router();

// Save step (draft progress)
import multer from 'multer';
const upload = multer({ dest: 'uploads/' });

router.post("/start", startApplication);
router.post(
  "/save-step",
  upload.fields([
    { name: "profilePhoto" },
    { name: "idProof" },
    { name: "addressProof" },
    { name: "certifications" },
    { name: "policeVerification" },
    { name: "tradeLicense" },
    { name: "passportPhoto" },
  ]),
  saveStep
);

router.get("/:applicationId", getTechnicianApplication)

// Submit final application
router.post("/submit", submitApplication);

// Admin review
router.post("/review", reviewApplication);

router.post('/send-otp', sendApplicationOtp);
router.post('/verify-otp', verifyApplicationOtp);

export default router;
