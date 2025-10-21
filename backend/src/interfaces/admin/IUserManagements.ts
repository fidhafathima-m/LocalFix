// interfaces/admin/IUserManagements.ts
import { ApiResponse } from "../../utils/responseHelper";
import { IUserBase } from "../common/IUserBase";

// Extend from the common base interface
export interface IUser extends IUserBase {
  // Add any admin-specific properties here if needed
}

export interface IUserWithAddress extends IUser {
  addresses?: any[];
  defaultAddress?: any;
}

export interface UpdateUserStatusRequest {
  status: "Active" | "Inactive" | "Blocked";
}

export interface EditUserRequest {
  fullName?: string;
  email?: string;
  phone?: string;
  status?: "Active" | "Inactive" | "Blocked";
}

export type UserManagementResponse = ApiResponse;
export type UsersListResponse = ApiResponse<{
  users: IUserWithAddress[];
  total?: number;
  page?: number;
  limit?: number;
}>;