import { Request, Response } from "express";
import { IItemService } from "../../interfaces/services/admin/IItemManagementService";
import { ResponseHelper } from "../../utils/responseHelper";
import { ITEM_MESSAGES } from "../../constants";
import { CreateItemDto, UpdateItemDto } from "../../interfaces/dtos/itemDtos";
import { LoggerService } from "../../services/LoggerService";

export class ItemController {
  private itemService: IItemService;
  private logger: LoggerService;

  constructor(itemService: IItemService) {
    this.itemService = itemService;
    this.logger = new LoggerService();
  }

  createItem = async (req: Request, res: Response): Promise<void> => {
    const context = {
      operation: 'createItem',
      body: req.body,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Creating new item', context);

      const createDto: CreateItemDto = req.body;

      // Validation
      if (!createDto.name?.trim()) {
        this.logger.warn('Item creation failed - name required', context);
        const response = ResponseHelper.badRequest(ITEM_MESSAGES.NAME_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.description?.trim()) {
        this.logger.warn('Item creation failed - description required', context);
        const response = ResponseHelper.badRequest(
          ITEM_MESSAGES.DESCRIPTION_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.serviceId?.trim()) {
        this.logger.warn('Item creation failed - service ID required', context);
        const response = ResponseHelper.badRequest(
          ITEM_MESSAGES.SERVICE_ID_REQUIRED
        );
        res.status(response.statusCode).json(response);
        return;
      }

      if (createDto.price === undefined || createDto.price < 0) {
        this.logger.warn('Item creation failed - invalid price', {
          ...context,
          providedPrice: createDto.price
        });
        const response = ResponseHelper.badRequest(ITEM_MESSAGES.INVALID_PRICE);
        res.status(response.statusCode).json(response);
        return;
      }

      this.logger.debug('Calling item service to create item', {
        ...context,
        itemName: createDto.name,
        serviceId: createDto.serviceId,
        price: createDto.price
      });

      const item = await this.itemService.createItem(createDto);
      
      this.logger.info('Item created successfully', {
        ...context,
        itemId: item.id,
        itemName: item.name,
        serviceId: item.serviceId
      });

      const response = ResponseHelper.success(ITEM_MESSAGES.ITEM_CREATED, {
        item,
      });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || ITEM_MESSAGES.FAILED_CREATE_ITEM;
      this.logger.error('Create item controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getItemById = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'getItemById',
      itemId: id,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching item by ID', context);

      const item = await this.itemService.getItemById(id);
      
      this.logger.info('Item retrieved successfully', {
        ...context,
        itemName: item.name,
        serviceId: item.serviceId
      });

      const response = ResponseHelper.success(ITEM_MESSAGES.ITEM_RETRIEVED, {
        item,
      });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || ITEM_MESSAGES.ITEM_NOT_FOUND;
      this.logger.error('Get item by ID controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getItemsByServiceId = async (req: Request, res: Response): Promise<void> => {
    const { serviceId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const context = {
      operation: 'getItemsByServiceId',
      serviceId,
      page,
      limit,
      search,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching items by service ID', context);

      const result = await this.itemService.getItemsByServiceId(
        serviceId,
        page,
        limit,
        search
      );
      
      this.logger.info('Items by service retrieved successfully', {
        ...context,
        totalItems: result.total,
      });

      const response = ResponseHelper.success(
        ITEM_MESSAGES.ITEMS_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || ITEM_MESSAGES.FAILED_FETCH_ITEMS;
      this.logger.error('Get items by service controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  getAllItems = async (req: Request, res: Response): Promise<void> => {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const search = req.query.search as string;
    
    const context = {
      operation: 'getAllItems',
      page,
      limit,
      search,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching all items', context);

      const result = await this.itemService.getAllItems(page, limit, search);
      
      this.logger.info('All items retrieved successfully', {
        ...context,
        totalItems: result.total,
      });

      const response = ResponseHelper.success(
        ITEM_MESSAGES.ITEMS_RETRIEVED,
        result
      );
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || ITEM_MESSAGES.FAILED_FETCH_ITEMS;
      this.logger.error('Get all items controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  updateItem = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const updateDto: UpdateItemDto = req.body;
    
    const context = {
      operation: 'updateItem',
      itemId: id,
      updateFields: Object.keys(updateDto),
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Updating item', context);

      const item = await this.itemService.updateItem(id, updateDto);
      
      this.logger.info('Item updated successfully', {
        ...context,
        itemName: item.name,
        updatedFields: Object.keys(updateDto)
      });

      const response = ResponseHelper.success(ITEM_MESSAGES.ITEM_UPDATED, {
        item,
      });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || ITEM_MESSAGES.FAILED_UPDATE_ITEM;
      this.logger.error('Update item controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  deleteItem = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    const context = {
      operation: 'deleteItem',
      itemId: id,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Deleting item', context);

      await this.itemService.deleteItem(id);
      
      this.logger.info('Item deleted successfully', context);

      const response = ResponseHelper.success(ITEM_MESSAGES.ITEM_DELETED);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      const errorMessage = error.message || ITEM_MESSAGES.FAILED_DELETE_ITEM;
      this.logger.error('Delete item controller error', {
        ...context,
        error: errorMessage,
        stack: error.stack
      });
      
      const response = ResponseHelper.error(errorMessage);
      res.status(response.statusCode).json(response);
    }
  };

  searchItems = async (req: Request, res: Response): Promise<void> => {
    const { q } = req.query;
    const limit = parseInt(req.query.limit as string) || 10;
    
    const context = {
      operation: 'searchItems',
      query: q,
      limit,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Searching items', context);

      if (!q || typeof q !== "string") {
        this.logger.warn('Search items failed - query required', context);
        const response = ResponseHelper.badRequest("Search query is required");
        res.status(response.statusCode).json(response);
        return;
      }

      const items = await this.itemService.searchItems(q, limit);
      
      this.logger.info('Items search completed successfully', {
        ...context,
        resultsCount: items.length
      });

      const response = ResponseHelper.success("Items search completed", {
        items,
      });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      this.logger.error('Search items controller error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      
      const response = ResponseHelper.error("Failed to search items");
      res.status(response.statusCode).json(response);
    }
  };
}