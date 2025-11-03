import { IItemService } from "../interfaces/services/admin/IItemManagementService";
import { IItemRepository } from "../interfaces/repository/admin/IItemRepository";
import {
  ItemResponseDto,
  CreateItemDto,
  UpdateItemDto,
  ItemListResponseDto,
} from "../interfaces/dtos/itemDtos";
import { ItemMapper } from "../mappers/itemMapper";
import { ITEM_MESSAGES } from "../constants";
import { Types } from "mongoose";
import { LoggerService } from "../services/LoggerService";

export class ItemService implements IItemService {
  private itemRepository: IItemRepository;
  private itemMapper: ItemMapper;
  private logger: LoggerService;

  constructor(itemRepository: IItemRepository) {
    this.itemRepository = itemRepository;
    this.itemMapper = new ItemMapper();
    this.logger = new LoggerService();
  }

  async createItem(createDto: CreateItemDto): Promise<ItemResponseDto> {
    const context = {
      operation: 'createItem',
      itemName: createDto.name,
      serviceId: createDto.serviceId,
      price: createDto.price,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Creating new item', context);

      // Check if item with same name already exists for this service
      const existingItem = await this.itemRepository.findByName(createDto.name);
      if (existingItem) {
        this.logger.warn('Item creation failed - item already exists', {
          ...context,
          existingItemId: existingItem._id.toString()
        });
        throw new Error(ITEM_MESSAGES.ITEM_ALREADY_EXISTS);
      }

      // Validate service ID
      if (!Types.ObjectId.isValid(createDto.serviceId)) {
        this.logger.warn('Item creation failed - invalid service ID', context);
        throw new Error(ITEM_MESSAGES.INVALID_SERVICE_ID);
      }

      this.logger.debug('Creating item in repository', context);

      const item = await this.itemRepository.create({
        ...createDto,
        serviceId: new Types.ObjectId(createDto.serviceId),
        isActive: createDto.isActive ?? true,
      });

      this.logger.info('Item created successfully', {
        ...context,
        itemId: item._id.toString(),
        serviceId: item.serviceId.toString()
      });

      return this.itemMapper.toItemResponseDto(item);
    } catch (error: any) {
      this.logger.error('Create item error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async getItemById(itemId: string): Promise<ItemResponseDto> {
    const context = {
      operation: 'getItemById',
      itemId,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching item by ID', context);

      const item = await this.itemRepository.findById(itemId);
      if (!item) {
        this.logger.warn('Item not found', context);
        throw new Error(ITEM_MESSAGES.ITEM_NOT_FOUND);
      }

      this.logger.info('Item retrieved successfully', {
        ...context,
        itemName: item.name,
        serviceId: item.serviceId.toString()
      });

      return this.itemMapper.toItemResponseDto(item);
    } catch (error: any) {
      this.logger.error('Get item by ID error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async getItemsByServiceId(
    serviceId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ItemListResponseDto> {
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

      if (!Types.ObjectId.isValid(serviceId)) {
        this.logger.warn('Invalid service ID provided', context);
        throw new Error(ITEM_MESSAGES.INVALID_SERVICE_ID);
      }

      const skip = (page - 1) * limit;
      let items: any[];
      let total: number;

      if (search) {
        this.logger.debug('Searching items by service with query', {
          ...context,
          searchQuery: search
        });
        items = await this.itemRepository.searchByService(
          serviceId,
          search,
          limit
        );
        total = items.length;
      } else {
        this.logger.debug('Fetching all items by service', context);
        items = await this.itemRepository.findAll({ serviceId }, skip, limit);
        total = await this.itemRepository.count({ serviceId });
      }

      this.logger.info('Items by service retrieved successfully', {
        ...context,
        itemsCount: items.length,
        totalItems: total,
        hasSearch: !!search
      });

      return this.itemMapper.toItemListResponseDto(items, total, page, limit);
    } catch (error: any) {
      this.logger.error('Get items by service error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async getAllItems(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ItemListResponseDto> {
    const context = {
      operation: 'getAllItems',
      page,
      limit,
      search,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Fetching all items', context);

      const skip = (page - 1) * limit;
      let items: any[];
      let total: number;

      if (search) {
        this.logger.debug('Searching items with query', {
          ...context,
          searchQuery: search
        });
        items = await this.itemRepository.search(search, limit);
        total = items.length;
      } else {
        this.logger.debug('Fetching all items without search', context);
        items = await this.itemRepository.findAll({}, skip, limit);
        total = await this.itemRepository.count();
      }

      this.logger.info('All items retrieved successfully', {
        ...context,
        itemsCount: items.length,
        totalItems: total,
        hasSearch: !!search
      });

      return this.itemMapper.toItemListResponseDto(items, total, page, limit);
    } catch (error: any) {
      this.logger.error('Get all items error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async updateItem(
    itemId: string,
    updateDto: UpdateItemDto
  ): Promise<ItemResponseDto> {
    const context = {
      operation: 'updateItem',
      itemId,
      updateFields: Object.keys(updateDto),
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Updating item', context);

      // Check if item exists
      const existingItem = await this.itemRepository.findById(itemId);
      if (!existingItem) {
        this.logger.warn('Update failed - item not found', context);
        throw new Error(ITEM_MESSAGES.ITEM_NOT_FOUND);
      }

      // If name is being updated, check for duplicates
      if (updateDto.name && updateDto.name !== existingItem.name) {
        this.logger.debug('Checking for duplicate item name', {
          ...context,
          newName: updateDto.name,
          oldName: existingItem.name
        });
        
        const duplicateItem = await this.itemRepository.findByName(
          updateDto.name
        );
        if (duplicateItem && duplicateItem._id.toString() !== itemId) {
          this.logger.warn('Update failed - item name already exists', {
            ...context,
            duplicateItemId: duplicateItem._id.toString()
          });
          throw new Error(ITEM_MESSAGES.ITEM_ALREADY_EXISTS);
        }
      }

      this.logger.debug('Updating item in repository', {
        ...context,
        updateData: updateDto
      });

      const updatedItem = await this.itemRepository.update(itemId, updateDto);
      if (!updatedItem) {
        this.logger.error('Update failed - repository returned null', context);
        throw new Error(ITEM_MESSAGES.FAILED_UPDATE_ITEM);
      }

      this.logger.info('Item updated successfully', {
        ...context,
        itemName: updatedItem.name,
        updatedFieldCount: Object.keys(updateDto).length
      });

      return this.itemMapper.toItemResponseDto(updatedItem);
    } catch (error: any) {
      this.logger.error('Update item error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async deleteItem(itemId: string): Promise<void> {
    const context = {
      operation: 'deleteItem',
      itemId,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Deleting item', context);

      // Check if item exists
      const existingItem = await this.itemRepository.findById(itemId);
      if (!existingItem) {
        this.logger.warn('Delete failed - item not found', context);
        throw new Error(ITEM_MESSAGES.ITEM_NOT_FOUND);
      }

      this.logger.debug('Deleting item from repository', {
        ...context,
        itemName: existingItem.name
      });

      const deleted = await this.itemRepository.delete(itemId);
      if (!deleted) {
        this.logger.error('Delete failed - repository returned false', context);
        throw new Error(ITEM_MESSAGES.FAILED_DELETE_ITEM);
      }

      this.logger.info('Item deleted successfully', context);
    } catch (error: any) {
      this.logger.error('Delete item error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }

  async searchItems(
    query: string,
    limit: number = 10
  ): Promise<ItemResponseDto[]> {
    const context = {
      operation: 'searchItems',
      query,
      limit,
      timestamp: new Date().toISOString()
    };

    try {
      this.logger.info('Searching items', context);

      const items = await this.itemRepository.search(query, limit);

      this.logger.info('Item search completed', {
        ...context,
        resultsCount: items.length
      });

      return items.map((item) => this.itemMapper.toItemResponseDto(item));
    } catch (error: any) {
      this.logger.error('Search items error', {
        ...context,
        error: error.message,
        stack: error.stack
      });
      throw error;
    }
  }
}