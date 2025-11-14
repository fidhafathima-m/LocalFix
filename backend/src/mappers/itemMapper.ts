import {
  ItemResponseDto,
  ItemListResponseDto,
} from "../interfaces/dtos/itemDtos";
import { IItem } from "../interfaces/admin/IItemManagement";

export const toItemResponseDto = (item: IItem): ItemResponseDto => {
  return {
    id: item._id.toString(),
    serviceId: item.serviceId.toString(),
    name: item.name,
    description: item.description,
    sku: item.sku,
    price: item.price,
    isActive: item.isActive,
    createdAt: item.createdAt.toISOString(),
    updatedAt: item.updatedAt.toISOString(),
  };
};

export const toItemListResponseDto = (
  items: IItem[],
  total: number,
  page: number,
  limit: number
): ItemListResponseDto => {
  return {
    items: items.map((item) => toItemResponseDto(item)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
