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

export class ItemService implements IItemService {
  private itemRepository: IItemRepository;
  private itemMapper: ItemMapper;

  constructor(itemRepository: IItemRepository) {
    this.itemRepository = itemRepository;
    this.itemMapper = new ItemMapper();
  }

  async createItem(createDto: CreateItemDto): Promise<ItemResponseDto> {
    try {
      // Check if item with same name already exists for this service
      const existingItem = await this.itemRepository.findByName(createDto.name);
      if (existingItem) {
        throw new Error(ITEM_MESSAGES.ITEM_ALREADY_EXISTS);
      }

      // Validate service ID
      if (!Types.ObjectId.isValid(createDto.serviceId)) {
        throw new Error(ITEM_MESSAGES.INVALID_SERVICE_ID);
      }

      const item = await this.itemRepository.create({
        ...createDto,
        serviceId: new Types.ObjectId(createDto.serviceId),
        isActive: createDto.isActive ?? true,
      });

      return this.itemMapper.toItemResponseDto(item);
    } catch (error) {
      console.error("Create item error:", error);
      throw error;
    }
  }

  async getItemById(itemId: string): Promise<ItemResponseDto> {
    try {
      const item = await this.itemRepository.findById(itemId);
      if (!item) {
        throw new Error(ITEM_MESSAGES.ITEM_NOT_FOUND);
      }
      return this.itemMapper.toItemResponseDto(item);
    } catch (error) {
      console.error("Get item by ID error:", error);
      throw error;
    }
  }

  async getItemsByServiceId(
    serviceId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ItemListResponseDto> {
    try {
      if (!Types.ObjectId.isValid(serviceId)) {
        throw new Error(ITEM_MESSAGES.INVALID_SERVICE_ID);
      }

      const skip = (page - 1) * limit;
      let items: any[];
      let total: number;

      if (search) {
        items = await this.itemRepository.searchByService(
          serviceId,
          search,
          limit
        );
        total = items.length;
      } else {
        items = await this.itemRepository.findAll({ serviceId }, skip, limit);
        total = await this.itemRepository.count({ serviceId });
      }

      return this.itemMapper.toItemListResponseDto(items, total, page, limit);
    } catch (error) {
      console.error("Get items by service error:", error);
      throw error;
    }
  }

  async getAllItems(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ItemListResponseDto> {
    try {
      const skip = (page - 1) * limit;
      let items: any[];
      let total: number;

      if (search) {
        items = await this.itemRepository.search(search, limit);
        total = items.length;
      } else {
        items = await this.itemRepository.findAll({}, skip, limit);
        total = await this.itemRepository.count();
      }

      return this.itemMapper.toItemListResponseDto(items, total, page, limit);
    } catch (error) {
      console.error("Get all items error:", error);
      throw error;
    }
  }

  async updateItem(
    itemId: string,
    updateDto: UpdateItemDto
  ): Promise<ItemResponseDto> {
    try {
      // Check if item exists
      const existingItem = await this.itemRepository.findById(itemId);
      if (!existingItem) {
        throw new Error(ITEM_MESSAGES.ITEM_NOT_FOUND);
      }

      // If name is being updated, check for duplicates
      if (updateDto.name && updateDto.name !== existingItem.name) {
        const duplicateItem = await this.itemRepository.findByName(
          updateDto.name
        );
        if (duplicateItem && duplicateItem._id.toString() !== itemId) {
          throw new Error(ITEM_MESSAGES.ITEM_ALREADY_EXISTS);
        }
      }

      const updatedItem = await this.itemRepository.update(itemId, updateDto);
      if (!updatedItem) {
        throw new Error(ITEM_MESSAGES.FAILED_UPDATE_ITEM);
      }

      return this.itemMapper.toItemResponseDto(updatedItem);
    } catch (error) {
      console.error("Update item error:", error);
      throw error;
    }
  }

  async deleteItem(itemId: string): Promise<void> {
    try {
      // Check if item exists
      const existingItem = await this.itemRepository.findById(itemId);
      if (!existingItem) {
        throw new Error(ITEM_MESSAGES.ITEM_NOT_FOUND);
      }

      const deleted = await this.itemRepository.delete(itemId);
      if (!deleted) {
        throw new Error(ITEM_MESSAGES.FAILED_DELETE_ITEM);
      }
    } catch (error) {
      console.error("Delete item error:", error);
      throw error;
    }
  }

  async searchItems(
    query: string,
    limit: number = 10
  ): Promise<ItemResponseDto[]> {
    try {
      const items = await this.itemRepository.search(query, limit);
      return items.map((item) => this.itemMapper.toItemResponseDto(item));
    } catch (error) {
      console.error("Search items error:", error);
      throw error;
    }
  }
}
