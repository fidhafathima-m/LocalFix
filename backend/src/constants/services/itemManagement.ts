export const ITEM_MESSAGES = {
  // Success messages
  ITEM_CREATED: "Item created successfully",
  ITEM_UPDATED: "Item updated successfully",
  ITEM_DELETED: "Item deleted successfully",
  ITEM_RETRIEVED: "Item retrieved successfully",
  ITEMS_RETRIEVED: "Items retrieved successfully",

  // Error messages
  ITEM_NOT_FOUND: "Item not found",
  ITEM_ALREADY_EXISTS: "Item with this name already exists",
  FAILED_CREATE_ITEM: "Failed to create item",
  FAILED_UPDATE_ITEM: "Failed to update item",
  FAILED_DELETE_ITEM: "Failed to delete item",
  FAILED_FETCH_ITEMS: "Failed to fetch items",
  INVALID_ITEM_ID: "Invalid item ID",
  INVALID_SERVICE_ID: "Invalid service ID",

  // Validation messages
  NAME_REQUIRED: "Item name is required",
  DESCRIPTION_REQUIRED: "Item description is required",
  SERVICE_ID_REQUIRED: "Service ID is required",
  PRICE_REQUIRED: "Price is required",
  NAME_TOO_LONG: "Item name cannot exceed 100 characters",
  DESCRIPTION_TOO_LONG: "Item description cannot exceed 500 characters",
  INVALID_PRICE: "Price must be a positive number",
} as const;