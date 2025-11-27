import { IAddressRepository } from '../interfaces/repository/user/IAddressRepository';
import { IAddressService } from '../interfaces/services/user/IAddressService';
import { ResponseHelper } from '../utils/responseHelper';
import {
  AddressListResponseDto,
  AddressResponseDto,
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from '../interfaces/dtos/addressDtos';
import { ILogger } from '../interfaces/utils/ILogger';
import {
  toAddressCreateModel,
  toAddressDto,
  toAddressDtoList,
  toAddressUpdateModel,
} from '../mappers/addressMapper';

export class AddressService implements IAddressService {
  private _addressRepository: IAddressRepository;
  private _logger: ILogger;

  constructor(addressRepository: IAddressRepository, logger: ILogger) {
    this._logger = logger;
    this._addressRepository = addressRepository;
  }

  async getUserAddresses(userId: string): Promise<AddressListResponseDto> {
    const context = {
      operation: 'getUserAddresses',
      data: { userId },
    };

    try {
      this._logger.info('Fetching user addresses', context);

      const addresses = await this._addressRepository.findByUserId(userId);

      if (!addresses || addresses.length === 0) {
        this._logger.info('No addresses found for user', context);
        return ResponseHelper.success('No addresses found', {
          addresses: [],
        });
      }

      this._logger.info('User addresses retrieved successfully', {
        ...context,
        addressCount: addresses.length,
      });

      const addressDtos = toAddressDtoList(addresses);
      return ResponseHelper.success('Addresses retrieved successfully', {
        addresses: addressDtos,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching user addresses', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch addresses');
    }
  }

  async getAddressById(
    userId: string,
    addressId: string
  ): Promise<AddressResponseDto> {
    const context = {
      operation: 'getAddressById',
      data: { userId, addressId },
    };

    try {
      this._logger.info('Fetching address by ID', context);

      const address = await this._addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!address) {
        this._logger.warn('Address not found for user', context);
        return ResponseHelper.notFound('Address not found');
      }

      this._logger.info('Address retrieved successfully', {
        ...context,
        addressFound: true,
      });

      const addressDto = toAddressDto(address);
      return ResponseHelper.success('Address retrieved successfully', {
        address: addressDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching address by ID', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch address');
    }
  }

  async createAddress(
    userId: string,
    addressData: CreateAddressRequestDto
  ): Promise<AddressResponseDto> {
    const context = {
      operation: 'createAddress',
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
      this._logger.info('Creating new address for user', context);

      // Validate required fields
      if (
        !addressData.street ||
        !addressData.city ||
        !addressData.state ||
        !addressData.pincode
      ) {
        this._logger.warn('Missing required address fields', {
          ...context,
          missingFields: {
            street: !addressData.street,
            city: !addressData.city,
            state: !addressData.state,
            pincode: !addressData.pincode,
          },
        });
        return ResponseHelper.badRequest(
          'Please fill in all required address fields'
        );
      }

      // If this is set as default, unset other defaults
      if (addressData.isDefault) {
        this._logger.info(
          'Setting address as default, unsetting other defaults',
          context
        );
        await this._addressRepository.unsetAllDefaults(userId);
      }

      const addressModel = toAddressCreateModel(userId, addressData);

      this._logger.debug('Creating address in repository', {
        ...context,
        addressModel: {
          ...addressModel,
          userId: addressModel.userId,
        },
      });

      const newAddress = await this._addressRepository.create(addressModel);

      if (!newAddress) {
        this._logger.error('Failed to create address in database', context);
        return ResponseHelper.error('Failed to create address in database');
      }

      this._logger.info('Address created successfully', {
        ...context,
        addressId: newAddress._id?.toString(),
      });

      const addressDto = toAddressDto(newAddress);
      return ResponseHelper.success('Address added successfully', {
        address: addressDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error creating address', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to create address');
    }
  }

  async updateAddress(
    userId: string,
    addressId: string,
    addressData: UpdateAddressRequestDto
  ): Promise<AddressResponseDto> {
    const context = {
      operation: 'updateAddress',
      data: {
        userId,
        addressId,
        updateFields: Object.keys(addressData),
      },
    };

    try {
      this._logger.info('Updating address', context);

      const existingAddress = await this._addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!existingAddress) {
        this._logger.warn('Address not found for update', context);
        return ResponseHelper.notFound('Address not found');
      }

      this._logger.debug('Existing address found', {
        ...context,
        currentIsDefault: existingAddress.isDefault,
      });

      // If setting as default, unset other defaults
      if (addressData.isDefault && !existingAddress.isDefault) {
        this._logger.info(
          'Setting address as default, unsetting other defaults',
          context
        );
        await this._addressRepository.unsetAllDefaults(userId);
      }

      const updateModel = toAddressUpdateModel(addressData);

      this._logger.debug('Updating address in repository', {
        ...context,
        updateModel,
      });

      const updatedAddress = await this._addressRepository.update(
        addressId,
        updateModel
      );

      if (!updatedAddress) {
        this._logger.error('Failed to update address in repository', context);
        return ResponseHelper.error('Failed to update address');
      }

      this._logger.info('Address updated successfully', context);

      const addressDto = toAddressDto(updatedAddress);
      return ResponseHelper.success('Address updated successfully', {
        address: addressDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error updating address', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to update address');
    }
  }

  async deleteAddress(
    userId: string,
    addressId: string
  ): Promise<AddressResponseDto> {
    const context = {
      operation: 'deleteAddress',
      data: { userId, addressId },
    };

    try {
      this._logger.info('Deleting address', context);

      const address = await this._addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!address) {
        this._logger.warn('Address not found for deletion', context);
        return ResponseHelper.notFound('Address not found');
      }

      // Don't allow deletion if it's the only address
      const userAddresses = await this._addressRepository.findByUserId(userId);

      this._logger.debug('Checking address count for deletion validation', {
        ...context,
        addressCount: userAddresses.length,
      });

      if (userAddresses.length <= 1) {
        this._logger.warn('Attempt to delete only address', {
          ...context,
          addressCount: userAddresses.length,
        });
        return ResponseHelper.badRequest('Cannot delete your only address');
      }

      this._logger.debug('Proceeding with address deletion', {
        ...context,
        isDefault: address.isDefault,
      });

      const deleted = await this._addressRepository.delete(addressId);

      if (!deleted) {
        this._logger.error('Failed to delete address from repository', context);
        return ResponseHelper.error('Failed to delete address');
      }

      this._logger.info('Address deleted successfully', context);

      return ResponseHelper.success('Address deleted successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error deleting address', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to delete address');
    }
  }

  async setDefaultAddress(
    userId: string,
    addressId: string
  ): Promise<AddressResponseDto> {
    const context = {
      operation: 'setDefaultAddress',
      data: { userId, addressId },
    };

    try {
      this._logger.info('Setting default address', context);

      const address = await this._addressRepository.findByIdAndUserId(
        addressId,
        userId
      );

      if (!address) {
        this._logger.warn('Address not found for setting default', context);
        return ResponseHelper.notFound('Address not found');
      }

      if (address.isDefault) {
        this._logger.info('Address is already set as default', context);
        return ResponseHelper.success('Address is already default');
      }

      this._logger.info('Unsetting all existing default addresses', context);

      // Unset all other defaults
      await this._addressRepository.unsetAllDefaults(userId);

      // Set this as default
      const updatedAddress = await this._addressRepository.update(addressId, {
        isDefault: true,
      });

      if (!updatedAddress) {
        this._logger.error(
          'Failed to set address as default in repository',
          context
        );
        return ResponseHelper.error('Failed to set default address');
      }

      this._logger.info('Default address set successfully', context);

      const addressDto = toAddressDto(updatedAddress);
      return ResponseHelper.success('Default address updated successfully', {
        address: addressDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error setting default address', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to set default address');
    }
  }
}
