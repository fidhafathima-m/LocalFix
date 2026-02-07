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
exports.UserProfileService = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const cloudinary_1 = require("../utils/cloudinary");
const addressMapper_1 = require("../mappers/addressMapper");
const mongoose_1 = require("mongoose");
const validators_1 = require("../utils/validators");
class UserProfileService {
    constructor(userManagementRepository, addressRepository, logger) {
        this._logger = logger;
        this._userManagementRepository = userManagementRepository;
        this._addressRepository = addressRepository;
    }
    async getUserProfile(userId) {
        const context = {
            operation: 'getUserProfile',
            userId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching user profile', context);
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found', context);
                return responseHelper_1.ResponseHelper.notFound('User not found');
            }
            if (user.isDeleted) {
                this._logger.warn('Attempt to access deleted account', context);
                return responseHelper_1.ResponseHelper.forbidden('Account has been deleted');
            }
            this._logger.debug('User found, fetching addresses', context);
            const addresses = await this._addressRepository.findByUserId(userId);
            const addressDtos = (0, addressMapper_1.toAddressDtoList)(addresses);
            this._logger.debug(`Found ${addresses.length} addresses for user`, {
                ...context,
                addressCount: addresses.length,
            });
            const userDetailDto = {
                _id: user._id.toString(),
                fullName: user.fullName,
                email: user.email,
                phone: user.phone,
                status: user.status,
                roles: user.roles,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt,
                applicationStatus: user.applicationStatus,
                lastLogin: user.lastLogin,
                loginCount: user.loginCount,
                profilePicture: user.profilePictureUrl,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                wallet: user.wallet,
                defaultAddress: user.defaultAddress,
            };
            const enhancedUserDto = {
                ...userDetailDto,
                addresses: addressDtos,
            };
            this._logger.info('Successfully retrieved user profile', {
                ...context,
                userEmail: user.email,
                hasProfilePicture: !!user.profilePictureUrl,
            });
            return responseHelper_1.ResponseHelper.success('User profile retrieved successfully', {
                user: enhancedUserDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to fetch user profile', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch user profile');
        }
    }
    async updateUserProfile(userId, updateData) {
        const context = {
            operation: 'updateUserProfile',
            userId,
            updateFields: Object.keys(updateData),
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Updating user profile', context);
            const validation = validators_1.Validators.validateUserProfile(updateData);
            if (!validation.isValid) {
                this._logger.warn('Validation failed for profile update', {
                    ...context,
                    validationErrors: validation.errors,
                });
                return responseHelper_1.ResponseHelper.badRequest(`Invalid data ${validation.errors}`);
            }
            // Sanitize input data
            const sanitizedData = validators_1.Validators.sanitizeProfileData(updateData);
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found for profile update', context);
                return responseHelper_1.ResponseHelper.notFound('User not found');
            }
            if (user.isDeleted) {
                this._logger.warn('Attempt to update deleted account', context);
                return responseHelper_1.ResponseHelper.forbidden('Account has been deleted');
            }
            // Build update payload with proper field mapping
            // Build update payload
            const updatePayload = {};
            const updatedFields = [];
            if (sanitizedData.fullName !== undefined) {
                updatePayload.fullName = sanitizedData.fullName;
                updatedFields.push('fullName');
                this._logger.debug('Updating full name', {
                    ...context,
                    newFullName: sanitizedData.fullName,
                });
            }
            if (sanitizedData.phone !== undefined) {
                updatePayload.phone = sanitizedData.phone;
                updatedFields.push('phone');
                this._logger.debug('Updating phone number', {
                    ...context,
                    newPhone: sanitizedData.phone,
                });
            }
            if (sanitizedData.email !== undefined &&
                sanitizedData.email !== user.email) {
                this._logger.debug('Checking email availability', {
                    ...context,
                    newEmail: sanitizedData.email,
                    currentEmail: user.email,
                });
                // Check if email already exists (case-insensitive)
                const existingUser = await this._userManagementRepository.findByEmail(sanitizedData.email);
                if (existingUser && existingUser._id.toString() !== userId) {
                    this._logger.warn('Email already exists', {
                        ...context,
                        existingUserId: existingUser._id.toString(),
                    });
                    return responseHelper_1.ResponseHelper.error('Email already exists');
                }
                updatePayload.email = sanitizedData.email;
                updatedFields.push('email');
            }
            if (sanitizedData.dateOfBirth !== undefined) {
                updatePayload.dateOfBirth = sanitizedData.dateOfBirth;
                updatedFields.push('dateOfBirth');
                this._logger.debug('Updating date of birth', context);
            }
            if (sanitizedData.gender !== undefined) {
                // If gender is explicitly set to undefined (empty string), remove it
                if (sanitizedData.gender === undefined) {
                    updatePayload.gender = undefined;
                    this._logger.debug('Removing gender field', context);
                }
                else {
                    updatePayload.gender = sanitizedData.gender;
                    updatedFields.push('gender');
                    this._logger.debug('Updating gender', {
                        ...context,
                        newGender: sanitizedData.gender,
                    });
                }
            }
            if (updatedFields.length === 0) {
                this._logger.warn('No valid fields to update', context);
                return responseHelper_1.ResponseHelper.badRequest('No valid fields to update');
            }
            this._logger.debug('Updating user in repository', {
                ...context,
                updatePayload,
                updatedFields,
            });
            const updatedUser = await this._userManagementRepository.update(userId, updatePayload);
            if (!updatedUser) {
                this._logger.error('Failed to update user in database', context);
                return responseHelper_1.ResponseHelper.error('Failed to update user profile');
            }
            this._logger.debug('Fetching fresh user data after update', context);
            const freshUser = await this._userManagementRepository.findById(userId);
            const publicUserDto = {
                _id: freshUser._id.toString(),
                fullName: freshUser.fullName,
                email: freshUser.email,
                phone: freshUser.phone || 'Not provided',
                profilePicture: freshUser.profilePictureUrl,
                isVerified: freshUser.isVerified,
                createdAt: freshUser.createdAt,
                defaultAddress: freshUser.defaultAddress,
                wallet: freshUser.wallet || { balance: 0 },
                status: freshUser.status || 'Active',
                role: freshUser.roles?.[0] || 'user',
                dateOfBirth: freshUser.dateOfBirth,
                gender: freshUser.gender || '',
            };
            this._logger.info('Successfully updated user profile', {
                ...context,
                updatedFields,
                userEmail: freshUser.email,
            });
            return responseHelper_1.ResponseHelper.success('Profile updated successfully', {
                user: publicUserDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to update user profile', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to update user profile');
        }
    }
    async uploadProfilePicture(userId, file) {
        const context = {
            operation: 'uploadProfilePicture',
            userId,
            fileSize: file?.size,
            fileName: file?.originalname,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Uploading profile picture', context);
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found for profile picture upload', context);
                return responseHelper_1.ResponseHelper.notFound('User not found');
            }
            this._logger.debug('Uploading file to Cloudinary', context);
            // Upload to Cloudinary
            const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file);
            if (!uploadResult || !uploadResult.secure_url) {
                this._logger.error('Cloudinary upload failed', context);
                return responseHelper_1.ResponseHelper.error('Failed to upload profile picture');
            }
            const profilePictureUrl = uploadResult.secure_url;
            this._logger.debug('Updating user profile picture URL', {
                ...context,
                cloudinaryUrl: profilePictureUrl,
            });
            // Update user profile picture
            const updatedUser = await this._userManagementRepository.update(userId, {
                profilePictureUrl,
            });
            if (!updatedUser) {
                this._logger.error('Failed to update user profile picture in database', context);
                return responseHelper_1.ResponseHelper.error('Failed to update profile picture');
            }
            this._logger.info('Successfully uploaded profile picture', {
                ...context,
                profilePictureUrl,
            });
            return responseHelper_1.ResponseHelper.success('Profile picture uploaded successfully', {
                profilePictureUrl,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to upload profile picture', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to upload profile picture');
        }
    }
    async changePassword(userId, currentPassword, newPassword, confirmPassword) {
        const context = {
            operation: 'changePassword',
            userId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Changing user password', context);
            // Validate input data using custom validators
            const validation = validators_1.Validators.validateChangePassword({
                currentPassword,
                newPassword,
                confirmPassword,
            });
            if (!validation.isValid) {
                this._logger.warn('Password change validation failed', {
                    ...context,
                    validationErrors: validation.errors,
                });
                return responseHelper_1.ResponseHelper.badRequest(`Invalid data ${validation.errors}`);
            }
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found for password change', context);
                return responseHelper_1.ResponseHelper.notFound('User not found');
            }
            if (user.isDeleted) {
                this._logger.warn('Attempt to change password for deleted account', context);
                return responseHelper_1.ResponseHelper.forbidden('Account has been deleted');
            }
            this._logger.debug('Verifying current password', context);
            // Verify current password
            const isCurrentPasswordValid = await this._userManagementRepository.verifyPassword(userId, currentPassword);
            if (!isCurrentPasswordValid) {
                this._logger.warn('Current password verification failed', context);
                return responseHelper_1.ResponseHelper.badRequest('Current password is incorrect');
            }
            this._logger.debug('Updating password in repository', context);
            // Update password
            const updatedUser = await this._userManagementRepository.updatePassword(userId, newPassword);
            if (!updatedUser) {
                this._logger.error('Failed to update password in repository', context);
                return responseHelper_1.ResponseHelper.error('Failed to update password');
            }
            this._logger.info('Successfully changed password', context);
            return responseHelper_1.ResponseHelper.success('Password changed successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to change password', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to change password');
        }
    }
    async getUserTransactions(userId, page = 1, limit = 10) {
        const context = {
            operation: 'getUserTransactions',
            userId,
            page,
            limit,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching user transactions', context);
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found for transactions', context);
                return responseHelper_1.ResponseHelper.notFound('User not found');
            }
            if (user.isDeleted) {
                this._logger.warn('Attempt to access transactions for deleted account', context);
                return responseHelper_1.ResponseHelper.forbidden('Account has been deleted');
            }
            // Import Payment and Order models
            const PaymentModel = (await Promise.resolve().then(() => __importStar(require('../models/PaymentSchema')))).default;
            const OrderModel = (await Promise.resolve().then(() => __importStar(require('../models/OrderSchema')))).default;
            const skip = (page - 1) * limit;
            // Fetch payments with order details (not booking)
            const payments = await PaymentModel.find({
                userId: new mongoose_1.Types.ObjectId(userId),
            })
                .populate({
                path: 'bookingId',
                select: 'serviceName scheduledAt', // Get basic booking info
            })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean();
            const total = await PaymentModel.countDocuments({
                userId: new mongoose_1.Types.ObjectId(userId),
            });
            // Get order codes for each payment
            const transactions = await Promise.all(payments.map(async (payment) => {
                // Find the order that matches this booking
                const order = await OrderModel.findOne({
                    bookingId: payment.bookingId,
                })
                    .select('orderCode serviceName')
                    .lean();
                return {
                    _id: payment._id.toString(),
                    bookingId: payment.bookingId?._id?.toString() || 'N/A',
                    orderCode: order?.orderCode ||
                        `PAY-${payment._id.toString().slice(-8).toUpperCase()}`,
                    serviceName: order?.serviceName ||
                        payment.bookingId?.serviceName ||
                        'Service',
                    amount: payment.amount,
                    status: payment.status,
                    type: payment.type,
                    paymentProvider: payment.paymentProvider,
                    createdAt: payment.createdAt,
                    confirmedAt: payment.confirmedAt,
                    refundedAt: payment.refundedAt,
                };
            }));
            this._logger.info('Successfully retrieved user transactions', {
                ...context,
                transactionCount: transactions.length,
                totalTransactions: total,
            });
            return responseHelper_1.ResponseHelper.success('Transactions retrieved successfully', {
                transactions,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to fetch user transactions', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch transactions');
        }
    }
    async getWalletTransactions(userId) {
        const context = {
            operation: 'getWalletTransactions',
            userId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching wallet transactions', context);
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found for wallet transactions', context);
                return responseHelper_1.ResponseHelper.notFound('User not found');
            }
            if (user.isDeleted) {
                this._logger.warn('Attempt to access wallet for deleted account', context);
                return responseHelper_1.ResponseHelper.forbidden('Account has been deleted');
            }
            // Return wallet transactions from user schema
            const walletTransactions = user.wallet?.transactions || [];
            // Sort transactions by date (newest first)
            const sortedTransactions = walletTransactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            this._logger.info('Successfully retrieved wallet transactions', {
                ...context,
                transactionCount: sortedTransactions.length,
                currentBalance: user.wallet?.balance || 0,
            });
            return responseHelper_1.ResponseHelper.success('Wallet transactions retrieved successfully', {
                transactions: sortedTransactions,
                balance: user.wallet?.balance || 0,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to fetch wallet transactions', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch wallet transactions');
        }
    }
}
exports.UserProfileService = UserProfileService;
