// services/technician/TechnicianDashboardService.ts
import { Types } from 'mongoose';
import { TechnicianRepository } from '../repositories/technician/TechnicianRepository';
import { UserRepository } from '../repositories/user/UserRepository';

interface DashboardOverview {
  upcomingBookings?: number;
  monthlyEarnings?: number;
  totalJobs?: number;
  averageRating: number;
}

export class TechnicianDashboardService {
  private technicianRepository: TechnicianRepository;
  private userRepository: UserRepository;

  constructor() {
    this.technicianRepository = new TechnicianRepository();
    this.userRepository = new UserRepository();
  }

  async getDashboardOverview(technicianId: string): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      
      if (!technician) {
        return { 
          success: false, 
          message: 'Technician not found' 
        };
      }

      const overview: DashboardOverview = {
        averageRating: technician.averageRating || 0
      };

      return {
        success: true,
        message: 'Dashboard overview retrieved successfully',
        data: { overview }
      };

    } catch (error) {
      console.error('Get dashboard overview error:', error);
      return {
        success: false,
        message: 'Failed to fetch dashboard overview',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getTechnicianProfile(technicianId: string): Promise<any> {
    try {
      const technician = await this.technicianRepository.findByUserId(technicianId);
      const user = await this.userRepository.findById(technicianId);
      
      if (!technician || !user) {
        return { 
          success: false, 
          message: 'Technician profile not found' 
        };
      }

      // Create the profile with ALL fields from your schema
      const profile = {
        // Basic info
        displayName: technician.displayName,
        email: user.email,
        phone: user.phone || technician.phone, // Use technician phone if available
        services: technician.services || [],
        experienceYears: technician.experienceYears || 0,
        workAreas: technician.workAreas || [],
        averageRating: technician.averageRating || 0,
        ratingCount: technician.ratingCount || 0,
        profilePictureUrl: technician.profilePictureUrl || '',
        isVerified: technician.status === 'approved',
        bio: technician.bio || '',
        status: technician.status,
        
        // Personal info from technician schema
        personalInfo: {
          fullName: technician.personalInfo?.fullName || '',
          gender: technician.personalInfo?.gender || '',
          phoneNumber: technician.personalInfo?.phoneNumber || user.phone || '',
          dateOfBirth: technician.personalInfo?.dateOfBirth 
            ? new Date(technician.personalInfo.dateOfBirth).toISOString().split('T')[0]
            : '',
          languages: technician.personalInfo?.languages || '',
          address: {
            street: technician.personalInfo?.address?.street || '',
            city: technician.personalInfo?.address?.city || '',
            state: technician.personalInfo?.address?.state || '',
            pincode: technician.personalInfo?.address?.pincode || ''
          }
        }
      };

      return {
        success: true,
        message: 'Technician profile retrieved successfully',
        data: { profile }
      };

    } catch (error) {
      console.error('Get technician profile error:', error);
      return {
        success: false,
        message: 'Failed to fetch technician profile',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}