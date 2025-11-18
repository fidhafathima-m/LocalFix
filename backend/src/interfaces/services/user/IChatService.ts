export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ChatResponse {
  message: string;
  usage?: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
  isRealAI?: boolean;
}

export interface IChatService {
  sendMessage(
    userMessage: string,
    conversationHistory: ChatMessage[],
    context?: string
  ): Promise<ChatResponse>;
  getAvailableModels(): Promise<any>;
}
