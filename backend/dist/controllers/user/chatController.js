"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
class ChatController {
    constructor(chatService, logger) {
        this.sendMessage = async (req, res) => {
            const { message, conversationHistory, context } = req.body;
            const userId = req.user?.id;
            const requestContext = {
                operation: 'ChatController.sendMessage',
                userId: userId || 'anonymous',
                messageLength: message?.length || 0,
                hasHistory: !!conversationHistory?.length,
            };
            try {
                this._logger.info('Processing chat message', requestContext);
                // Validate input
                if (!message ||
                    typeof message !== 'string' ||
                    message.trim().length === 0) {
                    const response = responseHelper_1.ResponseHelper.badRequest('Message is required');
                    res.status(response.statusCode).json(response);
                    return;
                }
                // Limit message length
                if (message.length > 1000) {
                    const response = responseHelper_1.ResponseHelper.badRequest('Message too long (max 1000 characters)');
                    res.status(response.statusCode).json(response);
                    return;
                }
                // Process the message
                const chatResponse = await this._chatService.sendMessage(message.trim(), conversationHistory || [], context);
                this._logger.info('Chat message processed successfully', {
                    ...requestContext,
                    responseLength: chatResponse.message.length,
                });
                const response = responseHelper_1.ResponseHelper.success('Message processed successfully', {
                    response: chatResponse.message,
                    usage: chatResponse.usage,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                this._logger.error('Chat message processing failed', {
                    ...requestContext,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to process message');
                res.status(response.statusCode).json(response);
            }
        };
        //  Get chat history for a user
        this.getChatHistory = async (req, res) => {
            const userId = req.user?.id;
            try {
                const response = responseHelper_1.ResponseHelper.success('Chat history retrieved', {
                    messages: [],
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                this._logger.error('Failed to get chat history', {
                    userId,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to retrieve chat history');
                res.status(response.statusCode).json(response);
            }
        };
        this._chatService = chatService;
        this._logger = logger;
    }
}
exports.ChatController = ChatController;
