import api from '../../../utils/axiosConfig';

// Interface for the new service response format
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

interface Technician {
  _id: string;
  userId: string;
  displayName: string;
  email?: string;
  phone?: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
  serviceRadiusKm: number;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  averageRating: number;
  ratingCount: number;
  totalJobs?: number;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    phone: string;
    fullName: string;
    createdAt: string;
  };
}

interface TechnicianApplication {
  _id: string;
  technicianId: string;
  email: string;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected';
  personal: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
  skills: {
    services?: string[];
    yearsOfExperience?: number;
  };
  submittedAt?: string;
  createdAt: string;
}

// Fetch all technicians - UPDATED ENDPOINT
export const fetchTechnicians = async (): Promise<Technician[]> => {
  try {
    const res = await api.get<ApiResponse<{ technicians: Technician[] }>>('/admin/technicians');
    
    if (res.data.success && res.data.data && res.data.data.technicians) {
      return res.data.data.technicians;
    } else {
      throw new Error(res.data.message || 'Failed to fetch technicians');
    }
  } catch (error) {
    console.error('❌ Error fetching technicians:', error);
    throw error;
  }
};

// Fetch pending applications - UPDATED ENDPOINT
export const fetchPendingApplications = async (): Promise<TechnicianApplication[]> => {
  try {
    const res = await api.get<ApiResponse<{ applications: TechnicianApplication[] }>>('/admin/technicians/applications/pending');
    
    if (res.data.success && res.data.data && res.data.data.applications) {
      return res.data.data.applications;
    } else {
      throw new Error(res.data.message || 'Failed to fetch pending applications');
    }
  } catch (error) {
    console.error('❌ Error fetching pending applications:', error);
    throw error;
  }
};

// Approve application - UPDATED ENDPOINT
export const approveApplication = async (applicationId: string): Promise<void> => {
  const res = await api.patch<ApiResponse<void>>(`/admin/technicians/applications/${applicationId}/approve`);
  
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to approve application');
  }
};

// Reject application - UPDATED ENDPOINT
export const rejectApplication = async (applicationId: string, rejectionReason: string): Promise<void> => {
  const res = await api.patch<ApiResponse<void>>(`/admin/technicians/applications/${applicationId}/reject`, { rejectionReason });
  
  if (!res.data.success) {
    throw new Error(res.data.message || 'Failed to reject application');
  }
};

// Update technician status - UPDATED ENDPOINT
export const updateTechnicianStatus = async (technicianId: string, status: string): Promise<Technician> => {
  const res = await api.patch<ApiResponse<{ technician: Technician }>>(`/admin/technicians/${technicianId}/status`, { status });
  
  if (res.data.success && res.data.data && res.data.data.technician) {
    return res.data.data.technician;
  } else {
    throw new Error(res.data.message || 'Failed to update technician status');
  }
};

// Define an interface for technician stats
interface TechnicianStats {
  totalTechnicians: number;
  approvedTechnicians: number;
  pendingTechnicians: number;
  rejectedTechnicians: number;
  suspendedTechnicians: number;
  [key: string]: number; // For any additional stats fields
}

// Get technician stats - UPDATED ENDPOINT
export const getTechnicianStats = async (): Promise<TechnicianStats> => {
  const res = await api.get<ApiResponse<{ stats: TechnicianStats }>>('/admin/technicians/stats');
  
  if (res.data.success && res.data.data) {
    return res.data.data.stats;
  } else {
    throw new Error(res.data.message || 'Failed to fetch technician stats');
  }
};

// Define an interface for application stats
interface ApplicationStats {
  totalApplications: number;
  draftApplications: number;
  submittedApplications: number;
  underReviewApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  [key: string]: number; // For any additional stats fields
}

// Get application stats - UPDATED ENDPOINT
export const getApplicationStats = async (): Promise<ApplicationStats> => {
  const res = await api.get<ApiResponse<{ stats: ApplicationStats }>>('/admin/technicians/applications/stats');
  
  if (res.data.success && res.data.data) {
    return res.data.data.stats;
  } else {
    throw new Error(res.data.message || 'Failed to fetch application stats');
  }
};

// In technicianApi.ts - Update the fetchTechnicianById function
export const fetchTechnicianById = async (technicianId: string): Promise<Technician> => {
  try {
    console.log('🔍 Fetching technician by ID:', technicianId);
    
    const res = await api.get<ApiResponse<{ technician: Technician }>>(`/admin/technicians/${technicianId}`);
    
    console.log('📦 RAW API Response:', res.data);
    console.log('🔍 Response data structure:', res.data.data);
    
    if (res.data.success && res.data.data) {
      // ✅ Handle both response formats for compatibility
      const technician = res.data.data.technician || 
                        (res.data.data.technician && res.data.data.technician[0]);
      
      if (technician) {
        console.log('✅ Technician data retrieved successfully');
        return technician;
      }
    }
    
    console.warn('⚠️ API response indicates failure:', res.data.message);
    throw new Error(res.data.message || 'Failed to fetch technician');
    
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error('❌ Error fetching technician by ID:', error);
    throw error;
  }
};