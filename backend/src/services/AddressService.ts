import { IAddressRepository } from "../interfaces/repository/user/IAddressRepository";
import { IAddressService } from "../interfaces/services/user/IAddressService";
import { ResponseHelper } from "../utils/responseHelper";
import { AddressMapper } from "../mappers/addressMapper";
import {
  AddressListResponseDto,
  AddressResponseDto,
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from "../interfaces/dtos/addressDtos";

export class AddressService implements IAddressService {
  constructor(private addressRepository: IAddressRepository) {}

  async getUserAddresses(userId: string): Promise<AddressListResponseDto> {
    try {
      const addresses = await this.addressRepository.findByUserId(userId);

      if (!addresses || addresses.length === 0) {
        return ResponseHelper.success("No addresses found", {
          addresses: [],
        });
      }

      const addressDtos = AddressMapper.toDtoList(addresses);
      return ResponseHelper.success("Addresses retrieved successfully", {
        addresses: addressDtos,
      });
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      return ResponseHelper.error("Failed to fetch addresses");
    }
  }

  async getAddressById(
    userId: string,
    addressId: string
  ): Promise<AddressResponseDto> {
    try {
      const address = await this.addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!address) {
        return ResponseHelper.notFound("Address not found");
      }

      const addressDto = AddressMapper.toDto(address);
      return ResponseHelper.success("Address retrieved successfully", {
        address: addressDto,
      });
    } catch (error) {
      console.error("Error fetching address:", error);
      return ResponseHelper.error("Failed to fetch address");
    }
  }

  async createAddress(userId: string, addressData: CreateAddressRequestDto): Promise<AddressResponseDto> {
  try {
    console.log("🔍 [AddressService] Creating address for user ID:", userId);
    console.log("🔍 [AddressService] Address data received:", JSON.stringify(addressData, null, 2));

    // Validate required fields
    if (!addressData.street || !addressData.city || !addressData.state || !addressData.pincode) {
      console.log("❌ [AddressService] Missing required address fields");
      return ResponseHelper.badRequest("Please fill in all required address fields");
    }

    // If this is set as default, unset other defaults
    if (addressData.isDefault) {
      console.log("🔍 [AddressService] Unsetting other default addresses");
      await this.addressRepository.unsetAllDefaults(userId);
    }

    const addressModel = AddressMapper.toCreateModel(userId, addressData);
    console.log("🔍 [AddressService] Mapped address model:", JSON.stringify(addressModel, null, 2));

    console.log("🔍 [AddressService] Calling repository create method...");
    const newAddress = await this.addressRepository.create(addressModel);
    console.log("🔍 [AddressService] Repository returned:", newAddress);

    if (!newAddress) {
      console.log("❌ [AddressService] Repository returned null/undefined");
      return ResponseHelper.error("Failed to create address in database");
    }

    console.log("✅ [AddressService] Address created successfully with ID:", newAddress._id);
    
    const addressDto = AddressMapper.toDto(newAddress);
    return ResponseHelper.success("Address added successfully", {
      address: addressDto,
    });
  } catch (error) {
    console.error("❌ [AddressService] Error creating address:", error);
    return ResponseHelper.error("Failed to create address");
  }
}

  async updateAddress(
    userId: string,
    addressId: string,
    addressData: UpdateAddressRequestDto
  ): Promise<AddressResponseDto> {
    try {
      const existingAddress = await this.addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!existingAddress) {
        return ResponseHelper.notFound("Address not found");
      }

      // If setting as default, unset other defaults
      if (addressData.isDefault && !existingAddress.isDefault) {
        await this.addressRepository.unsetAllDefaults(userId);
      }

      const updateModel = AddressMapper.toUpdateModel(addressData);
      const updatedAddress = await this.addressRepository.update(
        addressId,
        updateModel
      );

      if (!updatedAddress) {
        return ResponseHelper.error("Failed to update address");
      }

      const addressDto = AddressMapper.toDto(updatedAddress);
      return ResponseHelper.success("Address updated successfully", {
        address: addressDto,
      });
    } catch (error) {
      console.error("Error updating address:", error);
      return ResponseHelper.error("Failed to update address");
    }
  }

  async deleteAddress(
    userId: string,
    addressId: string
  ): Promise<AddressResponseDto> {
    try {
      const address = await this.addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!address) {
        return ResponseHelper.notFound("Address not found");
      }

      // Don't allow deletion if it's the only address
      const userAddresses = await this.addressRepository.findByUserId(userId);
      if (userAddresses.length <= 1) {
        return ResponseHelper.badRequest("Cannot delete your only address");
      }

      const deleted = await this.addressRepository.delete(addressId);

      if (!deleted) {
        return ResponseHelper.error("Failed to delete address");
      }

      return ResponseHelper.success("Address deleted successfully");
    } catch (error) {
      console.error("Error deleting address:", error);
      return ResponseHelper.error("Failed to delete address");
    }
  }

  async setDefaultAddress(
    userId: string,
    addressId: string
  ): Promise<AddressResponseDto> {
    try {
      const address = await this.addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!address) {
        return ResponseHelper.notFound("Address not found");
      }

      if (address.isDefault) {
        return ResponseHelper.success("Address is already default");
      }

      // Unset all other defaults
      await this.addressRepository.unsetAllDefaults(userId);

      // Set this as default
      const updatedAddress = await this.addressRepository.update(addressId, {
        isDefault: true,
      });

      if (!updatedAddress) {
        return ResponseHelper.error("Failed to set default address");
      }

      const addressDto = AddressMapper.toDto(updatedAddress);
      return ResponseHelper.success("Default address updated successfully", {
        address: addressDto,
      });
    } catch (error) {
      console.error("Error setting default address:", error);
      return ResponseHelper.error("Failed to set default address");
    }
  }
}
