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

// Type guard function for status validation
function isValidStatus(status: string): status is "Active" | "Inactive" | "Blocked" {
  return VALID_STATUSES.includes(status as any);
}

export class UserManagementService implements IUserManagementService {
  constructor(private userManagementRepository: IUserManagementRepository) {}

  async getUsers(): Promise<UsersListResponseDto> {
    try {
      const users = await this.userManagementRepository.findAllUsers();

      // ✅ Map to DTOs
      const userDtos = users.map(user => UserMapper.toListDto(user));

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USERS_RETRIEVED, {
        users: userDtos, // ✅ Now this is UserListDto[]
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_FETCH_USERS);
    }
  }

  async updateUserStatus(
    userId: string,
    statusData: UpdateUserStatusRequestDto
  ): Promise<UserManagementResponseDto> {
    try {
      const { status } = statusData;

      if (!isValidStatus(status)) {
        return ResponseHelper.badRequest(
          USER_MANAGEMENT_MESSAGES.INVALID_STATUS_VALUE
        );
      }

      const user = await this.userManagementRepository.findById(userId);
      if (!user) {
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden(
          USER_MANAGEMENT_MESSAGES.CANNOT_UPDATE_DELETED_USER
        );
      }

      const updatedUser = await this.userManagementRepository.updateUserStatus(
        userId,
        status
      );

      if (!updatedUser) {
        return ResponseHelper.conflict(
          USER_MANAGEMENT_MESSAGES.UPDATE_CONFLICT
        );
      }

      // ✅ Map to DTO
      const userDto = UserMapper.toDetailDto(updatedUser);

      return ResponseHelper.success(
        USER_MANAGEMENT_MESSAGES.USER_STATUS_UPDATED,
        {
          user: userDto // ✅ Now this is UserDetailDto
        }
      );
    } catch (error) {
      console.error("Error updating user status:", error);
      return ResponseHelper.error(
        USER_MANAGEMENT_MESSAGES.FAILED_UPDATE_STATUS
      );
    }
  }

  async editUser(
    userId: string,
    userData: EditUserRequestDto
  ): Promise<UserManagementResponseDto> {
    try {
      const { fullName, email, phone, status } = userData;

      if (status) {
        if (!isValidStatus(status)) {
          return ResponseHelper.badRequest(
            USER_MANAGEMENT_MESSAGES.INVALID_STATUS_VALUE
          );
        }
      }

      const user = await this.userManagementRepository.findById(userId);
      if (!user) {
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden(
          USER_MANAGEMENT_MESSAGES.CANNOT_UPDATE_DELETED_USER
        );
      }

      // Validate email format if provided
      if (email && !VALIDATION.EMAIL_REGEX.test(email)) {
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
        return ResponseHelper.conflict(
          USER_MANAGEMENT_MESSAGES.UPDATE_USER_CONFLICT
        );
      }

      // ✅ Map to DTO
      const userDto = UserMapper.toDetailDto(updatedUser);

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_UPDATED, {
        user: userDto, // ✅ Now this is UserDetailDto
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_UPDATE_USER);
    }
  }

  async deleteUser(userId: string): Promise<UserManagementResponseDto> {
    try {
      const user = await this.userManagementRepository.findById(userId);
      if (!user) {
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        return ResponseHelper.badRequest(
          USER_MANAGEMENT_MESSAGES.USER_ALREADY_DELETED
        );
      }

      const deletedUser = await this.userManagementRepository.softDeleteUser(
        userId
      );

      if (!deletedUser) {
        return ResponseHelper.conflict(
          USER_MANAGEMENT_MESSAGES.DELETE_CONFLICT
        );
      }

      // ✅ Map to DTO
      const userDto = UserMapper.toDetailDto(deletedUser);

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_DELETED, {
        user: userDto, // ✅ Now this is UserDetailDto
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_DELETE_USER);
    }
  }

  async getUserStats(): Promise<UserStatsResponseDto> {
  try {
    const stats = await this.userManagementRepository.getUserStats();

    // ✅ Map to DTO
    const statsDto = UserMapper.toStatsDto(stats);

    return ResponseHelper.success(
      USER_MANAGEMENT_MESSAGES.USER_STATS_RETRIEVED,
      {
        stats: statsDto, // ✅ This matches UserStatsResponseDto structure
      }
    );
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_FETCH_STATS);
  }
}

  async getUserById(userId: string): Promise<UserManagementResponseDto> {
    try {
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden(
          USER_MANAGEMENT_MESSAGES.CANNOT_ACCESS_DELETED_USER
        );
      }

      // ✅ Map to DTO
      const userDto = UserMapper.toDetailDto(user);

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_RETRIEVED, {
        user: userDto, // ✅ Now this is UserDetailDto
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_FETCH_USER);
    }
  }
}