"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddressRepository = void 0;
const UserAddressSchema_1 = __importDefault(require("../../models/UserAddressSchema"));
const mongoose_1 = require("mongoose");
class AddressRepository {
    async findByUserId(userId) {
        return await UserAddressSchema_1.default.find({ userId: new mongoose_1.Types.ObjectId(userId) })
            .sort({ isDefault: -1, createdAt: -1 })
            .exec();
    }
    async findByIdAndUserId(addressId, userId) {
        return await UserAddressSchema_1.default.findOne({
            _id: new mongoose_1.Types.ObjectId(addressId),
            userId: new mongoose_1.Types.ObjectId(userId),
        }).exec();
    }
    async create(addressData) {
        try {
            const address = new UserAddressSchema_1.default(addressData);
            const savedAddress = await address.save();
            return savedAddress;
        }
        catch (error) {
            console.error("[AddressRepository] Error saving address:", error);
            throw error;
        }
    }
    async update(addressId, updateData) {
        return await UserAddressSchema_1.default.findByIdAndUpdate(new mongoose_1.Types.ObjectId(addressId), { $set: updateData }, { new: true }).exec();
    }
    async delete(addressId) {
        const result = await UserAddressSchema_1.default.findByIdAndDelete(new mongoose_1.Types.ObjectId(addressId)).exec();
        return result !== null;
    }
    async unsetAllDefaults(userId) {
        await UserAddressSchema_1.default.updateMany({ userId: new mongoose_1.Types.ObjectId(userId), isDefault: true }, { $set: { isDefault: false } }).exec();
    }
    async findDefaultAddress(userId) {
        return await UserAddressSchema_1.default.findOne({
            userId: new mongoose_1.Types.ObjectId(userId),
            isDefault: true,
        }).exec();
    }
}
exports.AddressRepository = AddressRepository;
