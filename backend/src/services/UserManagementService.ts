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

export class UserManagementService implements IUserManagementService {

  constructor(private userManagementRepository: IUserManagementRepository) {}

  async getUsers(): Promise<UsersListResponse> {
    try {
      const users = await this.userManagementRepository.findAllUsers();

      return ResponseHelper.success("Users retrieved successfully", {
        users
      })
    } catch (error) {
      console.error("Error fetching users:", error);
      return ResponseHelper.error("Error fetching users")
    }
  }

  async updateUserStatus(
    userId: string,
    statusData: UpdateUserStatusRequest
  ): Promise<UserManagementResponse> {
    try {
      const { status } = statusData;

      const validStatuses = ["Active", "Inactive", "Blocked"];
      if (!validStatuses.includes(status)) {
        return ResponseHelper.badRequest("Invalid status value")
      }

      const user = await this.userManagementRepository.findUserById(userId);
      if (!user) {
        return ResponseHelper.notFound("User not found")
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden("Cannot update a deleted user")
      }

      const updatedUser = await this.userManagementRepository.updateUserStatus(
        userId,
        status
      );

      if (!updatedUser) {
        return ResponseHelper.conflict("Failed to update user status")
      }

      return ResponseHelper.success("User status updated successfully", {
        data: { user: updatedUser },
      })
    } catch (error) {
      console.error("Error updating user status:", error);
      return ResponseHelper.error("Error updating user status")
    }
  }

  async editUser(
    userId: string,
    userData: EditUserRequest
  ): Promise<UserManagementResponse> {
    try {
      const { fullName, email, phone, status } = userData;

      if (status) {
        const validStatuses = ["Active", "Inactive", "Blocked"];
        if (!validStatuses.includes(status)) {
          return ResponseHelper.badRequest("Invalid status value")
        }
      }

      const user = await this.userManagementRepository.findUserById(userId);
      if (!user) {
        return ResponseHelper.notFound("User not found")
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden("Cannot update a deleted user")
      }

      const updateData: Partial<IUser> = {};
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (status) updateData.status = status;

      const updatedUser = await this.userManagementRepository.updateUser(
        userId,
        updateData
      );

      if (!updatedUser) {
        return ResponseHelper.conflict("Failed to update user")
      }

      return ResponseHelper.success("User updated successfully", {
        data: { user: updatedUser },
      })
    } catch (error) {
      console.error("Error updating user:", error);
      return ResponseHelper.error("Error updating user")
    }
  }

  async deleteUser(userId: string): Promise<UserManagementResponse> {
    try {
      const user = await this.userManagementRepository.findUserById(userId);
      if (!user) {
        return ResponseHelper.notFound("User not found")
      }

      if (user.isDeleted) {
        return ResponseHelper.badRequest("User is already deleted")
      }

      const deletedUser = await this.userManagementRepository.softDeleteUser(
        userId
      );

      if (!deletedUser) {
        return ResponseHelper.conflict("Failed to delete user")
      }

      return ResponseHelper.success("User deleted successfully", {
         data: { user: deletedUser },
      })
    } catch (error) {
      console.error("Error deleting user:", error);
      return ResponseHelper.error("Error deleting user")
    }
  }

  async getUserStats(): Promise<UserManagementResponse> {
    try {
      const stats = await this.userManagementRepository.getUserStats();

      return ResponseHelper.success("User statistics retrieved successfully", {
        data: { stats },
      })
    } catch (error) {
      console.error("Error fetching user stats:", error);
      return ResponseHelper.error("Error fetching user statistics")
    }
  }

  async getUserById(userId: string): Promise<UserManagementResponse> {
    try {
      const user = await this.userManagementRepository.findUserById(userId);

      if (!user) {
        return ResponseHelper.notFound("User not found")
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden("User has been deleted")
      }

      return ResponseHelper.success("User retrieved successfully", {
        data: { user },
      })
    } catch (error) {
      console.error("Error fetching user:", error);
      return ResponseHelper.error("Error fetching user")
    }
  }
}
