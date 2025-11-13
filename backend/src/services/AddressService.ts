import { IAddressRepository } from "../interfaces/repository/user/IAddressRepository";
import { IAddressService } from "../interfaces/services/user/IAddressService";
import { ResponseHelper } from "../utils/responseHelper";
import { AddressMapper } from "../mappers/addressMapper";
import { LoggerService } from "../services/LoggerService";
import {
  AddressListResponseDto,
  AddressResponseDto,
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from "../interfaces/dtos/addressDtos";
import { ILogger } from "@/interfaces/utils/ILogger";

export class AddressService implements IAddressService {
  private logger: ILogger;

  constructor(private addressRepository: IAddressRepository, logger: ILogger) {
    this.logger = logger;
  }

  async getUserAddresses(userId: string): Promise<AddressListResponseDto> {
    const context = {
      operation: "getUserAddresses",
      data: { userId },
    };

    try {
      this.logger.info("Fetching user addresses", context);

      const addresses = await this.addressRepository.findByUserId(userId);

      if (!addresses || addresses.length === 0) {
        this.logger.info("No addresses found for user", context);
        return ResponseHelper.success("No addresses found", {
          addresses: [],
        });
      }

      this.logger.info("User addresses retrieved successfully", {
        ...context,
        addressCount: addresses.length,
      });

      const addressDtos = AddressMapper.toDtoList(addresses);
      return ResponseHelper.success("Addresses retrieved successfully", {
        addresses: addressDtos,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching user addresses", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch addresses");
    }
  }

  async getAddressById(
    userId: string,
    addressId: string
  ): Promise<AddressResponseDto> {
    const context = {
      operation: "getAddressById",
      data: { userId, addressId },
    };

    try {
      this.logger.info("Fetching address by ID", context);

      const address = await this.addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!address) {
        this.logger.warn("Address not found for user", context);
        return ResponseHelper.notFound("Address not found");
      }

      this.logger.info("Address retrieved successfully", {
        ...context,
        addressFound: true,
      });

      const addressDto = AddressMapper.toDto(address);
      return ResponseHelper.success("Address retrieved successfully", {
        address: addressDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching address by ID", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to fetch address");
    }
  }

  async createAddress(
    userId: string,
    addressData: CreateAddressRequestDto
  ): Promise<AddressResponseDto> {
    const context = {
      operation: "createAddress",
      data: {
        userId,
        addressData: {
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          pincode: addressData.pincode,
          isDefault: addressData.isDefault,
        },
      },
    };

    try {
      this.logger.info("Creating new address for user", context);

      // Validate required fields
      if (
        !addressData.street ||
        !addressData.city ||
        !addressData.state ||
        !addressData.pincode
      ) {
        this.logger.warn("Missing required address fields", {
          ...context,
          missingFields: {
            street: !addressData.street,
            city: !addressData.city,
            state: !addressData.state,
            pincode: !addressData.pincode,
          },
        });
        return ResponseHelper.badRequest(
          "Please fill in all required address fields"
        );
      }

      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        this.logger.info(
          "Setting address as default, unsetting other defaults",
          context
        );
        await this.addressRepository.unsetAllDefaults(userId);
      }

      const addressModel = AddressMapper.toCreateModel(userId, addressData);

      this.logger.debug("Creating address in repository", {
        ...context,
        addressModel: {
          ...addressModel,
          userId: addressModel.userId,
        },
      });

      const newAddress = await this.addressRepository.create(addressModel);

      if (!newAddress) {
        this.logger.error("Failed to create address in database", context);
        return ResponseHelper.error("Failed to create address in database");
      }

      this.logger.info("Address created successfully", {
        ...context,
        addressId: newAddress._id?.toString(),
      });

      const addressDto = AddressMapper.toDto(newAddress);
      return ResponseHelper.success("Address added successfully", {
        address: addressDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error creating address", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to create address");
    }
  }

  async updateAddress(
    userId: string,
    addressId: string,
    addressData: UpdateAddressRequestDto
  ): Promise<AddressResponseDto> {
    const context = {
      operation: "updateAddress",
      data: {
        userId,
        addressId,
        updateFields: Object.keys(addressData),
      },
    };

    try {
      this.logger.info("Updating address", context);

      const existingAddress = await this.addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!existingAddress) {
        this.logger.warn("Address not found for update", context);
        return ResponseHelper.notFound("Address not found");
      }

      this.logger.debug("Existing address found", {
        ...context,
        currentIsDefault: existingAddress.isDefault,
      });

      // If setting as default, unset other defaults
      if (addressData.isDefault && !existingAddress.isDefault) {
        this.logger.info(
          "Setting address as default, unsetting other defaults",
          context
        );
        await this.addressRepository.unsetAllDefaults(userId);
      }

      const updateModel = AddressMapper.toUpdateModel(addressData);

      this.logger.debug("Updating address in repository", {
        ...context,
        updateModel,
      });

      const updatedAddress = await this.addressRepository.update(
        addressId,
        updateModel
      );

      if (!updatedAddress) {
        this.logger.error("Failed to update address in repository", context);
        return ResponseHelper.error("Failed to update address");
      }

      this.logger.info("Address updated successfully", context);

      const addressDto = AddressMapper.toDto(updatedAddress);
      return ResponseHelper.success("Address updated successfully", {
        address: addressDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error updating address", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to update address");
    }
  }

  async deleteAddress(
    userId: string,
    addressId: string
  ): Promise<AddressResponseDto> {
    const context = {
      operation: "deleteAddress",
      data: { userId, addressId },
    };

    try {
      this.logger.info("Deleting address", context);

      const address = await this.addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!address) {
        this.logger.warn("Address not found for deletion", context);
        return ResponseHelper.notFound("Address not found");
      }

      // Don't allow deletion if it's the only address
      const userAddresses = await this.addressRepository.findByUserId(userId);

      this.logger.debug("Checking address count for deletion validation", {
        ...context,
        addressCount: userAddresses.length,
      });

      if (userAddresses.length <= 1) {
        this.logger.warn("Attempt to delete only address", {
          ...context,
          addressCount: userAddresses.length,
        });
        return ResponseHelper.badRequest("Cannot delete your only address");
      }

      this.logger.debug("Proceeding with address deletion", {
        ...context,
        isDefault: address.isDefault,
      });

      const deleted = await this.addressRepository.delete(addressId);

      if (!deleted) {
        this.logger.error("Failed to delete address from repository", context);
        return ResponseHelper.error("Failed to delete address");
      }

      this.logger.info("Address deleted successfully", context);

      return ResponseHelper.success("Address deleted successfully");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error deleting address", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to delete address");
    }
  }

  async setDefaultAddress(
    userId: string,
    addressId: string
  ): Promise<AddressResponseDto> {
    const context = {
      operation: "setDefaultAddress",
      data: { userId, addressId },
    };

    try {
      this.logger.info("Setting default address", context);

      const address = await this.addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!address) {
        this.logger.warn("Address not found for setting default", context);
        return ResponseHelper.notFound("Address not found");
      }

      if (address.isDefault) {
        this.logger.info("Address is already set as default", context);
        return ResponseHelper.success("Address is already default");
      }

      this.logger.info("Unsetting all existing default addresses", context);

      // Unset all other defaults
      await this.addressRepository.unsetAllDefaults(userId);

      // Set this as default
      const updatedAddress = await this.addressRepository.update(addressId, {
        isDefault: true,
      });

      if (!updatedAddress) {
        this.logger.error(
          "Failed to set address as default in repository",
          context
        );
        return ResponseHelper.error("Failed to set default address");
      }

      this.logger.info("Default address set successfully", context);

      const addressDto = AddressMapper.toDto(updatedAddress);
      return ResponseHelper.success("Default address updated successfully", {
        address: addressDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error setting default address", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error("Failed to set default address");
    }
  }
}
