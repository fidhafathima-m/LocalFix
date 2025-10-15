import User from "../../models/UserSchema";
import {
  IUser,
  IUserWithAddress,
} from "../../interfaces/admin/IUserManagements";
import { Types } from "mongoose";
import { IUserManagementRepository } from "../../interfaces/repository/admin/IUserManagementRepository";

export class UserManagementRepository implements IUserManagementRepository {
  async findAllUsers(): Promise<IUserWithAddress[]> {
    return await User.aggregate([
      { $match: { role: "user", isDeleted: { $ne: true } } },
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

  async findUserById(userId: string): Promise<IUser | null> {
    return await User.findById(userId).select("-passwordHash");
  }

  async updateUserStatus(
    userId: string,
    status: "Active" | "Inactive" | "Blocked"
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { status } },
      { new: true }
    ).select("-passwordHash");
  }

  async updateUser(
    userId: string,
    updateData: Partial<IUser>
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true }
    ).select("-passwordHash");
  }

  async softDeleteUser(userId: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { isDeleted: true } },
      { new: true }
    ).select("-passwordHash");
  }

  async getUserStats(): Promise<{
    totalUsers: number;
    activeUsers: number;
    inactiveUsers: number;
    blockedUsers: number;
  }> {
    const totalUsers = await User.countDocuments({
      role: "user",
      isDeleted: { $ne: true },
    });
    const activeUsers = await User.countDocuments({
      role: "user",
      status: "Active",
      isDeleted: { $ne: true },
    });
    const inactiveUsers = await User.countDocuments({
      role: "user",
      status: "Inactive",
      isDeleted: { $ne: true },
    });
    const blockedUsers = await User.countDocuments({
      role: "user",
      status: "Blocked",
      isDeleted: { $ne: true },
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      blockedUsers,
    };
  }
}
