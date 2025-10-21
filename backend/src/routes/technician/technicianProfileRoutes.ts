import { technicianProfileController } from "../../config/container";
import { serviceProvider } from "../../middleware/authMiddleware";
import { Router } from "express";

const router = Router();

router.use(serviceProvider);

router.get("/", technicianProfileController.getProfile);

router.put("/personal-info", technicianProfileController.updatePersonalInfo);
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
router.post("/documents", technicianProfileController.uploadDocument);

export default router;
