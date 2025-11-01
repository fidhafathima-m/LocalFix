import { IAddressRepository } from "../../interfaces/repository/user/IAddressRepository";
import UserAddress, { IUserAddress } from "../../models/UserAddressSchema";
import { Types } from "mongoose";

export class AddressRepository implements IAddressRepository {
  async findByUserId(userId: string): Promise<IUserAddress[]> {
    return await UserAddress.find({ userId: new Types.ObjectId(userId) })
      .sort({ isDefault: -1, createdAt: -1 })
      .exec();
  }

  async findByIdAndUserId(addressId: string, userId: string): Promise<IUserAddress | null> {
    return await UserAddress.findOne({
      _id: new Types.ObjectId(addressId),
      userId: new Types.ObjectId(userId),
    }).exec();
  }

  async create(addressData: Partial<IUserAddress>): Promise<IUserAddress> {
  try {
    console.log("🔍 [AddressRepository] Creating address with data:", JSON.stringify(addressData, null, 2));
    
    const address = new UserAddress(addressData);
    console.log("🔍 [AddressRepository] Address instance created:", address);
    
    const savedAddress = await address.save();
    console.log("🔍 [AddressRepository] Address saved to database:", savedAddress);
    console.log("🔍 [AddressRepository] Saved address ID:", savedAddress._id);
    
    return savedAddress;
  } catch (error) {
    console.error("❌ [AddressRepository] Error saving address:", error);
    throw error;
  }
}

  async update(addressId: string, updateData: Partial<IUserAddress>): Promise<IUserAddress | null> {
    return await UserAddress.findByIdAndUpdate(
      new Types.ObjectId(addressId),
      { $set: updateData },
      { new: true }
    ).exec();
  }

  async delete(addressId: string): Promise<boolean> {
    const result = await UserAddress.findByIdAndDelete(new Types.ObjectId(addressId)).exec();
    return result !== null;
  }

  async unsetAllDefaults(userId: string): Promise<void> {
    await UserAddress.updateMany(
      { userId: new Types.ObjectId(userId), isDefault: true },
      { $set: { isDefault: false } }
    ).exec();
  }

  async findDefaultAddress(userId: string): Promise<IUserAddress | null> {
    return await UserAddress.findOne({
      userId: new Types.ObjectId(userId),
      isDefault: true,
    }).exec();
  }
}