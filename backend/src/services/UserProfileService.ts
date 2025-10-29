import { IUserManagementRepository } from "../interfaces/repository/admin/IUserManagementRepository";
import { ResponseHelper } from "../utils/responseHelper";
import { uploadToCloudinary } from "../utils/cloudinary";
import { Types } from "mongoose";
import { UserMapper } from "../mappers/userMapper";

export interface UpdateUserProfileData {
  fullName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePicture?: string;
}

export class UserProfileService {
  constructor(private userManagementRepository: IUserManagementRepository) {}

  async getUserProfile(userId: string) {
    try {
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        return ResponseHelper.notFound("User not found");
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden("Account has been deleted");
      }

      const userDetailDto = {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: user.roles,
        isEmailVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        applicationStatus: user.applicationStatus,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        profilePictureUrl: user.profilePictureUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        wallet: user.wallet,
        defaultAddress: user.defaultAddress,
      };

      return ResponseHelper.success("User profile retrieved successfully", {
        user: userDetailDto,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return ResponseHelper.error("Failed to fetch user profile");
    }
  }

  async updateUserProfile(userId: string, updateData: UpdateUserProfileData) {
    try {
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        return ResponseHelper.notFound("User not found");
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden("Account has been deleted");
      }

      // Build update payload with correct field names
      const updatePayload: any = {};

      if (updateData.fullName !== undefined) {
        updatePayload.fullName = updateData.fullName;
      }

      if (updateData.phone !== undefined) {
        updatePayload.phone = updateData.phone;
      }

      if (updateData.email !== undefined && updateData.email !== user.email) {
        // Check if email already exists
        const existingUser = await this.userManagementRepository.findByEmail(
          updateData.email
        );
        if (existingUser && existingUser._id.toString() !== userId) {
          return ResponseHelper.error("Email already exists");
        }
        updatePayload.email = updateData.email;
      }

      if (updateData.dateOfBirth !== undefined) {
        updatePayload.dateOfBirth = updateData.dateOfBirth;
      }

      if (updateData.gender !== undefined) {
        updatePayload.gender = updateData.gender;
      }

      if (updateData.profilePicture !== undefined) {
        updatePayload.profilePictureUrl = updateData.profilePicture;
      }

      const updatedUser = await this.userManagementRepository.update(
        userId,
        updatePayload
      );

      if (!updatedUser) {
        return ResponseHelper.error("Failed to update user profile");
      }

      const publicUserDto = {
        _id: updatedUser._id.toString(),
        fullName: updatedUser.fullName,
        email: updatedUser.email,
        phone: updatedUser.phone || "Not provided",
        profilePicture: updatedUser.profilePictureUrl,
        isVerified: updatedUser.isVerified,
        createdAt: updatedUser.createdAt,
        defaultAddress: updatedUser.defaultAddress,
        wallet: updatedUser.wallet || { balance: 0 },
        status: updatedUser.status || "Active",
        role: updatedUser.roles?.[0] || "user",
        dateOfBirth: updatedUser.dateOfBirth || "Not set",
        gender: updatedUser.gender || "Not specified",
      };

      return ResponseHelper.success("Profile updated successfully", {
        user: publicUserDto,
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      return ResponseHelper.error("Failed to update user profile");
    }
  }
  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    try {
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        return ResponseHelper.notFound("User not found");
      }

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file);

      if (!uploadResult || !uploadResult.secure_url) {
        return ResponseHelper.error("Failed to upload profile picture");
      }

      const profilePictureUrl = uploadResult.secure_url;

      // Update user profile picture
      const updatedUser = await this.userManagementRepository.update(userId, {
        profilePictureUrl,
      });

      if (!updatedUser) {
        return ResponseHelper.error("Failed to update profile picture");
      }

      return ResponseHelper.success("Profile picture uploaded successfully", {
        profilePictureUrl,
      });
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      return ResponseHelper.error("Failed to upload profile picture");
    }
  }
}
