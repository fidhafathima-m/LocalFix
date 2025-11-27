import { Response } from 'express';
import { IMessageService } from '../../interfaces/services/user/IMessageService';
import { ResponseHelper } from '../../utils/responseHelper';
import { GeneralMessages } from '../../constants';
import { AuthRequest } from '../../types/express';

import { ILogger } from '../../interfaces/utils/ILogger';

export class MessageController {
  private _messageService: IMessageService;
  private _logger: ILogger;

  constructor(messageService: IMessageService, logger: ILogger) {
    this._messageService = messageService;
    this._logger = logger;
  }

  getOrderMessages = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { orderId } = req.params;
    const limit = parseInt(req.query.limit as string) || 50;

    const context = {
      operation: 'getOrderMessages',
      userId,
      orderId,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching order messages', context);

      if (!userId) {
        this._logger.warn(
          'Get order messages failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const messages = await this._messageService.getOrderMessages(
        orderId,
        limit
      );

      this._logger.info('Order messages retrieved successfully', {
        ...context,
        messagesCount: messages.length,
      });

      const successResponse = ResponseHelper.success(
        'Messages retrieved successfully',
        messages
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: unknown) {
      this._logger.error('Get order messages controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUserConversations = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;

    const context = {
      operation: 'getUserConversations',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching user conversations', context);

      if (!userId) {
        this._logger.warn(
          'Get user conversations failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const conversations = await this._messageService.getConversations(
        userId,
        'user'
      );

      this._logger.info('User conversations retrieved successfully', {
        ...context,
        conversationsCount: conversations.length,
      });

      const successResponse = ResponseHelper.success(
        'Conversations retrieved successfully',
        conversations
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: unknown) {
      this._logger.error('Get user conversations controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getTechnicianConversations = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;

    const context = {
      operation: 'getTechnicianConversations',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching technician conversations', context);

      if (!userId) {
        this._logger.warn(
          'Get technician conversations failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      // Convert user ID to technician ID
      const technicianId =
        await this._messageService.getTechnicianIdByUserId(userId);

      if (!technicianId) {
        this._logger.warn(
          'Get technician conversations failed - technician not found for user',
          context
        );
        const errorResponse = ResponseHelper.notFound(
          'Technician profile not found'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      const conversations = await this._messageService.getConversations(
        technicianId,
        'technician'
      );

      this._logger.info('Technician conversations retrieved successfully', {
        ...context,
        technicianId,
        conversationsCount: conversations.length,
      });

      const successResponse = ResponseHelper.success(
        'Conversations retrieved successfully',
        conversations
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: unknown) {
      this._logger.error('Get technician conversations controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  markMessagesAsRead = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { orderId, userType } = req.body;

    const context = {
      operation: 'markMessagesAsRead',
      userId,
      orderId,
      userType,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Marking messages as read', context);

      if (!userId) {
        this._logger.warn(
          'Mark messages as read failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!orderId || !userType) {
        this._logger.warn(
          'Mark messages as read failed - missing required fields',
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          'orderId and userType are required'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      await this._messageService.markConversationAsRead(
        orderId,
        userId,
        userType as 'user' | 'technician'
      );

      this._logger.info('Messages marked as read successfully', context);

      const successResponse = ResponseHelper.success(
        'Messages marked as read successfully'
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: unknown) {
      this._logger.error('Mark messages as read controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  getUnreadCount = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { userType } = req.query;

    const context = {
      operation: 'getUnreadCount',
      userId,
      userType,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching unread message count', context);

      if (!userId) {
        this._logger.warn(
          'Get unread count failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!userType) {
        this._logger.warn(
          'Get unread count failed - userType required',
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          'userType is required'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const count = await this._messageService.getUnreadCount(
        userId,
        userType as 'user' | 'technician'
      );

      this._logger.info('Unread count retrieved successfully', {
        ...context,
        unreadCount: count,
      });

      const successResponse = ResponseHelper.success(
        'Unread count retrieved successfully',
        { count }
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: unknown) {
      this._logger.error('Get unread count controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  // In MessageController.ts - Add this method
  markAllMessagesAsRead = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const userType = req.user?.roles?.includes('serviceProvider')
      ? 'technician'
      : 'user';

    const context = {
      operation: 'markAllMessagesAsRead',
      userId,
      userType,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Marking all messages as read', context);

      if (!userId) {
        this._logger.warn(
          'Mark all messages as read failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      // For technicians, we need to convert user ID to technician ID
      let targetUserId = userId;
      if (userType === 'technician') {
        const technicianId =
          await this._messageService.getTechnicianIdByUserId(userId);
        if (!technicianId) {
          this._logger.warn(
            'Mark all messages as read failed - technician not found for user',
            context
          );
          const errorResponse = ResponseHelper.notFound(
            'Technician profile not found'
          );
          res.status(errorResponse.statusCode).json(errorResponse);
          return;
        }
        targetUserId = technicianId;
      }

      await this._messageService.markAllMessagesAsRead(targetUserId, userType);

      this._logger.info('All messages marked as read successfully', {
        ...context,
        targetUserId,
      });

      const successResponse = ResponseHelper.success(
        'All messages marked as read successfully'
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: unknown) {
      this._logger.error('Mark all messages as read controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  sendMessage = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { orderId, message, messageType, receiverId, receiverType } =
      req.body;

    const context = {
      operation: 'sendMessage',
      userId,
      orderId,
      messageLength: message?.length,
      messageType,
      receiverId,
      receiverType,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Sending message', context);

      if (!userId) {
        this._logger.warn(
          'Send message failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!orderId || !message || !receiverId || !receiverType) {
        this._logger.warn(
          'Send message failed - missing required fields',
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          'orderId, message, receiverId, and receiverType are required'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const senderType = req.user?.roles?.includes('serviceProvider')
        ? 'technician'
        : 'user';

      const sentMessage = await this._messageService.sendMessage({
        orderId,
        senderId: userId,
        senderType,
        receiverId,
        receiverType: receiverType as 'user' | 'technician',
        message,
        messageType: messageType || 'text',
      });

      this._logger.info('Message sent successfully', context);

      const successResponse = ResponseHelper.success(
        'Message sent successfully',
        sentMessage
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: unknown) {
      this._logger.error('Send message controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  initializeChatRoom = async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const userId = req.user?.id;
    const { orderId, technicianId } = req.body;

    const context = {
      operation: 'initializeChatRoom',
      userId,
      orderId,
      technicianId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Initializing chat room', context);

      if (!userId) {
        this._logger.warn(
          'Initialize chat room failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      if (!orderId || !technicianId) {
        this._logger.warn(
          'Initialize chat room failed - missing required fields',
          context
        );
        const badRequestResponse = ResponseHelper.badRequest(
          'orderId and technicianId are required'
        );
        res.status(badRequestResponse.statusCode).json(badRequestResponse);
        return;
      }

      const chatRoom = await this._messageService.initializeChatRoom(
        orderId,
        userId,
        technicianId
      );

      this._logger.info('Chat room initialized successfully', context);

      const successResponse = ResponseHelper.success(
        'Chat room initialized successfully',
        chatRoom
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: unknown) {
      this._logger.error('Initialize chat room controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };

  closeChatRoom = async (req: AuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.id;
    const { orderId } = req.params;

    const context = {
      operation: 'closeChatRoom',
      userId,
      orderId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Closing chat room', context);

      if (!userId) {
        this._logger.warn(
          'Close chat room failed - authentication required',
          context
        );
        const errorResponse = ResponseHelper.unauthorized(
          'Authentication required'
        );
        res.status(errorResponse.statusCode).json(errorResponse);
        return;
      }

      await this._messageService.closeChatRoom(orderId);

      this._logger.info('Chat room closed successfully', context);

      const successResponse = ResponseHelper.success(
        'Chat room closed successfully'
      );
      res.status(successResponse.statusCode).json(successResponse);
    } catch (error: unknown) {
      this._logger.error('Close chat room controller error', {
        ...context,
        error: error instanceof Error ? error.message : undefined,
        stack: error instanceof Error ? error.stack : undefined,
      });

      const errorResponse = ResponseHelper.error(GeneralMessages.SERVER_ERROR);
      res.status(errorResponse.statusCode).json(errorResponse);
    }
  };
}
