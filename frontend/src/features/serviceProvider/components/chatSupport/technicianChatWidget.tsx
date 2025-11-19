// components/chat/TechnicianChatWidget.tsx
import { useState, useRef, useEffect } from "react";
import {
  CloseOutlined,
  SendOutlined,
  BuildOutlined,
} from "@mui/icons-material";
import {
  technicianChatService,
  type TechnicianChatMessage,
} from "../../../../services/technician/technicianChatService";

export function TechnicianChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<TechnicianChatMessage[]>([
    {
      id: 1,
      sender: "support",
      text: "Hello! I'm your LocalFix Technician Assistant. How can I help with your technical work today?",
      timestamp: new Date(),
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // components/chat/TechnicianChatWidget.tsx
  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const userMessage = message.trim();
    const userMessageObj: TechnicianChatMessage = {
      id: messages.length + 1,
      sender: "technician",
      text: userMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessageObj]);
    setMessage("");
    setIsLoading(true);

    try {
      const response = await technicianChatService.sendMessage(
        userMessage,
        messages
      );

      let aiResponse: string;
      let isRealAI = false;

      if (response.success) {
        aiResponse = response.data.response;
        isRealAI = response.data.isRealAI || false;
      } else {
        aiResponse =
          response.data?.response ||
          "I'm having trouble connecting right now. Please try again in a moment.";
      }

      const aiMessageObj: TechnicianChatMessage = {
        id: messages.length + 2,
        sender: "support",
        text: aiResponse,
        timestamp: new Date(),
        isRealAI: isRealAI,
      };

      setMessages((prev) => [...prev, aiMessageObj]);
    } catch (error) {
      console.error("Technician chat error:", error);
      const fallbackMessage: TechnicianChatMessage = {
        id: messages.length + 2,
        sender: "support",
        text: "I apologize, but I'm having technical difficulties. Please try again or contact technical support.",
        timestamp: new Date(),
        isRealAI: false,
      };
      setMessages((prev) => [...prev, fallbackMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const technicianQuickQuestions = [
    "How to diagnose error code E5?",
    "Need help with part compatibility",
    "Safety procedures for gas appliances",
    "How to handle difficult customer?",
    "Documentation requirements for warranty",
  ];

  return (
    <>
      {/* Technician Floating Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full shadow-lg hover:from-orange-700 hover:to-red-700 transition-all hover:scale-110 flex items-center justify-center z-50 group"
      >
        {isOpen ? (
          <CloseOutlined className="w-6 h-6" />
        ) : (
          <div className="relative">
            <BuildOutlined className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></span>
          </div>
        )}
        <div className="absolute -top-10 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          Tech Support
        </div>
      </button>

      {/* Technician Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50">
          {/* Technician Chat Header */}
          <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white px-4 py-3 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <BuildOutlined className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Tech Support</h3>
                <p className="text-xs text-orange-100">Expert Assistance</p>
              </div>
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${
                  msg.sender === "technician" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[85%] px-3 py-2 rounded-2xl ${
                    msg.sender === "technician"
                      ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      msg.sender === "technician"
                        ? "text-orange-100"
                        : "text-gray-500"
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
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-none px-3 py-2">
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

          {/* Quick Questions for Technicians */}
          <div className="bg-orange-50 border-t border-orange-200 p-3">
            <p className="text-xs text-orange-800 font-medium mb-2">
              Quick help:
            </p>
            <div className="flex flex-wrap gap-1">
              {technicianQuickQuestions.map((question, index) => (
                <button
                  key={index}
                  onClick={() => setMessage(question)}
                  className="bg-white text-orange-700 text-xs px-2 py-1 rounded border border-orange-200 hover:bg-orange-50"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>

          {/* Input Area */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Ask about technical issues, parts, safety..."
                disabled={isLoading}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
              <button
                onClick={handleSend}
                disabled={!message.trim() || isLoading}
                className="w-10 h-10 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg hover:from-orange-700 hover:to-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                <SendOutlined className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
