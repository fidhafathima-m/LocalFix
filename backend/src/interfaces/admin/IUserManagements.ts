import { ApiResponse } from "../../utils/responseHelper";
import { Types } from "mongoose";

export interface IUser {
  _id: Types.ObjectId;
  fullName: string;
  email?: string;
  phone?: string;
  role: "user" | "serviceProvider" | "admin";
  status: "Active" | "Inactive" | "Blocked";
  isVerified: boolean;
  applicationStatus: "not-applied" | "pending" | "approved" | "rejected";
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
  addresses?: any[];
  defaultAddress?: any;
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