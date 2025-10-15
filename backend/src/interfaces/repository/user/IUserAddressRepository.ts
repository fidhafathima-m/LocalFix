import { IUserAddress } from "../../../models/UserAddressSchema";
import { Types } from "mongoose";

export interface IUserAddressRepository {
  findByUserId(userId: Types.ObjectId): Promise<IUserAddress | null>;
  findDefaultByUserId(userId: Types.ObjectId): Promise<IUserAddress | null>;
  create(userAddressData: Partial<IUserAddress>): Promise<IUserAddress>;
  updateByUserId(
    userId: Types.ObjectId,
    updateData: Partial<IUserAddress>
  ): Promise<IUserAddress | null>;
  deleteByUserId(userId: Types.ObjectId): Promise<boolean>;
}
