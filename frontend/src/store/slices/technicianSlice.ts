import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export interface TechnicianProfile {
  _id: string;
  userId: string;
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
  status: "pending" | "active" | "inactive" | "suspended";
  isApproved: boolean;
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
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationData {
  _id: string;
  phone: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  stepsCompleted: string[];
  personal: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
    dateOfBirth?: string;
    gender?: string;
  };
  identity: {
    idType?: string;
    idNumber?: string;
    currentAddress?: string;
  };
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents?: Record<string, any>;
  submittedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  rejectedAt?: string;
  createdAt: string;
  updatedAt: string;
}

interface TechnicianState {
  profile: TechnicianProfile | null;
  application: ApplicationData | null;
  loading: boolean;
  error: string | null;
  applicationLoading: boolean;
  applicationError: string | null;
}

const initialState: TechnicianState = {
  profile: null,
  application: null,
  loading: false,
  error: null,
  applicationLoading: false,
  applicationError: null,
};

const technicianSlice = createSlice({
  name: "technician",
  initialState,
  reducers: {
    // Profile actions
    fetchProfileStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    fetchProfileSuccess: (state, action: PayloadAction<TechnicianProfile>) => {
      state.loading = false;
      state.profile = action.payload;
      state.error = null;
    },
    fetchProfileFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Application actions
    fetchApplicationStart: (state) => {
      state.applicationLoading = true;
      state.applicationError = null;
    },
    fetchApplicationSuccess: (
      state,
      action: PayloadAction<ApplicationData>
    ) => {
      state.applicationLoading = false;
      state.application = action.payload;
      state.applicationError = null;
    },
    fetchApplicationFailure: (state, action: PayloadAction<string>) => {
      state.applicationLoading = false;
      state.applicationError = action.payload;
    },

    // Update application status
    updateApplicationStatus: (
      state,
      action: PayloadAction<ApplicationData["status"]>
    ) => {
      if (state.application) {
        state.application.status = action.payload;
      }
    },

    // Clear technician data
    clearTechnicianData: (state) => {
      state.profile = null;
      state.application = null;
      state.error = null;
      state.applicationError = null;
    },

    // Set loading
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  fetchProfileStart,
  fetchProfileSuccess,
  fetchProfileFailure,
  fetchApplicationStart,
  fetchApplicationSuccess,
  fetchApplicationFailure,
  updateApplicationStatus,
  clearTechnicianData,
  setLoading,
} = technicianSlice.actions;

// Selectors
export const selectTechnicianProfile = (state: {
  technician: TechnicianState;
}) => state.technician.profile;
export const selectTechnicianApplication = (state: {
  technician: TechnicianState;
}) => state.technician.application;
export const selectTechnicianLoading = (state: {
  technician: TechnicianState;
}) => state.technician.loading;
export const selectTechnicianError = (state: { technician: TechnicianState }) =>
  state.technician.error;
export const selectApplicationLoading = (state: {
  technician: TechnicianState;
}) => state.technician.applicationLoading;
export const selectApplicationError = (state: {
  technician: TechnicianState;
}) => state.technician.applicationError;
export const selectIsTechnicianApproved = (state: {
  technician: TechnicianState;
}) => state.technician.profile?.isApproved || false;

export default technicianSlice.reducer;
