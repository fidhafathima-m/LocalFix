// mappers/CategoryMapper.ts
import { CategoryResponseDto, CategoryListResponseDto, CategoryMapper as ICategoryMapper } from "../interfaces/dtos/categoryDtos";
import { ICategory } from "../interfaces/admin/ICategoryManagement"

export class CategoryMapper implements ICategoryMapper {
  toCategoryResponseDto(category: ICategory): CategoryResponseDto {
    return {
      id: category._id.toString(),
      name: category.name,
      slug: category.slug,
      description: category.description,
      iconUrl: category.iconUrl,
      createdAt: category.createdAt.toISOString(),
      updatedAt: category.updatedAt.toISOString(),
       serviceCount: category.serviceCount || 0,
    };
  }

  toCategoryListResponseDto(
    categories: ICategory[],
    total: number,
    page: number,
    limit: number
  ): CategoryListResponseDto {
    return {
      categories: categories.map(category => this.toCategoryResponseDto(category)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}