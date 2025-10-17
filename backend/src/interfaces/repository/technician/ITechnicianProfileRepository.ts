import { ITechnician } from "../../../interfaces/technician/ITechnician";
import { IUser, IUserUpdate } from "../../../interfaces/user/IUser";

export interface ITechnicianProfileRepository {
  updateTechnician(
    technicianId: string,
    updateData: any
  ): Promise<ITechnician | null>;
  addDocument(
    technicianId: string,
    documentData: any
  ): Promise<ITechnician | null>;
  updateDocument(
    technicianId: string,
    documentId: string,
    updateData: any
  ): Promise<ITechnician | null>;
  removeDocument(
    technicianId: string,
    documentId: string
  ): Promise<ITechnician | null>;
  updateTechnicianPersonalInfo(
    technicianId: string,
    personalInfo: any
  ): Promise<ITechnician | null>;

  updateAvailability(
    technicianId: string,
    availabilityData: any
  ): Promise<ITechnician | null>;

  updatePaymentDetails(
    technicianId: string,
    paymentData: any
  ): Promise<ITechnician | null>;
  updateIdentityVerification(
    technicianId: string,
    verificationData: any
  ): Promise<ITechnician | null>;
  findByService(service: string): Promise<ITechnician[]>;
  findByLocation(location: string): Promise<ITechnician[]>;
  findAvailableTechnicians(): Promise<ITechnician[]>;
  countTechnicians(filter: any): Promise<number>;
  findAll(filter: any, skip: number, limit: number): Promise<ITechnician[]>;
  updateUser(userId: string, updateData: IUserUpdate): Promise<IUser | null>;
  verifyPassword(userId: string, password: string): Promise<boolean>;
  updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<IUser | null>;
  updateLastLogin(userId: string): Promise<IUser | null>;
  updateLoginDevice(userId: string, deviceInfo: string): Promise<IUser | null>;
  findByRole(role: string): Promise<IUser[]>;
  countUsers(filter: any): Promise<number>;
  findAllUsers(filter: any, skip: number, limit: number): Promise<IUser[]>;
  deleteUser(userId: string): Promise<boolean>;
  updateProfile(userId: string, profileData: any): Promise<IUser | null>;
}
