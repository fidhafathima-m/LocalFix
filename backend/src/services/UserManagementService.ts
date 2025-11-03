import { UserManagementRepository } from "../repositories/admin/UserManagementRepository";
import { IUserManagementService } from "../interfaces/services/admin/IUserManagementService";
import { IUserManagementRepository } from "../interfaces/repository/admin/IUserManagementRepository";
import { ResponseHelper } from "../utils/responseHelper";
import {
  USER_MANAGEMENT_MESSAGES,
  VALID_STATUSES,
  VALIDATION,
} from "../constants";
import {
  UsersListResponseDto,
  UserManagementResponseDto,
  UserStatsResponseDto,
  UpdateUserStatusRequestDto,
  EditUserRequestDto,
} from "../interfaces/dtos/userDtos";
import { UserMapper } from "../mappers/userMapper";
import { LoggerService } from "./LoggerService";

// Type guard function for status validation
function isValidStatus(
  status: string
): status is "Active" | "Inactive" | "Blocked" {
  return VALID_STATUSES.includes(status as any);
}

export class UserManagementService implements IUserManagementService {
  private userManagementRepository: IUserManagementRepository
  private logger: LoggerService

  constructor(
   userManagementRepository: IUserManagementRepository
  ) {
    this.userManagementRepository = userManagementRepository
    this.logger = new LoggerService()
  }

  async getUsers(): Promise<UsersListResponseDto> {
    const context = {
      operation: "getUsers",
      timestamp: new Date().toString()
    }
    try {
      this.logger.info("Finding all users", context)
      const users = await this.userManagementRepository.findAllUsers();

      const userDtos = users.map((user) => UserMapper.toListDto(user));

      this.logger.debug("Users retrieved", {
        ...context,
        users: userDtos
      })

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USERS_RETRIEVED, {
        users: userDtos,
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      this.logger.error('Failed to get all users', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_FETCH_USERS);
    }
  }

  async updateUserStatus(
    userId: string,
    statusData: UpdateUserStatusRequestDto
  ): Promise<UserManagementResponseDto> {
    const context = {
      operation: "updateUserStatus",
      userId,
      status: statusData,
      timestamp: new Date().toString()
    }
    try {
      this.logger.info("Updating user status", context)
      const { status } = statusData;

      if (!isValidStatus(status)) {
        this.logger.error("Invalid status value", {
          ...context,
        })
        return ResponseHelper.badRequest(
          USER_MANAGEMENT_MESSAGES.INVALID_STATUS_VALUE
        );
      }

      const user = await this.userManagementRepository.findById(userId);
      if (!user) {
        this.logger.warn("User not found", context)
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      this.logger.info("User found", {
        ...context,
        userId
      })

      if (user.isDeleted) {
        this.logger.warn("Deleted user cannot be updated", context)
        return ResponseHelper.forbidden(
          USER_MANAGEMENT_MESSAGES.CANNOT_UPDATE_DELETED_USER
        );
      }

      const updatedUser = await this.userManagementRepository.updateUserStatus(
        userId,
        status
      );

      if (!updatedUser) {
        this.logger.error("Failed to update user status", context)
        return ResponseHelper.conflict(
          USER_MANAGEMENT_MESSAGES.UPDATE_CONFLICT
        );
      }

      const userDto = UserMapper.toDetailDto(updatedUser);

      this.logger.info("User status updated", {
        ...context,
        user: userDto
      })

      return ResponseHelper.success(
        USER_MANAGEMENT_MESSAGES.USER_STATUS_UPDATED,
        {
          user: userDto,
        }
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      this.logger.error('Failed to update user status', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      return ResponseHelper.error(
        USER_MANAGEMENT_MESSAGES.FAILED_UPDATE_STATUS
      );
    }
  }

  async editUser(
    userId: string,
    userData: EditUserRequestDto
  ): Promise<UserManagementResponseDto> {
    const context = {
      operation: "editUser",
      userId,
      user: userData
    }
    try {
      this.logger.info("Editing user", context)
      const { fullName, email, phone, status } = userData;

      if (status) {
        if (!isValidStatus(status)) {
          this.logger.warn("Invalid status value", context)
          return ResponseHelper.badRequest(
            USER_MANAGEMENT_MESSAGES.INVALID_STATUS_VALUE
          );
        }
      }

      const user = await this.userManagementRepository.findById(userId);
      if (!user) {
        this.logger.warn("User not found", context)
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        this.logger.warn("Deleted user cannot be updated", context)
        return ResponseHelper.forbidden(
          USER_MANAGEMENT_MESSAGES.CANNOT_UPDATE_DELETED_USER
        );
      }

      // Validate email format if provided
      if (email && !VALIDATION.EMAIL_REGEX.test(email)) {
        this.logger.warn("not a valid email", context)
        return ResponseHelper.badRequest(
          "Please provide a valid email address"
        );
      }

      // Validate full name length if provided
      if (
        fullName &&
        (fullName.length < VALIDATION.MIN_FULL_NAME_LENGTH ||
          fullName.length > VALIDATION.MAX_FULL_NAME_LENGTH)
      ) {
        this.logger.warn( `Full name must be between ${VALIDATION.MIN_FULL_NAME_LENGTH} and ${VALIDATION.MAX_FULL_NAME_LENGTH} characters`)
        return ResponseHelper.badRequest(
          `Full name must be between ${VALIDATION.MIN_FULL_NAME_LENGTH} and ${VALIDATION.MAX_FULL_NAME_LENGTH} characters`
        );
      }

      // Validate phone length if provided
      if (
        phone &&
        (phone.length < VALIDATION.MIN_PHONE_LENGTH ||
          phone.length > VALIDATION.MAX_PHONE_LENGTH)
      ) {
        this.logger.warn(`Phone number must be between ${VALIDATION.MIN_PHONE_LENGTH} and ${VALIDATION.MAX_PHONE_LENGTH} characters`)
        return ResponseHelper.badRequest(
          `Phone number must be between ${VALIDATION.MIN_PHONE_LENGTH} and ${VALIDATION.MAX_PHONE_LENGTH} characters`
        );
      }

      const updateData: any = {};
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (status) updateData.status = status;

      const updatedUser = await this.userManagementRepository.update(
        userId,
        updateData
      );

      if (!updatedUser) {
        this.logger.error("Failed to update user", context)
        return ResponseHelper.conflict(
          USER_MANAGEMENT_MESSAGES.UPDATE_USER_CONFLICT
        );
      }

      const userDto = UserMapper.toDetailDto(updatedUser);

      this.logger.info("user updated", {
        ...context,
        user: userDto
      })

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_UPDATED, {
        user: userDto,
      });
    } catch (error) {
      console.error("Error updating user:", error);
      this.logger.error('Failed to edit user', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_UPDATE_USER);
    }
  }

  async deleteUser(userId: string): Promise<UserManagementResponseDto> {
    const context = {
      operation: "deleteUser",
      userId,
      timestamp: new Date().toString()
    }
    try {
      this.logger.info("Deleting user", context)
      const user = await this.userManagementRepository.findById(userId);
      if (!user) {
        this.logger.warn("User not found", context)
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        this.logger.error("User already deleted", context)
        return ResponseHelper.badRequest(
          USER_MANAGEMENT_MESSAGES.USER_ALREADY_DELETED
        );
      }

      const deletedUser = await this.userManagementRepository.softDeleteUser(
        userId
      );

      if (!deletedUser) {
        this.logger.error("Failed to delete user", context)
        return ResponseHelper.conflict(
          USER_MANAGEMENT_MESSAGES.DELETE_CONFLICT
        );
      }

      const userDto = UserMapper.toDetailDto(deletedUser);

      this.logger.info("User deleted", {
        ...context, 
        user: userDto
      })

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_DELETED, {
        user: userDto,
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      this.logger.error('Failed to delete user', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_DELETE_USER);
    }
  }

  async getUserStats(): Promise<UserStatsResponseDto> {
    const context = {
      operation: "getUserStats",
      timestamp: new Date().toString()
    }
    try {
      this.logger.info("Fetchning user stats", context)
      const stats = await this.userManagementRepository.getUserStats();

      const statsDto = UserMapper.toStatsDto(stats);

      this.logger.info("User stats retriened", {
        ...context,
        stats: statsDto,
      })

      return ResponseHelper.success(
        USER_MANAGEMENT_MESSAGES.USER_STATS_RETRIEVED,
        {
          stats: statsDto,
        }
      );
    } catch (error) {
      console.error("Error fetching user stats:", error);
      this.logger.error('Failed to get user sttas', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_FETCH_STATS);
    }
  }

  async getUserById(userId: string): Promise<UserManagementResponseDto> {
    const context = {
      operation: "getUserById",
      userId
    }
    try {
      this.logger.info("Fetching user by id", context)
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        this.logger.warn("User not found", context)
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        this.logger.warn("User has been deleted", context)
        return ResponseHelper.forbidden(
          USER_MANAGEMENT_MESSAGES.CANNOT_ACCESS_DELETED_USER
        );
      }

      // Get user addresses
      const userAddresses = await this.userManagementRepository.findUserAddresses(userId);
      
      const userDto = UserMapper.toDetailDto(user, userAddresses);

      this.logger.info("User retrieved", {
        ...context,
        user: userDto,
      })

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_RETRIEVED, {
        user: userDto,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      this.logger.error('Failed to get user by id', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_FETCH_USER);
    }
  }

  async getPublicUserById(userId: string): Promise<UserManagementResponseDto> {
    const context = {
      operation: "getPublicUserById",
      userId,
      timestamp: new Date().toString()
    }
    try {
      this.logger.info("fetching public user by id", context)
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        this.logger.warn("User not found", context)
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        this.logger.warn("User has been deleted", context)
        return ResponseHelper.forbidden(
          USER_MANAGEMENT_MESSAGES.CANNOT_ACCESS_DELETED_USER
        );
      }

      // Get ALL user addresses
      const userAddresses = await this.userManagementRepository.findUserAddresses(userId);
      
      // Map addresses to the format expected by frontend
      const addresses = userAddresses.map(address => ({
        id: address._id.toString(),
        label: address.label || "Home",
        street: address.street || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark || "",
        isDefault: address.isDefault,
        location: address.location,
        formattedAddress: address.formattedAddress || "",
        placeId: address.placeId,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
      }));

      const defaultAddress = userAddresses.find((addr) => addr.isDefault) || userAddresses[0];

      const publicUserDto = {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone || "Not provided",
        profilePicture: user.profilePictureUrl,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        defaultAddress: defaultAddress
          ? {
              city: defaultAddress.city,
              state: defaultAddress.state,
              pincode: defaultAddress.pincode,
              landmark: defaultAddress.landmark,
              location: defaultAddress.location,
            }
          : undefined,
        wallet: user.wallet || { balance: 0 },
        status: user.status || "Active",
        role: user.roles?.[0] || "user",
        addresses: addresses, // All addresses array
      };

      this.logger.info("User retrieved", {
        ...context,
        user: publicUserDto,
      })

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_RETRIEVED, {
        user: publicUserDto,
      });
    } catch (error) {
      console.error("Error fetching public user:", error);
      this.logger.error('Failed to get public user', {
        ...context,
        error: error,
        stack: error instanceof Error ? error.stack : undefined
      });
      return ResponseHelper.error("Failed to fetch user");
    }
  }
}