  // src/controllers/technicianApplicationController.ts
  import { Request, Response } from "express";
  import { TechnicianApplication } from "../../models/Technician/TechnicianApplicationSchema";
  import { TechnicianDocument } from "../../models/Technician/TechnicianDocumentSchema";
  import OTPVerificationSchema from "../../models/OTPVerificationSchema";
  import { sendOTP } from "../../utils/sendOTP";
  import { generateOTP } from "../../utils/generateOTP";
  import bcrypt from 'bcrypt'
  import { AuthRequest } from "../../middleware/authMiddleware";
  import { Technician } from "../../models/Technician/TechnicianSchema";

  // STEP names to validate
  const STEPS = [
    "Personal Information",
    "Identity & Verification",
    "Skills & Services",
    "Work Experience",
    "Availability",
    "Banking Details",
    "Background Check",
    "Review & Submit",
  ];

  // Start a new application (draft)
  export const startApplication = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone } = req.body;

      if (!phone) {
        res.status(400).json({ message: "Phone number is required" });
        return;
      }

      let application = await TechnicianApplication.findOne({ phone });
      if (!application) {
        application = new TechnicianApplication({
          phone,
          status: "draft",
          stepsCompleted: [],
        });
        console.log("Saving new application...");
        await application.save();
      }

      res.json({
        message: "Application started",
        applicationId: application._id,
      });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };


  // Create or update draft
  export const saveStep = async (req: Request, res: Response): Promise<void> => {
    try {
      const { step, applicationId } = req.body;

      if (!STEPS.includes(step)) {
        res.status(400).json({ message: "Invalid step" });
        return;
      }

      let application = await TechnicianApplication.findById(applicationId);
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }

      // handle files
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };

      switch (step) {
        case "Personal Information":
          application.personal = req.body;
          if (files?.profilePhoto) {
            const file = files.profilePhoto[0];
            application.personal.profilePhoto = `/uploads/${file.filename}`;

            await TechnicianDocument.create({
              applicationId: application._id,
              type: "other",
              fileUrl: `/uploads/${file.filename}`,
              metadata: { originalName: file.originalname },
            });
          }
          break;

        case "Identity & Verification":
          application.identity = req.body;
          if (files?.idProof) {
            const file = files.idProof[0];
            application.identity.idProof = `/uploads/${file.filename}`;

            await TechnicianDocument.create({
              applicationId: application._id,
              type: "idProof",
              fileUrl: `/uploads/${file.filename}`,
              metadata: { originalName: file.originalname },
            });
          }
          if (files?.addressProof) {
            const file = files.addressProof[0];
            application.identity.addressProof = `/uploads/${file.filename}`;

            await TechnicianDocument.create({
              applicationId: application._id,
              type: "addressProof",
              fileUrl: `/uploads/${file.filename}`,
              metadata: { originalName: file.originalname },
            });
          }
          break;

        case "Skills & Services":
          application.skills = req.body;
          break;

        case "Work Experience":
          (application as any).workExperience = req.body;
          if (files?.certifications) {
            const file = files.certifications[0];
            (application as any).workExperience.certifications =
              `/uploads/${file.filename}`;

            await TechnicianDocument.create({
              applicationId: application._id,
              type: "experienceCertificate",
              fileUrl: `/uploads/${file.filename}`,
              metadata: { originalName: file.originalname },
            });
          }
          break;

        case "Availability":
          application.availability = req.body;
          break;

        case "Banking Details":
          application.bank = req.body;
          break;

        case "Background Check":
          if (files?.policeVerification) {
            const file = files.policeVerification[0];
            application.availability.policeVerification =
              `/uploads/${file.filename}`;

            await TechnicianDocument.create({
              applicationId: application._id,
              type: "policeVerification",
              fileUrl: `/uploads/${file.filename}`,
              metadata: { originalName: file.originalname },
            });
          }
          break;

        case "Review & Submit":
          application.agreement = req.body.agreement === "true";
          break;
      }

      if (!application.stepsCompleted.includes(step)) {
        application.stepsCompleted.push(step);
      }

      await application.save();
      res.json({ message: "Step saved", application });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };


  // Final submit
  export const submitApplication = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { technicianId } = req.body;

      const application = await TechnicianApplication.findOne({ technicianId });
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }

      if (application.stepsCompleted.length < STEPS.length) {
        res.status(400).json({ message: "All steps must be completed" });
        return;
      }

      const previousStatus = application.status;
      application.status = "submitted";
      application.submittedAt = new Date();
      application.lastSubmittedAt = new Date();
      if (previousStatus === "rejected") {
        application.resubmittedCount += 1;
      }

      await application.save();
      res.json({ message: "Application submitted successfully", application });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  // Admin review
  export const reviewApplication = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    try {
      const { applicationId, status, notes, rejectionReason } = req.body;

      const application = await TechnicianApplication.findById(applicationId);
      if (!application) {
        res.status(404).json({ message: "Application not found" });
        return;
      }

      if (!["approved", "rejected", "under_review"].includes(status)) {
        res.status(400).json({ message: "Invalid status" });
        return;
      }

      application.status = status;
      if (status === "rejected") {
        application.rejectionReason = rejectionReason;
      } else {
        application.reviewNotes = notes;
      }

      await application.save();
      res.json({ message: "Application reviewed", application });
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  export const sendApplicationOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone } = req.body;
      if (!phone) {
        res.status(400).json({ message: "Phone number is required" });
        return;
      }
     
      const otp = generateOTP();  
      const otpHash = await bcrypt.hash(otp, 10);

      await OTPVerificationSchema.create({
        phone,
        otpHash,
        purpose: "application", 
        expiresAt: new Date(Date.now() + 5 * 60 * 1000),
      });

      await sendOTP(phone, otp);

      res.json({ message: "OTP sent to phone." });

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  export const verifyApplicationOtp = async (req: Request, res: Response): Promise<void> => {
    try {
      const { phone, otp } = req.body;
      if (!phone || !otp) {
        res.status(400).json({ message: "Phone and OTP are required" });
        return;
      }

      const record = await OTPVerificationSchema.findOne({ phone, purpose: "application" }).sort({ createdAt: -1 });
      if (!record) {
        res.status(400).json({ message: "No OTP request found" });
        return;
      }

      if (record.expiresAt < new Date()) {
        res.status(400).json({ message: "OTP expired!" });
        return;
      }

      const isMatch = await bcrypt.compare(otp, record.otpHash);
      if (!isMatch) {
        res.status(400).json({ message: "Invalid OTP" });
        return;
      }


      // clean up old OTPs
      await OTPVerificationSchema.deleteMany({ phone, purpose: "application" });

      res.json({ message: "OTP verified successfully" });

    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

export const getTechnicianApplication = async(req: Request, res: Response): Promise<void> => {
  try {
    const application = await TechnicianApplication.findById(req.params.applicationId);
    if (!application) {
      res.status(404).json({ message: "Application not found" });
    }
    res.json({ application });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
