"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTechnicianProfileRoutes = void 0;
const authMiddleware_1 = require("../../middleware/authMiddleware");
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const createTechnicianProfileRoutes = (technicianProfileController) => {
    const router = (0, express_1.Router)();
    const storage = multer_1.default.memoryStorage();
    const upload = (0, multer_1.default)({
        storage: storage,
        limits: {
            fileSize: 5 * 1024 * 1024, // 5MB
        },
        fileFilter: (req, file, cb) => {
            if (file.mimetype.startsWith("image/") ||
                file.mimetype === "application/pdf") {
                cb(null, true);
            }
            else {
                cb(new Error("Only images and PDF files are allowed"));
            }
        },
    });
    router.use(authMiddleware_1.serviceProvider);
    router.get("/", technicianProfileController.getProfile);
    router.put("/personal-info", technicianProfileController.updatePersonalInfo);
    router.post("/upload-photo", upload.single("profilePicture"), technicianProfileController.uploadPhoto);
    router.put("/identity-verification", technicianProfileController.updateIdentityVerification);
    router.put("/skills-services", technicianProfileController.updateSkillsServices);
    router.put("/availability", technicianProfileController.updateAvailability);
    router.put("/bank-payment", technicianProfileController.updateBankPayment);
    router.put("/password", technicianProfileController.updatePassword);
    router.post("/upload-document", upload.single("document"), technicianProfileController.uploadDocument);
    router.get("/slot-rules", technicianProfileController.getSlotRules);
    router.get("/technician-availability", technicianProfileController.getTechnicianAvailability);
    return router;
};
exports.createTechnicianProfileRoutes = createTechnicianProfileRoutes;
exports.default = exports.createTechnicianProfileRoutes;
