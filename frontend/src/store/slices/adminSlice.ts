import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

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

interface AdminState {
  users: User[];
  technicians: Technician[];
  applications: TechnicianApplication[];
  loading: boolean;
  error: string | null;
  usersLoading: boolean;
  techniciansLoading: boolean;
  applicationsLoading: boolean;
}

const initialState: AdminState = {
  users: [],
  technicians: [],
  applications: [],
  loading: false,
  error: null,
  usersLoading: false,
  techniciansLoading: false,
  applicationsLoading: false,
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    // Users actions
    fetchUsersStart: (state) => {
      state.usersLoading = true;
      state.error = null;
    },
    fetchUsersSuccess: (state, action: PayloadAction<User[]>) => {
      state.usersLoading = false;
      state.users = action.payload;
      state.error = null;
    },
    fetchUsersFailure: (state, action: PayloadAction<string>) => {
      state.usersLoading = false;
      state.error = action.payload;
    },

    // Technicians actions
    fetchTechniciansStart: (state) => {
      state.techniciansLoading = true;
      state.error = null;
    },
    fetchTechniciansSuccess: (state, action: PayloadAction<Technician[]>) => {
      state.techniciansLoading = false;
      state.technicians = action.payload;
      state.error = null;
    },
    fetchTechniciansFailure: (state, action: PayloadAction<string>) => {
      state.techniciansLoading = false;
      state.error = action.payload;
    },

    // Applications actions
    fetchApplicationsStart: (state) => {
      state.applicationsLoading = true;
      state.error = null;
    },
    fetchApplicationsSuccess: (
      state,
      action: PayloadAction<TechnicianApplication[]>
    ) => {
      state.applicationsLoading = false;
      state.applications = action.payload;
      state.error = null;
    },
    fetchApplicationsFailure: (state, action: PayloadAction<string>) => {
      state.applicationsLoading = false;
      state.error = action.payload;
    },

    updateUser: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex((u) => u._id === action.payload._id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },

    // Update user status
    updateUserStatus: (
      state,
      action: PayloadAction<{ userId: string; status: User["status"] }>
    ) => {
      const user = state.users.find((u) => u._id === action.payload.userId);
      if (user) {
        user.status = action.payload.status;
      }
    },

    // Update technician status
    updateTechnicianStatus: (
      state,
      action: PayloadAction<{
        technicianId: string;
        status: Technician["status"];
      }>
    ) => {
      const technician = state.technicians.find(
        (t) => t._id === action.payload.technicianId
      );
      if (technician) {
        technician.status = action.payload.status;
      }
    },

    // Update application status
    updateApplicationStatus: (
      state,
      action: PayloadAction<{
        applicationId: string;
        status: TechnicianApplication["status"];
      }>
    ) => {
      const application = state.applications.find(
        (a) => a._id === action.payload.applicationId
      );
      if (application) {
        application.status = action.payload.status;
      }
    },

    // Remove user
    removeUser: (state, action: PayloadAction<string>) => {
      state.users = state.users.filter((u) => u._id !== action.payload);
    },

    // Remove application
    removeApplication: (state, action: PayloadAction<string>) => {
      state.applications = state.applications.filter(
        (a) => a._id !== action.payload
      );
    },

    // Clear admin data
    clearAdminData: (state) => {
      state.users = [];
      state.technicians = [];
      state.applications = [];
      state.error = null;
    },

    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  fetchUsersStart,
  fetchUsersSuccess,
  fetchUsersFailure,
  fetchTechniciansStart,
  fetchTechniciansSuccess,
  fetchTechniciansFailure,
  fetchApplicationsStart,
  fetchApplicationsSuccess,
  fetchApplicationsFailure,
  updateUser,
  updateUserStatus,
  updateTechnicianStatus,
  updateApplicationStatus,
  removeUser,
  removeApplication,
  clearAdminData,
  setLoading,
} = adminSlice.actions;

// Selectors
export const selectAdminUsers = (state: { admin: AdminState }) =>
  state.admin.users;
export const selectAdminTechnicians = (state: { admin: AdminState }) =>
  state.admin.technicians;
export const selectAdminApplications = (state: { admin: AdminState }) =>
  state.admin.applications;
export const selectAdminLoading = (state: { admin: AdminState }) =>
  state.admin.loading;
export const selectAdminError = (state: { admin: AdminState }) =>
  state.admin.error;
export const selectUsersLoading = (state: { admin: AdminState }) =>
  state.admin.usersLoading;
export const selectTechniciansLoading = (state: { admin: AdminState }) =>
  state.admin.techniciansLoading;
export const selectApplicationsLoading = (state: { admin: AdminState }) =>
  state.admin.applicationsLoading;

export default adminSlice.reducer;
