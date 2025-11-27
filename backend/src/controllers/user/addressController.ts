import { Response } from 'express';
import { IAddressService } from '../../interfaces/services/user/IAddressService';
import { ResponseHelper } from '../../utils/responseHelper';
import { GeneralMessages } from '../../constants';
import {
  AddressListResponseDto,
  AddressResponseDto,
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from '../../interfaces/dtos/addressDtos';
import { ILogger } from '@/interfaces/utils/ILogger';
import { AuthRequest } from '../../types/express';

export class AddressController {
  private _addressService: IAddressService;
  private _logger: ILogger;

  constructor(addressService: IAddressService, logger: ILogger) {
    this._addressService = addressService;
    this._logger = logger;
  }

  // Get all addresses for user
  getUserAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const context = {
      operation: 'getUserAddresses',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching user addresses', context);

      if (!userId) {
        this._logger.warn(
          'Get user addresses failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result: AddressListResponseDto =
        await this._addressService.getUserAddresses(userId);

      this._logger.info('User addresses retrieved successfully', {
        ...context,
        addressCount: result?.addresses?.length,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get user addresses controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Create new address
  createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const addressData: CreateAddressRequestDto = req.body;

    const context = {
      operation: 'createAddress',
      userId,
      addressType: addressData?.label,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Creating new address', context);

      if (!userId) {
        this._logger.warn(
          'Create address failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      // Log address data (excluding sensitive information)
      this._logger.debug('Address creation data', {
        ...context,
        hasStreet: !!addressData.street,
        hasCity: !!addressData.city,
        hasState: !!addressData.state,
        hasPincode: !!addressData.pincode,
      });

      const result: AddressResponseDto =
        await this._addressService.createAddress(userId, addressData);

      this._logger.info('Address created successfully', {
        ...context,
        addressId: result?.address?.id,
        isDefault: result?.address?.isDefault,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Create address controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Update address
  updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { addressId } = req.params;
    const addressData: UpdateAddressRequestDto = req.body;

    const context = {
      operation: 'updateAddress',
      userId,
      addressId,
      updateFields: Object.keys(addressData),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating address', context);

      if (!userId) {
        this._logger.warn(
          'Update address failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (Object.keys(addressData).length === 0) {
        this._logger.warn(
          'Update address failed - no fields to update',
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          'No fields to update'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      this._logger.debug('Address update data', {
        ...context,
        updateFields: addressData,
      });

      const result: AddressResponseDto =
        await this._addressService.updateAddress(
          userId,
          addressId,
          addressData
        );

      this._logger.info('Address updated successfully', {
        ...context,
        updatedFieldCount: Object.keys(addressData).length,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Update address controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Delete address
  deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { addressId } = req.params;

    const context = {
      operation: 'deleteAddress',
      userId,
      addressId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Deleting address', context);

      if (!userId) {
        this._logger.warn(
          'Delete address failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result: AddressResponseDto =
        await this._addressService.deleteAddress(userId, addressId);

      this._logger.info('Address deleted successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Delete address controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Set default address
  setDefaultAddress = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { addressId } = req.params;

    const context = {
      operation: 'setDefaultAddress',
      userId,
      addressId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Setting default address', context);

      if (!userId) {
        this._logger.warn(
          'Set default address failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result: AddressResponseDto =
        await this._addressService.setDefaultAddress(userId, addressId);

      this._logger.info('Default address set successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Set default address controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Get address by ID
  getAddressById = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { addressId } = req.params;

    const context = {
      operation: 'getAddressById',
      userId,
      addressId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching address by ID', context);

      if (!userId) {
        this._logger.warn(
          'Get address by ID failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const result: AddressResponseDto =
        await this._addressService.getAddressById(userId, addressId);

      this._logger.info('Address retrieved successfully', {
        ...context,
        addressType: result.address?.label,
        isDefault: result?.address?.isDefault,
      });

      res.status(result.statusCode).json(result);
    } catch (error: unknown) {
      this._logger.error('Get address by ID controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
