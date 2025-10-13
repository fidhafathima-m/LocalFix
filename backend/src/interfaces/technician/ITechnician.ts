import { Types } from "mongoose";

export interface IGeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export type ServiceRates = Record<string, number>;

export interface ITechnician {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  phone?: string;
  personalInfo?: {
    fullName: string;
    gender?: string;
    phoneNumber?: string;
    dateOfBirth?: string;
    address?: {
      street?: string;
      city?: string;
      state?: string;
      pincode?: string;
    };
    languages?: string[];
  };
  displayName: string;
  bio: string;
  experienceYears: number;
  services: string[];
  serviceRates: ServiceRates;
  workAreas: string[];
  serviceRadiusKm: number;
  currentLocation?: IGeoPoint;
  averageRating: number;
  ratingCount: number;
  status:
    | "not-applied"
    | "draft"
    | "submitted"
    | "under_review"
    | "approved"
    | "rejected";
  rejectionReason?: string;
  resubmittedCount: number;
  rejectedAt?: Date;
  profilePictureUrl?: string;
  previousApplicationId?: Types.ObjectId;
  suspensionReason?: string;
  suspendedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
