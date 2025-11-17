export const SUBSCRIPTION_MESSAGES = {
  // Success messages
  SUBSCRIPTION_CREATED: 'Subscription plan created successfully',
  SUBSCRIPTION_UPDATED: 'Subscription plan updated successfully',
  SUBSCRIPTION_DELETED: 'Subscription plan deleted successfully',
  SUBSCRIPTION_RETRIEVED: 'Subscription plan retrieved successfully',
  SUBSCRIPTIONS_RETRIEVED: 'Subscriptions retrieved successfully',

  // Error messages
  FAILED_CREATE_SUBSCRIPTION: 'Failed to create subscription plan',
  FAILED_UPDATE_SUBSCRIPTION: 'Failed to update subscription plan',
  FAILED_DELETE_SUBSCRIPTION: 'Failed to delete subscription plan',
  FAILED_FETCH_SUBSCRIPTIONS: 'Failed to fetch subscriptions',
  SUBSCRIPTION_NOT_FOUND: 'Subscription plan not found',
  SUBSCRIPTION_ALREADY_EXISTS:
    'Subscription plan with this name already exists',
  NAME_REQUIRED: 'Subscription name is required',
  PRICE_REQUIRED: 'Valid price is required',
  DURATION_REQUIRED: 'Valid duration is required',
  COMMISSION_RATE_REQUIRED: 'Valid commission rate is required',
} as const;
