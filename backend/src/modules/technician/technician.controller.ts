import { Request, Response } from 'express';
import { ITechnicianApplication, TechnicianApplication } from './schemas/TechnicianApplicationSchema';
import { TechnicianDocument } from './schemas/TechnicianDocumentSchema';
import User from '../user/user.model';
import { uploadToCloudinary } from '../../core/utils/cloudinary'
import {
  StartApplicationRequest,
  SaveStepRequest,
  SubmitApplicationRequest,
  ApiResponse
} from './types/technicianApplication';
import mongoose from 'mongoose';
import { Technician } from './schemas/TechnicianSchema';
import { AuthRequest } from '@/middleware/authMiddleware';

export const startApplication = async (req: Request<{}, {}, StartApplicationRequest>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { email, userId } = req.body;

    console.log("Starting application for email:", email, "user:", userId);

    if (!email) {
      res.status(400).json({
        message: 'Email is required'
      });
      return;
    }

    if (!userId) {
      res.status(400).json({
        message: 'User ID is required'
      });
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400).json({
        message: 'Please provide a valid email address'
      });
      return;
    }

    // Check if user already has ANY application 
    console.log("🔍 Checking for existing applications for user:", userId);
    
    const existingUserApplication = await TechnicianApplication.findOne({
      technicianId: new mongoose.Types.ObjectId(userId),
      status: { $in: ['draft', 'submitted', 'under_review', 'approved'] }
    });

    console.log("🔍 Existing application found:", existingUserApplication);
    
    if (existingUserApplication) {
      const appStatus = (existingUserApplication as any).status;
      const appTechnicianId = (existingUserApplication as any).technicianId?.toString();
      
      console.log("🔍 Existing application status:", appStatus);
      console.log("🔍 Existing application technicianId:", appTechnicianId);
      console.log("🔍 Existing application _id:", (existingUserApplication as any)._id?.toString());
      
      // If application is submitted or under review, redirect to pending dashboard
      if (appStatus === 'submitted' || appStatus === 'under_review') {
        res.status(200).json({
          message: 'Application already submitted',
          data: { 
            applicationId: (existingUserApplication as any)._id.toString(),
            redirectTo: '/pending-technician/dashboard'
          }
        });
        return;
      }
      
      // If application is approved, redirect to technician dashboard
      if (appStatus === 'approved') {
        res.status(200).json({
          message: 'Application already approved',
          data: { 
            applicationId: (existingUserApplication as any)._id.toString(),
            redirectTo: '/technician/dashboard'
          }
        });
        return;
      }
      
      // If it's a draft, return the existing application
      res.status(200).json({
        message: 'Draft application found',
        data: { 
          applicationId: (existingUserApplication as any)._id.toString(),
          redirectTo: null // Continue with draft
        }
      });
      return;
    }

    // Check if email is already registered to different user
    const existingEmailApplication = await TechnicianApplication.findOne({
      email: email.toLowerCase().trim(),
      status: { $in: ['draft', 'submitted', 'under_review', 'approved'] }
    });

    if (existingEmailApplication) {
      const existingAppTechnicianId = (existingEmailApplication as any).technicianId?.toString();
      
      // Email already used by someone else
      if (existingAppTechnicianId && existingAppTechnicianId !== userId) {
        res.status(400).json({
          message: 'Email already has an application in progress by another user'
        });
        return;
      }
    }

    //  Create new application only if no existing application found
    const application = new TechnicianApplication({
      email: email.toLowerCase().trim(),
      technicianId: new mongoose.Types.ObjectId(userId),
      status: 'draft',
      stepsCompleted: [],
      personal: {},
      identity: {},
      skills: {},
      availability: {},
      bank: {},
      documents: {},
      agreement: false
    });

    await application.save();
    console.log("Created new application with ID:", application._id);

    res.status(200).json({
      message: 'Application started successfully',
      data: { 
        applicationId: application._id.toString(),
        redirectTo: null
      }
    });

  } catch (error) {
    console.error('Start application error:', error);
    res.status(500).json({
      message: 'Failed to start application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
export const saveStep = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    console.log("🔵 === SAVE STEP REQUEST STARTED ===");
    console.log("📦 Request body keys:", Object.keys(req.body));
    console.log("📦 applicationId:", req.body.applicationId);
    console.log("📦 step:", req.body.step);
    console.log("📦 agreement value:", req.body.agreement, "Type:", typeof req.body.agreement);
    console.log("📁 Files received:", req.files ? Object.keys(req.files) : 'No files');

    const { applicationId, step, ...stepData } = req.body;
    
    if (!applicationId || !step) {
      console.log("❌ Missing applicationId or step");
      res.status(400).json({
        message: 'Application ID and step are required'
      });
      return;
    }

    console.log("🔍 Looking for application in database...");
    const application = await TechnicianApplication.findById(applicationId);
    if (!application) {
      console.log("❌ Application not found:", applicationId);
      res.status(404).json({
        message: 'Application not found'
      });
      return;
    }
    console.log("✅ Application found");

    console.log("🔧 Processing step data...");
    const processedStepData = { ...stepData };
    
    const jsonFields = ['availability', 'services', 'languages', 'serviceAreas'];
    jsonFields.forEach(field => {
      if ((processedStepData as any)[field] && typeof (processedStepData as any)[field] === 'string') {
        try {
          (processedStepData as any)[field] = JSON.parse((processedStepData as any)[field]);
          console.log(`✅ Parsed JSON field: ${field}`);
        } catch (e) {
          console.log(`⚠️  Could not parse ${field}, keeping as string`);
        }
      }
    });

if (step === 'Documents') {
  console.log("🎯 Processing Documents step with file uploads");
  
  if (!application.documents || typeof application.documents !== 'object') {
    application.documents = {};
  }
  
  const documents: any = application.documents;
  
  const documentFields = ['idProof', 'addressProof', 'policeVerification', 'passportPhoto', 'profilePhoto'];
  
  for (const field of documentFields) {
    if (req.files && (req.files as any)[field]) {
      const file = (req.files as any)[field];
      console.log(`📄 Processing ${field} file:`, file);
      
      try {
        let fileToUpload;
        if (Array.isArray(file)) {
          fileToUpload = file[0];
        } else {
          fileToUpload = file;
        }
        
        // Upload to Cloudinary
        console.log(`☁️ Uploading ${field} to Cloudinary...`);
        const uploadResult = await uploadToCloudinary(fileToUpload);
        
        if (uploadResult && uploadResult.secure_url) {
          documents[field] = {
            url: uploadResult.secure_url,
            publicId: uploadResult.public_id,
            filename: fileToUpload.originalname,
            mimetype: fileToUpload.mimetype,
            size: fileToUpload.size,
            uploadedAt: new Date(),
            verified: false
          };
          console.log(`✅ ${field} uploaded successfully:`, uploadResult.secure_url);
        } else {
          console.log(`❌ ${field} upload failed:`, uploadResult);
        }
      } catch (uploadError) {
        console.error(`❌ Error uploading ${field}:`, uploadError);
      }
    } else {
      console.log(`📝 No file uploaded for ${field}`);
    }
  }
  
  // Update the application documents
  application.documents = documents;
  console.log("📂 Final documents object:", application.documents);
  
  if (!application.stepsCompleted.includes(step)) {
    application.stepsCompleted.push(step);
    console.log(`✅ Added '${step}' to completed steps`);
  }
}
    // SPECIAL HANDLING FOR AGREEMENT & CONSENT STEP
    else if (step === 'Agreement & Consent') {
      console.log("🎯 Processing Agreement & Consent step");
      
      if (processedStepData.agreement !== undefined) {
        const agreementValue = processedStepData.agreement === 'true' || processedStepData.agreement === true;
        console.log(`📝 Setting agreement to: ${agreementValue}`);
        application.agreement = agreementValue;
        
        // Remove agreement from processedStepData so it doesn't get saved to the wrong place
        delete processedStepData.agreement;
      }
      
      if (!application.stepsCompleted.includes(step)) {
        application.stepsCompleted.push(step);
        console.log(`✅ Added '${step}' to completed steps`);
      }
    } 
    // SPECIAL HANDLING FOR REVIEW & SUBMIT STEP
    else if (step === 'Review & Submit') {
      console.log("🎯 Processing Review & Submit step");
      
      // For Review & Submit step, just mark it as completed without changing agreement
      if (!application.stepsCompleted.includes(step)) {
        application.stepsCompleted.push(step);
        console.log(`✅ Added '${step}' to completed steps`);
      }
      
      console.log("⏭️  Skipping data processing for Review & Submit step");
    }
    // HANDLE ALL OTHER STEPS
    else {
      const stepMapping: Record<string, keyof ITechnicianApplication> = {
        'Personal Information': 'personal',
        'Identity & Verification': 'identity',
        'Skills & Services': 'skills',
        'Availability & Work Preferences': 'availability',
        'Banking Details': 'bank'
      };

      const applicationField = stepMapping[step];
      console.log(`🎯 Step '${step}' maps to field: ${applicationField}`);

      if (applicationField) {
        console.log(`📝 Updating application field: ${applicationField}`);
        const currentData = application[applicationField] as Record<string, any> || {};
        const newData = {
          ...currentData,
          ...processedStepData
        };
        
        console.log(`📊 Data to save:`, Object.keys(newData));
        application.set(applicationField, newData);
      }

      if (!application.stepsCompleted.includes(step)) {
        application.stepsCompleted.push(step);
        console.log(`✅ Added '${step}' to completed steps`);
      }
    }

    console.log("💾 Saving to database...");
    await application.save();
    console.log("✅ Application saved successfully!");

    res.status(200).json({
      message: 'Step saved successfully',
      data: { application: { _id: application._id, stepsCompleted: application.stepsCompleted } }
    });
    console.log("🟢 === SAVE STEP COMPLETED SUCCESSFULLY ===");
    
  } catch (error) {
    console.error("❌ Save step error:", error);
    
    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Validation errors:", error.errors);
    }
    if (error instanceof mongoose.Error.CastError) {
      console.error("Cast error - invalid ID format?");
    }

    res.status(500).json({
      message: 'Failed to save step',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
export const getApplication = async (req: Request<{ applicationId: string }>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { applicationId } = req.params;
    

    const application = await TechnicianApplication.findById(applicationId);
    if (!application) {
      res.status(404).json({
        message: 'Application not found'
      });
      return;
    }

    console.log("🔍 Raw application documents from DB:", application.documents);

    const getDocumentStatus = (docField: string) => {
      if (!application.documents || typeof application.documents !== 'object') {
        return { verified: false, submitted: false };
      }
      
      const doc = (application.documents as any)[docField];
      console.log(`🔍 ${docField} raw data:`, doc);
      
      let hasDocument = false;
      let isVerified = false;
      
      if (doc) {
        // Case 1: If it's a string (file URL/path) and not empty
        if (typeof doc === 'string' && doc.trim().length > 0 && doc !== 'null' && doc !== 'undefined') {
          hasDocument = true;
        }
        // Case 2: If it's an object with url/path property
        else if (typeof doc === 'object' && doc !== null) {
          // Check if it has a URL property
          if (doc.url && typeof doc.url === 'string' && doc.url.trim().length > 0) {
            hasDocument = true;
          }
          // Check if it has a path property  
          else if (doc.path && typeof doc.path === 'string' && doc.path.trim().length > 0) {
            hasDocument = true;
          }
          // Check if it's a file object with name/size
          else if (doc.name || doc.size) {
            hasDocument = true;
          }
          // Check if it has any properties (might be stored as object with metadata)
          else if (Object.keys(doc).length > 0) {
            hasDocument = true;
          }
        }
        // Case 3: If it's an array with files
        else if (Array.isArray(doc) && doc.length > 0) {
          hasDocument = true;
        }
        
        isVerified = doc.verified === true;
      }
      
      console.log(`✅ ${docField} - hasDocument: ${hasDocument}, verified: ${isVerified}`);
      
      return {
        verified: isVerified,
        submitted: hasDocument
      };
    };

    const applicationData = {
      _id: application._id,
      email: application.email,
      status: application.status,
      stepsCompleted: application.stepsCompleted,
      personal: application.personal || {},
      identity: application.identity || {},
      skills: application.skills || {},
      availability: application.availability || {},
      bank: application.bank || {},
      documents: {
        idProof: getDocumentStatus('idProof'),
        addressProof: getDocumentStatus('addressProof'),
        policeVerification: getDocumentStatus('policeVerification'),
        passportPhoto: getDocumentStatus('passportPhoto')
      },
      agreement: application.agreement,
      submittedAt: application.submittedAt,
      reviewNotes: application.reviewNotes,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };

    console.log("📄 Final document status:", applicationData.documents);

    res.status(200).json({
      message: 'Application retrieved successfully',
      data: { application: applicationData }
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      message: 'Failed to retrieve application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const submitApplication = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { applicationId } = req.body;
    const userId = req.user?.id;

    console.log("🚀 Submitting application:", applicationId, "for user:", userId);

     if (!userId) {
      console.log("❌ No user ID in request");
      res.status(401).json({
        message: 'Authentication required'
      });
      return;
    }

    const application = await TechnicianApplication.findById(applicationId);
    if (!application) {
      res.status(404).json({
        message: 'Application not found'
      });
      return;
    }

    console.log("🔍 Application technicianId:", application.technicianId?.toString());
    console.log("🔍 Current userId:", userId);

    // Ownership validation
    if (!application.technicianId) {
      console.log("❌ Application has no technicianId assigned");
      res.status(403).json({
        message: 'Application ownership not established'
      });
      return;
    }

    if (application.technicianId.toString() !== userId) {
      console.log(`❌ Access denied: Application ${applicationId} belongs to ${application.technicianId}, but user is ${userId}`);
      res.status(403).json({
        message: 'Access denied - application does not belong to current user'
      });
      return;
    }

    // Check if application already submitted
    if (application.status !== 'draft') {
      res.status(400).json({
        message: 'Application has already been submitted'
      });
      return;
    }

    // Validate all required steps are completed 
    const requiredSteps = [
      'Personal Information',
      'Identity & Verification',
      'Skills & Services',
      'Availability & Work Preferences',
      'Banking Details',
      'Documents',
      'Agreement & Consent',
    ];

    const missingSteps = requiredSteps.filter(step => 
      !application.stepsCompleted.includes(step)
    );

    if (missingSteps.length > 0) {
      res.status(400).json({
        message: 'Please complete all steps before submitting',
        missingSteps
      });
      return;
    }

    let user = await User.findById(userId);
    
    if (!user) {
      res.status(404).json({
        message: 'User not found'
      });
      return;
    }

    // Update user email if it's different
    if (application.email && user.email !== application.email) {
      user.email = application.email;
    }

    if (user.role !== 'serviceProvider') {
      user.role = 'serviceProvider';
    }

    user.applicationStatus = 'submitted'
    await user.save();
    console.log("✅ Updated user role to serviceProvider");

    let technician = await Technician.findOne({ userId: user._id });
    
    if (!technician) {
      technician = new Technician({
        userId: user._id,
        displayName: application.personal?.fullName || 'Technician',
        bio: application.skills?.bio || '',
        experienceYears: parseInt(application.skills?.yearsOfExperience) || 0,
        services: application.skills?.services || [],
        serviceRates: {},
        workAreas: application.skills?.serviceAreas || [],
        serviceRadiusKm: parseInt(application.skills?.workRadius) || 10,
        currentLocation: {
          type: 'Point',
          coordinates: [0, 0]
        },
        averageRating: 0,
        ratingCount: 0,
        status: 'submitted',
        profilePictureUrl: application.documents?.passportPhoto?.url || '',
      });
      console.log("✅ Created new technician record");
    } else {
      // Update existing technician record
      technician.displayName = application.personal?.fullName || technician.displayName;
      technician.bio = application.skills?.bio || technician.bio;
      technician.experienceYears = parseInt(application.skills?.yearsOfExperience) || technician.experienceYears;
      technician.services = application.skills?.services || technician.services;
      technician.workAreas = application.skills?.serviceAreas || technician.workAreas;
      technician.serviceRadiusKm = parseInt(application.skills?.workRadius) || technician.serviceRadiusKm;
      technician.profilePictureUrl = application.documents?.passportPhoto?.url || technician.profilePictureUrl;
      technician.status = 'submitted';
      console.log("✅ Updated existing technician record");
    }

    await technician.save();
    console.log("✅ Technician record saved:", technician._id);

    application.status = 'submitted';
    application.submittedAt = new Date();

    await application.save();
    console.log("✅ Application submitted successfully");

    res.status(200).json({
      message: 'Application submitted successfully',
      data: { 
        application: application.toObject(),
        technician: technician.toObject(),
        user: { _id: user._id, email: user.email, applicationStatus: user.applicationStatus  } // Return email instead of phone
      }
    });
  } catch (error) {
    console.error('Submit application error:', error);
    res.status(500).json({
      message: 'Failed to submit application',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};
export const getApplicationStatus = async (req: Request<{ applicationId: string }>, res: Response<ApiResponse>): Promise<void> => {
  try {
    const { applicationId } = req.params;

    const application = await TechnicianApplication.findById(applicationId);
    if (!application) {
      res.status(404).json({
        message: 'Application not found'
      });
      return;
    }

    const getDocumentStatus = (docField: string) => {
      if (!application.documents || typeof application.documents !== 'object') {
        return { verified: false, submitted: false };
      }
      
      const doc = (application.documents as any)[docField];
      
      const hasDocument = doc && (
        (typeof doc === 'string' && doc.length > 0) ||
        (typeof doc === 'object' && Object.keys(doc).length > 0) ||
        (Array.isArray(doc) && doc.length > 0)
      );
      
      return {
        verified: hasDocument && (doc.verified || false),
        submitted: hasDocument
      };
    };

    const applicationData = {
      ...application.toObject(),
      documents: {
        idProof: getDocumentStatus('idProof'),
        addressProof: getDocumentStatus('addressProof'),
        policeVerification: getDocumentStatus('policeVerification'),
        passportPhoto: getDocumentStatus('passportPhoto')
      }
    };

    res.status(200).json({
      message: 'Application status retrieved successfully',
      data: { application: applicationData }
    });
  } catch (error) {
    console.error('Get application status error:', error);
    res.status(500).json({
      message: 'Failed to get application status',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};

export const getUserApplications = async (req: AuthRequest, res: Response<ApiResponse>): Promise<void> => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const applications = await TechnicianApplication.find({
      technicianId: new mongoose.Types.ObjectId(userId)
    }).sort({ createdAt: -1 }); // Most recent first

    res.status(200).json({
      message: 'User applications retrieved successfully',
      data: { applications }
    });
  } catch (error) {
    console.error('Get user applications error:', error);
    res.status(500).json({
      message: 'Failed to retrieve user applications',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};