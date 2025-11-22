export const MESSAGE_ROUTES = {
  // Message routes
  GET_ORDER_MESSAGES: (orderId: string) => `/messages/${orderId}`,
  GET_USER_CONVERSATIONS: "/messages/conversations/user",
  GET_TECHNICIAN_CONVERSATIONS: "/messages/conversations/technician",
  MARK_AS_READ: "/messages/read",
  GET_UNREAD_COUNT: "/messages/unread-count",
  SEND_MESSAGE: "/messages/send",
  INITIALIZE_CHAT_ROOM: "/messages/room/initialize",
  MARK_ALL_READ: "/messages/mark-all-read",
  CLOSE_CHAT_ROOM: (orderId: string) => `/messages/room/close/${orderId}`,
} as const;
