import { TechnicianManagementRepository } from '../repositories/admin/TechnicianManagemnetRepository';
import {
  IAdminTechnician,
  ITechnician, // This is the DB schema
  ITechnicianApplication,
  TechnicianListResponse,
  SingleTechnicianResponse, // Add this
  ApplicationListResponse,
  TechnicianStatsResponse,
  ApplicationStatsResponse,
  UpdateStatusRequest,
  ApproveApplicationRequest,
  RejectApplicationRequest,
  TechnicianFilters,
  ApplicationFilters
} from '../interfaces/admin/ITechnicianManagement';
import { Types } from 'mongoose';
import { Technician } from '../models/technician/TechnicianSchema';

export class TechnicianManagementService {
  private technicianRepository: TechnicianManagementRepository;

  constructor() {
    this.technicianRepository = new TechnicianManagementRepository();
  }

  // Helper function to format documents from TechnicianApplication.documents
 private formatApplicationDocuments(documents: any) {
  if (!documents) return {};
  
  const formatted: any = {};
  
  // Map the actual document structure from your application
  Object.keys(documents).forEach(key => {
    const doc = documents[key];
    if (doc && doc.url) {
      formatted[key] = {
        url: doc.url,
        verified: doc.verified || false,
        uploadedAt: doc.uploadedAt || new Date(),
        type: key
      };
    }
  });
  
  return formatted;
}

  async getAllTechnicians(filters: TechnicianFilters): Promise<TechnicianListResponse> {
    try {
      const { 
        status, 
        service, 
        rating, 
        location,
        search,
        page = 1,
        limit = 10
      } = filters;

      // Build filter object
      const filter: any = {};

      // Status filter
      if (status && status !== 'all') {
        filter.status = status;
      }

      // Service filter
      if (service && service !== 'All Services') {
        filter.services = service;
      }

      // Rating filter
      if (rating && rating !== 'All Ratings') {
        const ratingMap: any = {
          '5 Star': { $gte: 4.8 },
          '4+ Star': { $gte: 4.0 },
          '3+ Star': { $gte: 3.0 }
        };
        filter.averageRating = ratingMap[rating as string];
      }

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        filter.$or = [
          { displayName: searchRegex },
          { 'user.email': searchRegex },
          { 'user.phone': searchRegex },
          { workAreas: { $in: [searchRegex] } }
        ];
      }

      // Location filter
      if (location && location !== 'All Locations') {
        filter.workAreas = { $in: [new RegExp(location as string, 'i')] };
      }

      const pageNum = parseInt(page as any);
      const limitNum = parseInt(limit as any);
      const skip = (pageNum - 1) * limitNum;

      // Get technicians with user data populated
      const technicians = await this.technicianRepository.findAllTechnicians(filter, skip, limitNum);
      const total = await this.technicianRepository.countTechnicians(filter);

      // Format the response with proper typing
      const adminTechnicians: IAdminTechnician[] = await Promise.all(
        technicians.map(async (tech: ITechnician) => {
          return await this.convertToAdminTechnician(tech);
        })
      );

      return {
        success: true,
        message: 'Technicians retrieved successfully',
        data: {
          technicians: adminTechnicians, // Now using IAdminTechnician[]
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      };

    } catch (error) {
      console.error('Get technicians error:', error);
      return {
        success: false,
        message: 'Failed to fetch technicians',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // In TechnicianManagementService class - FIXED getTechnicianById method
// In TechnicianManagementService - FIXED getTechnicianById method
// In TechnicianManagementService - FIXED getTechnicianById method
async getTechnicianById(id: string): Promise<SingleTechnicianResponse> {
  try {
    const technician = await this.technicianRepository.findTechnicianById(id);

    if (!technician) {
      return {
        success: false,
        message: 'Technician not found'
      };
    }

    const adminTechnician = await this.convertToAdminTechnician(technician);

    // ✅ FIXED: Return single technician object, not array
    return {
      success: true,
      message: 'Technician retrieved successfully',
      data: {
        technician: adminTechnician 
      }
    };

  } catch (error) {
    console.error('Get technician error:', error);
    return {
      success: false,
      message: 'Failed to fetch technician',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

private async convertToAdminTechnician(technician: ITechnician): Promise<IAdminTechnician> {
  
  // Get user data
  const user = await this.technicianRepository.findUserById(technician.userId as Types.ObjectId);
  
  // Get technician's application data for personal info
  const application = await this.technicianRepository.findApplicationByTechnicianId(technician._id.toString());
  
  // ✅ FIXED: Get address from UserAddress collection
  const userAddress = await this.technicianRepository.findUserAddress(technician.userId as Types.ObjectId);

  // Map status from technician schema to admin schema
  const mapStatus = (status: string): 'pending' | 'approved' | 'rejected' | 'suspended' => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return 'pending';
      case 'approved':
        return 'approved';
      case 'rejected':
        return 'rejected';
      case 'suspended':
        return 'suspended';
      default:
        return 'pending';
    }
  };

  // ✅ FIXED: Better personal info extraction that includes address from UserAddress
  const getPersonalInfo = (technician: ITechnician, application?: any, userAddress?: any) => {
    // Check if technician personalInfo has real data (not just fallbacks)
    const hasRealTechnicianData = technician.personalInfo && 
      (technician.personalInfo.gender !== 'Not specified' || 
       technician.personalInfo.phoneNumber !== 'Not provided' ||
       technician.personalInfo.dateOfBirth !== 'Not specified');

    // Use technician data if it has real values, otherwise use application data
    let personalInfo: any;
    
    if (hasRealTechnicianData) {
      personalInfo = {
        fullName: technician.personalInfo?.fullName || technician.displayName,
        gender: technician.personalInfo?.gender,
        phoneNumber: technician.personalInfo?.phoneNumber || technician.phone,
        dateOfBirth: technician.personalInfo?.dateOfBirth,
        languages: technician.personalInfo?.languages || [],
      };
    } else if (application?.personal) {
      const appPersonal = application.personal;
      personalInfo = {
        fullName: appPersonal.fullName || technician.displayName,
        gender: appPersonal.gender || 'Not specified',
        phoneNumber: appPersonal.phoneNumber || technician.phone || 'Not provided',
        dateOfBirth: appPersonal.dateOfBirth || 'Not specified',
        languages: appPersonal.languages || [],
      };
    } else {
      personalInfo = {
        fullName: technician.displayName,
        gender: 'Not specified',
        phoneNumber: technician.phone || 'Not provided',
        dateOfBirth: 'Not specified',
        languages: [],
      };
    }

    // ✅ ADD ADDRESS FROM USERADDRESS COLLECTION
    if (userAddress) {
      personalInfo.address = {
        street: userAddress.street || 'Not specified',
        city: userAddress.city || 'Not specified',
        state: userAddress.state || 'Not specified',
        pincode: userAddress.pincode || 'Not specified'
      };
    } else if (technician.personalInfo?.address) {
      personalInfo.address = {
        street: technician.personalInfo.address.street || 'Not specified',
        city: technician.personalInfo.address.city || 'Not specified',
        state: technician.personalInfo.address.state || 'Not specified',
        pincode: technician.personalInfo.address.pincode || 'Not specified'
      };
    } else if (application?.personal?.address) {
      personalInfo.address = {
        street: application.personal.address.street || 'Not specified',
        city: application.personal.address.city || 'Not specified',
        state: application.personal.address.state || 'Not specified',
        pincode: application.personal.address.pincode || 'Not specified'
      };
    } else {
      personalInfo.address = undefined;
    }

    return personalInfo;
  };

  // Format personal information
  const personalInfo = getPersonalInfo(technician, application, userAddress);

  // ✅ FIXED: Better document handling
  const getDocuments = (technician: ITechnician, application?: any) => {
    
    // Always prefer application documents for approved technicians
    if (application?.documents) {
      const formattedDocs = this.formatApplicationDocuments(application.documents);
      return formattedDocs;
    }
    
    // Fallback for profile picture
    const fallbackDocs: any = {};
    if (technician.profilePictureUrl) {
      fallbackDocs.profilePhoto = {
        url: technician.profilePictureUrl,
        verified: true,
        type: 'profilePhoto'
      };
    }
    
    return fallbackDocs;
  };

  // Format documents
  const documents = getDocuments(technician, application);

  // Create the admin technician view
  const adminTechnician: IAdminTechnician = {
    _id: technician._id,
    userId: technician.userId,
    displayName: technician.displayName,
    email: user?.email || '',
    phone: user?.phone || technician.phone || '',
    services: technician.services,
    experienceYears: technician.experienceYears,
    workAreas: technician.workAreas,
    serviceRadiusKm: technician.serviceRadiusKm,
    status: mapStatus(technician.status),
    averageRating: technician.averageRating,
    ratingCount: technician.ratingCount,
    totalJobs: 0,
    completedJobs: 0,
    ongoingJobs: 0,
    totalEarnings: 0,
    profilePictureUrl: technician.profilePictureUrl,
    createdAt: technician.createdAt,
    updatedAt: technician.updatedAt,
    user: user ? {
      email: user.email || '',
      phone: user.phone || '',
      fullName: user.fullName || technician.displayName,
      createdAt: user.createdAt
    } : undefined,
    personalInfo: personalInfo,
    documents: documents,
    availability: undefined
  };

  return adminTechnician;
}

  async updateTechnicianStatus(id: string, statusData: UpdateStatusRequest): Promise<SingleTechnicianResponse> { // ✅ Change return type
  try {
    const { status } = statusData;

    if (!status || !['approved', 'suspended', 'rejected'].includes(status)) {
      return {
        success: false,
        message: 'Valid status is required (approved, suspended, rejected)'
      };
    }

    const technician = await this.technicianRepository.updateTechnicianStatus(id, status);

    if (!technician) {
      return {
        success: false,
        message: 'Technician not found'
      };
    }

    const adminTechnician = await this.convertToAdminTechnician(technician);

    // If approving a technician, also update their application status
    if (status === 'approved') {
      await this.technicianRepository.updateApplicationStatus(
        id,
        'approved'
      );
    }

    // ✅ FIXED: Return single technician response
    return {
      success: true,
      message: `Technician status updated to ${status}`,
      data: {
        technician: adminTechnician // ✅ Single technician object
      }
    };
  } catch (error) {
    console.error('Update technician status error:', error);
    return {
      success: false,
      message: 'Failed to update technician status',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

  async getTechnicianStats(): Promise<TechnicianStatsResponse> {
    try {
      const stats = await this.technicianRepository.getTechnicianStats();

      return {
        success: true,
        message: 'Technician statistics retrieved successfully',
        data: stats
      };

    } catch (error) {
      console.error('Get technician stats error:', error);
      return {
        success: false,
        message: 'Failed to fetch technician statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getPendingApplications(filters: ApplicationFilters): Promise<ApplicationListResponse> {
    try {
      const { 
        status = 'submitted,under_review',
        search,
        service,
        page = 1,
        limit = 10
      } = filters;

      // Build filter object
      const filter: any = {
        status: { $in: (status as string).split(',') }
      };

      // Search filter
      if (search) {
        const searchRegex = new RegExp(search as string, 'i');
        filter.$or = [
          { 'personal.fullName': searchRegex },
          { email: searchRegex },
          { 'personal.phoneNumber': searchRegex }
        ];
      }

      // Service filter
      if (service && service !== 'All Services') {
        filter['skills.services'] = service;
      }

      const pageNum = parseInt(page as any);
      const limitNum = parseInt(limit as any);
      const skip = (pageNum - 1) * limitNum;

      const applications = await this.technicianRepository.findAllApplications(filter, skip, limitNum);
      const total = await this.technicianRepository.countApplications(filter);

      return {
        success: true,
        message: 'Pending applications retrieved successfully',
        data: {
          applications: applications as ITechnicianApplication[],
          pagination: {
            page: pageNum,
            limit: limitNum,
            total,
            pages: Math.ceil(total / limitNum)
          }
        }
      };

    } catch (error) {
      console.error('Get pending applications error:', error);
      return {
        success: false,
        message: 'Failed to fetch pending applications',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async approveApplication(id: string): Promise<ApplicationListResponse> {
    try {

      const application = await this.technicianRepository.findApplicationById(id);
      if (!application) {
        return {
          success: false,
          message: 'Application not found'
        };
      }

      // Update application status
      const updatedApplication = await this.technicianRepository.updateApplicationStatus(
        id, 
        'approved', 
      );

      if (!updatedApplication) {
        return {
          success: false,
          message: 'Failed to update application'
        };
      }

      // Update user's application status
      await this.technicianRepository.updateUserApplicationStatus(
        application.technicianId as Types.ObjectId,
        'approved'
      );

      // Update or create technician record
      const technician = await this.technicianRepository.findOrCreateTechnician(application);

      return {
        success: true,
        message: 'Application approved successfully',
        data: {
          applications: [updatedApplication as ITechnicianApplication],
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            pages: 1
          }
        }
      };

    } catch (error) {
      console.error('Approve application error:', error);
      return {
        success: false,
        message: 'Failed to approve application',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // In your rejectApplication method in TechnicianManagementService
async rejectApplication(id: string, rejectData: RejectApplicationRequest): Promise<ApplicationListResponse> {
  try {
    const { rejectionReason } = rejectData;

    console.log('🔍 Rejecting application:', id);
    console.log('🔍 Rejection reason:', rejectionReason);

    const application = await this.technicianRepository.findApplicationById(id);
    if (!application) {
      console.log('❌ Application not found');
      return {
        success: false,
        message: 'Application not found'
      };
    }

    console.log('🔍 Found application:', application._id);
    console.log('🔍 Current application status:', application.status);

    // Update application status with rejection details
    const updatedApplication = await this.technicianRepository.updateApplicationStatus(
      id, 
      'rejected', 
      { 
        rejectionReason,
        rejectedAt: new Date()
      }
    );

    console.log('🔍 Updated application:', updatedApplication);
    console.log('🔍 Updated rejectionReason:', updatedApplication?.rejectionReason);

    if (!updatedApplication) {
      console.log('❌ Failed to update application');
      return {
        success: false,
        message: 'Failed to update application'
      };
    }

    // Update user's application status
    await this.technicianRepository.updateUserApplicationStatus(
      application.technicianId as Types.ObjectId,
      'rejected'
    );

    // Update technician status if exists
    await this.technicianRepository.updateTechnicianStatus(
      application.technicianId?.toString() || id,
      'rejected'
    );

    console.log('✅ Application rejected successfully');

    return {
      success: true,
      message: 'Application rejected successfully',
      data: {
        applications: [updatedApplication as ITechnicianApplication],
        pagination: {
          page: 1,
          limit: 1,
          total: 1,
          pages: 1
        }
      }
    };

  } catch (error) {
    console.error('❌ Reject application error:', error);
    return {
      success: false,
      message: 'Failed to reject application',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

  async getApplicationById(id: string): Promise<ApplicationListResponse> {
    try {
      const application = await this.technicianRepository.findApplicationById(id);
      if (!application) {
        return {
          success: false,
          message: 'Application not found'
        };
      }

      // Get user data
      const user = await this.technicianRepository.updateUserApplicationStatus(
        application.technicianId as Types.ObjectId,
        application.status
      );

      // Format documents from TechnicianApplication.documents for frontend
      const formattedDocuments = this.formatApplicationDocuments(application.documents || {});

      const applicationData: ITechnicianApplication = {
        ...application.toObject(),
        _id: application._id as Types.ObjectId,
        technicianId: application.technicianId as Types.ObjectId,
        user,
        documents: formattedDocuments
      } as ITechnicianApplication;

      return {
        success: true,
        message: 'Application retrieved successfully',
        data: {
          applications: [applicationData],
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            pages: 1
          }
        }
      };

    } catch (error) {
      console.error('Get application error:', error);
      return {
        success: false,
        message: 'Failed to fetch application',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getApplicationStats(): Promise<ApplicationStatsResponse> {
    try {
      const stats = await this.technicianRepository.getApplicationStats();

      return {
        success: true,
        message: 'Application statistics retrieved successfully',
        data: stats
      };

    } catch (error) {
      console.error('Get application stats error:', error);
      return {
        success: false,
        message: 'Failed to fetch application statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getTechnicianByApplicationId(applicationId: string): Promise<TechnicianListResponse> {
    try {
      const technician = await this.technicianRepository.findTechnicianByApplicationId(applicationId);
      
      if (!technician) {
        return {
          success: false,
          message: 'Technician not found for this application'
        };
      }

      const adminTechnician = await this.convertToAdminTechnician(technician);

      return {
        success: true,
        message: 'Technician retrieved successfully',
        data: {
          technicians: [adminTechnician],
          pagination: {
            page: 1,
            limit: 1,
            total: 1,
            pages: 1
          }
        }
      };

    } catch (error) {
      console.error('Get technician by application error:', error);
      return {
        success: false,
        message: 'Failed to fetch technician',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}