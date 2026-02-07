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
const rrule_1 = require("rrule");
const SlotRuleSchema = new mongoose_1.Schema({
    technicianId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
        required: false,
    },
    name: {
        type: String,
        required: true,
    },
    rruleString: {
        type: String,
        required: true,
    },
    startTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    endTime: {
        type: String,
        required: true,
        match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/,
    },
    slotDurationMinutes: {
        type: Number,
        default: 60,
        min: 15,
        max: 480,
    },
    bookingBufferBeforeMinutes: {
        type: Number,
        default: 0,
    },
    bookingBufferAfterMinutes: {
        type: Number,
        default: 0,
    },
    maxBookingsPerSlot: {
        type: Number,
        default: 1,
    },
    effectiveFrom: {
        type: Date,
        default: Date.now,
    },
    effectiveTo: {
        type: Date,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Instance methods
// Update in your SlotRuleSchema
SlotRuleSchema.methods.generateSlotsForDate = function (date) {
    const slots = [];
    const [startHour, startMinute] = this.startTime.split(":").map(Number);
    const [endHour, endMinute] = this.endTime.split(":").map(Number);
    const slotStart = new Date(date);
    slotStart.setHours(startHour, startMinute, 0, 0);
    const dayEnd = new Date(date);
    dayEnd.setHours(endHour, endMinute, 0, 0);
    let currentSlotStart = new Date(slotStart);
    while (currentSlotStart < dayEnd) {
        const currentSlotEnd = new Date(currentSlotStart);
        currentSlotEnd.setMinutes(currentSlotEnd.getMinutes() + this.slotDurationMinutes);
        if (currentSlotEnd > dayEnd)
            break;
        slots.push({
            start: new Date(currentSlotStart), // This should be a Date object
            end: new Date(currentSlotEnd), // This should be a Date object
            status: "available",
        });
        currentSlotStart = currentSlotEnd;
    }
    return slots;
};
SlotRuleSchema.methods.getOccurrencesBetween = function (start, end) {
    try {
        const rule = (0, rrule_1.rrulestr)(this.rruleString);
        return rule.between(start, end, true);
    }
    catch (error) {
        console.error("Error parsing RRule:", error);
        return [];
    }
};
exports.default = mongoose_1.default.model("SlotRule", SlotRuleSchema);
