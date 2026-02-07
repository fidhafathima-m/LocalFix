"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserManagementRepository = void 0;
const mongoose_1 = require("mongoose");
const BaseRepository_1 = require("../BaseRepository");
const UserSchema_1 = __importDefault(require("../../models/UserSchema"));
const UserAddressSchema_1 = __importDefault(require("../../models/UserAddressSchema"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class UserManagementRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(UserSchema_1.default);
        this.userAddressModel = UserAddressSchema_1.default;
    }
    async findUserAddresses(userId) {
        try {
            const addresses = await UserAddressSchema_1.default.find({
                userId: new mongoose_1.Types.ObjectId(userId),
            }).exec();
            return addresses;
        }
        catch (error) {
            console.error('Error finding user addresses:', error);
            return [];
        }
    }
    async findAllUsers(search, status) {
        try {
            // Build match conditions
            const matchConditions = {
                roles: 'user',
                isDeleted: { $ne: true },
            };
            // Add status filter if provided
            if (status && status !== 'All Status' && status !== 'all') {
                matchConditions.status = status;
            }
            // Add search filter if provided
            if (search && search.trim()) {
                const searchRegex = new RegExp(search.trim(), 'i');
                matchConditions.$or = [
                    { fullName: { $regex: searchRegex } },
                    { email: { $regex: searchRegex } },
                    { phone: { $regex: searchRegex } },
                ];
            }
            const aggregationPipeline = [
                {
                    $match: matchConditions,
                },
                { $sort: { createdAt: -1 } },
                {
                    $lookup: {
                        from: 'useraddresses',
                        localField: '_id',
                        foreignField: 'userId',
                        as: 'addresses',
                    },
                },
                {
                    $addFields: {
                        defaultAddress: {
                            $first: {
                                $filter: {
                                    input: '$addresses',
                                    as: 'addr',
                                    cond: { $eq: ['$$addr.isDefault', true] },
                                },
                            },
                        },
                    },
                },
                { $project: { addresses: 0, passwordHash: 0 } },
            ];
            return await this.model.aggregate(aggregationPipeline);
        }
        catch (error) {
            console.error('Error finding users:', error);
            throw error;
        }
    }
    async updateUserStatus(userId, status) {
        return this.update(userId, { $set: { status } });
    }
    async softDeleteUser(userId) {
        return this.update(userId, { $set: { isDeleted: true } });
    }
    async getUserStats() {
        const userMatchCondition = {
            roles: 'user',
            isDeleted: { $ne: true },
        };
        const totalUsers = await this.count(userMatchCondition);
        const activeUsers = await this.count({
            ...userMatchCondition,
            status: 'Active',
        });
        const inactiveUsers = await this.count({
            ...userMatchCondition,
            status: 'Inactive',
        });
        const blockedUsers = await this.count({
            ...userMatchCondition,
            status: 'Blocked',
        });
        return { totalUsers, activeUsers, inactiveUsers, blockedUsers };
    }
    async findByEmail(email) {
        try {
            return await this.model.findOne({ email, isDeleted: { $ne: true } });
        }
        catch (error) {
            console.error('Error finding user by email:', error);
            return null;
        }
    }
    async verifyPassword(userId, password) {
        try {
            const user = await this.model.findById(userId).select('+passwordHash');
            if (!user || !user.passwordHash) {
                return false;
            }
            // Compare the provided password with the stored hash
            const isPasswordValid = await bcrypt_1.default.compare(password, user.passwordHash);
            return isPasswordValid;
        }
        catch (error) {
            console.error('Error verifying password:', error);
            return false;
        }
    }
    async updatePassword(userId, newPassword) {
        try {
            // Hash the new password
            const saltRounds = 10;
            const hashedPassword = await bcrypt_1.default.hash(newPassword, saltRounds);
            // Update the user's password
            const updatedUser = await this.model.findByIdAndUpdate(userId, {
                $set: {
                    passwordHash: hashedPassword,
                    updatedAt: new Date(),
                },
            }, { new: true });
            return updatedUser;
        }
        catch (error) {
            console.error('Error updating password:', error);
            return null;
        }
    }
}
exports.UserManagementRepository = UserManagementRepository;
