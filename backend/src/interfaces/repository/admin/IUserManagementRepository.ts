import { IUser, IUserWithAddress } from "../../admin/IUserManagements";

export interface IUserManagementRepository {
  findAllUsers(): Promise<IUserWithAddress[]>;
  findUserById(userId: string): Promise<IUser | null>;
  updateUserStatus(userId: string, status: "Active" | "Inactive" | "Blocked"): Promise<IUser | null>;
  updateUser(userId: string, updateData: Partial<IUser>): Promise<IUser | null>;
  softDeleteUser(userId: string): Promise<IUser | null>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    blockedUsers: number;
  }>;
}