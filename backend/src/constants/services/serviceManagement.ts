export const SERVICE_MESSAGES = {
  // Success messages
  SERVICE_CREATED: 'Service created successfully',
  SERVICE_UPDATED: 'Service updated successfully',
  SERVICE_DELETED: 'Service deleted successfully',
  SERVICE_RETRIEVED: 'Service retrieved successfully',
  SERVICES_RETRIEVED: 'Services retrieved successfully',

  // Error messages
  SERVICE_NOT_FOUND: 'Service not found',
  SERVICE_NOT_AVAILABLE: 'Service not available',
  SERVICE_ALREADY_EXISTS: 'Service with this name already exists',
  FAILED_CREATE_SERVICE: 'Failed to create service',
  FAILED_UPDATE_SERVICE: 'Failed to update service',
  FAILED_DELETE_SERVICE: 'Failed to delete service',
  FAILED_FETCH_SERVICES: 'Failed to fetch services',
  INVALID_SERVICE_ID: 'Invalid service ID',
  INVALID_CATEGORY_ID: 'Invalid category ID',

  // Validation messages
  NAME_REQUIRED: 'Service name is required',
  DESCRIPTION_REQUIRED: 'Service description is required',
  CATEGORY_ID_REQUIRED: 'Category ID is required',
  AVG_BASE_PRICE_REQUIRED: 'Average base price is required',
  NAME_TOO_LONG: 'Service name cannot exceed 100 characters',
  DESCRIPTION_TOO_LONG: 'Service description cannot exceed 500 characters',
  INVALID_BASE_PRICE: 'Average base price must be a positive number',
} as const;

export enum ServiceStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}
