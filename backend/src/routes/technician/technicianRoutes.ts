import express from "express";
import multer from "multer";
import { technicianApplicationController } from "../../config/container";
import { protect } from "../../middleware/authMiddleware";

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith("image/") ||
      file.mimetype === "application/pdf"
    ) {
      cb(null, true);
    } else {
      cb(new Error("Only images and PDF files are allowed"));
    }
  },
});

// Define fields for file uploads
const uploadFields = upload.fields([
  { name: "profilePhoto", maxCount: 1 },
  { name: "idProof", maxCount: 1 },
  { name: "addressProof", maxCount: 1 },
  { name: "certifications", maxCount: 1 },
  { name: "policeVerification", maxCount: 1 },
  { name: "tradeLicense", maxCount: 1 },
  { name: "passportPhoto", maxCount: 1 },
]);

// Application routes
router.post(
  "/start",
  protect,
  technicianApplicationController.startApplication
);
router.post(
  "/save-step",
  protect,
  uploadFields,
  technicianApplicationController.saveStep
);
router.get(
  "/:applicationId",
  protect,
  technicianApplicationController.getApplication
);
router.post(
  "/submit",
  protect,
  technicianApplicationController.submitApplication
);
router.get(
  "/status/:email",
  technicianApplicationController.getApplicationStatus
);
router.get(
  "/user/applications",
  protect,
  technicianApplicationController.getUserApplications
);
router.patch(
  "/:applicationId/resubmit",
  protect,
  technicianApplicationController.resubmitApplication
);
router.post(
  "/start-new-after-rejection",
  protect,
  technicianApplicationController.startNewAfterRejection
);
router.get(
  "/:applicationId/edit",
  protect,
  technicianApplicationController.getApplicationForEdit
);

export default router;
