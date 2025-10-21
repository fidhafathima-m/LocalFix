import { Model, Types } from 'mongoose';
import { BaseRepository } from '../BaseRepository';
import { IUserRepository } from "../../interfaces/repository/user/IUserRepository";
import { IUser, IUserCreate, IUserUpdate } from "../../interfaces/user/IUser";
import User from "../../models/UserSchema";

export class UserRepository extends BaseRepository<IUser> implements IUserRepository {
  constructor() {
    super(User as Model<IUser>);
  }

  // Only custom methods - all common methods are inherited
  async findByEmail(email: string, role?: string): Promise<IUser | null> {
    const query: any = { 
      email: email.toLowerCase(), 
      isDeleted: false 
    };
    
    if (role) {
      query.roles = role;
    }
    
    return this.findOne(query);
  }

  async findByPhone(phone: string, role?: string): Promise<IUser | null> {
    const query: any = { 
      phone, 
      isDeleted: false 
    };
    
    if (role) {
      query.roles = role;
    }
    
    return this.findOne(query);
  }

  async findByIdentifier(identifier: string, role?: string): Promise<IUser | null> {
    let actualIdentifier = identifier;

    if (typeof identifier === "object" && identifier !== null) {
      const identifierObj = identifier as any;
      if (identifierObj.email) {
        actualIdentifier = identifierObj.email;
      } else if (identifierObj.phone) {
        actualIdentifier = identifierObj.phone;
      } else {
        return null;
      }
    }

    const query: any = /^\d{10}$/.test(actualIdentifier)
      ? { phone: actualIdentifier }
      : { email: { $regex: new RegExp(`^${actualIdentifier}$`, "i") } };

    if (role) {
      query.roles = role;
    }

    return this.findOne(query);
  }

  async updatePassword(identifier: string, passwordHash: string, userType?: string): Promise<IUser | null> {
    let actualIdentifier = identifier;

    if (typeof identifier === "object" && identifier !== null) {
      const identifierObj = identifier as any;
      if (identifierObj.email) {
        actualIdentifier = identifierObj.email;
      } else if (identifierObj.phone) {
        actualIdentifier = identifierObj.phone;
      } else {
        return null;
      }
    }

    const query: any = /^\d{10}$/.test(actualIdentifier)
      ? { phone: actualIdentifier }
      : { email: actualIdentifier };

    if (userType === "serviceProvider") {
      query.roles = "serviceProvider";
    }

    return this.update(query, { $set: { passwordHash } } as any);
  }

  async updateApplicationStatus(userId: string, applicationStatus: string): Promise<IUser | null> {
    return this.update(userId, { $set: { applicationStatus } } as any);
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.update(userId, {
      $push: { 
        refreshTokens: {
          token: refreshToken,
          createdAt: new Date()
        }
      }
    } as any);
  }

  async findByRefreshToken(userId: string, refreshToken: string): Promise<IUser | null> {
    return this.findOne({
      _id: userId,
      'refreshTokens.token': refreshToken
    });
  }

  async updateRefreshToken(userId: string, oldToken: string, newToken: string): Promise<void> {
    await this.model.findOneAndUpdate(
      {
        _id: userId,
        'refreshTokens.token': oldToken
      },
      {
        $set: {
          'refreshTokens.$.token': newToken,
          'refreshTokens.$.createdAt': new Date()
        }
      }
    );
  }

  async removeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await this.update(userId, {
      $pull: { 
        refreshTokens: { token: refreshToken } 
      }
    } as any);
  }

  async removeAllRefreshTokens(userId: string): Promise<void> {
    await this.update(userId, {
      $set: { refreshTokens: [] } 
    } as any);
  }
}