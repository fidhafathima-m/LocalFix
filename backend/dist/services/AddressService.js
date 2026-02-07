"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressService = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const addressMapper_1 = require("../mappers/addressMapper");
class AddressService {
    constructor(addressRepository, logger) {
        this._logger = logger;
        this._addressRepository = addressRepository;
    }
    async getUserAddresses(userId) {
        const context = {
            operation: 'getUserAddresses',
            data: { userId },
        };
        try {
            this._logger.info('Fetching user addresses', context);
            const addresses = await this._addressRepository.findByUserId(userId);
            if (!addresses || addresses.length === 0) {
                this._logger.info('No addresses found for user', context);
                return responseHelper_1.ResponseHelper.success('No addresses found', {
                    addresses: [],
                });
            }
            this._logger.info('User addresses retrieved successfully', {
                ...context,
                addressCount: addresses.length,
            });
            const addressDtos = (0, addressMapper_1.toAddressDtoList)(addresses);
            return responseHelper_1.ResponseHelper.success('Addresses retrieved successfully', {
                addresses: addressDtos,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching user addresses', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch addresses');
        }
    }
    async getAddressById(userId, addressId) {
        const context = {
            operation: 'getAddressById',
            data: { userId, addressId },
        };
        try {
            this._logger.info('Fetching address by ID', context);
            const address = await this._addressRepository.findByIdAndUserId(addressId, userId);
            if (!address) {
                this._logger.warn('Address not found for user', context);
                return responseHelper_1.ResponseHelper.notFound('Address not found');
            }
            this._logger.info('Address retrieved successfully', {
                ...context,
                addressFound: true,
            });
            const addressDto = (0, addressMapper_1.toAddressDto)(address);
            return responseHelper_1.ResponseHelper.success('Address retrieved successfully', {
                address: addressDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching address by ID', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch address');
        }
    }
    async createAddress(userId, addressData) {
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
            if (!addressData.street ||
                !addressData.city ||
                !addressData.state ||
                !addressData.pincode) {
                this._logger.warn('Missing required address fields', {
                    ...context,
                    missingFields: {
                        street: !addressData.street,
                        city: !addressData.city,
                        state: !addressData.state,
                        pincode: !addressData.pincode,
                    },
                });
                return responseHelper_1.ResponseHelper.badRequest('Please fill in all required address fields');
            }
            // If this is set as default, unset other defaults
            if (addressData.isDefault) {
                this._logger.info('Setting address as default, unsetting other defaults', context);
                await this._addressRepository.unsetAllDefaults(userId);
            }
            const addressModel = (0, addressMapper_1.toAddressCreateModel)(userId, addressData);
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
                return responseHelper_1.ResponseHelper.error('Failed to create address in database');
            }
            this._logger.info('Address created successfully', {
                ...context,
                addressId: newAddress._id?.toString(),
            });
            const addressDto = (0, addressMapper_1.toAddressDto)(newAddress);
            return responseHelper_1.ResponseHelper.success('Address added successfully', {
                address: addressDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error creating address', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to create address');
        }
    }
    async updateAddress(userId, addressId, addressData) {
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
            const existingAddress = await this._addressRepository.findByIdAndUserId(addressId, userId);
            if (!existingAddress) {
                this._logger.warn('Address not found for update', context);
                return responseHelper_1.ResponseHelper.notFound('Address not found');
            }
            this._logger.debug('Existing address found', {
                ...context,
                currentIsDefault: existingAddress.isDefault,
            });
            // If setting as default, unset other defaults
            if (addressData.isDefault && !existingAddress.isDefault) {
                this._logger.info('Setting address as default, unsetting other defaults', context);
                await this._addressRepository.unsetAllDefaults(userId);
            }
            const updateModel = (0, addressMapper_1.toAddressUpdateModel)(addressData);
            this._logger.debug('Updating address in repository', {
                ...context,
                updateModel,
            });
            const updatedAddress = await this._addressRepository.update(addressId, updateModel);
            if (!updatedAddress) {
                this._logger.error('Failed to update address in repository', context);
                return responseHelper_1.ResponseHelper.error('Failed to update address');
            }
            this._logger.info('Address updated successfully', context);
            const addressDto = (0, addressMapper_1.toAddressDto)(updatedAddress);
            return responseHelper_1.ResponseHelper.success('Address updated successfully', {
                address: addressDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error updating address', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to update address');
        }
    }
    async deleteAddress(userId, addressId) {
        const context = {
            operation: 'deleteAddress',
            data: { userId, addressId },
        };
        try {
            this._logger.info('Deleting address', context);
            const address = await this._addressRepository.findByIdAndUserId(addressId, userId);
            if (!address) {
                this._logger.warn('Address not found for deletion', context);
                return responseHelper_1.ResponseHelper.notFound('Address not found');
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
                return responseHelper_1.ResponseHelper.badRequest('Cannot delete your only address');
            }
            this._logger.debug('Proceeding with address deletion', {
                ...context,
                isDefault: address.isDefault,
            });
            const deleted = await this._addressRepository.delete(addressId);
            if (!deleted) {
                this._logger.error('Failed to delete address from repository', context);
                return responseHelper_1.ResponseHelper.error('Failed to delete address');
            }
            this._logger.info('Address deleted successfully', context);
            return responseHelper_1.ResponseHelper.success('Address deleted successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error deleting address', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to delete address');
        }
    }
    async setDefaultAddress(userId, addressId) {
        const context = {
            operation: 'setDefaultAddress',
            data: { userId, addressId },
        };
        try {
            this._logger.info('Setting default address', context);
            const address = await this._addressRepository.findByIdAndUserId(addressId, userId);
            if (!address) {
                this._logger.warn('Address not found for setting default', context);
                return responseHelper_1.ResponseHelper.notFound('Address not found');
            }
            if (address.isDefault) {
                this._logger.info('Address is already set as default', context);
                return responseHelper_1.ResponseHelper.success('Address is already default');
            }
            this._logger.info('Unsetting all existing default addresses', context);
            // Unset all other defaults
            await this._addressRepository.unsetAllDefaults(userId);
            // Set this as default
            const updatedAddress = await this._addressRepository.update(addressId, {
                isDefault: true,
            });
            if (!updatedAddress) {
                this._logger.error('Failed to set address as default in repository', context);
                return responseHelper_1.ResponseHelper.error('Failed to set default address');
            }
            this._logger.info('Default address set successfully', context);
            const addressDto = (0, addressMapper_1.toAddressDto)(updatedAddress);
            return responseHelper_1.ResponseHelper.success('Default address updated successfully', {
                address: addressDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error setting default address', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to set default address');
        }
    }
}
exports.AddressService = AddressService;
