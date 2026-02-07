"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoles = exports.UserStatus = exports.USER_FILTERS = exports.STATS_CATEGORIES = exports.VALID_STATUSES = exports.USER_MANAGEMENT_MESSAGES = void 0;
const user_1 = require("../core/user");
Object.defineProperty(exports, "UserStatus", { enumerable: true, get: function () { return user_1.UserStatus; } });
Object.defineProperty(exports, "UserRoles", { enumerable: true, get: function () { return user_1.UserRoles; } });
exports.USER_MANAGEMENT_MESSAGES = {
    // Success messages
    USERS_RETRIEVED: 'Users retrieved successfully',
    USER_STATUS_UPDATED: 'User status updated successfully',
    USER_UPDATED: 'User updated successfully',
    USER_DELETED: 'User deleted successfully',
    USER_STATS_RETRIEVED: 'User statistics retrieved successfully',
    USER_RETRIEVED: 'User retrieved successfully',
    // Error messages
    FAILED_FETCH_USERS: 'Error fetching users',
    FAILED_UPDATE_STATUS: 'Error updating user status',
    FAILED_UPDATE_USER: 'Error updating user',
    FAILED_DELETE_USER: 'Error deleting user',
    FAILED_FETCH_STATS: 'Error fetching user statistics',
    FAILED_FETCH_USER: 'Error fetching user',
    // Validation messages
    INVALID_STATUS_VALUE: 'Invalid status value',
    USER_NOT_FOUND: 'User not found',
    USER_ALREADY_DELETED: 'User is already deleted',
    CANNOT_UPDATE_DELETED_USER: 'Cannot update a deleted user',
    CANNOT_ACCESS_DELETED_USER: 'User has been deleted',
    UPDATE_CONFLICT: 'Failed to update user status',
    DELETE_CONFLICT: 'Failed to delete user',
    UPDATE_USER_CONFLICT: 'Failed to update user',
};
exports.VALID_STATUSES = [
    user_1.UserStatus.ACTIVE,
    user_1.UserStatus.INACTIVE,
    user_1.UserStatus.BLOCKED,
];
exports.STATS_CATEGORIES = {
    TOTAL_USERS: 'totalUsers',
    ACTIVE_USERS: 'activeUsers',
    INACTIVE_USERS: 'inactiveUsers',
    BLOCKED_USERS: 'blockedUsers',
    NEW_USERS_TODAY: 'newUsersToday',
    NEW_USERS_THIS_WEEK: 'newUsersThisWeek',
    NEW_USERS_THIS_MONTH: 'newUsersThisMonth',
    USER_GROWTH_RATE: 'userGrowthRate',
};
exports.USER_FILTERS = {
    STATUS: {
        ALL: 'all',
        ACTIVE: 'active',
        INACTIVE: 'inactive',
        BLOCKED: 'blocked',
    },
    ROLE: {
        ALL: 'all',
        USER: 'user',
        SERVICE_PROVIDER: 'serviceProvider',
        TECHNICIAN: 'technician',
        ADMIN: 'admin',
    },
    DATE_RANGE: {
        TODAY: 'today',
        WEEK: 'week',
        MONTH: 'month',
        YEAR: 'year',
        ALL: 'all',
    },
};
