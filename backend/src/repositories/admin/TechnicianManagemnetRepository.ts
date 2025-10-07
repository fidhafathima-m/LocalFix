import { Technician } from '../../models/technician/TechnicianSchema';
import { TechnicianApplication, ITechnicianApplication } from '../../models/technician/TechnicianApplicationSchema';
import User from '../../models/UserSchema';
import UserAddressSchema from '../../models/UserAddressSchema';
import { Types } from 'mongoose';
import { ITechnician } from '@/interfaces/admin/ITechnicianManagement';

export class TechnicianManagementRepository {
  // Technician methods
  async findAllTechnicians(filter: any, skip: number, limit: number): Promise<ITechnician[]> {
    return await Technician.find(filter)
      .populate('userId', 'email phone fullName')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countTechnicians(filter: any): Promise<number> {
    return await Technician.countDocuments(filter);
  }

  async findTechnicianById(id: string): Promise<ITechnician | null> {
    return await Technician.findById(id)
      .populate('userId', 'email phone fullName createdAt')
      .lean();
  }

  async updateTechnicianStatus(id: string, status: string): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    ).populate('userId', 'email phone fullName');
  }

  async getTechnicianStats(): Promise<{
    total: number;
    active: number;
    pending: number;
    suspended: number;
    recent: number;
  }> {
    const total = await Technician.countDocuments();
    const active = await Technician.countDocuments({ status: 'approved' });
    const pending = await Technician.countDocuments({ status: 'pending' });
    const suspended = await Technician.countDocuments({ status: 'suspended' });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recent = await Technician.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    return { total, active, pending, suspended, recent };
  }

  // Application methods
  async findAllApplications(filter: any, skip: number, limit: number): Promise<ITechnicianApplication[]> {
    return await TechnicianApplication.find(filter)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }

  async countApplications(filter: any): Promise<number> {
    return await TechnicianApplication.countDocuments(filter);
  }

  async findApplicationById(id: string): Promise<ITechnicianApplication | null> {
    return await TechnicianApplication.findById(id);
  }

  async updateApplicationStatus(id: string, status: string, updateData: any = {}): Promise<ITechnicianApplication | null> {
    return await TechnicianApplication.findByIdAndUpdate(
      id,
      { $set: { status, ...updateData } },
      { new: true }
    );
  }

  async getApplicationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    recent: number;
  }> {
    const total = await TechnicianApplication.countDocuments();
    const pending = await TechnicianApplication.countDocuments({
      status: { $in: ['submitted', 'under_review'] }
    });
    const approved = await TechnicianApplication.countDocuments({ status: 'approved' });
    const rejected = await TechnicianApplication.countDocuments({ status: 'rejected' });

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const recent = await TechnicianApplication.countDocuments({
      createdAt: { $gte: oneWeekAgo }
    });

    return { total, pending, approved, rejected, recent };
  }

  // User methods
  async updateUserApplicationStatus(userId: Types.ObjectId, applicationStatus: string): Promise<any> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { applicationStatus } },
      { new: true }
    );
  }

  async findUserAddress(userId: Types.ObjectId): Promise<any> {
  try {
    console.log('🔍 Searching for user address by userId:', userId);
    
    const address = await UserAddressSchema.findOne({ 
      userId,
      isDefault: true 
    }).select('street city state pincode landmark').lean();
    
    console.log('🏠 Found user address:', address);
    
    return address;
  } catch (error) {
    console.error('❌ Error finding user address:', error);
    return null;
  }
}

  // In TechnicianManagementRepository - update findOrCreateTechnician method
async findOrCreateTechnician(application: any): Promise<ITechnician> {
  try {
    // Find existing technician
    let technician = await Technician.findOne({ 
      userId: application.technicianId 
    });

    if (technician) {
      // Update existing technician with application data
      technician = await Technician.findOneAndUpdate(
        { userId: application.technicianId },
        { 
          $set: {
            displayName: application.personal?.fullName || technician.displayName,
            services: application.skills?.services || technician.services,
            experienceYears: application.skills?.yearsOfExperience || technician.experienceYears,
            workAreas: application.availability?.serviceAreas || technician.workAreas,
            serviceRadiusKm: application.availability?.workRadius ? 
              parseInt(application.availability.workRadius) : technician.serviceRadiusKm,
            status: 'approved',
            profilePictureUrl: application.documents?.passportPhoto?.url || 
                              application.documents?.profilePhoto?.url || 
                              technician.profilePictureUrl,
            // ✅ ADD PERSONAL INFO TRANSFER
            phone: application.personal?.phoneNumber || technician.phone,
            // Store personal info in technician for easy access
            personalInfo: application.personal ? {
              fullName: application.personal.fullName,
              gender: application.personal.gender,
              phoneNumber: application.personal.phoneNumber,
              dateOfBirth: application.personal.dateOfBirth,
              address: application.personal.address,
              languages: application.personal.languages || []
            } : technician.personalInfo
          }
        },
        { new: true }
      );
    } else {
      // Create new technician with application data
      technician = await Technician.create({
        userId: application.technicianId,
        displayName: application.personal?.fullName || 'Technician',
        services: application.skills?.services || [],
        experienceYears: application.skills?.yearsOfExperience || 0,
        workAreas: application.availability?.serviceAreas || [],
        serviceRadiusKm: application.availability?.workRadius ? 
          parseInt(application.availability.workRadius) : 10,
        status: 'approved',
        profilePictureUrl: application.documents?.passportPhoto?.url || 
                          application.documents?.profilePhoto?.url,
        // ✅ ADD PERSONAL INFO TRANSFER
        phone: application.personal?.phoneNumber,
        personalInfo: application.personal ? {
          fullName: application.personal.fullName,
          gender: application.personal.gender,
          phoneNumber: application.personal.phoneNumber,
          dateOfBirth: application.personal.dateOfBirth,
          address: application.personal.address,
          languages: application.personal.languages || []
        } : undefined
      });
    }

    if (!technician) {
      throw new Error('Technician could not be found or created');
    }
    return technician;
  } catch (error) {
    console.error('Find or create technician error:', error);
    throw error;
  }
}

  async findTechnicianByApplicationId(applicationId: string): Promise<ITechnician | null> {
    const application = await TechnicianApplication.findById(applicationId);
    if (!application) return null;

    return await Technician.findOne({ 
      userId: application.technicianId 
    }).populate('userId', 'email phone fullName');
  }

  // Add these methods to your TechnicianManagementRepository class

async findUserById(userId: Types.ObjectId): Promise<any> {
  try {
    console.log('🔍 Searching for user by ID:', userId);
    
    const user = await User.findById(userId).select('email phone fullName createdAt').lean();
    
    console.log('👤 Found user:', user);
    
    return user;
  } catch (error) {
    console.error('❌ Error finding user by ID:', error);
    return null;
  }
}

async findApplicationByTechnicianId(technicianId: string): Promise<any> {
  try {
    console.log('🔍 Searching for application by technicianId:', technicianId);
    
    const application = await TechnicianApplication.findOne({ 
      technicianId: new Types.ObjectId(technicianId) 
    }).lean();
    
    console.log('📄 Found application:', application);
    
    return application;
  } catch (error) {
    console.error('❌ Error finding application by technician ID:', error);
    return null;
  }
}

}

