// controllers/chat/ChatController.ts
import { Request, Response } from 'express';
import { ResponseHelper } from '../../utils/responseHelper';
import { ILogger } from '../../interfaces/utils/ILogger';
import { IChatService } from '../../interfaces/services/user/IChatService';

export class ChatController {
  private _chatService: IChatService;
  private _logger: ILogger;

  constructor(chatService: IChatService, logger: ILogger) {
    this._chatService = chatService;
    this._logger = logger;
  }

  sendMessage = async (req: Request, res: Response): Promise<void> => {
    const { message, conversationHistory, context } = req.body;
    const userId = (req as any).user?.id; // From your auth middleware

    const requestContext = {
      operation: 'ChatController.sendMessage',
      userId: userId || 'anonymous',
      messageLength: message?.length || 0,
      hasHistory: !!conversationHistory?.length,
    };

    try {
      this._logger.info('Processing chat message', requestContext);

      // Validate input
      if (
        !message ||
        typeof message !== 'string' ||
        message.trim().length === 0
      ) {
        const response = ResponseHelper.badRequest('Message is required');
        res.status(response.statusCode).json(response);
        return;
      }

      // Limit message length
      if (message.length > 1000) {
        const response = ResponseHelper.badRequest(
          'Message too long (max 1000 characters)'
        );
        res.status(response.statusCode).json(response);
        return;
      }

      // Process the message
      const chatResponse = await this._chatService.sendMessage(
        message.trim(),
        conversationHistory || [],
        context
      );

      this._logger.info('Chat message processed successfully', {
        ...requestContext,
        responseLength: chatResponse.message.length,
      });

      const response = ResponseHelper.success(
        'Message processed successfully',
        {
          response: chatResponse.message,
          usage: chatResponse.usage,
        }
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Chat message processing failed', {
        ...requestContext,
        error: errorMessage,
      });

      const response = ResponseHelper.error('Failed to process message');
      res.status(response.statusCode).json(response);
    }
  };

  // Optional: Get chat history for a user
  getChatHistory = async (req: Request, res: Response): Promise<void> => {
    const userId = (req as any).user?.id;

    try {
      // In a real implementation, you'd fetch from database
      // For now, return empty array
      const response = ResponseHelper.success('Chat history retrieved', {
        messages: [],
      });
      res.status(response.statusCode).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to get chat history', {
        userId,
        error: errorMessage,
      });

      const response = ResponseHelper.error('Failed to retrieve chat history');
      res.status(response.statusCode).json(response);
    }
  };
  // In your ChatController
  getModels = async (req: Request, res: Response): Promise<void> => {
    try {
      const availableModels = await this._chatService.getAvailableModels();

      res.json({
        success: true,
        data: {
          totalFreeModels: availableModels.length,
          models: availableModels,
        },
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
