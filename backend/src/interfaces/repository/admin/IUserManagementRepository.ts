import { IUser, IUserWithAddress } from "../../admin/IUserManagements";
import { IBaseRepository } from "../IBaseRepository";

export interface IUserManagementRepository extends IBaseRepository<IUser> {
  findAllUsers(): Promise<IUserWithAddress[]>;
  updateUserStatus(
    userId: string,
    status: "Active" | "Inactive" | "Blocked"
  ): Promise<IUser | null>;
  softDeleteUser(userId: string): Promise<IUser | null>;
  getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    blockedUsers: number;
  }>;
  findUserAddresses(userId: string): Promise<any[]>;
  findByEmail(email: string): Promise<IUser | null>
}
