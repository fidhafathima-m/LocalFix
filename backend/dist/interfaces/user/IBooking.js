"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isBooking = exports.isTechnicianPopulated = void 0;
// Type guard for populated technician
const isTechnicianPopulated = (tech) => {
    return (tech && typeof tech === 'object' && '_id' in tech && 'displayName' in tech);
};
exports.isTechnicianPopulated = isTechnicianPopulated;
// Type guard for booking
const isBooking = (booking) => {
    return booking && typeof booking === 'object' && '_id' in booking;
};
exports.isBooking = isBooking;
