export const USER_PROFILE_ROUTES = {
  // User profile
  UPDATE_USER_PROFILE: "/user/profile",
  UPDATE_PROFILE_PHOTO: "/user/profile/upload-photo",
  CHANGE_PASSWORD: "/user/change-password",
  // Add to your routes file
  USER_ADDRESSES: "/user/addresses",
  CREATE_ADDRESS: "/user/addresses",
  UPDATE_ADDRESS: (addressId: string) => `/user/addresses/${addressId}`,
  DELETE_ADDRESS: (addressId: string) => `/user/addresses/${addressId}`,
  SET_DEFAULT_ADDRESS: (addressId: string) =>
    `/user/addresses/${addressId}/default`,

  // Review routes
  REVIEWS: "/user/reviews",
  REVIEW_BY_ID: (reviewId: string) => `/user/reviews/${reviewId}`,
  REVIEW_ORDER: (orderId: string) => `/user/reviews/order/${orderId}`,
  REVIEW_TECHNICIAN: (technicianId: string) => `/user/reviews/technician/${technicianId}`,
  REVIEW_TECHNICIAN_STATS: (technicianId: string) => `/user/reviews/technician/${technicianId}/stats`,
  REVIEW_CAN_REVIEW: (orderId: string) => `/user/reviews/can-review/${orderId}`,
} as const;
