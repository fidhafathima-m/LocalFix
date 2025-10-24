import { EditUserRequestDto, UpdateUserStatusRequestDto, UserManagementResponseDto, UsersListResponseDto } from "@/interfaces/dtos/userDtos";
import { ApiResponse } from "../../../utils/responseHelper";
import {
  IUserWithAddress,
  UpdateUserStatusRequest,
  EditUserRequest,
} from "../../admin/IUserManagements";

export interface IUserManagementService {
  getUsers(): Promise<UsersListResponseDto>;

  updateUserStatus(
    userId: string,
    statusData: UpdateUserStatusRequestDto
  ): Promise<UserManagementResponseDto>;

  editUser(userId: string, userData: EditUserRequestDto): Promise<UserManagementResponseDto>;

  deleteUser(userId: string): Promise<UserManagementResponseDto>;

  getUserStats(): Promise<UserManagementResponseDto>;

  getUserById(userId: string): Promise<UserManagementResponseDto>;
}
