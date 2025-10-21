import { ApiResponse } from "../../utils/responseHelper";
import { IUserBase } from "../common/IUserBase";

export interface IUser extends IUserBase {
  // any admin-specific properties here 
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