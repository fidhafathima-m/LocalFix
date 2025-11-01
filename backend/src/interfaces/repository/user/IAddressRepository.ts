import { IUserAddress } from "../../../models/UserAddressSchema";

export interface IAddressRepository {
  findByUserId(userId: string): Promise<IUserAddress[]>;
  findByIdAndUserId(addressId: string, userId: string): Promise<IUserAddress | null>;
  create(addressData: Partial<IUserAddress>): Promise<IUserAddress>;
  update(addressId: string, updateData: Partial<IUserAddress>): Promise<IUserAddress | null>;
  delete(addressId: string): Promise<boolean>;
  unsetAllDefaults(userId: string): Promise<void>;
  findDefaultAddress(userId: string): Promise<IUserAddress | null>;
}