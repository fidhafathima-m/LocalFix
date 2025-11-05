import { technicianProfileController } from "../../config/container";
import { serviceProvider } from "../../middleware/authMiddleware";
import { Router } from "express";
import multer from "multer";

const router = Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
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

router.use(serviceProvider);

router.get("/", technicianProfileController.getProfile);

router.put("/personal-info", technicianProfileController.updatePersonalInfo);
router.post(
  "/upload-photo",
  upload.single("profilePicture"),
  technicianProfileController.uploadPhoto
);
router.put(
  "/identity-verification",
  technicianProfileController.updateIdentityVerification
);
router.put(
  "/skills-services",
  technicianProfileController.updateSkillsServices
);
router.put("/availability", technicianProfileController.updateAvailability);
router.put("/bank-payment", technicianProfileController.updateBankPayment);
router.put("/password", technicianProfileController.updatePassword);
router.post(
  "/upload-document",
  upload.single("document"),
  technicianProfileController.uploadDocument
);

router.get("/slot-rules", technicianProfileController.getSlotRules);
router.get(
  "/technician-availability",
  technicianProfileController.getTechnicianAvailability
);

export default router;
