import { ITechnician } from "../../interfaces/technician/ITechnician";
import { Technician } from "../../models/technician/TechnicianSchema";
import { Types } from "mongoose";
import { ITechnicianProfileRepository } from "../../interfaces/repository/technician/ITechnicianProfileRepository";
import { IUser, IUserUpdate } from "../../interfaces/user/IUser";
import UserSchema from "../../models/UserSchema";
import bcrypt from "bcrypt";

interface TechnicianUpdateData {
  displayName?: string;
  services?: string[];
  experienceYears?: number;
  workAreas?: string[];
  serviceRadiusKm?: number;
  profilePictureUrl?: string;
  phone?: string;
  personalInfo?: PersonalInfo;
  availability?: AvailabilityData;
  paymentDetails?: PaymentData;
  identityVerification?: VerificationData;
  [key: string]: unknown;
}

interface PersonalInfo {
  fullName?: string;
  gender?: string;
  phoneNumber?: string;
  dateOfBirth?: Date;
  address?: string;
  languages?: string[];
  [key: string]: unknown;
}

interface DocumentData {
  type: string;
  url: string;
  name: string;
  verified?: boolean;
  status?: string;
  verifiedAt?: Date;
  uploadedAt?: Date;
  [key: string]: unknown;
}

interface DocumentUpdateData {
  verified?: boolean;
  status?: string;
  verifiedAt?: Date;
  [key: string]: unknown;
}

interface AvailabilityData {
  isAvailable?: boolean;
  workingDays?: string[];
  startTime?: string;
  endTime?: string;
  serviceAreas?: string[];
  workRadius?: number;
  [key: string]: unknown;
}

interface PaymentData {
  bankAccount?: {
    accountNumber?: string;
    ifscCode?: string;
    accountHolderName?: string;
  };
  upiId?: string;
  [key: string]: unknown;
}

interface VerificationData {
  status?: string;
  verifiedAt?: Date;
  verifiedBy?: string;
  documents?: string[];
  [key: string]: unknown;
}

interface TechnicianFilter {
  status?: string;
  services?: string | { $in: string[] };
  workAreas?: { $regex: string; $options: string };
  "availability.isAvailable"?: boolean;
  [key: string]: unknown;
}

interface UserFilter {
  role?: string;
  [key: string]: unknown;
}

interface ProfileData {
  fullName?: string;
  phone?: string;
  profilePicture?: string;
  [key: string]: unknown;
}

export class TechnicianProfileRepository
  implements ITechnicianProfileRepository
{
  async updateTechnician(
    technicianId: string,
    updateData: TechnicianUpdateData
  ): Promise<ITechnician | null> {
    try {
      const processedUpdateData = {
        ...updateData,
        personalInfo: updateData.personalInfo
          ? {
              ...updateData.personalInfo,
              languages: Array.isArray(updateData.personalInfo?.languages)
                ? updateData.personalInfo.languages
                : [],
            }
          : undefined,
      };

      return await Technician.findByIdAndUpdate(
        technicianId,
        { $set: processedUpdateData },
        { new: true, runValidators: true }
      );
    } catch (error) {
      console.error("Error updating technician:", error);
      throw error;
    }
  }

  async addDocument(
    technicianId: string,
    documentData: DocumentData
  ): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(
      technicianId,
      {
        $push: {
          documents: {
            ...documentData,
            _id: new Types.ObjectId(),
          },
        },
      },
      { new: true }
    );
  }

  async updateDocument(
    technicianId: string,
    documentId: string,
    updateData: DocumentUpdateData
  ): Promise<ITechnician | null> {
    return await Technician.findOneAndUpdate(
      {
        _id: new Types.ObjectId(technicianId),
        "documents._id": new Types.ObjectId(documentId),
      },
      {
        $set: {
          "documents.$.verified": updateData.verified,
          "documents.$.status": updateData.status,
          "documents.$.verifiedAt": updateData.verifiedAt,
        },
      },
      { new: true }
    );
  }

  async removeDocument(
    technicianId: string,
    documentId: string
  ): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(
      technicianId,
      {
        $pull: {
          documents: { _id: new Types.ObjectId(documentId) },
        },
      },
      { new: true }
    );
  }

  async updateTechnicianPersonalInfo(
    technicianId: string,
    personalInfo: any
  ): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(
      technicianId,
      {
        $set: {
          personalInfo: {
            ...personalInfo,
            languages: Array.isArray(personalInfo.languages)
              ? personalInfo.languages
              : [],
          },
        },
      },
      { new: true }
    );
  }

  async updateAvailability(
    technicianId: string,
    availabilityData: any
  ): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(
      technicianId,
      {
        $set: {
          availability: availabilityData,
        },
      },
      { new: true }
    );
  }

  async updatePaymentDetails(
    technicianId: string,
    paymentData: PaymentData
  ): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(
      technicianId,
      {
        $set: {
          paymentDetails: paymentData,
        },
      },
      { new: true }
    );
  }

  async updateIdentityVerification(
    technicianId: string,
    verificationData: any
  ): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(
      technicianId,
      {
        $set: {
          identityVerification: verificationData,
        },
      },
      { new: true }
    );
  }

  async findByService(service: string): Promise<ITechnician[]> {
    return await Technician.find({
      services: service,
      status: "approved",
    });
  }

  async findByLocation(location: string): Promise<ITechnician[]> {
    return await Technician.find({
      workAreas: { $regex: location, $options: "i" },
      status: "approved",
    });
  }

  async findAvailableTechnicians(): Promise<ITechnician[]> {
    return await Technician.find({
      status: "approved",
      "availability.isAvailable": true,
    });
  }

  async countTechnicians(filter: any = {}): Promise<number> {
    return await Technician.countDocuments(filter);
  }

  async findAll(
    filter: any = {},
    skip: number = 0,
    limit: number = 10
  ): Promise<ITechnician[]> {
    return await Technician.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async updateUser(
    userId: string,
    updateData: IUserUpdate
  ): Promise<IUser | null> {
    return await UserSchema.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    );
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      const user = await UserSchema.findById(userId);
      if (!user || !user.passwordHash) {
        return false;
      }
      return await bcrypt.compare(password, user.passwordHash);
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  }

  async updateUserPassword(
    userId: string,
    newPassword: string
  ): Promise<IUser | null> {
    try {
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);

      return await UserSchema.findByIdAndUpdate(
        userId,
        {
          $set: {
            passwordHash,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );
    } catch (error) {
      console.error("Error updating password:", error);
      throw error;
    }
  }

  async updateLastLogin(userId: string): Promise<IUser | null> {
    return await UserSchema.findByIdAndUpdate(
      userId,
      {
        $set: {
          lastLogin: new Date(),
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async updateLoginDevice(
    userId: string,
    deviceInfo: string
  ): Promise<IUser | null> {
    return await UserSchema.findByIdAndUpdate(
      userId,
      {
        $set: {
          loginDevice: deviceInfo,
          updatedAt: new Date(),
        },
      },
      { new: true }
    );
  }

  async findByRole(role: string): Promise<IUser[]> {
    return await UserSchema.find({ role }).sort({ createdAt: -1 });
  }

  async countUsers(filter: any = {}): Promise<number> {
    return await UserSchema.countDocuments(filter);
  }

  async findAllUsers(
    filter: any = {},
    skip: number = 0,
    limit: number = 10
  ): Promise<IUser[]> {
    return await UserSchema.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result = await UserSchema.findByIdAndDelete(userId);
    return result !== null;
  }

  async updateProfile(userId: string, profileData: any): Promise<IUser | null> {
    return await UserSchema.findByIdAndUpdate(
      userId,
      {
        $set: {
          ...profileData,
          updatedAt: new Date(),
        },
      },
      { new: true, runValidators: true }
    );
  }
}
