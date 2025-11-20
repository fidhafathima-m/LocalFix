/* eslint-disable @typescript-eslint/no-explicit-any */
// components/chat/ChatThread.tsx
import React, { useState, useEffect, useRef } from "react";
import { SendOutlined } from "@mui/icons-material";
import { MessageBubble } from "./MessageBubble";
import { useSocket } from "../../../../../context/SocketContext";
import { messageService } from "../../../../../services/user/messageService";
import toast from "react-hot-toast";

interface Message {
  id: string;
  text: string;
  timestamp: string;
  isSent: boolean;
  isRead?: boolean;
  senderId: string;
  senderType: "user" | "technician";
}

interface ChatThreadProps {
  orderId: string;
  recipientId: string;
  recipientName?: string;
  recipientProfilePhoto?: string;
  recipientService?: string;
  isOnline?: boolean;
  currentUserId: string;
  currentUserType: "user" | "technician";
  onClose?: () => void;
  isChatEnabled?: boolean;
}

export function ChatThread({
  orderId,
  recipientId,
  recipientName,
  recipientProfilePhoto,
  recipientService,
  isOnline,
  currentUserId,
  currentUserType,
  onClose,
  isChatEnabled = true,
}: ChatThreadProps) {
  useEffect(() => {
    console.log("🎯 ChatThread Props Updated:", {
      recipientName,
      recipientService,
      recipientProfilePhoto,
      orderId,
    });
  }, [recipientName, recipientService, recipientProfilePhoto, orderId]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);
  const { socket, isConnected } = useSocket();

  useEffect(() => {
    loadMessages();
    joinChatRoom();

    return () => {
      leaveChatRoom();
    };
  }, [orderId]);

  useEffect(() => {
    if (!socket) return;

    console.log(
      "💬 Setting up real-time message listeners for order:",
      orderId
    );

    const handleNewMessage = (data: any) => {
      console.log("💬 New real-time message received:", data);

      if (data.message && data.message.orderId === orderId) {
        // FIX: More robust duplicate detection
        const isSentByMe =
          data.message.senderId === currentUserId &&
          data.message.senderType === currentUserType;

        const isDuplicate = messages.some(
          (msg) =>
            msg.id === data.message._id ||
            (msg.id.startsWith("temp-") && msg.text === data.message.message)
        );

        if (isSentByMe || isDuplicate) {
          console.log(
            "🔄 Ignoring own/duplicate message from socket:",
            data.message._id
          );
          return;
        }

        console.log("🆕 New message from other user:", data.message);

        const newMessage: Message = {
          id: data.message._id,
          text: data.message.message,
          timestamp: new Date(data.message.timestamp).toLocaleTimeString(
            "en-IN",
            {
              hour: "2-digit",
              minute: "2-digit",
            }
          ),
          isSent: false, // Always false for socket-received messages
          isRead: data.message.isRead,
          senderId: data.message.senderId,
          senderType: data.message.senderType,
        };

        console.log("💬 Adding received message to state:", newMessage);
        setMessages((prev) => [...prev, newMessage]);
      }
    };

    // Join the chat room when socket connects
    if (isConnected && socket.connected) {
      console.log("💬 Joining chat room for order:", orderId);
      socket.emit("join-chat-room", {
        orderId,
        userId: currentUserId,
        userType: currentUserType,
      });
    }

    // Listen for new messages
    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleUserTyping);

    // Re-join room on reconnect
    const handleConnect = () => {
      console.log("💬 Socket reconnected, rejoining chat room");
      socket.emit("join-chat-room", {
        orderId,
        userId: currentUserId,
        userType: currentUserType,
      });
    };

    socket.on("connect", handleConnect);

    return () => {
      console.log("💬 Cleaning up chat listeners");
      socket.off("new-message", handleNewMessage);
      socket.off("user-typing", handleUserTyping);
      socket.off("connect", handleConnect);

      // Leave chat room
      if (socket.connected) {
        socket.emit("leave-chat-room", { orderId });
      }
    };
  }, [socket, isConnected, orderId, currentUserId, currentUserType]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const chatMessages = await messageService.getOrderMessages(orderId);

      console.log("📨 Loading messages for order:", orderId);
      console.log("👤 Current user ID:", currentUserId);
      console.log("👤 Current user type:", currentUserType);

      const formattedMessages: Message[] = chatMessages.map((msg) => {
        // Fix: Properly determine if message was sent by current user
        // Compare both ID AND type to avoid confusion between user and technician with same ID
        const isSentByMe =
          msg.senderId === currentUserId && msg.senderType === currentUserType;

        console.log(`✉️ Message ${msg._id}:`, {
          senderId: msg.senderId,
          senderType: msg.senderType,
          currentUserId: currentUserId,
          currentUserType: currentUserType,
          isSentByMe: isSentByMe,
          text: msg.message.substring(0, 50) + "...",
        });

        return {
          id: msg._id!,
          text: msg.message,
          timestamp: new Date(msg.timestamp).toLocaleTimeString("en-IN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          isSent: isSentByMe,
          isRead: msg.isRead,
          senderId: msg.senderId,
          senderType: msg.senderType,
        };
      });

      setMessages(formattedMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setLoading(false);
    }
  };

  const joinChatRoom = () => {
    if (socket && isConnected) {
      socket.emit("join-chat-room", {
        orderId,
        userId: currentUserId,
        userType: currentUserType,
      });
    }
  };

  const leaveChatRoom = () => {
    if (socket && isConnected) {
      socket.emit("leave-chat-room", { orderId });
    }
  };

  const handleUserTyping = (data: any) => {
    if (data.userId !== currentUserId) {
      setIsTyping(data.isTyping);
    }
  };

  // In ChatThread.tsx - improve handleSendMessage
  const handleSendMessage = async () => {
    if (!isChatEnabled) {
      toast.error("Chat is no longer available for this order.");
      return;
    }

    if (!newMessage.trim()) return;

    const cleanRecipientId =
      typeof recipientId === "string"
        ? recipientId
        : JSON.parse(recipientId)?._id || recipientId;

    const receiverType: "user" | "technician" =
      currentUserType === "user" ? "technician" : "user";

    const messageData = {
      orderId,
      senderId: currentUserId,
      senderType: currentUserType,
      receiverId: cleanRecipientId,
      receiverType: receiverType,
      message: newMessage.trim(),
      messageType: "text" as const,
    };

    const tempId = `temp-${Date.now()}`;

    try {
      setSending(true);

      // Add message optimistically
      const optimisticMsg: Message = {
        id: tempId,
        text: newMessage.trim(),
        timestamp: new Date().toLocaleTimeString("en-IN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isSent: true,
        isRead: false,
        senderId: currentUserId,
        senderType: currentUserType,
      };

      setMessages((prev) => [...prev, optimisticMsg]);
      setNewMessage("");

      // Save message to database
      const savedMessage = await messageService.sendMessage(messageData);
      console.log("✅ Message saved to database:", savedMessage);

      // Replace temporary message with saved message
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId
            ? {
                ...msg,
                id: savedMessage._id || tempId,
                isRead: savedMessage.isRead,
              }
            : msg
        )
      );

      // FIX: Don't emit socket event here - the backend should handle this
      // The MessageService.sendMessage should trigger the socket emission
      console.log("✅ Message sent successfully");

      // Clear typing indicator
      if (socket && isConnected) {
        socket.emit("typing-stop", {
          orderId,
          userId: currentUserId,
          userType: currentUserType,
        });
      }
    } catch (error) {
      console.error("Error sending message:", error);
      // Remove the optimistic message if there was an error
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      toast.error("Failed to send message. Please try again.");
    } finally {
      setSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (socket && isConnected) {
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Start typing
      socket.emit("typing-start", {
        orderId,
        userId: currentUserId,
        userType: currentUserType,
      });

      // Stop typing after 1 second of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing-stop", {
          orderId,
          userId: currentUserId,
          userType: currentUserType,
        });
      }, 1000);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // In ChatThread component - update the structure:
  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header - Fixed */}
      <div className="border-b border-gray-200 p-4 bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
              {recipientProfilePhoto ? (
                <img
                  src={recipientProfilePhoto}
                  alt={recipientName}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <span className="text-xl font-semibold text-gray-600">
                  {recipientName?.charAt(0)}
                </span>
              )}
            </div>
            <div>
              <div className="font-semibold text-gray-900">{recipientName}</div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span>{recipientService}</span>
                {isOnline && (
                  <>
                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                    <span className="text-green-600">Online</span>
                  </>
                )}
                {isTyping && (
                  <span className="text-blue-600 italic">typing...</span>
                )}
              </div>
            </div>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Messages - Scrollable */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        <div className="h-full p-4 bg-gray-50">
          {loading ? (
            <div className="flex justify-center items-center h-full">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex justify-center items-center h-full text-gray-500">
              No messages yet. Start the conversation!
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <MessageBubble
                  key={message.id}
                  text={message.text}
                  timestamp={message.timestamp}
                  isSent={message.isSent}
                  isRead={message.isRead}
                  senderType={message.senderType}
                />
              ))}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input - Fixed */}
      <div className="border-t border-gray-200 p-4 bg-white flex-shrink-0">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            placeholder={
              isChatEnabled
                ? "Type a message..."
                : "Chat unavailable for completed orders"
            }
            disabled={sending || !isChatEnabled} // Add !isChatEnabled here
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={
              !newMessage.trim() || sending || !isConnected || !isChatEnabled
            } // Add !isChatEnabled here
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <span>Send</span>
            <SendOutlined className="w-4 h-4" />
          </button>
        </div>
        {!isConnected && (
          <div className="text-red-500 text-sm mt-2">
            Connection lost. Reconnecting...
          </div>
        )}
      </div>
    </div>
  );
}
