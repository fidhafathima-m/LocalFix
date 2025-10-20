import api from "../../utils/axiosConfig";

export interface User {
  _id: string;
  fullName: string;
  email?: string;
  phone: string;
  status: "Active" | "Inactive" | "Blocked";
  defaultAddress?: {
    city: string;
    state: string;
    pincode: string;
    location: { type: "Point"; coordinates: [number, number] };
  };
  isVerified: boolean;
  role: string;
  createdAt: string;
  wallet: { balance: number };
}

export interface Technician {
  _id: string;
  userId: string;
  displayName: string;
  email?: string;
  phone?: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
  serviceRadiusKm: number;
  status: "pending" | "approved" | "rejected" | "suspended";
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
  };
}

export interface TechnicianApplication {
  _id: string;
  technicianId: string;
  email: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
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

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export const adminAPI = {
  // Users
  getUsers: () => api.get<ApiResponse<{ users: User[] }>>("/admin/users"),

  updateUser: (userId: string, updates: Partial<User>) =>
    api.put<ApiResponse<{ user: User }>>(`/admin/users/${userId}`, updates),

  deleteUser: (userId: string) =>
    api.delete<ApiResponse<void>>(`/admin/users/${userId}`),

  updateUserStatus: (userId: string, status: string) =>
    api.patch<ApiResponse<{ user: User }>>(`/admin/users/${userId}/status`, {
      status,
    }),

  // Technicians
  getTechnicians: (filters: { status?: string } = {}) =>
    api.get<ApiResponse<{ technicians: Technician[] }>>("/admin/technicians", {
      params: filters,
    }),

  getPendingApplications: () =>
    api.get<ApiResponse<{ applications: TechnicianApplication[] }>>(
      "/admin/technicians/applications/pending"
    ),

  approveApplication: (applicationId: string) =>
    api.patch<ApiResponse<void>>(
      `/admin/technicians/applications/${applicationId}/approve`
    ),

  rejectApplication: (applicationId: string, rejectionReason: string) =>
    api.patch<ApiResponse<void>>(
      `/admin/technicians/applications/${applicationId}/reject`,
      { rejectionReason }
    ),

  updateTechnicianStatus: (technicianId: string, status: string) =>
    api.patch<ApiResponse<{ technician: Technician }>>(
      `/admin/technicians/${technicianId}/status`,
      { status }
    ),

  // Application details
  getApplicationDetails: (applicationId: string) =>
    api.get<ApiResponse<{ applications: TechnicianApplication[] }>>(
      `/admin/technicians/applications/${applicationId}`
    ),

  // Technician details
  getTechnicianById: (technicianId: string) =>
    api.get<ApiResponse<{ technician: Technician }>>(
      `/admin/technicians/${technicianId}`
    ),
};
