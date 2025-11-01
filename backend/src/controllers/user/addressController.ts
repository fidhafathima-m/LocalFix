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

export class AddressController {
  private addressService: IAddressService;

  constructor(addressService: IAddressService) {
    this.addressService = addressService;
  }

  // Get all addresses for user
  getUserAddresses = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      
      if (!userId) {
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      const result: AddressListResponseDto = await this.addressService.getUserAddresses(userId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get user addresses controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Create new address
  createAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const addressData: CreateAddressRequestDto = req.body;
      
      if (!userId) {
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      const result: AddressResponseDto = await this.addressService.createAddress(userId, addressData);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Create address controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Update address
  updateAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { addressId } = req.params;
      const addressData: UpdateAddressRequestDto = req.body;
      
      if (!userId) {
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      const result: AddressResponseDto = await this.addressService.updateAddress(
        userId,
        addressId,
        addressData
      );
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Update address controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Delete address
  deleteAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { addressId } = req.params;
      
      if (!userId) {
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      const result: AddressResponseDto = await this.addressService.deleteAddress(userId, addressId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Delete address controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Set default address
  setDefaultAddress = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { addressId } = req.params;
      
      if (!userId) {
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      const result: AddressResponseDto = await this.addressService.setDefaultAddress(userId, addressId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Set default address controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // Get address by ID
  getAddressById = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const { addressId } = req.params;
      
      if (!userId) {
        const errorResponse = ResponseHelper.unauthorized("Authentication required");
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }
      
      const result: AddressResponseDto = await this.addressService.getAddressById(userId, addressId);
      res.status(result.statusCode).json(result);
    } catch (error) {
      console.error("Get address by ID controller error:", error);
      const errorResponse = ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}