import api from "../../utils/axiosConfig";

export interface ChatMessage {
  id: number;
  sender: "user" | "support";
  text: string;
  timestamp: Date;
  formattedContent?: React.ReactNode;
}

export const chatService = {
  // Send message to AI chatbot
  sendMessage: async (
    message: string,
    conversationHistory: ChatMessage[] = []
  ) => {
    try {
      const response = await api.post("/chat/message", {
        message,
        conversationHistory,
        context: "customer_support",
      });
      return response.data;
    } catch (error) {
      console.error("Chat service error:", error);
      throw error;
    }
  },
};
