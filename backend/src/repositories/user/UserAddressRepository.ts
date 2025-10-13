import { Types } from "mongoose";
import UserAddress, { IUserAddress } from "../../models/UserAddressSchema";

export class UserAddressRepository {
  async findByUserId(userId: Types.ObjectId): Promise<IUserAddress | null> {
    return await UserAddress.findOne({ userId });
  }

  async findDefaultByUserId(
    userId: Types.ObjectId
  ): Promise<IUserAddress | null> {
    return await UserAddress.findOne({ userId, isDefault: true });
  }

  async create(userAddressData: Partial<IUserAddress>): Promise<IUserAddress> {
    return await UserAddress.create(userAddressData);
  }

  async updateByUserId(
    userId: Types.ObjectId,
    updateData: Partial<IUserAddress>
  ): Promise<IUserAddress | null> {
    return await UserAddress.findOneAndUpdate(
      { userId },
      { $set: updateData },
      { new: true, upsert: true }
    );
  }

  async deleteByUserId(userId: Types.ObjectId): Promise<boolean> {
    const result = await UserAddress.deleteMany({ userId });
    return result.deletedCount > 0;
  }
}
