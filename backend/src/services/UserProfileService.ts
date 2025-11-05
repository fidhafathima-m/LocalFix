import { IUserManagementRepository } from "../interfaces/repository/admin/IUserManagementRepository";
import { ResponseHelper } from "../utils/responseHelper";
import { uploadToCloudinary } from "../utils/cloudinary";
import { Types } from "mongoose";
import { UserMapper } from "../mappers/userMapper";
import { IAddressRepository } from "../interfaces/repository/user/IAddressRepository";
import { AddressMapper } from "../mappers/addressMapper";
import { LoggerService } from "./LoggerService";

export interface UpdateUserProfileData {
  fullName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePicture?: string;
}

export class UserProfileService {
  private logger: LoggerService;

  constructor(
    private userManagementRepository: IUserManagementRepository,
    private addressRepository: IAddressRepository
  ) {
    this.logger = new LoggerService();
  }

  async getUserProfile(userId: string) {
    const context = {
      operation: "getUserProfile",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Fetching user profile", context);

      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        this.logger.warn("User not found", context);
        return ResponseHelper.notFound("User not found");
      }

      if (user.isDeleted) {
        this.logger.warn("Attempt to access deleted account", context);
        return ResponseHelper.forbidden("Account has been deleted");
      }

      this.logger.debug("User found, fetching addresses", context);

      const addresses = await this.addressRepository.findByUserId(userId);
      const addressDtos = AddressMapper.toDtoList(addresses);

      this.logger.debug(`Found ${addresses.length} addresses for user`, {
        ...context,
        addressCount: addresses.length,
      });

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
        profilePicture: user.profilePictureUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        wallet: user.wallet,
        defaultAddress: user.defaultAddress,
      };

      const enhancedUserDto = {
        ...userDetailDto,
        addresses: addressDtos,
      };

      this.logger.info("Successfully retrieved user profile", {
        ...context,
        userEmail: user.email,
        hasProfilePicture: !!user.profilePictureUrl,
      });

      return ResponseHelper.success("User profile retrieved successfully", {
        user: enhancedUserDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Failed to fetch user profile", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch user profile");
    }
  }

  async updateUserProfile(userId: string, updateData: UpdateUserProfileData) {
    const context = {
      operation: "updateUserProfile",
      userId,
      updateFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Updating user profile", context);

      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        this.logger.warn("User not found for profile update", context);
        return ResponseHelper.notFound("User not found");
      }

      if (user.isDeleted) {
        this.logger.warn("Attempt to update deleted account", context);
        return ResponseHelper.forbidden("Account has been deleted");
      }

      // Build update payload with proper field mapping
      const updatePayload: any = {};
      const updatedFields: string[] = [];

      if (updateData.fullName !== undefined) {
        updatePayload.fullName = updateData.fullName;
        updatedFields.push("fullName");
        this.logger.debug("Updating full name", {
          ...context,
          newFullName: updateData.fullName,
        });
      }

      if (updateData.phone !== undefined) {
        updatePayload.phone = updateData.phone;
        updatedFields.push("phone");
        this.logger.debug("Updating phone number", {
          ...context,
          newPhone: updateData.phone,
        });
      }

      if (updateData.email !== undefined && updateData.email !== user.email) {
        this.logger.debug("Checking email availability", {
          ...context,
          newEmail: updateData.email,
          currentEmail: user.email,
        });

        // Check if email already exists
        const existingUser = await this.userManagementRepository.findByEmail(
          updateData.email
        );
        if (existingUser && existingUser._id.toString() !== userId) {
          this.logger.warn("Email already exists", {
            ...context,
            existingUserId: existingUser._id.toString(),
          });
          return ResponseHelper.error("Email already exists");
        }
        updatePayload.email = updateData.email;
        updatedFields.push("email");
      }

      if (updateData.dateOfBirth !== undefined) {
        updatePayload.dateOfBirth = updateData.dateOfBirth;
        updatedFields.push("dateOfBirth");
        this.logger.debug("Updating date of birth", context);
      }

     if (updateData.gender !== undefined) {
      if (updateData.gender.trim() !== "") {
        updatePayload.gender = updateData.gender;
        updatedFields.push("gender");
        this.logger.debug("Updating gender", {
          ...context,
          newGender: updateData.gender,
        });
      } else {
        updatePayload.gender = undefined;
        this.logger.debug("Removing gender field", context);
      }
    }

      if (updatedFields.length === 0) {
        this.logger.warn("No valid fields to update", context);
        return ResponseHelper.badRequest("No valid fields to update");
      }

      this.logger.debug("Updating user in repository", {
        ...context,
        updatePayload,
        updatedFields,
      });

      const updatedUser = await this.userManagementRepository.update(
        userId,
        updatePayload
      );

      if (!updatedUser) {
        this.logger.error("Failed to update user in database", context);
        return ResponseHelper.error("Failed to update user profile");
      }

      this.logger.debug("Fetching fresh user data after update", context);
      const freshUser = await this.userManagementRepository.findById(userId);

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
        dateOfBirth: freshUser!.dateOfBirth,
         gender: freshUser!.gender || "",
      };

      this.logger.info("Successfully updated user profile", {
        ...context,
        updatedFields,
        userEmail: freshUser!.email,
      });

      return ResponseHelper.success("Profile updated successfully", {
        user: publicUserDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Failed to update user profile", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to update user profile");
    }
  }

  async uploadProfilePicture(userId: string, file: Express.Multer.File) {
    const context = {
      operation: "uploadProfilePicture",
      userId,
      fileSize: file?.size,
      fileName: file?.originalname,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Uploading profile picture", context);

      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        this.logger.warn("User not found for profile picture upload", context);
        return ResponseHelper.notFound("User not found");
      }

      this.logger.debug("Uploading file to Cloudinary", context);

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file);

      if (!uploadResult || !uploadResult.secure_url) {
        this.logger.error("Cloudinary upload failed", context);
        return ResponseHelper.error("Failed to upload profile picture");
      }

      const profilePictureUrl = uploadResult.secure_url;

      this.logger.debug("Updating user profile picture URL", {
        ...context,
        cloudinaryUrl: profilePictureUrl,
      });

      // Update user profile picture
      const updatedUser = await this.userManagementRepository.update(userId, {
        profilePictureUrl,
      });

      if (!updatedUser) {
        this.logger.error(
          "Failed to update user profile picture in database",
          context
        );
        return ResponseHelper.error("Failed to update profile picture");
      }

      this.logger.info("Successfully uploaded profile picture", {
        ...context,
        profilePictureUrl,
      });

      return ResponseHelper.success("Profile picture uploaded successfully", {
        profilePictureUrl,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Failed to upload profile picture", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to upload profile picture");
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    const context = {
      operation: "changePassword",
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this.logger.info("Changing user password", context);

      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        this.logger.warn("User not found for password change", context);
        return ResponseHelper.notFound("User not found");
      }

      if (user.isDeleted) {
        this.logger.warn(
          "Attempt to change password for deleted account",
          context
        );
        return ResponseHelper.forbidden("Account has been deleted");
      }

      // Validate that new password and confirm password match
      if (newPassword !== confirmPassword) {
        this.logger.warn("Password confirmation mismatch", context);
        return ResponseHelper.badRequest("New passwords do not match");
      }

      // Validate password strength
      if (newPassword.length < 6) {
        this.logger.warn("Password too short", {
          ...context,
          passwordLength: newPassword.length,
        });
        return ResponseHelper.badRequest(
          "Password must be at least 6 characters long"
        );
      }

      this.logger.debug("Verifying current password", context);

      // Verify current password
      const isCurrentPasswordValid =
        await this.userManagementRepository.verifyPassword(
          userId,
          currentPassword
        );

      if (!isCurrentPasswordValid) {
        this.logger.warn("Current password verification failed", context);
        return ResponseHelper.badRequest("Current password is incorrect");
      }

      this.logger.debug("Updating password in repository", context);

      // Update password
      const updatedUser = await this.userManagementRepository.updatePassword(
        userId,
        newPassword
      );

      if (!updatedUser) {
        this.logger.error("Failed to update password in repository", context);
        return ResponseHelper.error("Failed to update password");
      }

      this.logger.info("Successfully changed password", context);

      return ResponseHelper.success("Password changed successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Failed to change password", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to change password");
    }
  }
}
