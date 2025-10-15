import {
  UpdateUserStatusRequest,
  EditUserRequest,
  UserManagementResponse,
  UsersListResponse,
} from "../../admin/IUserManagements";

export interface IUserManagementService {
  getUsers(): Promise<UsersListResponse>;
  updateUserStatus(userId: string, statusData: UpdateUserStatusRequest): Promise<UserManagementResponse>;
  editUser(userId: string, userData: EditUserRequest): Promise<UserManagementResponse>;
  deleteUser(userId: string): Promise<UserManagementResponse>;
  getUserStats(): Promise<UserManagementResponse>;
  getUserById(userId: string): Promise<UserManagementResponse>;
}