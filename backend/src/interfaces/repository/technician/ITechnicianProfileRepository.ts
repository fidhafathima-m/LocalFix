import { AvailabilityInfo, BankInfo, DocumentsInfo, ITechnician, PersonalInfo } from "../../../interfaces/technician/ITechnician";
import { IUser, IUserUpdate } from "../../../interfaces/user/IUser";
import { FilterQuery } from "../admin/ITechnicianManagementRepository";

export interface VerificationData {
  idType: string;
  idNumber: string;
  verified: boolean;
  verifiedAt?: Date;
  verifiedBy?: string;
}


export interface DocumentUpdateData {
  verified?: boolean;
  status?: string;
  verifiedAt?: Date;
}

export interface ProfileData {
  fullName?: string;
  phone?: string;
  profilePicture?: string;
  [key: string]: unknown;
}


export interface ITechnicianProfileRepository {
  updateTechnician(
    technicianId: string,
    updateData: Partial<ITechnician>
  ): Promise<ITechnician | null>;
  addDocument(
    technicianId: string,
    documentData: DocumentsInfo
  ): Promise<ITechnician | null>;
  updateDocument(
    technicianId: string,
    documentId: string,
    updateData: DocumentUpdateData
  ): Promise<ITechnician | null>;
  removeDocument(
    technicianId: string,
    documentId: string
  ): Promise<ITechnician | null>;
  updateTechnicianPersonalInfo(
    technicianId: string,
    personalInfo: PersonalInfo
  ): Promise<ITechnician | null>;

  updateAvailability(
    technicianId: string,
    availabilityData: AvailabilityInfo
  ): Promise<ITechnician | null>;

  updateTechnicianPaymentDetails(
  technicianId: string,
  paymentDetails: {
    bankAccount: {
      holderName: string;
      accountNumber: string;
      ifscCode: string;
      bankName: string;
    };
    upiId: string;
    withdrawalPreference: string;
  }
): Promise<boolean>
  updateIdentityVerification(
    technicianId: string,
    verificationData: VerificationData
  ): Promise<ITechnician | null>;
  findByService(service: string): Promise<ITechnician[]>;
  findByLocation(location: string): Promise<ITechnician[]>;
  findAvailableTechnicians(): Promise<ITechnician[]>;
  countTechnicians(filter: FilterQuery): Promise<number>;
  findAll(filter: FilterQuery, skip: number, limit: number): Promise<ITechnician[]>;
  updateUser(userId: string, updateData: IUserUpdate): Promise<IUser | null>;
  verifyPassword(userId: string, password: string): Promise<boolean>;
  updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<IUser | null>;
  updateLastLogin(userId: string): Promise<IUser | null>;
  updateLoginDevice(userId: string, deviceInfo: string): Promise<IUser | null>;
  findByRole(role: string): Promise<IUser[]>;
  countUsers(filter: FilterQuery): Promise<number>;
  findAllUsers(filter: FilterQuery, skip: number, limit: number): Promise<IUser[]>;
  deleteUser(userId: string): Promise<boolean>;
  updateProfile(userId: string, profileData: ProfileData): Promise<IUser | null>;
}
