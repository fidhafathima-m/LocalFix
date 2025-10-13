export interface TechnicianDetails {
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
  completedJobs?: number;
  ongoingJobs?: number;
  totalEarnings?: number;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    phone: string;
    fullName: string;
    createdAt?: string;
  };
  personalInfo?: {
    fullName: string;
    gender?: string;
    phoneNumber: string;
    dateOfBirth?: string;
    languages?: string[];
    address?: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  documents?: {
    aadhaarCard?: { url: string; verified: boolean };
    panCard?: { url: string; verified: boolean };
    drivingLicense?: { url: string; verified: boolean };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any;
  };
  availability?: {
    isAvailable: boolean;
    schedule: Array<{
      day: string;
      slots: Array<{ start: string; end: string }>;
    }>;
  };
}
