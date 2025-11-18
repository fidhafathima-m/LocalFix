// components/chat/ChatWidget.tsx
import {
  ChatOutlined,
  CloseOutlined,
  OpenInNewOutlined,
  SendOutlined,
} from "@mui/icons-material";
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  chatService,
  type ChatMessage,
} from "../../../../services/user/chatService";

export function ChatWidget() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 1,
      sender: "support",
      text: "Hello! I'm your LocalFix assistant. How can I help you with your appliance repair needs today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Inside your handleSend function, update the AI response handling:
  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    const userMessageObj: ChatMessage = {
      id: messages.length + 1,
      sender: "user",
      text: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await chatService.sendMessage(userMessage, messages);
      let aiResponse: string;

      if (response.success) {
        aiResponse = response.data.response;
      } else {
        aiResponse =
          "I'm having trouble connecting right now. Please try again in a moment.";
      }

      const aiMessageObj: ChatMessage = {
        id: messages.length + 2,
        sender: "support",
        text: aiResponse,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessageObj]);
    } catch (error) {
      console.error("Chat error:", error);
      const fallbackMessage: ChatMessage = {
        id: messages.length + 2,
        sender: "support",
        text: "I apologize, but I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleOpenFullChat = () => {
    const cleanMessages = messages.map((msg) => ({
      id: msg.id,
      sender: msg.sender,
      text: msg.text,
      timestamp: msg.timestamp,
    }));
    navigate("/chatbot", {
      state: {
        initialMessages: cleanMessages,
        fromWidget: true,
      },
    });
  };

  return (
    <>
      {/* Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all hover:scale-110 flex items-center justify-center z-50 group"
        style={{
          animation: isOpen ? "none" : "pulse 2s infinite",
        }}
      >
        {isOpen ? (
          <CloseOutlined className="w-6 h-6" />
        ) : (
          <div className="relative">
            <ChatOutlined className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full"></span>
          </div>
        )}
        <div className="absolute -top-10 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Chat with us
        </div>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 animate-in slide-in-from-bottom-4 duration-300">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <ChatOutlined className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">LocalFix Assistant</h3>
                <div className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  <p className="text-xs text-blue-100">Online now</p>
                </div>
              </div>
            </div>

            {/* Improved Full Chat Button */}
            <button
              onClick={handleOpenFullChat}
              className="flex items-center gap-1 bg-white/20 hover:bg-white/30 px-3 py-1 rounded-lg text-xs transition-colors group"
            >
              <OpenInNewOutlined className="w-3 h-3" />
              <span>Full Chat</span>
            </button>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md"
                      : "bg-white text-gray-800 rounded-bl-none border border-gray-200 shadow-sm"
                  } transition-all duration-200 hover:shadow-lg`}
                >
                  {/* Use formatted content if available, otherwise fallback to text */}
                  {msg.sender === "support" && msg.formattedContent ? (
                    <div className="text-sm leading-relaxed">
                      {msg.formattedContent}
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed">{msg.text}</p>
                  )}

                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "user" ? "text-blue-100" : "text-gray-500"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-3 py-2 shadow-sm">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about services, pricing, or booking..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center justify-center shadow-md"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <SendOutlined className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Ask me about services, pricing, or booking process
            </p>
          </div>
        </div>
      )}
    </>
  );
}
