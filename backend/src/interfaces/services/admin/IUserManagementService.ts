import {
  EditUserRequestDto,
  UpdateUserStatusRequestDto,
  UserManagementResponseDto,
  UsersListResponseDto,
} from '../../dtos/userDtos';

export interface IUserManagementService {
  getUsers(search?: string, status?: string): Promise<UsersListResponseDto>;

  updateUserStatus(
    userId: string,
    statusData: UpdateUserStatusRequestDto
  ): Promise<UserManagementResponseDto>;

  editUser(
    userId: string,
    userData: EditUserRequestDto
  ): Promise<UserManagementResponseDto>;

  deleteUser(userId: string): Promise<UserManagementResponseDto>;

  getUserStats(): Promise<UserManagementResponseDto>;

  getUserById(userId: string): Promise<UserManagementResponseDto>;
  getPublicUserById(userId: string): Promise<UserManagementResponseDto>;
}
