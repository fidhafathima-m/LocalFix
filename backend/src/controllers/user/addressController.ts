import { Response } from "express";
import { IAddressService } from "../../interfaces/services/user/IAddressService";
import { ResponseHelper } from "../../utils/responseHelper";
import { GENERAL_MESSAGES } from "../../constants";
import {
  AddressListResponseDto,
  AddressResponseDto,
  CreateAddressRequestDto,
  UpdateAddressRequestDto,
} from "../../interfaces/dtos/addressDtos";
import { AuthRequest } from "@/middleware/authMiddleware";
import { LoggerService } from "../../services/LoggerService";

export class AddressController {
  private addressService: IAddressService;
  private logger: LoggerService;

  constructor(addressService: IAddressService) {
    this.addressService = addressService;
    this.logger = new LoggerService();
  }

  // Get all addresses for user
  getUserAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const context = {
      operation: 'getUserAddresses',
      userId,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching user addresses', context);

      if (!userId) {
        this.logger.warn('Get user addresses failed - authentication required', context);
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      const result: AddressListResponseDto = await this.addressService.getUserAddresses(userId);
      
      this.logger.info('User addresses retrieved successfully', {
        ...context,
        addressCount: result?.addresses?.length
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get user addresses controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Creating new address', context);

      if (!userId) {
        this.logger.warn('Create address failed - authentication required', context);
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      // Log address data (excluding sensitive information)
      this.logger.debug('Address creation data', {
        ...context,
        hasStreet: !!addressData.street,
        hasCity: !!addressData.city,
        hasState: !!addressData.state,
        hasPincode: !!addressData.pincode
      });
      
      const result: AddressResponseDto = await this.addressService.createAddress(userId, addressData);
      
      this.logger.info('Address created successfully', {
        ...context,
        addressId: result?.address?.id,
        isDefault: result?.address?.isDefault
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Create address controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Updating address', context);

      if (!userId) {
        this.logger.warn('Update address failed - authentication required', context);
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (Object.keys(addressData).length === 0) {
        this.logger.warn('Update address failed - no fields to update', context);
        const badRequestResponse = ResponseHelper.badRequest("No fields to update");
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      this.logger.debug('Address update data', {
        ...context,
        updateFields: addressData
      });
      
      const result: AddressResponseDto = await this.addressService.updateAddress(
        userId,
        addressId,
        addressData
      );
      
      this.logger.info('Address updated successfully', {
        ...context,
        updatedFieldCount: Object.keys(addressData).length
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Update address controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Deleting address', context);

      if (!userId) {
        this.logger.warn('Delete address failed - authentication required', context);
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      const result: AddressResponseDto = await this.addressService.deleteAddress(userId, addressId);
      
      this.logger.info('Address deleted successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Delete address controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Set default address
  setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { addressId } = req.params;
    
    const context = {
      operation: 'setDefaultAddress',
      userId,
      addressId,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Setting default address', context);

      if (!userId) {
        this.logger.warn('Set default address failed - authentication required', context);
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      const result: AddressResponseDto = await this.addressService.setDefaultAddress(userId, addressId);
      
      this.logger.info('Default address set successfully', context);

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Set default address controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching address by ID', context);

      if (!userId) {
        this.logger.warn('Get address by ID failed - authentication required', context);
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      const result: AddressResponseDto = await this.addressService.getAddressById(userId, addressId);
      
      this.logger.info('Address retrieved successfully', {
        ...context,
        addressType: result.address?.label,
        isDefault: result?.address?.isDefault
      });

      res.status(result.statusCode).json(result);
    } catch (error: any) {
      this.logger.error('Get address by ID controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}