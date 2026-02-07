"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
const reviewMapper_1 = require("../../mappers/reviewMapper");
class ReviewController {
    constructor(reviewService, reviewRepository, logger) {
        this.createReview = async (req, res) => {
            const userId = req.user?.id;
            const reviewData = req.body;
            const context = {
                operation: 'createReview',
                userId,
                orderId: reviewData?.orderId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Creating new review', context);
                if (!userId) {
                    this._logger.warn('Create review failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const result = await this._reviewService.createReview(userId, reviewData);
                this._logger.info('Review created successfully', {
                    ...context,
                    reviewId: result.data?.id,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Create review controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.updateReview = async (req, res) => {
            const userId = req.user?.id;
            const { reviewId } = req.params;
            const reviewData = req.body;
            const context = {
                operation: 'updateReview',
                userId,
                reviewId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating review', context);
                if (!userId) {
                    this._logger.warn('Update review failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const result = await this._reviewService.updateReview(userId, reviewId, reviewData);
                this._logger.info('Review updated successfully', context);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Update review controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.deleteReview = async (req, res) => {
            const userId = req.user?.id;
            const { reviewId } = req.params;
            const context = {
                operation: 'deleteReview',
                userId,
                reviewId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Deleting review', context);
                if (!userId) {
                    this._logger.warn('Delete review failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const result = await this._reviewService.deleteReview(userId, reviewId);
                this._logger.info('Review deleted successfully', context);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Delete review controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getReviewById = async (req, res) => {
            const { reviewId } = req.params;
            const context = {
                operation: 'getReviewById',
                reviewId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching review by ID', context);
                const result = await this._reviewService.getReviewById(reviewId);
                this._logger.info('Review retrieved successfully', context);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get review by ID controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getUserReviews = async (req, res) => {
            const userId = req.user?.id;
            const context = {
                operation: 'getUserReviews',
                userId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching user reviews', context);
                if (!userId) {
                    this._logger.warn('Get user reviews failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const result = await this._reviewService.getUserReviews(userId);
                this._logger.info('User reviews retrieved successfully', {
                    ...context,
                    reviewCount: result.data?.reviews?.length || 0,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get user reviews controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getTechnicianReviews = async (req, res) => {
            const { technicianId } = req.params;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const context = {
                operation: 'getTechnicianReviews',
                technicianId,
                page,
                limit,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician reviews', context);
                const result = await this._reviewService.getTechnicianReviews(technicianId, page, limit);
                this._logger.info('Technician reviews retrieved successfully', {
                    ...context,
                    reviewCount: result.data?.reviews?.length || 0,
                });
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician reviews controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getOrderReview = async (req, res) => {
            const { orderId } = req.params;
            const context = {
                operation: 'getOrderReview',
                orderId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching review for order', context);
                const review = await this._reviewRepository.findByOrderId(orderId);
                if (!review) {
                    this._logger.info('No review found for order', context);
                    const response = responseHelper_1.ResponseHelper.success('No review found for this order', null);
                    res.status(response.statusCode).json(response);
                    return;
                }
                this._logger.info('Order review retrieved successfully', context);
                const reviewDto = (0, reviewMapper_1.toReviewDto)(review);
                const response = responseHelper_1.ResponseHelper.success('Review retrieved successfully', reviewDto);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Get order review controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.getTechnicianReviewStats = async (req, res) => {
            const { technicianId } = req.params;
            const context = {
                operation: 'getTechnicianReviewStats',
                technicianId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching technician review stats', context);
                const result = await this._reviewService.getTechnicianReviewStats(technicianId);
                this._logger.info('Technician review stats retrieved successfully', context);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Get technician review stats controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.canUserReviewOrder = async (req, res) => {
            const userId = req.user?.id;
            const { orderId } = req.params;
            const context = {
                operation: 'canUserReviewOrder',
                userId,
                orderId,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Checking if user can review order', context);
                if (!userId) {
                    this._logger.warn('Check review permission failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const canReview = await this._reviewService.canUserReviewOrder(userId, orderId);
                const response = responseHelper_1.ResponseHelper.success('Review permission checked successfully', {
                    canReview,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                this._logger.error('Check review permission controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this.reportReview = async (req, res) => {
            const userId = req.user?.id;
            const { reviewId } = req.params;
            const reportData = req.body;
            const context = {
                operation: 'reportReview',
                userId,
                reviewId,
                reason: reportData.reason,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Reporting review', context);
                if (!userId) {
                    this._logger.warn('Report review failed - authentication required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.unauthorized('Authentication required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                // Validate required fields
                if (!reportData.reason || reportData.reason.trim().length === 0) {
                    this._logger.warn('Report review failed - reason required', context);
                    const errorResponse = responseHelper_1.ResponseHelper.badRequest('Reason is required');
                    res.status(errorResponse.statusCode).json(errorResponse);
                    return;
                }
                const result = await this._reviewService.reportReview(userId, reviewId, reportData);
                this._logger.info('Review reported successfully', context);
                res.status(result.statusCode).json(result);
            }
            catch (error) {
                this._logger.error('Report review controller error', {
                    ...context,
                    error: error instanceof Error ? error.message : undefined,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const errorResponse = responseHelper_1.ResponseHelper.error(constants_1.GeneralMessages.SERVER_ERROR);
                res.status(errorResponse.statusCode).json(errorResponse);
            }
        };
        this._reviewService = reviewService;
        this._reviewRepository = reviewRepository;
        this._logger = logger;
    }
}
exports.ReviewController = ReviewController;
