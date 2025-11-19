export interface TechnicianChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface TechnicianChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  isRealAI?: boolean;
}

export interface ITechnicianChatService {
  sendMessage(
    userMessage: string,
    conversationHistory: any[],
    context?: string,
    technicianId?: string
  ): Promise<TechnicianChatResponse>;
}
