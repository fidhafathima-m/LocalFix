import {
  CategoryResponseDto,
  CreateCategoryDto,
  UpdateCategoryDto,
  CategoryListResponseDto,
} from '../../dtos/categoryDtos';

export interface ICategoryService {
  createCategory(createDto: CreateCategoryDto): Promise<CategoryResponseDto>;
  getCategoryById(categoryId: string): Promise<CategoryResponseDto>;
  getCategoryBySlug(slug: string): Promise<CategoryResponseDto>;
  getAllCategories(
    page?: number,
    limit?: number,
    search?: string,
    status?: string
  ): Promise<CategoryListResponseDto>;
  updateCategory(
    categoryId: string,
    updateDto: UpdateCategoryDto
  ): Promise<CategoryResponseDto>;
  deleteCategory(categoryId: string): Promise<void>;
  searchCategories(
    query: string,
    limit?: number
  ): Promise<CategoryResponseDto[]>;
}
