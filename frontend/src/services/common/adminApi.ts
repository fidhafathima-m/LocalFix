import { ADMIN_ROUTES } from "../../routes/adminRoutes";
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
  statusCode?: number;
  error?: string;
}

interface UsersResponse {
  users: User[];
}

interface UserResponse {
  data: {
    user: User;
  };
}

interface TechniciansResponse {
  technicians: Technician[];
}

interface TechnicianResponse {
  data: {
    technician: Technician;
  };
}

interface ApplicationsResponse {
  applications: TechnicianApplication[];
}

export const adminAPI = {
  // Users
  getUsers: () => api.get<ApiResponse<UsersResponse>>(ADMIN_ROUTES.USERS),

  updateUser: (userId: string, updates: Partial<User>) =>
    api.put<ApiResponse<UserResponse>>(
      ADMIN_ROUTES.USER_BY_ID(userId),
      updates
    ),

  deleteUser: (userId: string) =>
    api.delete<ApiResponse<void>>(ADMIN_ROUTES.USER_BY_ID(userId)),

  updateUserStatus: (userId: string, status: string) =>
    api.patch<ApiResponse<UserResponse>>(ADMIN_ROUTES.USER_STATUS(userId), {
      status,
    }),

  // Technicians
  getTechnicians: (filters: { status?: string } = {}) =>
    api.get<ApiResponse<TechniciansResponse>>(ADMIN_ROUTES.TECHNICIANS, {
      params: filters,
    }),

  getPendingApplications: () =>
    api.get<ApiResponse<ApplicationsResponse>>(
      ADMIN_ROUTES.APPLICATIONS_PENDING
    ),

  approveApplication: (applicationId: string) =>
    api.patch<ApiResponse<void>>(
      ADMIN_ROUTES.APPLICATION_APPROVE(applicationId)
    ),

  rejectApplication: (applicationId: string, rejectionReason: string) =>
    api.patch<ApiResponse<void>>(
      ADMIN_ROUTES.APPLICATION_REJECT(applicationId),
      { rejectionReason }
    ),

  updateTechnicianStatus: (technicianId: string, status: string) =>
    api.patch<ApiResponse<TechnicianResponse>>(
      ADMIN_ROUTES.TECHNICIAN_STATUS(technicianId),
      { status }
    ),

  // Application details
  getApplicationDetails: (applicationId: string) =>
    api.get<ApiResponse<ApplicationsResponse>>(
      ADMIN_ROUTES.APPLICATION_BY_ID(applicationId)
    ),

  // Technician details
  getTechnicianById: (technicianId: string) =>
    api.get<ApiResponse<TechnicianResponse>>(
      ADMIN_ROUTES.TECHNICIAN_BY_ID(technicianId)
    ),
};
