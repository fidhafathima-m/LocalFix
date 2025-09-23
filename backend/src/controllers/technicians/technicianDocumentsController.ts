import { Request, Response } from "express";
import { TechnicianDocument } from "../../models/Technician/TechnicianDocumentSchema";

// Upload a document
export const uploadDocument = async (req: Request, res: Response): Promise<void> => {
  try {
    const { technicianId, type } = req.body;

    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }

    const newDoc = await TechnicianDocument.create({
      technicianId,
      type,
      fileUrl: `/uploads/${req.file.filename}`, 
      metadata: {
        originalName: req.file.originalname,
        size: req.file.size,
        mimeType: req.file.mimetype,
      },
    });

    res.json({ message: "File uploaded successfully", document: newDoc });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get documents of a technician
export const getTechnicianDocuments = async (req: Request, res: Response): Promise<void> => {
  try {
    const { technicianId } = req.params;
    const docs = await TechnicianDocument.find({ technicianId });
    res.json(docs);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
