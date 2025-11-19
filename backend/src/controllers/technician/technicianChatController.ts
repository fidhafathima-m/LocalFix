import { Response } from 'express';
import { ResponseHelper } from '../../utils/responseHelper';
import { ILogger } from '../../interfaces/utils/ILogger';
import { AuthRequest } from '../../middleware/authMiddleware';
import { ITechnicianChatService } from '../../interfaces/services/technician/ITechnicianChatService';

export class TechnicianChatController {
  private _chatService: ITechnicianChatService;
  private _logger: ILogger;

  constructor(chatService: ITechnicianChatService, logger: ILogger) {
    this._chatService = chatService;
    this._logger = logger;
  }

  sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    const { message, conversationHistory, context } = req.body;
    const technicianId = req.user?.id;

    const requestContext = {
      operation: 'TechnicianChatController.sendMessage',
      technicianId: technicianId || 'anonymous',
      messageLength: message?.length || 0,
      hasHistory: !!conversationHistory?.length,
    };

    try {
      this._logger.info('Processing technician chat message', requestContext);

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

      // Process the message with technician context
      const chatResponse = await this._chatService.sendMessage(
        message.trim(),
        conversationHistory || [],
        context,
        technicianId
      );

      this._logger.info('Technician chat message processed successfully', {
        ...requestContext,
        responseLength: chatResponse.message.length,
      });

      const response = ResponseHelper.success(
        'Message processed successfully',
        {
          response: chatResponse.message,
          usage: chatResponse.usage,
          isRealAI: chatResponse.isRealAI,
        }
      );

      res.status(response.statusCode).json(response);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Technician chat message processing failed', {
        ...requestContext,
        error: errorMessage,
      });

      const response = ResponseHelper.error('Failed to process message');
      res.status(response.statusCode).json(response);
    }
  };
}
