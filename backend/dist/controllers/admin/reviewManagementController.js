"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewManagementController = void 0;
const responseHelper_1 = require("../../utils/responseHelper");
const constants_1 = require("../../constants");
class ReviewManagementController {
    constructor(reviewService, logger) {
        this.getAllReviews = async (req, res) => {
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search;
            const rating = req.query.rating;
            const status = req.query.status;
            const service = req.query.service;
            const context = {
                operation: 'getAllReviews',
                page,
                limit,
                search,
                rating,
                status,
                service,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching all reviews for admin', context);
                const result = await this._reviewService.getAllReviews({
                    page,
                    limit,
                    search,
                    rating: rating ? parseInt(rating) : undefined,
                    status: status,
                    service,
                });
                this._logger.info('Reviews retrieved successfully', {
                    ...context,
                    totalReviews: result.total,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.REVIEW_MESSAGES.REVIEWS_RETRIEVED, result);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.REVIEW_MESSAGES.FAILED_FETCH_REVIEWS;
                this._logger.error('Get all reviews controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getReviewById = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'getReviewById',
                reviewId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching review by ID', context);
                const review = await this._reviewService.getReviewById(id);
                this._logger.info('Review retrieved successfully', {
                    ...context,
                    reviewId: review.id,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.REVIEW_MESSAGES.REVIEW_RETRIEVED, { review });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.REVIEW_MESSAGES.REVIEW_NOT_FOUND;
                this._logger.error('Get review by ID controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.updateReviewStatus = async (req, res) => {
            const { id } = req.params;
            const { status } = req.body;
            const context = {
                operation: 'updateReviewStatus',
                reviewId: id,
                status,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Updating review status', context);
                if (!status || !['published', 'flagged', 'pending'].includes(status)) {
                    this._logger.warn('Invalid status provided', context);
                    const response = responseHelper_1.ResponseHelper.badRequest('Invalid status');
                    res.status(response.statusCode).json(response);
                    return;
                }
                const review = await this._reviewService.updateReviewStatus(id, status);
                this._logger.info('Review status updated successfully', {
                    ...context,
                    reviewId: review.id,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.REVIEW_MESSAGES.REVIEW_UPDATED, {
                    review,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.REVIEW_MESSAGES.FAILED_UPDATE_REVIEW;
                this._logger.error('Update review status controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.flagReview = async (req, res) => {
            const { id } = req.params;
            const { reason } = req.body;
            const context = {
                operation: 'flagReview',
                reviewId: id,
                reason,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Flagging review', context);
                const review = await this._reviewService.flagReview(id, reason);
                this._logger.info('Review flagged successfully', {
                    ...context,
                    reviewId: review.id,
                });
                const response = responseHelper_1.ResponseHelper.success(constants_1.REVIEW_MESSAGES.REVIEW_FLAGGED, {
                    review,
                });
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.REVIEW_MESSAGES.FAILED_FLAG_REVIEW;
                this._logger.error('Flag review controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.deleteReview = async (req, res) => {
            const { id } = req.params;
            const context = {
                operation: 'deleteReview',
                reviewId: id,
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Deleting review', context);
                await this._reviewService.deleteReview(id);
                this._logger.info('Review deleted successfully', context);
                const response = responseHelper_1.ResponseHelper.success(constants_1.REVIEW_MESSAGES.REVIEW_DELETED);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : constants_1.REVIEW_MESSAGES.FAILED_DELETE_REVIEW;
                this._logger.error('Delete review controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this.getReviewStats = async (req, res) => {
            const context = {
                operation: 'getReviewStats',
                timestamp: new Date().toISOString(),
            };
            try {
                this._logger.info('Fetching review statistics', context);
                const stats = await this._reviewService.getReviewStats();
                this._logger.info('Review statistics retrieved successfully', context);
                const response = responseHelper_1.ResponseHelper.success('Review statistics retrieved', stats);
                res.status(response.statusCode).json(response);
            }
            catch (error) {
                const errorMessage = error instanceof Error
                    ? error.message
                    : 'Failed to fetch review statistics';
                this._logger.error('Get review stats controller error', {
                    ...context,
                    error: errorMessage,
                    stack: error instanceof Error ? error.stack : undefined,
                });
                const response = responseHelper_1.ResponseHelper.error(errorMessage);
                res.status(response.statusCode).json(response);
            }
        };
        this._reviewService = reviewService;
        this._logger = logger;
    }
}
exports.ReviewManagementController = ReviewManagementController;
