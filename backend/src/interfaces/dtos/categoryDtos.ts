import { Types } from 'mongoose';

export interface CategoryResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | undefined;
  iconUrl: string | undefined;
  createdAt: string;
  updatedAt: string;
  serviceCount: number;
  status: 'active' | 'inactive' | undefined;
}

export interface CreateCategoryDto {
  name: string;
  description: string;
  iconUrl?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  iconUrl?: string;
}

export interface CategoryListResponseDto {
  categories: CategoryResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CategoryMapper {
  toCategoryResponseDto(category: any): CategoryResponseDto;
  toCategoryListResponseDto(
    categories: any[],
    total: number,
    page: number,
    limit: number
  ): CategoryListResponseDto;
}
