import { UserManagementRepository } from "../repositories/admin/UserManagementRepository";
import {
  IUser,
  IUserWithAddress,
  UpdateUserStatusRequest,
  EditUserRequest,
  UserManagementResponse,
  UsersListResponse,
} from "../interfaces/admin/IUserManagements";
import { IUserManagementService } from "../interfaces/services/admin/IUserManagementService";
import { IUserManagementRepository } from "../interfaces/repository/admin/IUserManagementRepository";
import { ResponseHelper } from "../utils/responseHelper";
import {
  USER_MANAGEMENT_MESSAGES,
  USER_STATUS,
  VALID_STATUSES,
  STATS_CATEGORIES,
  USER_ROLES,
  APPLICATION_STATUS,
  VALIDATION,
  PAGINATION_DEFAULTS,
  USER_FILTERS,
} from "../constants";

export class UserManagementService implements IUserManagementService {

  constructor(private userManagementRepository: IUserManagementRepository) {}

  async getUsers(): Promise<UsersListResponse> {
    try {
      const users = await this.userManagementRepository.findAllUsers();

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USERS_RETRIEVED, {
        users
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_FETCH_USERS);
    }
  }

  async updateUserStatus(
    userId: string,
    statusData: UpdateUserStatusRequest
  ): Promise<UserManagementResponse> {
    try {
      const { status } = statusData;

      if (!VALID_STATUSES.includes(status as any)) {
        return ResponseHelper.badRequest(USER_MANAGEMENT_MESSAGES.INVALID_STATUS_VALUE);
      }

      const user = await this.userManagementRepository.findById(userId);
      if (!user) {
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden(USER_MANAGEMENT_MESSAGES.CANNOT_UPDATE_DELETED_USER);
      }

      const updatedUser = await this.userManagementRepository.updateUserStatus(
        userId,
        status
      );

      if (!updatedUser) {
        return ResponseHelper.conflict(USER_MANAGEMENT_MESSAGES.UPDATE_CONFLICT);
      }

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_STATUS_UPDATED, {
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error("Error updating user status:", error);
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_UPDATE_STATUS);
    }
  }

  async editUser(
    userId: string,
    userData: EditUserRequest
  ): Promise<UserManagementResponse> {
    try {
      const { fullName, email, phone, status } = userData;

      if (status) {
        if (!VALID_STATUSES.includes(status as any)) {
          return ResponseHelper.badRequest(USER_MANAGEMENT_MESSAGES.INVALID_STATUS_VALUE);
        }
      }

      const user = await this.userManagementRepository.findById(userId);
      if (!user) {
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden(USER_MANAGEMENT_MESSAGES.CANNOT_UPDATE_DELETED_USER);
      }

      // Validate email format if provided
      if (email && !VALIDATION.EMAIL_REGEX.test(email)) {
        return ResponseHelper.badRequest("Please provide a valid email address");
      }

      // Validate full name length if provided
      if (fullName && (fullName.length < VALIDATION.MIN_FULL_NAME_LENGTH || fullName.length > VALIDATION.MAX_FULL_NAME_LENGTH)) {
        return ResponseHelper.badRequest(`Full name must be between ${VALIDATION.MIN_FULL_NAME_LENGTH} and ${VALIDATION.MAX_FULL_NAME_LENGTH} characters`);
      }

      // Validate phone length if provided
      if (phone && (phone.length < VALIDATION.MIN_PHONE_LENGTH || phone.length > VALIDATION.MAX_PHONE_LENGTH)) {
        return ResponseHelper.badRequest(`Phone number must be between ${VALIDATION.MIN_PHONE_LENGTH} and ${VALIDATION.MAX_PHONE_LENGTH} characters`);
      }

      const updateData: Partial<IUser> = {};
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (status) updateData.status = status;

      const updatedUser = await this.userManagementRepository.update(
        userId,
        updateData
      );

      if (!updatedUser) {
        return ResponseHelper.conflict(USER_MANAGEMENT_MESSAGES.UPDATE_USER_CONFLICT);
      }

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_UPDATED, {
        data: { user: updatedUser },
      });
    } catch (error) {
      console.error("Error updating user:", error);
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_UPDATE_USER);
    }
  }

  async deleteUser(userId: string): Promise<UserManagementResponse> {
    try {
      const user = await this.userManagementRepository.findById(userId);
      if (!user) {
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        return ResponseHelper.badRequest(USER_MANAGEMENT_MESSAGES.USER_ALREADY_DELETED);
      }

      const deletedUser = await this.userManagementRepository.softDeleteUser(
        userId
      );

      if (!deletedUser) {
        return ResponseHelper.conflict(USER_MANAGEMENT_MESSAGES.DELETE_CONFLICT);
      }

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_DELETED, {
        data: { user: deletedUser },
      });
    } catch (error) {
      console.error("Error deleting user:", error);
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_DELETE_USER);
    }
  }

  async getUserStats(): Promise<UserManagementResponse> {
    try {
      const stats = await this.userManagementRepository.getUserStats();

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_STATS_RETRIEVED, {
        data: { stats },
      });
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_FETCH_STATS);
    }
  }

  async getUserById(userId: string): Promise<UserManagementResponse> {
    try {
      const user = await this.userManagementRepository.findById(userId);

      if (!user) {
        return ResponseHelper.notFound(USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden(USER_MANAGEMENT_MESSAGES.CANNOT_ACCESS_DELETED_USER);
      }

      return ResponseHelper.success(USER_MANAGEMENT_MESSAGES.USER_RETRIEVED, {
        data: { user },
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      return ResponseHelper.error(USER_MANAGEMENT_MESSAGES.FAILED_FETCH_USER);
    }
  }
}