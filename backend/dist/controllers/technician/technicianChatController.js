"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianChatController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
class TechnicianChatController {
    constructor(chatService, logger) {
        this.sendMessage = async (req, res) => {
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
                // Process the message with technician context
                const chatResponse = await this._chatService.sendMessage(message.trim(), conversationHistory || [], context, technicianId);
                this._logger.info('Technician chat message processed successfully', {
                    ...requestContext,
                    responseLength: chatResponse.message.length,
                });
                const response = responseHelper_1.ResponseHelper.success('Message processed successfully', {
                    response: chatResponse.message,
                    usage: chatResponse.usage,
                    isRealAI: chatResponse.isRealAI,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
                this._logger.error('Technician chat message processing failed', {
                    ...requestContext,
                    error: errorMessage,
                });
                const response = responseHelper_1.ResponseHelper.error('Failed to process message');
                res.status(response.statusCode).json(response);
            }
        };
        this._chatService = chatService;
        this._logger = logger;
    }
}
exports.TechnicianChatController = TechnicianChatController;
