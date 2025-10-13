import { UserManagementRepository } from '../repositories/admin/UserManagementRepository';
import {
  IUser,
  IUserWithAddress,
  UpdateUserStatusRequest,
  EditUserRequest,
  UserManagementResponse,
  UsersListResponse
} from '../interfaces/admin/IUserManagements'

export class UserManagementService {
  private userManagementRepository: UserManagementRepository;

  constructor() {
    this.userManagementRepository = new UserManagementRepository();
  }

  async getUsers(): Promise<UsersListResponse> {
    try {
      const users = await this.userManagementRepository.findAllUsers();

      return {
        success: true,
        message: 'Users retrieved successfully',
        data: { users }
      };
    } catch (error) {
      console.error('Error fetching users:', error);
      return {
        success: false,
        message: 'Error fetching users',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async updateUserStatus(userId: string, statusData: UpdateUserStatusRequest): Promise<UserManagementResponse> {
    try {
      const { status } = statusData;

      // Validate status
      const validStatuses = ['Active', 'Inactive', 'Blocked'];
      if (!validStatuses.includes(status)) {
        return {
          success: false,
          message: 'Invalid status value'
        };
      }

      const user = await this.userManagementRepository.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (user.isDeleted) {
        return {
          success: false,
          message: 'Cannot update a deleted user'
        };
      }

      const updatedUser = await this.userManagementRepository.updateUserStatus(userId, status);
      
      if (!updatedUser) {
        return {
          success: false,
          message: 'Failed to update user status'
        };
      }

      return {
        success: true,
        message: 'User status updated successfully',
        data: { user: updatedUser }
      };
    } catch (error) {
      console.error('Error updating user status:', error);
      return {
        success: false,
        message: 'Error updating user status',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async editUser(userId: string, userData: EditUserRequest): Promise<UserManagementResponse> {
    try {
      const { fullName, email, phone, status } = userData;

      // Validate status if provided
      if (status) {
        const validStatuses = ['Active', 'Inactive', 'Blocked'];
        if (!validStatuses.includes(status)) {
          return {
            success: false,
            message: 'Invalid status value'
          };
        }
      }

      const user = await this.userManagementRepository.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (user.isDeleted) {
        return {
          success: false,
          message: 'Cannot update a deleted user'
        };
      }

      // Prepare update data
      const updateData: Partial<IUser> = {};
      if (fullName) updateData.fullName = fullName;
      if (email) updateData.email = email;
      if (phone) updateData.phone = phone;
      if (status) updateData.status = status;

      const updatedUser = await this.userManagementRepository.updateUser(userId, updateData);
      
      if (!updatedUser) {
        return {
          success: false,
          message: 'Failed to update user'
        };
      }

      return {
        success: true,
        message: 'User updated successfully',
        data: { user: updatedUser }
      };
    } catch (error) {
      console.error('Error updating user:', error);
      return {
        success: false,
        message: 'Error updating user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async deleteUser(userId: string): Promise<UserManagementResponse> {
    try {
      const user = await this.userManagementRepository.findUserById(userId);
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (user.isDeleted) {
        return {
          success: false,
          message: 'User is already deleted'
        };
      }

      const deletedUser = await this.userManagementRepository.softDeleteUser(userId);
      
      if (!deletedUser) {
        return {
          success: false,
          message: 'Failed to delete user'
        };
      }

      return {
        success: true,
        message: 'User deleted successfully',
        data: { user: deletedUser }
      };
    } catch (error) {
      console.error('Error deleting user:', error);
      return {
        success: false,
        message: 'Error deleting user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getUserStats(): Promise<UserManagementResponse> {
    try {
      const stats = await this.userManagementRepository.getUserStats();

      return {
        success: true,
        message: 'User statistics retrieved successfully',
        data: { stats }
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return {
        success: false,
        message: 'Error fetching user statistics',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  async getUserById(userId: string): Promise<UserManagementResponse> {
    try {
      const user = await this.userManagementRepository.findUserById(userId);
      
      if (!user) {
        return {
          success: false,
          message: 'User not found'
        };
      }

      if (user.isDeleted) {
        return {
          success: false,
          message: 'User has been deleted'
        };
      }

      return {
        success: true,
        message: 'User retrieved successfully',
        data: { user }
      };
    } catch (error) {
      console.error('Error fetching user:', error);
      return {
        success: false,
        message: 'Error fetching user',
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}