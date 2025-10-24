import { ApiResponse } from "../../utils/responseHelper";
import { IUserBase } from "../common/IUserBase";
import { IAddress } from "../user/IAddress";

export interface IUser extends IUserBase {
  lastLogin?: Date;
  loginCount?: number;
  profilePictureUrl?: string;
}

export interface IUserWithAddress extends IUser {
  addresses?: IAddress[];
  defaultAddress?: IAddress;
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