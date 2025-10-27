// constants/categoryConstants.ts
export const CATEGORY_MESSAGES = {
  // Success messages
  CATEGORY_CREATED: "Category created successfully",
  CATEGORY_UPDATED: "Category updated successfully",
  CATEGORY_DELETED: "Category deleted successfully",
  CATEGORY_RETRIEVED: "Category retrieved successfully",
  CATEGORIES_RETRIEVED: "Categories retrieved successfully",

  // Error messages
  CATEGORY_NOT_FOUND: "Category not found",
  CATEGORY_ALREADY_EXISTS: "Category with this name already exists",
  FAILED_CREATE_CATEGORY: "Failed to create category",
  FAILED_UPDATE_CATEGORY: "Failed to update category",
  FAILED_DELETE_CATEGORY: "Failed to delete category",
  FAILED_FETCH_CATEGORIES: "Failed to fetch categories",
  INVALID_CATEGORY_ID: "Invalid category ID",

  // Validation messages
  NAME_REQUIRED: "Category name is required",
  DESCRIPTION_REQUIRED: "Category description is required",
  NAME_TOO_LONG: "Category name cannot exceed 100 characters",
  DESCRIPTION_TOO_LONG: "Category description cannot exceed 500 characters",
} as const;