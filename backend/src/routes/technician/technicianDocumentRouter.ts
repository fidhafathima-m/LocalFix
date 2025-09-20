import express from "express";
import { upload } from "../../config/multer";
import { uploadDocument, getTechnicianDocuments } from "../../controllers/technicians/technicianDocumentsController";

const router = express.Router();

// Single file upload with field name "file"
router.post("/upload", upload.single("file"), uploadDocument);

// Fetch documents by technician
router.get("/:technicianId", getTechnicianDocuments);

export default router;
