import { Types } from "mongoose";
import {
  UserListDto,
  UserDetailDto,
  AddressDto,
  UserStatsDto,
} from "../interfaces/dtos/userDtos";
import { IUser, IUserWithAddress } from "../interfaces/admin/IUserManagements";

export class UserMapper {
  // Map to list DTO
  static toListDto(user: IUserWithAddress): UserListDto {
    return {
      _id: user._id.toString(),
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone,
      status: user.status || 'Active',
      roles: Array.isArray(user.roles) ? user.roles : ['user'],
      isEmailVerified: user.isVerified || false,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
      defaultAddress: user.defaultAddress ? this.mapAddress(user.defaultAddress) : undefined,
    };
  }

  // Map to detail DTO
  static toDetailDto(user: IUser): UserDetailDto {
    const baseDto: UserListDto = {
      _id: user._id.toString(),
      fullName: user.fullName || '',
      email: user.email || '',
      phone: user.phone,
      status: user.status || 'Active',
      roles: Array.isArray(user.roles) ? user.roles : ['user'],
      isEmailVerified: user.isVerified || false,
      createdAt: user.createdAt || new Date(),
      updatedAt: user.updatedAt || new Date(),
    };

    return {
      ...baseDto,
      applicationStatus: user.applicationStatus,
      lastLogin: user.lastLogin,
      loginCount: user.loginCount,
      profilePictureUrl: user.profilePictureUrl,
    };
  }

  // Map address
  private static mapAddress(address: any): AddressDto {
    return {
      street: address?.street,
      city: address?.city,
      state: address?.state,
      pincode: address?.pincode,
      landmark: address?.landmark,
      isDefault: address?.isDefault || false,
    };
  }

  // Map stats
  static toStatsDto(stats: any): UserStatsDto {
    return {
      totalUsers: stats.totalUsers || 0,
      activeUsers: stats.activeUsers || 0,
      inactiveUsers: stats.inactiveUsers || 0,
      blockedUsers: stats.blockedUsers || 0,
    };
  }
}