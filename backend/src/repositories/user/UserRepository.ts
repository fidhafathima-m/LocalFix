import { IUserRepository } from "../../interfaces/repository/user/IUserRepository";
import { IUser, IUserCreate, IUserUpdate } from "../../interfaces/user/IUser";
import User from "../../models/UserSchema";

export class UserRepository implements IUserRepository {
  async findByEmail(email: string, role?: string): Promise<IUser | null> {
    const query: any = { 
      email: email.toLowerCase(), 
      isDeleted: false 
    };
    
    // If role is specified, check if roles array contains that role
    if (role) {
      query.roles = role;
    }
    
    return User.findOne(query);
  }

  async findByPhone(phone: string, role?: string): Promise<IUser | null> {
    const query: any = { 
      phone, 
      isDeleted: false 
    };
    
    if (role) {
      query.roles = role;
    }
    
    return User.findOne(query);
  }

  async findById(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async findByIdentifier(
    identifier: string,
    role?: string
  ): Promise<IUser | null> {
    let actualIdentifier = identifier;

    // If identifier is an object, extract the email/phone from it
    if (typeof identifier === "object" && identifier !== null) {
      const identifierObj = identifier as any;
      if (identifierObj.email) {
        actualIdentifier = identifierObj.email;
      } else if (identifierObj.phone) {
        actualIdentifier = identifierObj.phone;
      } else {
        // If it's an object but doesn't have email/phone, return null
        return null;
      }
    }

    if (/^\d{10}$/.test(actualIdentifier)) {
      const query: any = { phone: actualIdentifier };
      if (role) {
        query.roles = role;
      }
      return await User.findOne(query);
    }
    else {
      const query: any = {
        email: {
          $regex: new RegExp(`^${actualIdentifier}$`, "i"),
        },
      };
      if (role) {
        query.roles = role;
      }
      return await User.findOne(query);
    }
  }

  async create(userData: IUserCreate): Promise<IUser> {
    return await User.create(userData);
  }

  async update(id: string, updateData: IUserUpdate): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
  }

  async updatePassword(
    identifier: string,
    passwordHash: string,
    userType?: string
  ): Promise<IUser | null> {
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

    return await User.findOneAndUpdate(
      query,
      { $set: { passwordHash } },
      { new: true }
    );
  }

  async updateApplicationStatus(
    userId: string,
    applicationStatus: string
  ): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { applicationStatus } },
      { new: true }
    );
  }

  async updateRole(userId: string, role: string): Promise<IUser | null> {
    return await User.findByIdAndUpdate(
      userId,
      { $set: { role } },
      { new: true }
    );
  }

  async findOne(query: any): Promise<IUser | null> {
    return await User.findOne(query);
  }

   async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { 
        $push: { 
          refreshTokens: {
            token: refreshToken,
            createdAt: new Date()
          }
        } 
      }
    );
  }

  async findByRefreshToken(userId: string, refreshToken: string): Promise<IUser | null> {
    return User.findOne({
      _id: userId,
      'refreshTokens.token': refreshToken
    });
  }

  async updateRefreshToken(userId: string, oldToken: string, newToken: string): Promise<void> {
    await User.findOneAndUpdate(
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
    await User.findByIdAndUpdate(
      userId,
      { 
        $pull: { 
          refreshTokens: { token: refreshToken } 
        } 
      }
    );
  }

  async removeAllRefreshTokens(userId: string): Promise<void> {
    await User.findByIdAndUpdate(
      userId,
      { 
        $set: { refreshTokens: [] } 
      }
    );
  }
}
