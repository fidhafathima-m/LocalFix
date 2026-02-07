"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toReviewUpdateModel = exports.toReviewCreateModel = exports.toReviewDtoList = exports.toReviewDto = void 0;
const mongoose_1 = require("mongoose");
function isPopulatedUser(userId) {
    return userId && typeof userId === 'object' && 'fullName' in userId;
}
function isPopulatedOrder(orderId) {
    return orderId && typeof orderId === 'object' && 'serviceName' in orderId;
}
function isPopulatedTechnician(technicianId) {
    return (technicianId &&
        typeof technicianId === 'object' &&
        'displayName' in technicianId);
}
const toReviewDto = (review) => {
    let userName = 'Anonymous User';
    let userEmail = '';
    let userIdString = '';
    let serviceName = 'Service';
    let technicianName = 'Technician';
    let technicianProfilePicture = '';
    // Handle user data
    if (isPopulatedUser(review.userId)) {
        userName = review.userId.fullName || 'Anonymous User';
        userEmail = review.userId.email || '';
        userIdString = review.userId._id.toString();
    }
    else {
        userIdString = review.userId?.toString() || '';
    }
    // Handle service data (from populated order)
    if (isPopulatedOrder(review.orderId)) {
        serviceName = review.orderId.serviceName || 'Service';
    }
    // Handle technician data
    if (isPopulatedTechnician(review.technicianId)) {
        technicianName = review.technicianId.displayName || 'Technician';
        technicianProfilePicture = review.technicianId.profilePictureUrl || '';
    }
    return {
        id: review._id.toString(),
        orderId: review.orderId.toString(),
        userId: userIdString,
        technicianId: review.technicianId.toString(),
        rating: review.rating,
        comment: review.comment,
        status: review.status,
        createdAt: review.createdAt.toISOString(),
        updatedAt: review.updatedAt.toISOString(),
        userReported: review.userReported || false,
        user: {
            fullName: userName,
            email: userEmail,
        },
        // Include the populated data in the response
        service: {
            name: serviceName,
        },
        technician: {
            displayName: technicianName,
            profilePictureUrl: technicianProfilePicture,
        },
    };
};
exports.toReviewDto = toReviewDto;
const toReviewDtoList = (reviews) => {
    return reviews.map(review => (0, exports.toReviewDto)(review));
};
exports.toReviewDtoList = toReviewDtoList;
const toReviewCreateModel = (data) => {
    return {
        orderId: new mongoose_1.Types.ObjectId(data.orderId),
        userId: new mongoose_1.Types.ObjectId(data.userId),
        technicianId: new mongoose_1.Types.ObjectId(data.technicianId),
        rating: data.rating,
        comment: data.comment.trim(),
    };
};
exports.toReviewCreateModel = toReviewCreateModel;
const toReviewUpdateModel = (data) => {
    const updateData = {};
    if (data.rating !== undefined) {
        updateData.rating = data.rating;
    }
    if (data.comment !== undefined) {
        updateData.comment = data.comment.trim();
    }
    return updateData;
};
exports.toReviewUpdateModel = toReviewUpdateModel;
