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

  // In UserProfileService.ts - FIX the getUserProfile method
  async getUserProfile(userId: string) {
    try {
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        return ResponseHelper.notFound("User not found");
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden("Account has been deleted");
      }

      // FIX: Ensure ALL fields are included in the response
      const userDetailDto = {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: user.roles,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        applicationStatus: user.applicationStatus,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        profilePicture: user.profilePictureUrl, // This maps to profilePictureUrl in database
        dateOfBirth: user.dateOfBirth, // Make sure this is included
        gender: user.gender, // Make sure this is included
        wallet: user.wallet,
        defaultAddress: user.defaultAddress,
      };

      console.log("🔍 Backend response data:", userDetailDto);
      console.log("🔍 Raw user data from DB:", {
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        profilePictureUrl: user.profilePictureUrl,
      });

      return ResponseHelper.success("User profile retrieved successfully", {
        user: userDetailDto,
      });
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return ResponseHelper.error("Failed to fetch user profile");
    }
  }
  // In UserProfileService.ts - update the updateUserProfile method
  async updateUserProfile(userId: string, updateData: UpdateUserProfileData) {
    try {
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        return ResponseHelper.notFound("User not found");
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden("Account has been deleted");
      }

      // Build update payload with proper field mapping
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

      // FIX: Ensure dateOfBirth is properly handled
      if (updateData.dateOfBirth !== undefined) {
        // Handle both string and Date objects
        updatePayload.dateOfBirth = updateData.dateOfBirth;
      }

      // FIX: Ensure gender is properly handled
      if (updateData.gender !== undefined) {
        updatePayload.gender = updateData.gender;
      }

      // FIX: Add debug logging
      console.log("Updating user profile with payload:", updatePayload);
      console.log("User ID:", userId);

      // FIX: Use findByIdAndUpdate for better reliability
      const updatedUser = await this.userManagementRepository.update(
        userId,
        updatePayload
      );

      if (!updatedUser) {
        console.error("Failed to update user in database");
        return ResponseHelper.error("Failed to update user profile");
      }

      // FIX: Verify the update worked by fetching fresh data
      const freshUser = await this.userManagementRepository.findById(userId);

      console.log("Fresh user data after update:", {
        dateOfBirth: freshUser?.dateOfBirth,
        gender: freshUser?.gender,
        phone: freshUser?.phone,
      });

      const publicUserDto = {
        _id: freshUser!._id.toString(),
        fullName: freshUser!.fullName,
        email: freshUser!.email,
        phone: freshUser!.phone || "Not provided",
        profilePicture: freshUser!.profilePictureUrl,
        isVerified: freshUser!.isVerified,
        createdAt: freshUser!.createdAt,
        defaultAddress: freshUser!.defaultAddress,
        wallet: freshUser!.wallet || { balance: 0 },
        status: freshUser!.status || "Active",
        role: freshUser!.roles?.[0] || "user",
        dateOfBirth: freshUser!.dateOfBirth, // FIX: Remove the fallback to see actual data
        gender: freshUser!.gender, // FIX: Remove the fallback to see actual data
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
  
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    try {
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        return ResponseHelper.notFound("User not found");
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden("Account has been deleted");
      }

      // Validate that new password and confirm password match
      if (newPassword !== confirmPassword) {
        return ResponseHelper.badRequest("New passwords do not match");
      }

      // Validate password strength
      if (newPassword.length < 6) {
        return ResponseHelper.badRequest("Password must be at least 6 characters long");
      }

      // Verify current password
      const isCurrentPasswordValid = await this.userManagementRepository.verifyPassword(
        userId,
        currentPassword
      );

      if (!isCurrentPasswordValid) {
        return ResponseHelper.badRequest("Current password is incorrect");
      }

      // Update password
      const updatedUser = await this.userManagementRepository.updatePassword(
        userId,
        newPassword
      );

      if (!updatedUser) {
        return ResponseHelper.error("Failed to update password");
      }

      return ResponseHelper.success("Password changed successfully");
    } catch (error) {
      console.error("Error changing password:", error);
      return ResponseHelper.error("Failed to change password");
    }
  }
}
