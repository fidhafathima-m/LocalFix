import {
  IUser,
  IUserCreate,
  IUserUpdate,
} from "../../../interfaces/user/IUser";
import { IBaseRepository } from "../IBaseRepository";

export interface IUserRepository extends IBaseRepository<IUser> {
  findByEmail(email: string): Promise<IUser | null>;
  findByPhone(phone: string): Promise<IUser | null>;
  findByIdentifier(identifier: string, role?: string): Promise<IUser | null>;
  updatePassword(
    identifier: string,
    passwordHash: string,
    userType?: string
  ): Promise<IUser | null>;
  updateApplicationStatus(
    userId: string,
    applicationStatus: string
  ): Promise<IUser | null>;
  storeRefreshToken(userId: string, refreshToken: string): Promise<void>;
  findByRefreshToken(
    userId: string,
    refreshToken: string
  ): Promise<IUser | null>;
  updateRefreshToken(
    userId: string,
    oldToken: string,
    newToken: string
  ): Promise<void>;
  removeRefreshToken(userId: string, refreshToken: string): Promise<void>;
  removeAllRefreshTokens(userId: string): Promise<void>;
  findByPhone(phoneNumber: string): Promise<IUser | null>;
}
