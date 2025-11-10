export const PAYMENT_MESSAGES = {
  // Success messages
  PAYMENTS_RETRIEVED: "Payments retrieved successfully",
  PAYMENT_RETRIEVED: "Payment retrieved successfully",
  STATS_RETRIEVED: "Payment statistics retrieved successfully",
  REFUND_PROCESSED: "Refund processed successfully",
  PAYMENTS_EXPORTED: "Payments exported successfully",

  // Error messages
  FAILED_FETCH_PAYMENTS: "Failed to fetch payments",
  PAYMENT_NOT_FOUND: "Payment not found",
  FAILED_FETCH_STATS: "Failed to fetch payment statistics",
  FAILED_PROCESS_REFUND: "Failed to process refund",
  FAILED_EXPORT_PAYMENTS: "Failed to export payments",
  INVALID_PAYMENT_ID: "Invalid payment ID",
  REFUND_NOT_ALLOWED: "Refund can only be processed for successful payments",
  ALREADY_REFUNDED: "Payment has already been refunded",

  // Validation messages
  PAYMENT_ID_REQUIRED: "Payment ID is required",
  REFUND_REASON_REQUIRED: "Refund reason is required",
};