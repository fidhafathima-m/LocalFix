/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { ArrowLeftOutlined } from "@mui/icons-material";
import { ChatThread } from "./sections/ChatThread";
import { messageService } from "../../../../services/user/messageService";
import Header from "../../../../components/common/Header";
import Footer from "../../../../components/common/Footer";
import {
  selectUser,
  selectIsLoggedIn,
} from "../../../../store/slices/authSlice";
import { useAppSelector } from "../../../../hooks/redux";
import toast from "react-hot-toast";
import { useSocket } from "../../../../context/SocketContext";

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

export function UserMessages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [hasHandledInitialConversation, setHasHandledInitialConversation] =
    useState(false);
  const [searchParams] = useSearchParams();

  const user = useAppSelector(selectUser);
  const isLoggedIn = useAppSelector(selectIsLoggedIn);

  const { socket, isConnected } = useSocket();

  const orderId = searchParams.get("orderId");
  const technicianId = searchParams.get("technicianId");
  const serviceName = searchParams.get("serviceName");

  useEffect(() => {
    if (!socket || !isConnected || conversations.length === 0) return;

    // Join order status rooms for all conversations
    conversations.forEach((conv) => {
      socket.emit("join-order-room", {
        orderId: conv.orderId,
        userId: user?._id,
        userType: "user",
      });
    });

    return () => {
      // Leave all order rooms when component unmounts
      conversations.forEach((conv) => {
        socket.emit("leave-order-room", {
          orderId: conv.orderId,
          userId: user?._id,
          userType: "user",
        });
      });
    };
  }, [socket, isConnected, conversations, user]);

  const isChatAvailable = (orderStatus?: string) => {
    // If orderStatus is undefined, assume chat is available
    if (!orderStatus) return true;

    return ["accepted", "confirmed", "on_the_way", "in_progress"].includes(
      orderStatus
    );
  };

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

  useEffect(() => {
    if (isLoggedIn && user) {
      loadConversations();
    }
  }, [isLoggedIn, user]);

  useEffect(() => {
    if (
      orderId &&
      technicianId &&
      !loading &&
      !hasHandledInitialConversation &&
      conversations.length >= 0
    ) {
      handleOrderBasedConversation(orderId, technicianId, serviceName);
      setHasHandledInitialConversation(true);
    }
  }, [
    orderId,
    technicianId,
    loading,
    hasHandledInitialConversation,
    conversations.length,
  ]);

  const handleOrderBasedConversation = async (
    orderId: string,
    technicianId: string,
    serviceName: string | null
  ) => {
    if (!user) return;

    try {
      const existingConv = conversations.find(
        (conv) => conv.orderId === orderId && conv.recipientId === technicianId
      );

      if (existingConv) {
        setSelectedConversation(existingConv.id);
        clearUrlParameters();
      } else {
        await createAndSelectConversation(orderId, technicianId, serviceName);
      }
    } catch (error) {
      console.error("Error handling order-based conversation:", error);
      toast.error("Failed to start conversation");
      setHasHandledInitialConversation(true);
    }
  };

  const clearUrlParameters = () => {
    if (window.history.replaceState) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  };

  const createAndSelectConversation = async (
    orderId: string,
    technicianId: string,
    serviceName: string | null
  ) => {
    if (!user) return;

    try {
      const newRoom = await messageService.initializeChatRoom(
        orderId,
        user._id,
        technicianId
      );

      await loadConversations();

      if (newRoom._id) {
        setSelectedConversation(newRoom._id);
        clearUrlParameters();

        if (!newRoom.lastMessage) {
          await sendWelcomeMessage(orderId, technicianId, serviceName);
        }
      } else {
        console.warn("New conversation has no ID");
        const fallbackConv = conversations.find(
          (conv) => conv.orderId === orderId
        );
        if (fallbackConv) {
          setSelectedConversation(fallbackConv.id);
          clearUrlParameters();
        }
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to start conversation. Please try again.");
      setHasHandledInitialConversation(true);
    }
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const chatRooms = await messageService.getUserConversations();

      const formattedConversations: Conversation[] = chatRooms.map((room) => {
        const technician = room.technicianSnapshot;

        return {
          id: room._id!,
          orderId: room.orderId,
          recipientId: room.technicianId,
          name: technician?.displayName || "Technician",
          avatar: technician?.profilePictureUrl || "",
          service: technician?.serviceName || "Service",
          lastMessage: room.lastMessage?.message || "No messages yet",
          timestamp: room.lastMessage
            ? new Date(room.lastMessage.timestamp).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })
            : "No messages",
          unread: room.unreadCount?.user || 0,
          orderStatus: technician?.orderStatus || room.orderStatus,
        };
      });

      setConversations(formattedConversations);
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => {
      setHasHandledInitialConversation(false);
    };
  }, [user]);

  const sendWelcomeMessage = async (
    orderId: string,
    technicianId: string,
    serviceName: string | null
  ) => {
    if (!user) return;

    try {
      const welcomeMessage = `Hello! I need assistance with my ${
        serviceName || "service"
      } (Order: ${orderId})`;

      await messageService.sendMessage({
        orderId,
        senderId: user._id,
        senderType: "user",
        receiverId: technicianId,
        receiverType: "technician",
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
    if (window.history.replaceState) {
      const newUrl = window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  };

  const handleBackToList = () => {
    setSelectedConversation(null);
    loadConversations();
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);
  const isSelectedChatAvailable = selectedConv
    ? isChatAvailable(selectedConv.orderStatus)
    : false;

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

      if (selectedConv && selectedConv.orderId === data.orderId) {
        setSelectedConversation((prev) => {
          const updatedConv = conversations.find((c) => c.id === prev);
          return updatedConv ? prev : null;
        });
      }

      // Show success message
      toast.success(
        `Order status updated: ${data.newStatus.replace("_", " ")}`
      );
    };

    // Listen for order status updates
    socket.on("order-status-updated", handleOrderStatusUpdate);

    return () => {
      socket.off("order-status-updated", handleOrderStatusUpdate);
    };
  }, [socket, selectedConv, conversations]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const refreshConversationStatus = async (orderId: string) => {
    try {
      await loadConversations();
    } catch (error) {
      console.error("Error refreshing conversation status:", error);
    }
  };

  // Call this when chat reopens or on focus
  useEffect(() => {
    if (selectedConv && !loading) {
      refreshConversationStatus(selectedConv.orderId);
    }
  }, [selectedConversation]);

  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold mb-2">
              Authentication Required
            </h2>
            <p className="text-gray-600">
              Please log in to view your messages.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-8">
        <div className="mb-4">
          <button
            onClick={
              selectedConversation
                ? handleBackToList
                : () => window.history.back()
            }
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
          >
            <ArrowLeftOutlined className="w-5 h-5" />
            <span>
              {selectedConversation ? "Back to conversations" : "Back"}
            </span>
          </button>
          <h1 className="text-2xl font-bold text-gray-900 mt-2">Messages</h1>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="h-[700px] flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading conversations...</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 h-[700px] min-h-0">
              <div
                className={`border-r border-gray-200 flex flex-col min-h-0 ${
                  selectedConversation ? "hidden md:flex" : "flex"
                }`}
              >
                <div className="p-4 border-b border-gray-200 flex-shrink-0 bg-white">
                  <h2 className="font-semibold text-gray-900">Conversations</h2>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  {conversations.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-gray-500">
                      No conversations yet
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
                                      {conversation.name
                                        .charAt(0)
                                        .toUpperCase()}
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
                            "This service has been completed. For new inquiries, please book a new service."}
                          {selectedConv.orderStatus === "cancelled" &&
                            "This order has been cancelled. Chat is no longer available."}
                          {selectedConv.orderStatus === "refunded" &&
                            "This order has been refunded. Chat is no longer available."}
                          {selectedConv.orderStatus === "pending" &&
                            "Chat will be available once the technician accepts your order."}
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
                        currentUserId={user._id}
                        currentUserType="user"
                        onClose={handleBackToList}
                        isChatEnabled={isSelectedChatAvailable}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-500">
                    {conversations.length === 0
                      ? "You don't have any conversations yet"
                      : "Select a conversation to start chatting"}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
