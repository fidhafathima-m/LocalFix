// In your technicianProfileRoutes.ts
import { technicianProfileController } from "../../config/container";
import { serviceProvider } from "../../middleware/authMiddleware";
import { Router } from "express";

const router = Router();

console.log('🔧 Technician Profile Routes: Setting up middleware and routes');

router.use(serviceProvider);

console.log('🔧 Technician Profile Routes: Adding GET / route');
router.get("/", technicianProfileController.getProfile);

console.log('🔧 Technician Profile Routes: Adding other routes...');
router.put("/personal-info", technicianProfileController.updatePersonalInfo);
router.put("/identity-verification", technicianProfileController.updateIdentityVerification);
router.put("/skills-services", technicianProfileController.updateSkillsServices);
router.put("/availability", technicianProfileController.updateAvailability);
router.put("/bank-payment", technicianProfileController.updateBankPayment);
router.put("/password", technicianProfileController.updatePassword);
router.post("/documents", technicianProfileController.uploadDocument);

console.log('🔧 Technician Profile Routes: All routes configured');

export default router;