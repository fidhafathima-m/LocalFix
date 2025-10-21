import { Model } from "mongoose";
import { BaseRepository } from "../BaseRepository";
import { IUserManagementRepository } from "../../interfaces/repository/admin/IUserManagementRepository";
import {
  IUser,
  IUserWithAddress,
} from "../../interfaces/admin/IUserManagements";
import User from "../../models/UserSchema";

export class UserManagementRepository
  extends BaseRepository<IUser>
  implements IUserManagementRepository
{
  constructor() {
    super(User as unknown as Model<IUser>);
  }

  async findAllUsers(): Promise<IUserWithAddress[]> {
    return this.model.aggregate([
      {
        $match: {
          roles: "user",
          isDeleted: { $ne: true },
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: "useraddresses",
          localField: "_id",
          foreignField: "userId",
          as: "addresses",
        },
      },
      {
        $addFields: {
          defaultAddress: {
            $first: {
              $filter: {
                input: "$addresses",
                as: "addr",
                cond: { $eq: ["$$addr.isDefault", true] },
              },
            },
          },
        },
      },
      { $project: { addresses: 0, passwordHash: 0 } },
    ]);
  }

  async updateUserStatus(
    userId: string,
    status: "Active" | "Inactive" | "Blocked"
  ): Promise<IUser | null> {
    return this.update(userId, { $set: { status } });
  }

  async softDeleteUser(userId: string): Promise<IUser | null> {
    return this.update(userId, { $set: { isDeleted: true } });
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    blockedUsers: number;
  }> {
    const userMatchCondition = {
      roles: "user",
      isDeleted: { $ne: true },
    };

    const totalUsers = await this.count(userMatchCondition);
    const activeUsers = await this.count({
      ...userMatchCondition,
      status: "Active",
    });
    const inactiveUsers = await this.count({
      ...userMatchCondition,
      status: "Inactive",
    });
    const blockedUsers = await this.count({
      ...userMatchCondition,
      status: "Blocked",
    });

    return { totalUsers, activeUsers, inactiveUsers, blockedUsers };
  }
}
