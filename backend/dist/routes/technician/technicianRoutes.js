"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const container_1 = require("../../config/container");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = express_1.default.Router();
router.use(authMiddleware_1.serviceProvider);
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
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
router.post("/start", authMiddleware_1.protect, container_1.technicianApplicationController.startApplication);
router.post("/save-step", authMiddleware_1.protect, uploadFields, container_1.technicianApplicationController.saveStep);
router.get("/:applicationId", authMiddleware_1.protect, container_1.technicianApplicationController.getApplication);
router.post("/submit", authMiddleware_1.protect, container_1.technicianApplicationController.submitApplication);
router.get("/status/:email", container_1.technicianApplicationController.getApplicationStatus);
router.get("/user/applications", authMiddleware_1.protect, container_1.technicianApplicationController.getUserApplications);
router.patch("/:applicationId/resubmit", authMiddleware_1.protect, container_1.technicianApplicationController.resubmitApplication);
router.post("/start-new-after-rejection", authMiddleware_1.protect, container_1.technicianApplicationController.startNewAfterRejection);
router.get("/:applicationId/edit", authMiddleware_1.protect, container_1.technicianApplicationController.getApplicationForEdit);
exports.default = router;
