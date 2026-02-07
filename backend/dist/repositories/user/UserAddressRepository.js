"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserAddressRepository = void 0;
const UserAddressSchema_1 = __importDefault(require("../../models/UserAddressSchema"));
class UserAddressRepository {
    async findByUserId(userId) {
        return await UserAddressSchema_1.default.findOne({ userId });
    }
    async findDefaultByUserId(userId) {
        return await UserAddressSchema_1.default.findOne({ userId, isDefault: true });
    }
    async create(userAddressData) {
        return await UserAddressSchema_1.default.create(userAddressData);
    }
    async updateByUserId(userId, updateData) {
        return await UserAddressSchema_1.default.findOneAndUpdate({ userId }, { $set: updateData }, { new: true, upsert: true });
    }
    async deleteByUserId(userId) {
        const result = await UserAddressSchema_1.default.deleteMany({ userId });
        return result.deletedCount > 0;
    }
}
exports.UserAddressRepository = UserAddressRepository;
