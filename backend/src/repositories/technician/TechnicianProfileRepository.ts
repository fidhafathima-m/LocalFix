import { AvailabilityInfo, BankInfo, DocumentsInfo, ITechnician, PersonalInfo } from "../../interfaces/technician/ITechnician";
import { Technician } from "../../models/technician/TechnicianSchema";
import { Types } from "mongoose";
import { DocumentUpdateData, ITechnicianProfileRepository, ProfileData, VerificationData } from "../../interfaces/repository/technician/ITechnicianProfileRepository";
import { IUser, IUserUpdate } from "../../interfaces/user/IUser";
import UserSchema from "../../models/UserSchema";
import bcrypt from "bcrypt";
import { FilterQuery } from "@/interfaces/repository/admin/ITechnicianManagementRepository";



export class TechnicianProfileRepository
  implements ITechnicianProfileRepository
{
  async updateTechnician(
  technicianId: string,
  updateData: Partial<ITechnician>
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


    const result = await Technician.findByIdAndUpdate(
      technicianId,
      { $set: processedUpdateData },
      { new: true, runValidators: true }
    );

    return result;
  } catch (error) {
    console.error("REPOSITORY - Error updating technician:", error);
    throw error;
  }
}

  async addDocument(
    technicianId: string,
    documentData: DocumentsInfo
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
    updateData: Partial<DocumentUpdateData>
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
    personalInfo: PersonalInfo
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
    availabilityData: AvailabilityInfo
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

  async updateTechnicianPaymentDetails(
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
): Promise<boolean> {
  try {
    const result = await Technician.findByIdAndUpdate(
      technicianId,
      {
        $set: {
          'paymentDetails.bankAccount': paymentDetails.bankAccount,
          'paymentDetails.upiId': paymentDetails.upiId,
          'paymentDetails.withdrawalPreference': paymentDetails.withdrawalPreference,
        },
      },
      { new: true }
    );

    return !!result;
  } catch (error) {
    console.error('Error updating payment details:', error);
    return false;
  }
}
  async updateIdentityVerification(
    technicianId: string,
    verificationData: VerificationData
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

  async countTechnicians(filter: FilterQuery = {}): Promise<number> {
    return await Technician.countDocuments(filter);
  }

  async findAll(
    filter: FilterQuery = {},
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

  async updateUserPassword(userId: string, newPassword: string): Promise<IUser | null> {
    try {

      // Hash the new password
      const saltRounds = 12;
      const passwordHash = await bcrypt.hash(newPassword, saltRounds);
    

      // Update the user's password
      const result = await UserSchema.findByIdAndUpdate(
        userId,
        {
          $set: {
            passwordHash,
            updatedAt: new Date(),
          },
        },
        { new: true }
      );

      return result;
    } catch (error) {
      console.error('TECH PROFILE REPO - Error updating password:', error);
      throw error;
    }
  }

  async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      
      // Make sure to select the passwordHash field explicitly
      const user = await UserSchema.findById(userId).select('+passwordHash');
      
      if (!user || !user.passwordHash) {
        return false;
      }
      
      const isValid = await bcrypt.compare(password, user.passwordHash);
      
      return isValid;
    } catch (error) {
      console.error('TECH PROFILE REPO - Error verifying password:', error);
      return false;
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

  async countUsers(filter: FilterQuery = {}): Promise<number> {
    return await UserSchema.countDocuments(filter);
  }

  async findAllUsers(
    filter: FilterQuery = {},
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

  async updateProfile(userId: string, profileData: ProfileData): Promise<IUser | null> {
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
