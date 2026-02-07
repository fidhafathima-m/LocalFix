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
const mongoose_1 = __importStar(require("mongoose"));
const orderItemSchema = new mongoose_1.Schema({
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
    },
    serviceItemId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'ServiceItem',
    },
    customName: {
        type: String,
        required: true,
    },
    unitPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    quantity: {
        type: Number,
        required: true,
        min: 1,
    },
    totalPrice: {
        type: Number,
        required: true,
        min: 0,
    },
    addedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Technician',
        required: true,
    },
    status: {
        type: String,
        enum: ['requested', 'accepted', 'approved', 'rejected', 'purchased'],
        default: 'requested',
    },
}, {
    timestamps: true,
});
const orderSchema = new mongoose_1.Schema({
    bookingId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Booking',
        required: true,
        unique: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    technicianId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Technician',
        required: true,
    },
    orderCode: {
        type: String,
        required: true,
        unique: true,
    },
    serviceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Service',
    },
    serviceName: {
        type: String,
        required: true,
    },
    problemDescription: {
        type: String,
    },
    scheduledAt: {
        type: Date,
        required: true,
    },
    timeSlot: {
        type: String,
        required: true,
    },
    address: {
        label: {
            type: String,
            required: true,
        },
        street: {
            type: String,
            required: true,
        },
        city: {
            type: String,
            required: true,
        },
        state: {
            type: String,
            required: true,
        },
        pincode: {
            type: String,
            required: true,
        },
        landmark: {
            type: String,
        },
    },
    status: {
        type: String,
        enum: [
            'pending',
            'accepted',
            'confirmed',
            'on_the_way',
            'in_progress',
            'completed',
            'cancelled',
            'refunded',
        ],
        default: 'pending',
    },
    payment: {
        method: {
            type: String,
            enum: ['online', 'cod', 'wallet'],
            required: true,
        },
        amount: {
            type: Number,
            required: true,
            min: 0,
        },
        status: {
            type: String,
            enum: ['pending', 'paid', 'failed', 'refunded'],
            required: true,
        },
        transactionId: {
            type: String,
        },
        paidAt: {
            type: Date,
        },
    },
    orderItems: [orderItemSchema],
    totalAmount: {
        type: Number,
        required: true,
        min: 0,
    },
    technicianRating: {
        type: Number,
        min: 1,
        max: 5,
    },
    userReview: {
        type: String,
    },
    cancellation: {
        reason: String,
        cancelledBy: {
            type: String,
            enum: ['user', 'technician', 'admin'],
        },
        cancelledAt: Date,
        refundAmount: Number,
    },
    rescheduleInfo: {
        rescheduledAt: Date,
        rescheduledBy: String,
        previousScheduledAt: Date,
        previousTimeSlot: String,
        rescheduleCount: { type: Number, default: 0 },
        reason: String,
    },
    history: [
        {
            status: {
                type: String,
                required: true,
            },
            description: {
                type: String,
                required: true,
            },
            updatedBy: {
                type: String,
                enum: ['user', 'technician', 'system'],
                required: true,
            },
            timestamp: {
                type: Date,
                default: Date.now,
            },
        },
    ],
}, {
    timestamps: true,
});
// Generate order code
orderSchema.pre('save', async function (next) {
    if (this.isNew && !this.orderCode) {
        try {
            const OrderModel = mongoose_1.default.model('Order');
            const count = await OrderModel.countDocuments();
            this.orderCode = `ORD${String(count + 1).padStart(6, '0')}`;
            // Add initial history
            if (this.history.length === 0) {
                this.history.push({
                    status: 'pending',
                    description: 'Order created successfully',
                    updatedBy: 'system',
                    timestamp: new Date(),
                });
            }
        }
        catch (error) {
            return next(error);
        }
    }
    next();
});
exports.default = mongoose_1.default.model('Order', orderSchema);
