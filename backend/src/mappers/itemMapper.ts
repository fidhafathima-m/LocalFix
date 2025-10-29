import {
  ItemResponseDto,
  ItemListResponseDto,
  ItemMapper as IItemMapper,
} from "../interfaces/dtos/itemDtos";
import { IItem } from "../interfaces/admin/IItemManagement";

export class ItemMapper implements IItemMapper {
  toItemResponseDto(item: IItem): ItemResponseDto {
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
  }

  toItemListResponseDto(
    items: IItem[],
    total: number,
    page: number,
    limit: number
  ): ItemListResponseDto {
    return {
      items: items.map((item) => this.toItemResponseDto(item)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
