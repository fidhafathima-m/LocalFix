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
import { AuthRequest } from '../../middleware/authMiddleware';
import UserAddressSchema from '../../shared/UserAddressSchema';

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

    // In your saveStep function, move this block:
// In your saveStep function, update the "Identity & Verification" section:
if (step === "Identity & Verification") {
  // If address is provided, save to UserAddress collection
  if (processedStepData.address) {
    try {
      console.log("🏠 Processing address data:", processedStepData.address);
      
      // Parse address if it's a string (JSON)
      let addressData = processedStepData.address;
      if (typeof addressData === 'string') {
        try {
          addressData = JSON.parse(addressData);
        } catch (e) {
          console.log("⚠️ Could not parse address as JSON, treating as string");
        }
      }
      
      // Only save if we have valid address data
      if (typeof addressData === 'object' && addressData.street) {
        const userAddress = new UserAddressSchema({
          userId: application.technicianId,
          label: 'Home',
          street: addressData.street || '',
          city: addressData.city || '',
          state: addressData.state || '',
          pincode: addressData.pincode || '',
          landmark: addressData.landmark || '',
          isDefault: true,
          location: {
            type: "Point",
            coordinates: [0, 0]
          }
        });
        
        await userAddress.save();
        console.log("✅ Address saved to UserAddress collection:", userAddress._id);
      } else {
        console.log("⚠️ No valid address data to save");
      }
      
    } catch (error) {
      console.error("❌ Error saving to UserAddress:", error);
      // Don't fail the entire step if address saving fails
    }
  }
  
  // ✅ ADD THIS: Also save the address data to the application's identity field
  // This is what makes the step "complete" for validation
  if (!application.identity) {
    application.identity = {};
  }
  
  // Merge the processed step data with existing identity data
  application.identity = {
    ...application.identity,
    ...processedStepData
  };
  
  console.log("✅ Updated application identity field:", application.identity);
  
  if (!application.stepsCompleted.includes(step)) {
    application.stepsCompleted.push(step);
    console.log(`✅ Added '${step}' to completed steps`);
  }
}

// In your saveStep function, update the document processing section:
else if (step === 'Documents') {
  console.log("🎯 Processing Documents step with file uploads");
  
  if (!application.documents || typeof application.documents !== 'object') {
    application.documents = {};
  }
  
  const documents: any = application.documents;
  
  const documentFields = ['idProof', 'addressProof', 'policeVerification', 'passportPhoto', 'profilePhoto', 'tradeLicense'];
  
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
          // Save to TechnicianApplication.documents
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
          // Even if upload fails, mark the field as attempted but failed
          documents[field] = {
            url: '',
            filename: fileToUpload.originalname,
            uploadedAt: new Date(),
            uploadFailed: true,
            verified: false
          };
        }
      } catch (uploadError) {
        console.error(`❌ Error uploading ${field}:`, uploadError);
        // Mark document as failed but still record the attempt
        documents[field] = {
          url: '',
          filename: file.originalname,
          uploadedAt: new Date(),
          uploadFailed: true,
          error: uploadError instanceof Error ? uploadError.message : String(uploadError),
          verified: false
        };
      }
    } else {
      console.log(`📝 No file uploaded for ${field}`);
      // Keep existing document if it exists, otherwise don't set anything
      if (!documents[field]) {
        documents[field] = {
          url: '',
          uploadedAt: null,
          verified: false
        };
      }
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

// Helper function to save documents to TechnicianDocument collection
const saveToTechnicianDocumentCollection = async (
  technicianId: mongoose.Types.ObjectId | undefined,
  applicationId: mongoose.Types.ObjectId,
  documentType: string,
  fileUrl: string,
  file: any
) => {
  try {
    // Map frontend field names to document types
    const typeMapping: Record<string, string> = {
      'idProof': 'idProof',
      'addressProof': 'addressProof', 
      'policeVerification': 'policeVerification',
      'passportPhoto': 'passportPhoto',
      'profilePhoto': 'profilePhoto',
      'tradeLicense': 'tradeLicense'
    };

    const documentTypeForCollection = typeMapping[documentType] || 'other';

    // Create or update document in TechnicianDocument collection
    const technicianDocument = new TechnicianDocument({
      technicianId: technicianId,
      applicationId: applicationId,
      type: documentTypeForCollection,
      fileUrl: fileUrl,
      status: 'submitted',
      uploadedAt: new Date(),
      metadata: {
        originalName: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        fieldName: documentType
      }
    });

    await technicianDocument.save();
    console.log(`✅ Saved ${documentType} to TechnicianDocument collection:`, technicianDocument._id);
    
    return technicianDocument;
  } catch (error) {
    console.error(`❌ Error saving ${documentType} to TechnicianDocument collection:`, error);
    throw error;
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

    // Return the raw documents object as-is - NO PROCESSING!
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
      documents: application.documents || {}, // Return raw documents directly
      agreement: application.agreement,
      submittedAt: application.submittedAt,
      reviewNotes: application.reviewNotes,
      createdAt: application.createdAt,
      updatedAt: application.updatedAt
    };

    console.log("📄 Final application data with raw documents:", applicationData.documents);

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

    // Return raw documents instead of processed status
    const applicationData = {
      ...application.toObject(),
      documents: application.documents || {} // Return raw documents
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