/* eslint-disable @typescript-eslint/no-explicit-any */
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
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);
  const { socket, isConnected } = useSocket();

  // const listenersAddedRef = useRef(false);
  const receivedMessageIds = useRef(new Set<string>());

  const handlersRef = useRef<{
    handleNewMessage: ((data: any) => void) | null;
    handleUserTyping: ((data: any) => void) | null;
    handleMessageSent: ((data: any) => void) | null;
  }>({
    handleNewMessage: null,
    handleUserTyping: null,
    handleMessageSent: null,
  });

  useEffect(() => {
    loadMessages();
    joinChatRoom();

    return () => {
      leaveChatRoom();
      // Clear received message IDs when component unmounts
      receivedMessageIds.current.clear();
    };
  }, [orderId]);

  // Add this to your useEffect for socket listeners
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (data: any) => {
      if (!data.message || data.message.orderId !== orderId) {
        return;
      }

      const msgId = data.message._id;

      // CRITICAL: Ignore messages sent by current user from socket
      const isSentByMe =
        data.message.senderId === currentUserId &&
        data.message.senderType === currentUserType;

      if (isSentByMe) {
        return;
      }

      if (receivedMessageIds.current.has(msgId)) {
        return;
      }

      receivedMessageIds.current.add(msgId);

      const newMessage: Message = {
        id: msgId,
        text: data.message.message,
        timestamp: new Date(data.message.timestamp).toLocaleTimeString(
          "en-IN",
          { hour: "2-digit", minute: "2-digit" }
        ),
        isSent: isSentByMe,
        isRead: data.message.isRead,
        senderId: data.message.senderId,
        senderType: data.message.senderType,
      };

      setMessages((prev) => {
        const newMessages = [...prev, newMessage];
        return newMessages;
      });
    };

    const handleUserTyping = (data: any) => {
      if (data.userId !== currentUserId) {
        setIsTyping(data.isTyping);
      }
    };

    const handleMessageSent = (data: any) => {
      console.log(
        "FRONTEND: Message sent confirmation received:",
        data.message?._id
      );
    };

    // Store handlers in ref for cleanup
    handlersRef.current = {
      handleNewMessage,
      handleUserTyping,
      handleMessageSent,
    };

    // Remove any existing listeners first
    socket.off("new-message", handleNewMessage);
    socket.off("user-typing", handleUserTyping);
    socket.off("message-sent", handleMessageSent);

    // Add new listeners
    socket.on("new-message", handleNewMessage);
    socket.on("user-typing", handleUserTyping);
    socket.on("message-sent", handleMessageSent);

    return () => {
      if (socket && handlersRef.current) {
        socket.off("new-message", handlersRef.current.handleNewMessage!);
        socket.off("user-typing", handlersRef.current.handleUserTyping!);
        socket.off("message-sent", handlersRef.current.handleMessageSent!);
      }
    };
  }, [socket, orderId, currentUserId, currentUserType]);

  const loadMessages = async () => {
    try {
      setLoading(true);
      const chatMessages = await messageService.getOrderMessages(orderId);

      const formattedMessages: Message[] = chatMessages.map((msg) => {
        const isSentByMe =
          msg.senderId === currentUserId && msg.senderType === currentUserType;

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

      // Populate receivedMessageIds with all loaded messages
      formattedMessages.forEach((msg) => {
        receivedMessageIds.current.add(msg.id);
      });

      // Better deduplication
      const uniqueMessages = formattedMessages.reduce((acc, current) => {
        if (!acc.find((msg) => msg.id === current.id)) {
          acc.push(current);
        }
        return acc;
      }, [] as Message[]);

      setMessages(uniqueMessages);
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

    try {
      setSending(true);
      const messageText = newMessage.trim();
      setNewMessage("");

      const savedMessage = await messageService.sendMessage({
        orderId,
        senderId: currentUserId,
        senderType: currentUserType,
        receiverId: cleanRecipientId,
        receiverType: receiverType,
        message: messageText,
        messageType: "text",
      });

      const newMessageObj: Message = {
        id: savedMessage._id!,
        text: savedMessage.message,
        timestamp: new Date(savedMessage.timestamp).toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        ),
        isSent: true,
        isRead: savedMessage.isRead,
        senderId: savedMessage.senderId,
        senderType: savedMessage.senderType,
      };

      // Use functional update to ensure we're working with latest state
      setMessages((prev) => {
        // Double-check for duplicates
        const exists = prev.some((msg) => msg.id === newMessageObj.id);
        if (exists) {
          return prev;
        }
        const newMessages = [...prev, newMessageObj];
        return newMessages;
      });

      receivedMessageIds.current.add(savedMessage._id!);

      if (socket && isConnected) {
        socket.emit("send-message", {
          ...savedMessage,
          orderId,
        });
      }
    } catch (error) {
      console.error("FRONTEND: Error sending message:", error);
      setNewMessage(newMessage.trim());
      toast.error("Failed to send message.");
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
      }); // Stop typing after 1 second of inactivity
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

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header */}
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

      {/* Messages */}
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
              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  text={m.text}
                  timestamp={m.timestamp}
                  isSent={m.isSent}
                  isRead={m.isRead}
                  senderType={m.senderType}
                />
              ))}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
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
            disabled={sending || !isChatEnabled}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
          />
          <button
            onClick={handleSendMessage}
            disabled={
              !newMessage.trim() || sending || !isConnected || !isChatEnabled
            }
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
