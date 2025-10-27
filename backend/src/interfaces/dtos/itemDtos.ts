export interface ItemResponseDto {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemDto {
  serviceId: string;
  name: string;
  description: string;
  price: number;
  sku?: string;
  isActive?: boolean;
}

export interface UpdateItemDto {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  isActive?: boolean;
}

export interface ItemListResponseDto {
  items: ItemResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ItemMapper {
  toItemResponseDto(item: any): ItemResponseDto;
  toItemListResponseDto(items: any[], total: number, page: number, limit: number): ItemListResponseDto;
}