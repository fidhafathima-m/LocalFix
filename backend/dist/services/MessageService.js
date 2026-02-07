"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageService = void 0;
class MessageService {
    constructor(messageRepository) {
        this._messageRepository = messageRepository;
    }
    async sendMessage(messageData) {
        // Validate that the chat room is active
        const room = await this._messageRepository.getRoomByOrder(messageData.orderId);
        if (!room || !room.isActive) {
            console.error('Backend: Chat room is not active or does not exist');
            throw new Error('Chat room is not active or does not exist');
        }
        // Create the message
        const message = await this._messageRepository.createMessage(messageData);
        // Update room's last message and unread count
        await this._messageRepository.updateRoom(messageData.orderId, {
            lastMessage: {
                message: messageData.message,
                timestamp: message.timestamp,
                senderId: messageData.senderId,
                senderType: messageData.senderType,
            },
            unreadCount: {
                user: messageData.receiverType === 'user'
                    ? room.unreadCount.user + 1
                    : room.unreadCount.user,
                technician: messageData.receiverType === 'technician'
                    ? room.unreadCount.technician + 1
                    : room.unreadCount.technician,
            },
        });
        return message;
    }
    async getOrderMessages(orderId, limit = 50) {
        return this._messageRepository.getMessagesByOrder(orderId, limit);
    }
    async getTechnicianIdByUserId(userId) {
        try {
            const technicianId = await this._messageRepository.getTechnicianIdByUserId(userId);
            return technicianId;
        }
        catch (error) {
            console.error(`Error converting user ID to technician ID:`, error);
            return null;
        }
    }
    async syncOrderStatusWithRoom(orderId) {
        try {
            const orderStatus = await this._messageRepository.getOrderStatus(orderId);
            if (orderStatus) {
                const currentRoom = await this._messageRepository.getRoomByOrder(orderId);
                if (currentRoom) {
                    await this._messageRepository.updateRoom(orderId, {
                        technicianSnapshot: {
                            ...currentRoom.technicianSnapshot,
                            orderStatus: orderStatus,
                        },
                        orderStatus: orderStatus,
                    });
                }
            }
        }
        catch (error) {
            console.error('Error syncing order status with room:', error);
            throw error;
        }
    }
    async getConversations(userId, userType) {
        return this._messageRepository.getRoomsByUser(userId, userType);
    }
    async markConversationAsRead(orderId, userId, userType) {
        const markedCount = await this._messageRepository.markMessagesAsRead(orderId, userId, userType);
        if (markedCount > 0) {
            // Reset unread count for this user
            const room = await this._messageRepository.getRoomByOrder(orderId);
            if (room) {
                await this._messageRepository.updateRoom(orderId, {
                    unreadCount: {
                        user: userType === 'user' ? 0 : room.unreadCount.user,
                        technician: userType === 'technician' ? 0 : room.unreadCount.technician,
                    },
                });
            }
        }
    }
    async markAllMessagesAsRead(userId, userType) {
        try {
            // Get all active conversations for this user
            const conversations = await this._messageRepository.getRoomsByUser(userId, userType);
            // Mark all messages as read for each conversation
            for (const conversation of conversations) {
                await this._messageRepository.markMessagesAsRead(conversation.orderId, userId, userType);
                // Reset unread count for this user in the room
                await this._messageRepository.updateRoom(conversation.orderId, {
                    unreadCount: {
                        user: userType === 'user' ? 0 : conversation.unreadCount.user,
                        technician: userType === 'technician'
                            ? 0
                            : conversation.unreadCount.technician,
                    },
                });
            }
        }
        catch (error) {
            console.error('Error marking all messages as read:', error);
            throw error;
        }
    }
    async getTechnicianSnapshot(technicianId, orderId) {
        try {
            const [technicianDetails, orderDetails, orderStatus] = await Promise.all([
                this._messageRepository.getTechnicianDetails(technicianId),
                this._messageRepository.getOrderServiceName(orderId),
                this._messageRepository.getOrderStatus(orderId),
            ]);
            let serviceName = 'Service';
            if (orderDetails && orderDetails !== 'Service') {
                serviceName = orderDetails;
            }
            else if (technicianDetails?.serviceName) {
                serviceName = technicianDetails.serviceName;
            }
            const snapshot = {
                displayName: technicianDetails?.displayName || 'Technician',
                profilePictureUrl: technicianDetails?.profilePictureUrl || '',
                serviceName: serviceName,
                orderStatus: orderStatus || undefined,
            };
            return snapshot;
        }
        catch (error) {
            console.error('Error creating technician snapshot:', error);
            // Return fallback data
            return {
                displayName: 'Technician',
                profilePictureUrl: '',
                serviceName: 'Service',
                orderStatus: undefined,
            };
        }
    }
    async initializeChatRoom(orderId, userId, technicianId) {
        try {
            const room = await this._messageRepository.getOrCreateRoom(orderId, userId, technicianId);
            return room;
        }
        catch (error) {
            console.error('Error initializing chat room:', error);
            throw new Error(`Failed to initialize chat room: ${error.message}`);
        }
    }
    async closeChatRoom(orderId) {
        await this._messageRepository.deactivateRoom(orderId);
    }
    async getUnreadCount(userId, userType) {
        const rooms = await this._messageRepository.getRoomsByUser(userId, userType);
        return rooms.reduce((total, room) => {
            return (total +
                (userType === 'user'
                    ? room.unreadCount.user
                    : room.unreadCount.technician));
        }, 0);
    }
    async getRecentMessages(orderId, senderId, timeWindowMs = 5000) {
        return this._messageRepository.getRecentMessages(orderId, senderId, timeWindowMs);
    }
}
exports.MessageService = MessageService;
