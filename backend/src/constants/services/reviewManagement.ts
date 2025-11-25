export const REVIEW_MESSAGES = {
  // Success messages
  REVIEW_CREATED: 'Review created successfully',
  REVIEW_UPDATED: 'Review updated successfully',
  REVIEW_DELETED: 'Review deleted successfully',
  REVIEW_RETRIEVED: 'Review retrieved successfully',
  REVIEWS_RETRIEVED: 'Reviews retrieved successfully',
  REVIEW_FLAGGED: 'Review flagged successfully',

  // Error messages
  REVIEW_NOT_FOUND: 'Review not found',
  FAILED_CREATE_REVIEW: 'Failed to create review',
  FAILED_UPDATE_REVIEW: 'Failed to update review',
  FAILED_DELETE_REVIEW: 'Failed to delete review',
  FAILED_FETCH_REVIEWS: 'Failed to fetch reviews',
  FAILED_FLAG_REVIEW: 'Failed to flag review',

  // Validation messages
  RATING_REQUIRED: 'Rating is required',
  RATING_RANGE: 'Rating must be between 1 and 5',
  COMMENT_REQUIRED: 'Comment is required',
  COMMENT_TOO_LONG: 'Comment must be less than 500 characters',
} as const;
