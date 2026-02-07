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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BookingRepository = void 0;
const TechnicianAvailabilitySchema_1 = __importDefault(require("../../models/technician/TechnicianAvailabilitySchema"));
const BookingSchema_1 = __importDefault(require("../../models/BookingSchema"));
const mongoose_1 = __importStar(require("mongoose"));
class BookingRepository {
    async create(bookingData) {
        const booking = new BookingSchema_1.default(bookingData);
        return await booking.save();
    }
    async findById(bookingId) {
        return await BookingSchema_1.default.findById(bookingId)
            .populate("userId", "fullName email phone")
            .populate("technicianId", "displayName profilePictureUrl services")
            .populate("addressId")
            .exec();
    }
    async findByUserId(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            BookingSchema_1.default.find({ userId: new mongoose_1.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("technicianId", "displayName profilePictureUrl")
                .exec(),
            BookingSchema_1.default.countDocuments({ userId: new mongoose_1.Types.ObjectId(userId) }),
        ]);
        return { bookings, total };
    }
    async findByTechnicianId(technicianId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        const [bookings, total] = await Promise.all([
            BookingSchema_1.default.find({ technicianId: new mongoose_1.Types.ObjectId(technicianId) })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate("userId", "fullName email phone")
                .exec(),
            BookingSchema_1.default.countDocuments({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
            }),
        ]);
        return { bookings, total };
    }
    async update(bookingId, updateData) {
        return await BookingSchema_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(bookingId), { $set: updateData }, { new: true }).exec();
    }
    async updateStatus(bookingId, status, updatedBy, reason) {
        const booking = await BookingSchema_1.default.findById(bookingId);
        if (!booking)
            return null;
        // Add to history
        booking.history.push({
            status,
            by: updatedBy,
            reason,
            at: new Date(),
        });
        booking.status = status;
        return await booking.save();
    }
    async findByBookingCode(bookingCode) {
        return await BookingSchema_1.default.findOne({ bookingCode })
            .populate("userId", "fullName email phone")
            .populate("technicianId", "displayName profilePictureUrl services")
            .populate("addressId")
            .exec();
    }
    async checkTechnicianAvailability(technicianId, date, timeSlot) {
        try {
            // Parse the time slot (e.g., "9:00 AM - 6:00 PM")
            const [requestedStartTime, requestedEndTime] = this.parseTimeSlot(timeSlot);
            if (!requestedStartTime || !requestedEndTime) {
                console.error("Invalid time slot format:", timeSlot);
                return false;
            }
            // Check if technician has availability for this date
            const availability = await TechnicianAvailabilitySchema_1.default.findOne({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                date: {
                    $gte: new Date(date.setHours(0, 0, 0, 0)),
                    $lte: new Date(date.setHours(23, 59, 59, 999)),
                },
            }).exec();
            if (!availability) {
                return false;
            }
            // Check if the requested time slot is available
            const isSlotAvailable = availability.timeSlots.some((slot) => {
                // Handle both Date objects and string formats
                let slotStart;
                let slotEnd;
                if (slot.start instanceof Date) {
                    // If start is a Date object, extract time in minutes
                    slotStart = slot.start.getHours() * 60 + slot.start.getMinutes();
                }
                else {
                    // If start is a string, parse it
                    slotStart = this.parseTimeToMinutes(slot.start);
                }
                if (slot.end instanceof Date) {
                    // If end is a Date object, extract time in minutes
                    slotEnd = slot.end.getHours() * 60 + slot.end.getMinutes();
                }
                else {
                    // If end is a string, parse it
                    slotEnd = this.parseTimeToMinutes(slot.end);
                }
                return (slot.status === "available" &&
                    requestedStartTime >= slotStart &&
                    requestedEndTime <= slotEnd);
            });
            if (!isSlotAvailable) {
                return false;
            }
            // Check if there's no existing booking for this slot (prevent double booking)
            const existingBooking = await BookingSchema_1.default.findOne({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                scheduledAt: {
                    $gte: new Date(date.setHours(0, 0, 0, 0)),
                    $lte: new Date(date.setHours(23, 59, 59, 999)),
                },
                timeSlot: timeSlot,
                status: { $in: ["pending", "accepted", "in_progress", "on_the_way"] },
            }).exec();
            return !existingBooking;
        }
        catch (error) {
            console.error("Error checking technician availability:", error);
            return false;
        }
    }
    // Helper method to parse time slot string (e.g., "9:00 AM - 6:00 PM")
    parseTimeSlot(timeSlot) {
        try {
            const [startPart, endPart] = timeSlot.split(" - ");
            const startMinutes = this.parseTimeStringToMinutes(startPart.trim());
            const endMinutes = this.parseTimeStringToMinutes(endPart.trim());
            return [startMinutes, endMinutes];
        }
        catch (error) {
            console.error("Error parsing time slot:", error);
            return [null, null];
        }
    }
    // Helper method to parse time string to minutes since midnight
    parseTimeStringToMinutes(timeStr) {
        // Handle formats like "9:00 AM", "09:00 AM", "2:30 PM"
        const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
        if (!match) {
            throw new Error(`Invalid time format: ${timeStr}`);
        }
        let [_, hours, minutes, period] = match;
        let hourNum = parseInt(hours);
        const minuteNum = parseInt(minutes);
        // Convert to 24-hour format
        if (period.toUpperCase() === "PM" && hourNum !== 12) {
            hourNum += 12;
        }
        else if (period.toUpperCase() === "AM" && hourNum === 12) {
            hourNum = 0;
        }
        return hourNum * 60 + minuteNum;
    }
    // Helper method for simple time format (HH:MM)
    parseTimeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(":").map(Number);
        return hours * 60 + minutes;
    }
    async getBookingCount() {
        return await BookingSchema_1.default.countDocuments();
    }
    async getTechnicianDetails(technicianId) {
        const Technician = mongoose_1.default.model("Technician");
        return await Technician.findById(technicianId)
            .select("displayName profilePictureUrl averageRating ratingCount services phone")
            .exec();
    }
    async getAddressDetails(addressId) {
        const UserAddress = mongoose_1.default.model("UserAddress");
        return await UserAddress.findById(addressId).exec();
    }
    async getTechnicianLocation(technicianId) {
        try {
            const technician = await this.getTechnicianDetails(technicianId);
            if (technician && technician.isActive) {
                // Return mock location data
                return {
                    latitude: 26.4499 + (Math.random() - 0.5) * 0.1,
                    longitude: 80.3319 + (Math.random() - 0.5) * 0.1,
                    lastUpdated: new Date(),
                };
            }
            return null;
        }
        catch (error) {
            console.error("Error fetching technician location:", error);
            return null;
        }
    }
}
exports.BookingRepository = BookingRepository;
