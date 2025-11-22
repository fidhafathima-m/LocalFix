/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import toast from "react-hot-toast";
import { useSocket } from "../../../../../../context/SocketContext";
import { messageService } from "../../../../../../services/user/messageService";
import { ChatThread } from "../../../../../user/components/messages/sections/ChatThread";
import { useMessage } from "../../../../../../context/MessageContext";

interface Conversation {
  id: string;
  name: string;
  service: string;
  lastMessage: string;
  timestamp: string;
  unread?: number;
  avatar?: string;
  orderId: string;
  recipientId: string;
  orderStatus?: string;
}

interface MessagesTabProps {
  dashboardData: any;
  isSuspended: boolean;
}

export const MessagesTab: React.FC<MessagesTabProps> = ({
  dashboardData,
  isSuspended,
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [hasHandledInitialConversation, setHasHandledInitialConversation] =
    useState(false);
  const [searchParams] = useSearchParams();

  const technicianProfile = dashboardData?.profile;

  const { refreshUnreadCount } = useMessage();

  const { socket, isConnected } = useSocket();

  const orderId = searchParams.get("orderId");
  const customerId = searchParams.get("customerId");
  const serviceName = searchParams.get("serviceName");

  // Chat availability logic
  const isChatAvailable = (orderStatus?: string) => {
    if (!orderStatus) return true;
    return ["accepted", "confirmed", "on_the_way", "in_progress"].includes(
      orderStatus
    );
  };

  useEffect(() => {
    refreshUnreadCount();
  }, [refreshUnreadCount]);

  const getChatStatusMessage = (orderStatus?: string) => {
    if (!orderStatus) return "Chat Available";
    if (isChatAvailable(orderStatus)) return "Chat Available";
    if (orderStatus === "pending")
      return "Chat available after order acceptance";
    if (orderStatus === "completed")
      return "Chat no longer available for completed services";
    if (orderStatus === "cancelled")
      return "Chat not available for cancelled orders";
    if (orderStatus === "refunded")
      return "Chat not available for refunded orders";
    return "Chat not available";
  };

  const getChatStatusColor = (orderStatus?: string) => {
    if (!orderStatus) return "bg-green-100 text-green-800";
    if (isChatAvailable(orderStatus)) return "bg-green-100 text-green-800";
    return "bg-gray-100 text-gray-600";
  };

  const loadConversations = async () => {
    const technicianId = dashboardData?.profile?._id;
    if (!technicianId) {
      console.error("No technician ID found");
      return;
    }

    try {
      setLoading(true);
      const chatRooms = await messageService.getTechnicianConversations(
        technicianId
      );

      const formattedConversations: Conversation[] = chatRooms.map(
        (room, index) => {
          const customerName = room.userSnapshot?.fullName || "Customer";
          const customerAvatar = room.userSnapshot?.profilePictureUrl || "";
          const customerPhone = room.userSnapshot?.phone || "";

          let recipientId: string;

          if (typeof room.userId === "string") {
            recipientId = room.userId;
          } else if (room.userId && typeof room.userId === "object") {
            const userIdObj = room.userId as any;

            if (userIdObj._id != null) {
              recipientId =
                typeof userIdObj._id === "string"
                  ? userIdObj._id
                  : userIdObj._id?.toString?.() || "unknown";
            } else if (userIdObj.id != null) {
              recipientId =
                typeof userIdObj.id === "string"
                  ? userIdObj.id
                  : userIdObj.id?.toString?.() || "unknown";
            } else {
              try {
                recipientId = userIdObj.toString?.() || "unknown";
              } catch (e) {
                console.error(
                  `Room ${index + 1}: Cannot extract recipientId:`,
                  userIdObj,
                  e
                );
                recipientId = "unknown";
              }
            }
          } else {
            console.warn(
              `Room ${index + 1}: Invalid userId type:`,
              typeof room.userId,
              room.userId
            );
            recipientId = String(room.userId || "unknown");
          }

          return {
            id: room._id!,
            orderId: room.orderId,
            recipientId: recipientId,
            name: customerName,
            avatar: customerAvatar,
            phone: customerPhone,
            service: room.technicianSnapshot?.serviceName || "Service",
            lastMessage: room.lastMessage?.message || "No messages yet",
            timestamp: room.lastMessage
              ? new Date(room.lastMessage.timestamp).toLocaleTimeString(
                  "en-IN",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : "No messages",
            unread: room.unreadCount?.technician || 0,
            orderStatus:
              room.technicianSnapshot?.orderStatus || room.orderStatus,
          };
        }
      );
      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error loading technician conversations:", error);
      toast.error("Failed to load conversations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (technicianProfile?._id) {
      loadConversations();
    }
  }, [technicianProfile?._id]);

  // Handle initial conversation from URL parameters
  useEffect(() => {
    if (
      orderId &&
      customerId &&
      !loading &&
      !hasHandledInitialConversation &&
      conversations.length >= 0
    ) {
      handleOrderBasedConversation(orderId, customerId, serviceName);
      setHasHandledInitialConversation(true);
    }
  }, [
    orderId,
    customerId,
    loading,
    hasHandledInitialConversation,
    conversations.length,
  ]);

  const handleOrderBasedConversation = async (
    orderId: string,
    customerId: string,
    serviceName: string | null
  ) => {
    if (!technicianProfile) return;

    try {
      const existingConv = conversations.find(
        (conv) => conv.orderId === orderId && conv.recipientId === customerId
      );

      if (existingConv) {
        setSelectedConversation(existingConv.id);
        clearUrlParameters();
      } else {
        await createAndSelectConversation(orderId, customerId, serviceName);
      }
    } catch (error) {
      console.error("Error handling order-based conversation:", error);
      toast.error("Failed to start conversation");
      setHasHandledInitialConversation(true);
    }
  };

  const clearUrlParameters = () => {
    if (window.history.replaceState) {
      const newUrl =
        window.location.pathname +
        window.location.search
          .replace(/[?&](orderId|customerId|serviceName)=[^&]*/g, "")
          .replace(/^&/, "?");
      window.history.replaceState({}, "", newUrl);
    }
  };

  const createAndSelectConversation = async (
    orderId: string,
    customerId: string,
    serviceName: string | null
  ) => {
    if (!technicianProfile) return;

    try {
      const newRoom = await messageService.initializeChatRoom(
        orderId,
        customerId,
        technicianProfile._id
      );

      await loadConversations();

      if (newRoom._id) {
        setSelectedConversation(newRoom._id);
        clearUrlParameters();

        if (!newRoom.lastMessage) {
          await sendWelcomeMessage(orderId, customerId, serviceName);
        }
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
      setHasHandledInitialConversation(true);
    }
  };

  const sendWelcomeMessage = async (
    orderId: string,
    customerId: string,
    serviceName: string | null
  ) => {
    if (!technicianProfile) return;

    try {
      const welcomeMessage = `Hello! I'm your technician for the ${
        serviceName || "service"
      } (Order: ${orderId}). How can I assist you today?`;

      await messageService.sendMessage({
        orderId,
        senderId: technicianProfile._id,
        senderType: "technician",
        receiverId: customerId,
        receiverType: "user",
        message: welcomeMessage,
        messageType: "text",
      });

      await loadConversations();
    } catch (error) {
      console.error("Error sending welcome message:", error);
    }
  };

  const handleSelectConversation = (conversationId: string) => {
    setSelectedConversation(conversationId);
    clearUrlParameters();
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    loadConversations();
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const isSelectedChatAvailable = selectedConv
    ? isChatAvailable(selectedConv.orderStatus)
    : false;

  // Socket effects for real-time updates
  useEffect(() => {
    if (!socket) return;

    const handleOrderStatusUpdate = (data: any) => {
      // Update the conversation with new status
      setConversations((prev) =>
        prev.map((conv) =>
          conv.orderId === data.orderId
            ? { ...conv, orderStatus: data.newStatus }
            : conv
        )
      );

      toast.success(
        `Order status updated: ${data.newStatus.replace("_", " ")}`
      );
    };

    // Listen for order status updates
    socket.on("order-status-updated", handleOrderStatusUpdate);

    return () => {
      socket.off("order-status-updated", handleOrderStatusUpdate);
    };
  }, [socket]);

  // Join order rooms when conversations load
  useEffect(() => {
    if (!socket || !isConnected || conversations.length === 0) return;

    // Join order status rooms for all conversations
    conversations.forEach((conv) => {
      socket.emit("join-order-room", {
        orderId: conv.orderId,
        userId: technicianProfile?._id,
        userType: "technician",
      });
    });

    return () => {
      // Leave all order rooms when component unmounts
      conversations.forEach((conv) => {
        socket.emit("leave-order-room", {
          orderId: conv.orderId,
          userId: technicianProfile?._id,
          userType: "technician",
        });
      });
    };
  }, [socket, isConnected, conversations, technicianProfile?._id]);

  if (isSuspended) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <div className="max-w-md mx-auto">
          <div className="text-yellow-600 mb-4">
            <svg
              className="w-16 h-16 mx-auto"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Account Suspended
          </h3>
          <p className="text-gray-600 mb-4">
            Your account is currently suspended. You cannot access messages
            while suspended.
          </p>
          <p className="text-sm text-gray-500">
            Please contact support to resolve this issue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-2 mb-2"></div>
        <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
        <p className="text-gray-600 mt-1">Communicate with your customers</p>
      </div>

      {loading ? (
        <div className="h-[600px] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading conversations...</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 h-[600px] min-h-0">
          {/* Conversation List */}
          <div
            className={`border-r border-gray-200 flex flex-col min-h-0 ${
              selectedConversation ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
              <h2 className="font-semibold text-gray-900">Conversations</h2>
              <p className="text-sm text-gray-600 mt-1">
                {conversations.length} conversation
                {conversations.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              {conversations.length === 0 ? (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <svg
                      className="w-12 h-12 mx-auto text-gray-400 mb-3"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                      />
                    </svg>
                    <p>No conversations yet</p>
                    <p className="text-sm mt-1">
                      Start chatting with your customers
                    </p>
                  </div>
                </div>
              ) : (
                <div className="h-full overflow-y-auto">
                  <div className="space-y-2 p-1">
                    {conversations.map((conversation) => (
                      <div
                        key={conversation.id}
                        className={`p-4 rounded-lg cursor-pointer transition-colors ${
                          selectedConversation === conversation.id
                            ? "bg-blue-50 border border-blue-200"
                            : "hover:bg-gray-50 border border-transparent"
                        }`}
                        onClick={() =>
                          handleSelectConversation(conversation.id)
                        }
                      >
                        <div className="flex items-start gap-3">
                          <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                              {conversation.avatar ? (
                                <img
                                  src={conversation.avatar}
                                  alt={conversation.name}
                                  className="w-12 h-12 rounded-full object-cover"
                                />
                              ) : (
                                <span className="text-gray-400 text-lg">
                                  {conversation.name.charAt(0).toUpperCase()}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-1">
                              <h3 className="font-semibold text-gray-900 truncate">
                                {conversation.name}
                              </h3>
                              <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
                                {conversation.timestamp}
                              </span>
                            </div>

                            <p className="text-sm text-gray-600 mb-1 truncate">
                              {conversation.service}
                            </p>

                            {conversation.orderStatus && (
                              <div className="mb-1">
                                <span
                                  className={`text-xs px-2 py-1 rounded-full ${getChatStatusColor(
                                    conversation.orderStatus
                                  )}`}
                                >
                                  {getChatStatusMessage(
                                    conversation.orderStatus
                                  )}
                                </span>
                              </div>
                            )}

                            <div className="flex items-center justify-between">
                              <p className="text-sm text-gray-500 truncate flex-1 min-w-0 mr-2">
                                {conversation.lastMessage}
                              </p>
                              {conversation.unread &&
                                conversation.unread > 0 && (
                                  <span className="bg-blue-600 text-white text-xs rounded-full min-w-[20px] h-5 flex items-center justify-center px-1 flex-shrink-0">
                                    {conversation.unread}
                                  </span>
                                )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat Thread */}
          <div
            className={`min-h-0 ${
              selectedConversation
                ? "flex flex-col"
                : "hidden md:flex md:flex-col"
            } col-span-2`}
          >
            {selectedConv ? (
              <div className="flex flex-col h-full">
                {!isSelectedChatAvailable && (
                  <div className="bg-yellow-50 border-b border-yellow-200 p-3 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-yellow-800 text-sm font-medium">
                          {getChatStatusMessage(selectedConv.orderStatus)}
                        </span>
                      </div>
                      {selectedConv.orderStatus && (
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${getChatStatusColor(
                            selectedConv.orderStatus
                          )}`}
                        >
                          {selectedConv.orderStatus.replace("_", " ")}
                        </span>
                      )}
                    </div>
                    <p className="text-yellow-700 text-sm mt-1">
                      {selectedConv.orderStatus === "completed" &&
                        "This service has been completed. For new inquiries, please ask the customer to book a new service."}
                      {selectedConv.orderStatus === "cancelled" &&
                        "This order has been cancelled. Chat is no longer available."}
                      {selectedConv.orderStatus === "refunded" &&
                        "This order has been refunded. Chat is no longer available."}
                      {selectedConv.orderStatus === "pending" &&
                        "Chat will be available once you accept this order."}
                    </p>
                  </div>
                )}

                <div
                  className={`flex-1 min-h-0 ${
                    !isSelectedChatAvailable ? "opacity-50" : ""
                  }`}
                >
                  <ChatThread
                    orderId={selectedConv.orderId}
                    recipientId={selectedConv.recipientId}
                    recipientName={selectedConv.name}
                    recipientProfilePhoto={selectedConv.avatar}
                    recipientService={selectedConv.service}
                    currentUserId={technicianProfile._id}
                    currentUserType="technician"
                    onClose={handleBackToList}
                    isChatEnabled={isSelectedChatAvailable}
                  />
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg
                    className="w-16 h-16 mx-auto text-gray-400 mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                  <p className="text-lg font-medium text-gray-900 mb-2">
                    No conversation selected
                  </p>
                  <p className="text-gray-600">
                    Choose a conversation from the list to start chatting
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
