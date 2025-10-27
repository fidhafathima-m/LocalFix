import { Request, Response } from "express";
import { IItemService } from "../../interfaces/services/admin/IItemManagementService";
import { ResponseHelper } from "../../utils/responseHelper";
import { ITEM_MESSAGES } from "../../constants";
import { CreateItemDto, UpdateItemDto } from "../../interfaces/dtos/itemDtos";

export class ItemController {
  private itemService: IItemService;

  constructor(itemService: IItemService) {
    this.itemService = itemService;
  }

  createItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const createDto: CreateItemDto = req.body;

      // Validation
      if (!createDto.name?.trim()) {
        const response = ResponseHelper.badRequest(ITEM_MESSAGES.NAME_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.description?.trim()) {
        const response = ResponseHelper.badRequest(ITEM_MESSAGES.DESCRIPTION_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.serviceId?.trim()) {
        const response = ResponseHelper.badRequest(ITEM_MESSAGES.SERVICE_ID_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      if (createDto.price === undefined || createDto.price < 0) {
        const response = ResponseHelper.badRequest(ITEM_MESSAGES.INVALID_PRICE);
        res.status(response.statusCode).json(response);
        return;
      }

      const item = await this.itemService.createItem(createDto);
      const response = ResponseHelper.success(ITEM_MESSAGES.ITEM_CREATED, { item });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Create item controller error:", error);
      const response = ResponseHelper.error(error.message || ITEM_MESSAGES.FAILED_CREATE_ITEM);
      res.status(response.statusCode).json(response);
    }
  };

  getItemById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const item = await this.itemService.getItemById(id);
      const response = ResponseHelper.success(ITEM_MESSAGES.ITEM_RETRIEVED, { item });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Get item by ID controller error:", error);
      const response = ResponseHelper.error(error.message || ITEM_MESSAGES.ITEM_NOT_FOUND);
      res.status(response.statusCode).json(response);
    }
  };

  getItemsByServiceId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { serviceId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.itemService.getItemsByServiceId(serviceId, page, limit, search);
      const response = ResponseHelper.success(ITEM_MESSAGES.ITEMS_RETRIEVED, result);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Get items by service controller error:", error);
      const response = ResponseHelper.error(error.message || ITEM_MESSAGES.FAILED_FETCH_ITEMS);
      res.status(response.statusCode).json(response);
    }
  };

  getAllItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.itemService.getAllItems(page, limit, search);
      const response = ResponseHelper.success(ITEM_MESSAGES.ITEMS_RETRIEVED, result);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Get all items controller error:", error);
      const response = ResponseHelper.error(error.message || ITEM_MESSAGES.FAILED_FETCH_ITEMS);
      res.status(response.statusCode).json(response);
    }
  };

  updateItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateDto: UpdateItemDto = req.body;

      const item = await this.itemService.updateItem(id, updateDto);
      const response = ResponseHelper.success(ITEM_MESSAGES.ITEM_UPDATED, { item });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Update item controller error:", error);
      const response = ResponseHelper.error(error.message || ITEM_MESSAGES.FAILED_UPDATE_ITEM);
      res.status(response.statusCode).json(response);
    }
  };

  deleteItem = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.itemService.deleteItem(id);
      const response = ResponseHelper.success(ITEM_MESSAGES.ITEM_DELETED);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Delete item controller error:", error);
      const response = ResponseHelper.error(error.message || ITEM_MESSAGES.FAILED_DELETE_ITEM);
      res.status(response.statusCode).json(response);
    }
  };

  searchItems = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!q || typeof q !== "string") {
        const response = ResponseHelper.badRequest("Search query is required");
        res.status(response.statusCode).json(response);
        return;
      }

      const items = await this.itemService.searchItems(q, limit);
      const response = ResponseHelper.success("Items search completed", { items });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Search items controller error:", error);
      const response = ResponseHelper.error("Failed to search items");
      res.status(response.statusCode).json(response);
    }
  };
}