// services/technician/dashboardApi.ts
import api from '../../../utils/axiosConfig';

interface DashboardOverview {
  upcomingBookings: number;
  monthlyEarnings: number;
  totalJobs: number;
  averageRating: number;
}

interface Booking {
  _id: string;
  service: string;
  location: string;
  date: string;
  status: string;
  customerName: string;
}

interface Earnings {
  _id: string;
  service: string;
  amount: number;
  date: string;
  bookingId: string;
}

interface Review {
  _id: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
}

interface TechnicianProfile {
  displayName: string;
  email: string;
  phone: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
  averageRating: number;
  ratingCount: number;
  profilePictureUrl: string;
  isVerified: boolean;
  personalInfo?: {
    fullName?: string;
    gender?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    languages?: string;
  };
  bio?: string;
  status: string;
}

// Technician Profile - This is the main function you need
export const fetchTechnicianProfile = async (): Promise<{ profile: TechnicianProfile }> => {
  try {
    const res = await api.get('/technician/profile');
    if (res.data.success && res.data.data) {
      return { profile: res.data.data.profile };
    }
    throw new Error(res.data.message || 'Failed to fetch technician profile');
  } catch (error) {
    console.error('Error fetching technician profile:', error);
    throw new Error('Authentication required. Please log in again.');
  }
};

// Other API functions (keep them as they are for now)
export const fetchDashboardOverview = async (): Promise<{ overview: DashboardOverview }> => {
  try {
    const res = await api.get('/technician/dashboard/overview');
    if (res.data.success && res.data.data) {
      return { overview: res.data.data.overview };
    }
    return {
      overview: {
        upcomingBookings: 0,
        monthlyEarnings: 0,
        totalJobs: 0,
        averageRating: 0
      }
    };
  } catch (error) {
    console.error('Error fetching dashboard overview:', error);
    return {
      overview: {
        upcomingBookings: 0,
        monthlyEarnings: 0,
        totalJobs: 0,
        averageRating: 0
      }
    };
  }
};

export const fetchUpcomingBookings = async (): Promise<{ bookings: Booking[]; isNewTechnician?: boolean }> => {
  try {
    const res = await api.get('/technician/dashboard/bookings/upcoming');
    if (res.data.success && res.data.data) {
      return res.data.data;
    }
    return { bookings: [], isNewTechnician: true };
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    return { bookings: [], isNewTechnician: true };
  }
};

export const fetchRecentEarnings = async (): Promise<{ earnings: Earnings[]; isNewTechnician?: boolean }> => {
  try {
    const res = await api.get('/technician/dashboard/earnings/recent');
    if (res.data.success && res.data.data) {
      return res.data.data;
    }
    return { earnings: [], isNewTechnician: true };
  } catch (error) {
    console.error('Error fetching recent earnings:', error);
    return { earnings: [], isNewTechnician: true };
  }
};

export const fetchRecentReviews = async (): Promise<{ reviews: Review[]; isNewTechnician?: boolean }> => {
  try {
    const res = await api.get('/technician/dashboard/reviews/recent');
    if (res.data.success && res.data.data) {
      return res.data.data;
    }
    return { reviews: [], isNewTechnician: true };
  } catch (error) {
    console.error('Error fetching recent reviews:', error);
    return { reviews: [], isNewTechnician: true };
  }
};