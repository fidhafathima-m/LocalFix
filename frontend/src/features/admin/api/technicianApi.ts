import api from "../../../utils/axiosConfig";

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
    createdAt: string;
  };
}

interface TechnicianApplication {
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

interface ApplicationStats {
  totalApplications: number;
  draftApplications: number;
  submittedApplications: number;
  underReviewApplications: number;
  approvedApplications: number;
  rejectedApplications: number;
  [key: string]: number;
}

interface TechnicianStats {
  totalTechnicians: number;
  approvedTechnicians: number;
  pendingTechnicians: number;
  rejectedTechnicians: number;
  suspendedTechnicians: number;
  [key: string]: number;
}

// Fetch all technicians
export const fetchTechnicians = async (
  filters: { status?: string } = {}
): Promise<Technician[]> => {
  try {
    console.log("🔍 API: Fetching technicians with filters:", filters);

    const res = await api.get<ApiResponse<{ technicians: Technician[] }>>(
      "/admin/technicians",
      {
        params: filters,
      }
    );

    console.log("🔍 API: Technicians response:", res.data);

    if (res.data.success && res.data.data && res.data.data.technicians) {
      return res.data.data.technicians;
    } else {
      throw new Error(res.data.message || "Failed to fetch technicians");
    }
  } catch (error) {
    console.error("❌ Error fetching technicians:", error);
    throw error;
  }
};

// Fetch pending applications
export const fetchPendingApplications = async (): Promise<
  TechnicianApplication[]
> => {
  try {
    const res = await api.get<
      ApiResponse<{ applications: TechnicianApplication[] }>
    >("/admin/technicians/applications/pending");

    if (res.data.success && res.data.data && res.data.data.applications) {
      return res.data.data.applications;
    } else {
      throw new Error(
        res.data.message || "Failed to fetch pending applications"
      );
    }
  } catch (error) {
    console.error("❌ Error fetching pending applications:", error);
    throw error;
  }
};

// Approve application
export const approveApplication = async (
  applicationId: string,
  emailNotification: boolean = true
): Promise<void> => {
  const res = await api.patch<ApiResponse<void>>(
    `/admin/technicians/applications/${applicationId}/approve`,
    { emailNotification }
  );

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to approve application");
  }
};

// Reject application
export const rejectApplication = async (
  applicationId: string,
  rejectionReason: string,
  emailNotification: boolean = true
): Promise<void> => {
  console.log("🔍 API: Rejecting application:", applicationId);
  console.log("🔍 API: Rejection reason:", rejectionReason);
  console.log("🔍 API: Email notification:", emailNotification);

  const res = await api.patch<ApiResponse<void>>(
    `/admin/technicians/applications/${applicationId}/reject`,
    { rejectionReason, emailNotification }
  );

  console.log("🔍 API Response:", res.data);

  if (!res.data.success) {
    throw new Error(res.data.message || "Failed to reject application");
  }
};

// Update technician status
export const updateTechnicianStatus = async (
  technicianId: string,
  status: string,
  emailNotification: boolean = true,
  reason?: string
): Promise<Technician> => {
  const res = await api.patch<ApiResponse<{ technician: Technician }>>(
    `/admin/technicians/${technicianId}/status`,
    { status, emailNotification, reason }
  );

  if (res.data.success && res.data.data && res.data.data.technician) {
    return res.data.data.technician;
  } else {
    throw new Error(res.data.message || "Failed to update technician status");
  }
};

// Get technician stats
export const getTechnicianStats = async (): Promise<TechnicianStats> => {
  const res = await api.get<ApiResponse<{ stats: TechnicianStats }>>(
    "/admin/technicians/stats"
  );

  if (res.data.success && res.data.data) {
    return res.data.data.stats;
  } else {
    throw new Error(res.data.message || "Failed to fetch technician stats");
  }
};

// Get application stats
export const getApplicationStats = async (): Promise<ApplicationStats> => {
  const res = await api.get<ApiResponse<{ stats: ApplicationStats }>>(
    "/admin/technicians/applications/stats"
  );

  if (res.data.success && res.data.data) {
    return res.data.data.stats;
  } else {
    throw new Error(res.data.message || "Failed to fetch application stats");
  }
};

// Update the fetchTechnicianById
export const fetchTechnicianById = async (
  technicianId: string
): Promise<Technician> => {
  try {
    const res = await api.get<ApiResponse<{ technician: Technician }>>(
      `/admin/technicians/${technicianId}`
    );

    if (res.data.success && res.data.data) {
      const technician =
        res.data.data.technician ||
        (res.data.data.technician && res.data.data.technician[0]);

      if (technician) {
        return technician;
      }
    }

    throw new Error(res.data.message || "Failed to fetch technician");

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error fetching technician by ID:", error);
    throw error;
  }
};
