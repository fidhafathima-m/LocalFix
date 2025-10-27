import { ItemResponseDto, CreateItemDto, UpdateItemDto, ItemListResponseDto } from "../../dtos/itemDtos";

export interface IItemService {
  createItem(createDto: CreateItemDto): Promise<ItemResponseDto>;
  getItemById(itemId: string): Promise<ItemResponseDto>;
  getItemsByServiceId(serviceId: string, page?: number, limit?: number, search?: string): Promise<ItemListResponseDto>;
  getAllItems(page?: number, limit?: number, search?: string): Promise<ItemListResponseDto>;
  updateItem(itemId: string, updateDto: UpdateItemDto): Promise<ItemResponseDto>;
  deleteItem(itemId: string): Promise<void>;
  searchItems(query: string, limit?: number): Promise<ItemResponseDto[]>;
}