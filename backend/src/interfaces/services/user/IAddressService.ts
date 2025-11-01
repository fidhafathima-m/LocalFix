import {
  AddressListResponseDto,
  AddressResponseDto,
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from "../../dtos/addressDtos";

export interface IAddressService {
  getUserAddresses(userId: string): Promise<AddressListResponseDto>;
  getAddressById(userId: string, addressId: string): Promise<AddressResponseDto>;
  createAddress(userId: string, addressData: CreateAddressRequestDto): Promise<AddressResponseDto>;
  updateAddress(userId: string, addressId: string, addressData: UpdateAddressRequestDto): Promise<AddressResponseDto>;
  deleteAddress(userId: string, addressId: string): Promise<AddressResponseDto>;
  setDefaultAddress(userId: string, addressId: string): Promise<AddressResponseDto>;
}