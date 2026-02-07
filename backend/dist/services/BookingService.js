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
exports.BookingService = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const mongoose_1 = __importStar(require("mongoose"));
const IBooking_1 = require("../interfaces/user/IBooking");
class BookingService {
    constructor(bookingRepository, orderRepository, logger, redisClient) {
        this._logger = logger;
        this._bookingRepository = bookingRepository;
        this._orderRepository = orderRepository;
        this._redisClient = redisClient;
    }
    async checkBookingIdempotency(key) {
        // Similar implementation as payment service
        try {
            const cachedResponse = await this._redisClient.get(`booking_idempotency:${key}`);
            if (cachedResponse) {
                return { exists: true, response: JSON.parse(cachedResponse) };
            }
            return { exists: false };
        }
        catch (error) {
            this._logger.error('Error checking booking idempotency key', {
                key,
                error,
            });
            return { exists: false };
        }
    }
    async storeBookingIdempotency(key, response, statusCode) {
        try {
            await this._redisClient.setex(`booking_idempotency:${key}`, 24 * 60 * 60, JSON.stringify({ response, statusCode, timestamp: new Date() }));
        }
        catch (error) {
            this._logger.error('Error storing booking idempotency key', {
                key,
                error,
            });
        }
    }
    async createBooking(userId, bookingData, idempotencyKey) {
        const context = {
            operation: 'createBooking',
            data: { userId, ...bookingData, idempotencyKey },
        };
        try {
            this._logger.info('Creating new booking', context);
            // Check idempotency key if provided
            if (idempotencyKey) {
                const idempotencyCheck = await this.checkBookingIdempotency(idempotencyKey);
                if (idempotencyCheck.exists) {
                    this._logger.info('Returning cached booking response', {
                        ...context,
                        idempotencyKey,
                    });
                    return idempotencyCheck.response;
                }
            }
            // Validate required fields
            if (!bookingData.technicianId ||
                !bookingData.serviceName ||
                !bookingData.addressId ||
                !bookingData.scheduledAt ||
                !bookingData.timeSlot) {
                this._logger.warn('Missing required booking fields', context);
                return responseHelper_1.ResponseHelper.badRequest('Please fill in all required booking fields');
            }
            const Service = mongoose_1.default.model('Service');
            const service = await Service.findOne({ name: bookingData.serviceName });
            if (!service) {
                this._logger.warn('Service not found', {
                    ...context,
                    serviceName: bookingData.serviceName,
                });
                return responseHelper_1.ResponseHelper.notFound(`Service '${bookingData.serviceName}' not found`);
            }
            const serviceId = service._id;
            // Generate booking code
            const bookingCount = await this._bookingRepository.getBookingCount();
            const bookingCode = `BK${String(bookingCount + 1).padStart(6, '0')}`;
            // Calculate amounts
            const baseAmount = bookingData.amount || 0;
            const itemsAmount = 0;
            const totalAmount = baseAmount + itemsAmount;
            const bookingModel = {
                bookingCode: bookingCode,
                userId: new mongoose_1.Types.ObjectId(userId),
                technicianId: new mongoose_1.Types.ObjectId(bookingData.technicianId),
                serviceName: bookingData.serviceName,
                serviceId: serviceId,
                brand: bookingData.brand,
                addressId: new mongoose_1.Types.ObjectId(bookingData.addressId),
                scheduledAt: new Date(bookingData.scheduledAt),
                timeSlot: bookingData.timeSlot,
                amount: baseAmount,
                itemsAmount: itemsAmount,
                totalAmount: totalAmount,
                notes: bookingData.notes || '',
                status: 'pending',
                history: [
                    {
                        status: 'pending',
                        by: 'system',
                        at: new Date(),
                    },
                ],
            };
            this._logger.debug('Creating booking in repository', {
                ...context,
                bookingModel,
                serviceId: serviceId.toString(),
            });
            const newBooking = await this._bookingRepository.create(bookingModel);
            if (!newBooking) {
                this._logger.error('Failed to create booking in database', context);
                return responseHelper_1.ResponseHelper.error('Failed to create booking');
            }
            this._logger.info('Booking created successfully', {
                ...context,
                bookingId: newBooking._id?.toString(),
                bookingCode: newBooking.bookingCode,
                serviceId: serviceId.toString(),
            });
            const bookingDto = this.mapToDto(newBooking);
            const response = responseHelper_1.ResponseHelper.created('Booking created successfully', bookingDto);
            // Store the response for idempotency
            if (idempotencyKey) {
                await this.storeBookingIdempotency(idempotencyKey, response, 201);
            }
            return response;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error creating booking', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to create booking');
        }
    }
    async getBookingById(userId, bookingId) {
        const context = {
            operation: 'getBookingById',
            data: { userId, bookingId },
        };
        try {
            this._logger.info('Fetching booking by ID', context);
            const booking = await this._bookingRepository.findById(bookingId);
            if (!booking) {
                this._logger.warn('Booking not found', context);
                return responseHelper_1.ResponseHelper.notFound('Booking not found');
            }
            const bookingUserId = booking.userId?._id?.toString() || booking.userId?.toString();
            const bookingTechnicianId = booking.technicianId?._id?.toString() ||
                booking.technicianId?.toString();
            // Check if user has access to this booking
            if (bookingUserId !== userId && bookingTechnicianId !== userId) {
                this._logger.warn('User not authorized to access this booking', context);
                return responseHelper_1.ResponseHelper.forbidden('Not authorized to access this booking');
            }
            this._logger.info('Booking retrieved successfully', context);
            const bookingDto = this.mapToDto(booking);
            return responseHelper_1.ResponseHelper.success('Booking retrieved successfully', bookingDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching booking', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch booking');
        }
    }
    async getUserBookings(userId, page = 1, limit = 10) {
        const context = {
            operation: 'getUserBookings',
            data: { userId, page, limit },
        };
        try {
            this._logger.info('Fetching user bookings', context);
            const result = await this._bookingRepository.findByUserId(userId, page, limit);
            this._logger.info('User bookings retrieved successfully', {
                ...context,
                bookingCount: result.bookings.length,
                total: result.total,
            });
            const bookingDtos = result.bookings.map((booking) => this.mapToDto(booking));
            return responseHelper_1.ResponseHelper.success('Bookings retrieved successfully', {
                bookings: bookingDtos,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: Math.ceil(result.total / limit),
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching user bookings', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch bookings');
        }
    }
    async getTechnicianBookings(technicianId, page = 1, limit = 10) {
        const context = {
            operation: 'getTechnicianBookings',
            data: { technicianId, page, limit },
        };
        try {
            this._logger.info('Fetching technician bookings', context);
            const result = await this._bookingRepository.findByTechnicianId(technicianId, page, limit);
            this._logger.info('Technician bookings retrieved successfully', {
                ...context,
                bookingCount: result.bookings.length,
                total: result.total,
            });
            const bookingDtos = result.bookings.map((booking) => this.mapToDto(booking));
            return responseHelper_1.ResponseHelper.success('Bookings retrieved successfully', {
                bookings: bookingDtos,
                pagination: {
                    page,
                    limit,
                    total: result.total,
                    pages: Math.ceil(result.total / limit),
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching technician bookings', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch bookings');
        }
    }
    async updateBooking(userId, bookingId, updateData) {
        const context = {
            operation: 'updateBooking',
            data: { userId, bookingId, updateData },
        };
        try {
            this._logger.info('Updating booking', context);
            const existingBooking = await this._bookingRepository.findById(bookingId);
            if (!existingBooking) {
                this._logger.warn('Booking not found for update', context);
                return responseHelper_1.ResponseHelper.notFound('Booking not found');
            }
            const bookingUserId = existingBooking.userId?._id?.toString() ||
                existingBooking.userId?.toString();
            // Check if user owns the booking
            if (bookingUserId !== userId) {
                this._logger.warn('User not authorized to update this booking', context);
                return responseHelper_1.ResponseHelper.forbidden('Not authorized to update this booking');
            }
            const allowedStatuses = ['pending', 'cancelled', 'accepted'];
            if (!allowedStatuses.includes(existingBooking.status)) {
                this._logger.warn('Booking cannot be updated in current status', {
                    ...context,
                    currentStatus: existingBooking.status,
                });
                return responseHelper_1.ResponseHelper.badRequest(`Booking cannot be updated in ${existingBooking.status} status`);
            }
            // Prepare update data for repository
            const repositoryUpdateData = {};
            // Map the update fields to the repository model
            if (updateData.serviceName)
                repositoryUpdateData.serviceName = updateData.serviceName;
            if (updateData.brand)
                repositoryUpdateData.brand = updateData.brand;
            if (updateData.scheduledAt)
                repositoryUpdateData.scheduledAt = new Date(updateData.scheduledAt);
            if (updateData.timeSlot)
                repositoryUpdateData.timeSlot = updateData.timeSlot;
            if (updateData.amount !== undefined)
                repositoryUpdateData.amount = updateData.amount;
            if (updateData.notes !== undefined)
                repositoryUpdateData.notes = updateData.notes;
            // Handle address update
            if (updateData.addressId) {
                repositoryUpdateData.addressId = new mongoose_1.Types.ObjectId(updateData.addressId);
            }
            // Update the booking in repository
            const updatedBooking = await this._bookingRepository.update(bookingId, repositoryUpdateData);
            if (!updatedBooking) {
                this._logger.error('Failed to update booking in repository', context);
                return responseHelper_1.ResponseHelper.error('Failed to update booking');
            }
            this._logger.info('Booking updated successfully', {
                ...context,
                updatedFields: Object.keys(repositoryUpdateData),
            });
            const bookingDto = this.mapToDto(updatedBooking);
            return responseHelper_1.ResponseHelper.success('Booking updated successfully', bookingDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error updating booking', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to update booking');
        }
    }
    async updateBookingStatus(bookingId, status, updatedBy, reason) {
        const context = {
            operation: 'updateBookingStatus',
            data: { bookingId, status, updatedBy, reason },
        };
        try {
            this._logger.info('Updating booking status', context);
            const updatedBooking = await this._bookingRepository.updateStatus(bookingId, status, updatedBy, reason);
            if (!updatedBooking) {
                this._logger.warn('Booking not found for status update', context);
                return responseHelper_1.ResponseHelper.notFound('Booking not found');
            }
            this._logger.info('Booking status updated successfully', context);
            const bookingDto = this.mapToDto(updatedBooking);
            return responseHelper_1.ResponseHelper.success('Booking status updated successfully', bookingDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error updating booking status', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to update booking status');
        }
    }
    async cancelBooking(userId, bookingId, reason) {
        const context = {
            operation: 'cancelBooking',
            data: { userId, bookingId, reason },
        };
        try {
            this._logger.info('Cancelling booking', context);
            const booking = await this._bookingRepository.findById(bookingId);
            if (!booking) {
                this._logger.warn('Booking not found for cancellation', context);
                return responseHelper_1.ResponseHelper.notFound('Booking not found');
            }
            const bookingUserId = booking.userId?._id?.toString() || booking.userId?.toString();
            // Check if user owns the booking
            if (bookingUserId !== userId) {
                this._logger.warn('User not authorized to cancel this booking', context);
                return responseHelper_1.ResponseHelper.forbidden('Not authorized to cancel this booking');
            }
            // Check if booking can be cancelled
            if (['cancelled', 'completed'].includes(booking.status)) {
                this._logger.warn('Booking cannot be cancelled in current status', {
                    ...context,
                    currentStatus: booking.status,
                });
                return responseHelper_1.ResponseHelper.badRequest(`Booking cannot be cancelled in ${booking.status} status`);
            }
            const updatedBooking = await this._bookingRepository.updateStatus(bookingId, 'cancelled', 'user', reason);
            if (!updatedBooking) {
                this._logger.error('Failed to cancel booking', context);
                return responseHelper_1.ResponseHelper.error('Failed to cancel booking');
            }
            this._logger.info('Booking cancelled successfully', context);
            const bookingDto = this.mapToDto(updatedBooking);
            return responseHelper_1.ResponseHelper.success('Booking cancelled successfully', bookingDto);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error cancelling booking', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to cancel booking');
        }
    }
    mapToDto(booking) {
        const userId = booking.userId?._id?.toString() || booking.userId?.toString();
        const technicianId = booking.technicianId?._id?.toString() || booking.technicianId?.toString();
        const addressId = booking.addressId?._id?.toString() || booking.addressId?.toString();
        const serviceId = booking.serviceId?.toString();
        return {
            _id: booking.id.toString(),
            bookingCode: booking.bookingCode,
            userId: userId || '',
            technicianId: technicianId || '',
            serviceId: serviceId || '',
            serviceName: booking.serviceName,
            brand: booking.brand,
            addressId: addressId || '',
            scheduledAt: booking.scheduledAt.toISOString(),
            timeSlot: booking.timeSlot,
            status: booking.status,
            amount: booking.amount,
            itemsAmount: booking.itemsAmount,
            totalAmount: booking.totalAmount,
            notes: booking.notes,
            history: booking.history.map((h) => ({
                status: h.status,
                by: h.by,
                reason: h.reason,
                at: h.at.toISOString(),
            })),
            createdAt: booking.createdAt.toISOString(),
            updatedAt: booking.updatedAt.toISOString(),
        };
    }
    async getTrackingDetails(userId, bookingId) {
        const context = {
            operation: 'getTrackingDetails',
            data: { userId, bookingId },
        };
        try {
            this._logger.info('Fetching tracking details', context);
            // Query Order collection
            const order = await this._orderRepository.findByBookingId(bookingId);
            if (!order) {
                this._logger.warn('Order not found for tracking', context);
                return responseHelper_1.ResponseHelper.notFound('Order not found');
            }
            const technician = order.technicianId;
            if (!technician || !(0, IBooking_1.isTechnicianPopulated)(technician)) {
                this._logger.warn('Technician data not properly populated in order', context);
                return responseHelper_1.ResponseHelper.notFound('Technician details not found');
            }
            const address = order.address;
            // Get technician location if available
            const technicianLocation = await this._bookingRepository.getTechnicianLocation(technician._id.toString());
            // Calculate estimated arrival and distance if technician is on the way
            let estimatedArrival;
            let distance;
            if (order.status === 'on_the_way' && technicianLocation) {
                distance = this.calculateDistance(technicianLocation.latitude, technicianLocation.longitude);
                estimatedArrival = this.calculateEstimatedArrival(distance);
            }
            const trackingDetails = {
                _id: order._id.toString(),
                bookingId: order.bookingId.toString(),
                bookingCode: this._getBookingCode(order),
                userId: order.userId.toString(),
                technicianId: {
                    _id: technician._id.toString(),
                    displayName: technician.displayName,
                    profilePictureUrl: technician.profilePictureUrl || '',
                    averageRating: technician.averageRating || 0,
                    ratingCount: technician.ratingCount || 0,
                    skills: (() => {
                        // Normalize services/skills to string[]
                        const svc = technician.services;
                        const sks = technician.skills;
                        const arr = Array.isArray(svc)
                            ? svc
                            : Array.isArray(sks)
                                ? sks
                                : [];
                        return arr.map((item) => typeof item === 'string'
                            ? item
                            : item?.name || item?.skill || String(item));
                    })(),
                    phone: technician.phone || '',
                },
                serviceName: order.serviceName,
                problemDescription: order.problemDescription,
                scheduledAt: order.scheduledAt.toISOString(),
                timeSlot: order.timeSlot,
                address: {
                    label: address.label,
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    landmark: address.landmark,
                },
                status: order.status,
                amount: order.totalAmount,
                estimatedDuration: '1-2 hours',
                statusHistory: order.history.map((h) => ({
                    status: h.status,
                    timestamp: h.timestamp.toISOString(),
                    description: h.description || this.getStatusDescription(h.status, h.reason),
                    updatedBy: h.updatedBy,
                })),
                technicianLocation: technicianLocation
                    ? {
                        latitude: technicianLocation.latitude,
                        longitude: technicianLocation.longitude,
                        lastUpdated: technicianLocation.lastUpdated.toISOString(),
                    }
                    : undefined,
                estimatedArrival,
                distance,
            };
            this._logger.info('Tracking details retrieved successfully', context);
            return responseHelper_1.ResponseHelper.success('Tracking details retrieved successfully', trackingDetails);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching tracking details', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch tracking details');
        }
    }
    _getBookingCode(order) {
        if (order.bookingId &&
            typeof order.bookingId === 'object' &&
            'bookingCode' in order.bookingId) {
            return order.bookingId.bookingCode;
        }
        return 'N/A'; // Fallback if not populated
    }
    async getTechnicianLocation(bookingId) {
        const context = {
            operation: 'getTechnicianLocation',
            data: { bookingId },
        };
        try {
            this._logger.info('Fetching technician location', context);
            const booking = await this._bookingRepository.findById(bookingId);
            if (!booking) {
                this._logger.warn('Booking not found for location tracking', context);
                return responseHelper_1.ResponseHelper.notFound('Booking not found');
            }
            // Get technician location
            const technicianLocation = await this._bookingRepository.getTechnicianLocation(booking.technicianId.toString());
            if (!technicianLocation) {
                this._logger.warn('Technician location not available', context);
                return responseHelper_1.ResponseHelper.notFound('Technician location not available');
            }
            // Calculate estimated arrival and distance
            let estimatedArrival;
            let distance;
            if (booking.status === 'on_the_way') {
                distance = this.calculateDistance(technicianLocation.latitude, technicianLocation.longitude);
                estimatedArrival = this.calculateEstimatedArrival(distance);
            }
            const locationData = {
                latitude: technicianLocation.latitude,
                longitude: technicianLocation.longitude,
                lastUpdated: technicianLocation.lastUpdated.toISOString(),
                estimatedArrival,
                distance,
                technicianId: booking.technicianId.toString(),
                bookingId: booking.bookingCode,
            };
            this._logger.info('Technician location retrieved successfully', context);
            return responseHelper_1.ResponseHelper.success('Technician location retrieved successfully', locationData);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error fetching technician location', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch technician location');
        }
    }
    // Helper methods for location calculations
    calculateDistance(lat, lng) {
        // Mock distance calculation
        return Math.random() * 10 + 1;
    }
    calculateEstimatedArrival(distance) {
        // Mock ETA calculation - in real app, use traffic data
        const averageSpeed = 30; // km/h
        const travelTimeMinutes = Math.round((distance / averageSpeed) * 60);
        return `${travelTimeMinutes} minutes`;
    }
    getStatusDescription(status, reason) {
        const descriptions = {
            pending: 'Your booking has been confirmed and is waiting for technician assignment.',
            accepted: 'Your booking has been accepted and a technician will be assigned soon.',
            assigned: 'A technician has been assigned to your service request.',
            on_the_way: 'The technician is on the way to your location.',
            in_progress: 'The technician is currently working on your service.',
            completed: 'The service has been completed successfully.',
            cancelled: reason
                ? `Booking cancelled: ${reason}`
                : 'Booking has been cancelled.',
        };
        return descriptions[status] || `Status updated to ${status}`;
    }
}
exports.BookingService = BookingService;
