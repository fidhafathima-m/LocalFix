// mappers/categoryMapper.ts
import { ICategory, CategoryWithCount } from '../interfaces/user/ICategory';
import {
  CategoryResponseDto,
  CategoryListResponseDto,
} from '../interfaces/dtos/categoryDtos';

export const toCategoryResponseDto = (
  category: ICategory | CategoryWithCount
): CategoryResponseDto => {
  return {
    id: category._id.toString(),
    name: category.name,
    slug: category.slug,
    description: category.description,
    iconUrl: category.iconUrl,
    status: category.status,
    serviceCount: (category as CategoryWithCount).serviceCount || 0,
    createdAt: category.createdAt.toISOString(),
    updatedAt: category.updatedAt.toISOString(),
  };
};

export const toCategoryListResponseDto = (
  categories: CategoryWithCount[],
  total: number,
  page: number,
  limit: number
): CategoryListResponseDto => {
  return {
    categories: categories.map(toCategoryResponseDto),
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};
