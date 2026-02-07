"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRoom = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const messageRoomSchema = new mongoose_1.Schema({
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    technicianId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Technician',
        required: true,
        index: true,
    },
    userSnapshot: {
        fullName: { type: String, required: true, default: 'Customer' },
        profilePictureUrl: { type: String, default: '' },
        phone: { type: String, default: '' },
    },
    technicianSnapshot: {
        displayName: { type: String, required: true, default: 'Technician' },
        profilePictureUrl: { type: String, default: '' },
        serviceName: { type: String, required: true, default: 'Service' },
        orderStatus: { type: String },
    },
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    lastMessage: {
        message: String,
        timestamp: Date,
        senderId: mongoose_1.Schema.Types.ObjectId,
        senderType: {
            type: String,
            enum: ['user', 'technician'],
        },
    },
    unreadCount: {
        user: {
            type: Number,
            default: 0,
        },
        technician: {
            type: Number,
            default: 0,
        },
    },
}, {
    timestamps: true,
});
// Compound indexes
messageRoomSchema.index({ userId: 1, isActive: 1 });
messageRoomSchema.index({ technicianId: 1, isActive: 1 });
messageRoomSchema.index({ orderId: 1, isActive: 1 });
exports.MessageRoom = mongoose_1.default.model('MessageRoom', messageRoomSchema);
