"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementService = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const constants_1 = require("../constants");
const userMapper_1 = require("../mappers/userMapper");
// Type guard function for status validation
function isValidStatus(status) {
    return constants_1.VALID_STATUSES.includes(status);
}
class UserManagementService {
    constructor(userManagementRepository, logger) {
        this._userManagementRepository = userManagementRepository;
        this._logger = logger;
    }
    async getUsers(search, status) {
        const context = {
            operation: 'getUsers',
            search,
            status,
            timestamp: new Date().toString(),
        };
        try {
            this._logger.info('Finding all users with filters', context);
            // Validate status if provided
            if (status && status !== 'All Status' && status !== 'all') {
                if (!isValidStatus(status)) {
                    this._logger.warn('Invalid status value provided', {
                        ...context,
                        providedStatus: status,
                    });
                    return responseHelper_1.ResponseHelper.badRequest(constants_1.USER_MANAGEMENT_MESSAGES.INVALID_STATUS_VALUE);
                }
            }
            const users = await this._userManagementRepository.findAllUsers(search, status);
            const userDtos = users.map(user => (0, userMapper_1.toUserListDto)(user));
            this._logger.debug('Users retrieved with filters', {
                ...context,
                userCount: userDtos.length,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.USER_MANAGEMENT_MESSAGES.USERS_RETRIEVED, {
                users: userDtos,
            });
        }
        catch (error) {
            console.error('Error fetching users with filters:', error);
            this._logger.error('Failed to get users with filters', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.USER_MANAGEMENT_MESSAGES.FAILED_FETCH_USERS);
        }
    }
    async updateUserStatus(userId, statusData) {
        const context = {
            operation: 'updateUserStatus',
            userId,
            status: statusData,
            timestamp: new Date().toString(),
        };
        try {
            this._logger.info('Updating user status', context);
            const { status } = statusData;
            if (!isValidStatus(status)) {
                this._logger.error('Invalid status value', {
                    ...context,
                });
                return responseHelper_1.ResponseHelper.badRequest(constants_1.USER_MANAGEMENT_MESSAGES.INVALID_STATUS_VALUE);
            }
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
            }
            this._logger.info('User found', {
                ...context,
                userId,
            });
            if (user.isDeleted) {
                this._logger.warn('Deleted user cannot be updated', context);
                return responseHelper_1.ResponseHelper.forbidden(constants_1.USER_MANAGEMENT_MESSAGES.CANNOT_UPDATE_DELETED_USER);
            }
            const updatedUser = await this._userManagementRepository.updateUserStatus(userId, status);
            if (!updatedUser) {
                this._logger.error('Failed to update user status', context);
                return responseHelper_1.ResponseHelper.conflict(constants_1.USER_MANAGEMENT_MESSAGES.UPDATE_CONFLICT);
            }
            const userDto = (0, userMapper_1.toUserDetailDto)(updatedUser);
            this._logger.info('User status updated', {
                ...context,
                user: userDto,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.USER_MANAGEMENT_MESSAGES.USER_STATUS_UPDATED, {
                user: userDto,
            });
        }
        catch (error) {
            console.error('Error updating user status:', error);
            this._logger.error('Failed to update user status', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.USER_MANAGEMENT_MESSAGES.FAILED_UPDATE_STATUS);
        }
    }
    async editUser(userId, userData) {
        const context = {
            operation: 'editUser',
            userId,
            user: userData,
        };
        try {
            this._logger.info('Editing user', context);
            const { fullName, email, phone, status } = userData;
            if (status) {
                if (!isValidStatus(status)) {
                    this._logger.warn('Invalid status value', context);
                    return responseHelper_1.ResponseHelper.badRequest(constants_1.USER_MANAGEMENT_MESSAGES.INVALID_STATUS_VALUE);
                }
            }
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
            }
            if (user.isDeleted) {
                this._logger.warn('Deleted user cannot be updated', context);
                return responseHelper_1.ResponseHelper.forbidden(constants_1.USER_MANAGEMENT_MESSAGES.CANNOT_UPDATE_DELETED_USER);
            }
            // Validate email format if provided
            if (email && !constants_1.VALIDATION.EMAIL_REGEX.test(email)) {
                this._logger.warn('not a valid email', context);
                return responseHelper_1.ResponseHelper.badRequest('Please provide a valid email address');
            }
            // Validate full name length if provided
            if (fullName &&
                (fullName.length < constants_1.VALIDATION.MIN_FULL_NAME_LENGTH ||
                    fullName.length > constants_1.VALIDATION.MAX_FULL_NAME_LENGTH)) {
                this._logger.warn(`Full name must be between ${constants_1.VALIDATION.MIN_FULL_NAME_LENGTH} and ${constants_1.VALIDATION.MAX_FULL_NAME_LENGTH} characters`);
                return responseHelper_1.ResponseHelper.badRequest(`Full name must be between ${constants_1.VALIDATION.MIN_FULL_NAME_LENGTH} and ${constants_1.VALIDATION.MAX_FULL_NAME_LENGTH} characters`);
            }
            // Validate phone length if provided
            if (phone &&
                (phone.length < constants_1.VALIDATION.MIN_PHONE_LENGTH ||
                    phone.length > constants_1.VALIDATION.MAX_PHONE_LENGTH)) {
                this._logger.warn(`Phone number must be between ${constants_1.VALIDATION.MIN_PHONE_LENGTH} and ${constants_1.VALIDATION.MAX_PHONE_LENGTH} characters`);
                return responseHelper_1.ResponseHelper.badRequest(`Phone number must be between ${constants_1.VALIDATION.MIN_PHONE_LENGTH} and ${constants_1.VALIDATION.MAX_PHONE_LENGTH} characters`);
            }
            const updateData = {};
            if (fullName)
                updateData.fullName = fullName;
            if (email)
                updateData.email = email;
            if (phone)
                updateData.phone = phone;
            if (status)
                updateData.status = status;
            const updatedUser = await this._userManagementRepository.update(userId, updateData);
            if (!updatedUser) {
                this._logger.error('Failed to update user', context);
                return responseHelper_1.ResponseHelper.conflict(constants_1.USER_MANAGEMENT_MESSAGES.UPDATE_USER_CONFLICT);
            }
            const userDto = (0, userMapper_1.toUserDetailDto)(updatedUser);
            this._logger.info('user updated', {
                ...context,
                user: userDto,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.USER_MANAGEMENT_MESSAGES.USER_UPDATED, {
                user: userDto,
            });
        }
        catch (error) {
            console.error('Error updating user:', error);
            this._logger.error('Failed to edit user', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.USER_MANAGEMENT_MESSAGES.FAILED_UPDATE_USER);
        }
    }
    async deleteUser(userId) {
        const context = {
            operation: 'deleteUser',
            userId,
            timestamp: new Date().toString(),
        };
        try {
            this._logger.info('Deleting user', context);
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
            }
            if (user.isDeleted) {
                this._logger.error('User already deleted', context);
                return responseHelper_1.ResponseHelper.badRequest(constants_1.USER_MANAGEMENT_MESSAGES.USER_ALREADY_DELETED);
            }
            const deletedUser = await this._userManagementRepository.softDeleteUser(userId);
            if (!deletedUser) {
                this._logger.error('Failed to delete user', context);
                return responseHelper_1.ResponseHelper.conflict(constants_1.USER_MANAGEMENT_MESSAGES.DELETE_CONFLICT);
            }
            const userDto = (0, userMapper_1.toUserDetailDto)(deletedUser);
            this._logger.info('User deleted', {
                ...context,
                user: userDto,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.USER_MANAGEMENT_MESSAGES.USER_DELETED, {
                user: userDto,
            });
        }
        catch (error) {
            console.error('Error deleting user:', error);
            this._logger.error('Failed to delete user', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.USER_MANAGEMENT_MESSAGES.FAILED_DELETE_USER);
        }
    }
    async getUserStats() {
        const context = {
            operation: 'getUserStats',
            timestamp: new Date().toString(),
        };
        try {
            this._logger.info('Fetchning user stats', context);
            const stats = await this._userManagementRepository.getUserStats();
            const statsDto = (0, userMapper_1.toUserStatsDto)(stats);
            this._logger.info('User stats retriened', {
                ...context,
                stats: statsDto,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.USER_MANAGEMENT_MESSAGES.USER_STATS_RETRIEVED, {
                stats: statsDto,
            });
        }
        catch (error) {
            console.error('Error fetching user stats:', error);
            this._logger.error('Failed to get user sttas', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.USER_MANAGEMENT_MESSAGES.FAILED_FETCH_STATS);
        }
    }
    async getUserById(userId) {
        const context = {
            operation: 'getUserById',
            userId,
        };
        try {
            this._logger.info('Fetching user by id', context);
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
            }
            if (user.isDeleted) {
                this._logger.warn('User has been deleted', context);
                return responseHelper_1.ResponseHelper.forbidden(constants_1.USER_MANAGEMENT_MESSAGES.CANNOT_ACCESS_DELETED_USER);
            }
            // Get user addresses
            const userAddresses = await this._userManagementRepository.findUserAddresses(userId);
            const userDto = (0, userMapper_1.toUserDetailDto)(user, userAddresses);
            this._logger.info('User retrieved', {
                ...context,
                user: userDto,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.USER_MANAGEMENT_MESSAGES.USER_RETRIEVED, {
                user: userDto,
            });
        }
        catch (error) {
            console.error('Error fetching user:', error);
            this._logger.error('Failed to get user by id', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error(constants_1.USER_MANAGEMENT_MESSAGES.FAILED_FETCH_USER);
        }
    }
    async getPublicUserById(userId) {
        const context = {
            operation: 'getPublicUserById',
            userId,
            timestamp: new Date().toString(),
        };
        try {
            this._logger.info('fetching public user by id', context);
            const user = await this._userManagementRepository.findById(userId);
            if (!user) {
                this._logger.warn('User not found', context);
                return responseHelper_1.ResponseHelper.notFound(constants_1.USER_MANAGEMENT_MESSAGES.USER_NOT_FOUND);
            }
            if (user.isDeleted) {
                this._logger.warn('User has been deleted', context);
                return responseHelper_1.ResponseHelper.forbidden(constants_1.USER_MANAGEMENT_MESSAGES.CANNOT_ACCESS_DELETED_USER);
            }
            // Get ALL user addresses
            const userAddresses = await this._userManagementRepository.findUserAddresses(userId);
            // Map addresses to the format expected by frontend
            const addresses = userAddresses.map(address => ({
                id: address._id.toString(),
                label: address.label || 'Home',
                street: address.street || '',
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                landmark: address.landmark || '',
                isDefault: address.isDefault,
                location: address.location,
                formattedAddress: address.formattedAddress || '',
                placeId: address.placeId,
                createdAt: address.createdAt,
                updatedAt: address.updatedAt,
            }));
            const defaultAddress = userAddresses.find(addr => addr.isDefault) || userAddresses[0];
            const publicUserDto = {
                _id: user._id.toString(),
                fullName: user.fullName,
                email: user.email,
                phone: user.phone || 'Not provided',
                profilePicture: user.profilePictureUrl,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
                dateOfBirth: user.dateOfBirth,
                gender: user.gender,
                defaultAddress: defaultAddress
                    ? {
                        city: defaultAddress.city,
                        state: defaultAddress.state,
                        pincode: defaultAddress.pincode,
                        landmark: defaultAddress.landmark,
                        location: defaultAddress.location,
                    }
                    : undefined,
                wallet: user.wallet || { balance: 0 },
                status: user.status || 'Active',
                role: user.roles?.[0] || 'user',
                addresses: addresses, // All addresses array
            };
            this._logger.info('User retrieved', {
                ...context,
                user: publicUserDto,
            });
            return responseHelper_1.ResponseHelper.success(constants_1.USER_MANAGEMENT_MESSAGES.USER_RETRIEVED, {
                user: publicUserDto,
            });
        }
        catch (error) {
            console.error('Error fetching public user:', error);
            this._logger.error('Failed to get public user', {
                ...context,
                error: error,
                stack: error instanceof Error ? error.stack : undefined,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch user');
        }
    }
}
exports.UserManagementService = UserManagementService;
