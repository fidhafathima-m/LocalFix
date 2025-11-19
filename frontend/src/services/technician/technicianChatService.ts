// services/technician/technicianChatService.ts
import api from "../../utils/axiosConfig";

export interface TechnicianChatMessage {
  id: number;
  sender: "technician" | "support";
  text: string;
  timestamp: Date;
  formattedContent?: React.ReactNode;
  isRealAI?: boolean;
}

export const technicianChatService = {
  sendMessage: async (
    message: string,
    conversationHistory: TechnicianChatMessage[] = []
  ) => {
    try {
      const response = await api.post("/technician/chat/message", {
        message,
        conversationHistory,
        context: "technician_support", // Changed from customer_support
      });

      // Ensure the response has the expected structure
      if (response.data && response.data.success) {
        return {
          success: true,
          data: {
            response: response.data.data.response,
            usage: response.data.data.usage,
            isRealAI: response.data.data.isRealAI || false,
          },
        };
      } else {
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Technician chat service error:", error);

      // Provide a proper fallback response structure
      return {
        success: false,
        error: "Failed to send message",
        data: {
          response:
            "I'm having trouble connecting to the support system. Please try again in a moment.",
          isRealAI: false,
        },
      };
    }
  },
};
