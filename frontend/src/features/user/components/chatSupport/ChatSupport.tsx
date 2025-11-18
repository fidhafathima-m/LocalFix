// pages/ChatSupport.tsx - UPDATED
import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Header from "../../../../components/common/Header";
import {
  ArrowLeftOutlined,
  SendOutlined,
  SmartToyOutlined,
} from "@mui/icons-material";
import Footer from "../../../../components/common/Footer";
import {
  chatService,
  type ChatMessage,
} from "../../../../services/user/chatService";
import { ResponseFormatter } from "./helpers/ResponseFormatter"; // Add this import

const ChatSupport = () => {
  const navigate = useNavigate();
  const location = useLocation();
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

  // Load initial messages from widget if provided
  useEffect(() => {
    if (location.state?.initialMessages) {
      setMessages(location.state.initialMessages);
    }
  }, [location.state]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

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
        // Add formatted content here in the full chat
        formattedContent: ResponseFormatter.formatAIResponse(aiResponse),
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

  // Update the message rendering to use formatted content
  const renderMessageContent = (msg: ChatMessage) => {
    if (msg.sender === "support" && msg.formattedContent) {
      return (
        <div className="text-sm leading-relaxed">{msg.formattedContent}</div>
      );
    }
    return <p className="text-sm leading-relaxed">{msg.text}</p>;
  };

  const quickQuestions = [
    "What services do you offer?",
    "How much does AC repair cost?",
    "Are your technicians verified?",
    "How do I book a service?",
    "Do you offer emergency services?",
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header userType="user" />

      <main className="flex-1 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors group"
        >
          <ArrowLeftOutlined className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Home
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Chat with LocalFix Support
          </h1>
          <p className="text-gray-600">
            Get instant help with services, pricing, and bookings
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col h-[600px]">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                <SmartToyOutlined className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-semibold text-lg">LocalFix AI Assistant</h3>
                <p className="text-sm text-blue-100 flex items-center gap-2">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                  Online • Ready to help
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-sm">Average response time</p>
              <p className="text-white font-semibold">Under 30 seconds</p>
            </div>
          </div>

          {/* Quick Questions */}
          {messages.length <= 2 && (
            <div className="bg-blue-50 border-b border-blue-200 p-4">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Quick questions:
              </p>
              <div className="flex flex-wrap gap-2">
                {quickQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => setMessage(question)}
                    className="bg-white text-blue-700 text-xs px-3 py-2 rounded-lg border border-blue-200 hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {question}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "user" ? "justify-end" : "justify-start"
                } animate-in fade-in duration-300`}
              >
                <div
                  className={`max-w-[70%] px-4 py-3 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-none shadow-md"
                      : "bg-white text-gray-900 rounded-bl-none border border-gray-200 shadow-sm"
                  } transition-all duration-200 hover:shadow-lg`}
                >
                  {renderMessageContent(msg)}
                  <p
                    className={`text-xs mt-2 ${
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
              <div className="flex justify-start animate-in fade-in duration-300">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-2">
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
                    <span className="text-gray-500 text-sm">
                      LocalFix AI is typing...
                    </span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-200">
            <div className="flex gap-3">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message here... (Press Enter to send)"
                disabled={isLoading}
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:from-gray-400 disabled:to-gray-500 disabled:cursor-not-allowed flex items-center gap-2 font-medium shadow-md"
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <SendOutlined className="w-4 h-4" />
                    <span>Send</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              Our AI assistant can help with service information, pricing,
              booking, and technical support
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ChatSupport;
