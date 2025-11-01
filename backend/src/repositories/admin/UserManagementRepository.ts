import { Model } from "mongoose";
import { BaseRepository } from "../BaseRepository";
import { IUserManagementRepository } from "../../interfaces/repository/admin/IUserManagementRepository";
import {
  IUser,
  IUserWithAddress,
} from "../../interfaces/admin/IUserManagements";
import User from "../../models/UserSchema";
import UserAddress from "../../models/UserAddressSchema";
import bcrypt from "bcrypt"

export class UserManagementRepository
  extends BaseRepository<IUser>
  implements IUserManagementRepository
{
  private userAddressModel: Model<any>;

  constructor() {
    super(User as unknown as Model<IUser>);
    this.userAddressModel = UserAddress as Model<any>;
  }

  async findUserAddresses(userId: string): Promise<any[]> {
    try {
      return await this.userAddressModel.find({ userId }).lean();
    } catch (error) {
      console.error("Error finding user addresses:", error);
      return [];
    }
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
  async findByEmail(email: string): Promise<IUser | null> {
    try {
      return await this.model.findOne({ email, isDeleted: { $ne: true } });
    } catch (error) {
      console.error("Error finding user by email:", error);
      return null;
    }
  }
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    try {
      const user = await this.model.findById(userId).select('+passwordHash');
      
      if (!user || !user.passwordHash) {
        return false;
      }

      // Compare the provided password with the stored hash
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      return isPasswordValid;
    } catch (error) {
      console.error("Error verifying password:", error);
      return false;
    }
  }

  async updatePassword(userId: string, newPassword: string): Promise<IUser | null> {
    try {
      // Hash the new password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Update the user's password
      const updatedUser = await this.model.findByIdAndUpdate(
        userId,
        { 
          $set: { 
            passwordHash: hashedPassword,
            updatedAt: new Date()
          } 
        },
        { new: true }
      );

      return updatedUser;
    } catch (error) {
      console.error("Error updating password:", error);
      return null;
    }
  }

}
