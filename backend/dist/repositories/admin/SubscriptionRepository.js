"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionRepository = void 0;
const slugify_1 = __importDefault(require("slugify"));
const SubscriptionSchema_1 = __importDefault(require("../../models/SubscriptionSchema"));
class SubscriptionRepository {
    async create(subscriptionData) {
        const slug = (0, slugify_1.default)(subscriptionData.name, {
            lower: true,
            strict: true,
            trim: true,
        });
        const subscription = new SubscriptionSchema_1.default({
            ...subscriptionData,
            slug,
        });
        return await subscription.save();
    }
    async findById(subscriptionId) {
        return await SubscriptionSchema_1.default.findById(subscriptionId);
    }
    async findBySlug(slug) {
        return await SubscriptionSchema_1.default.findOne({ slug });
    }
    async findByName(name) {
        return await SubscriptionSchema_1.default.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
        });
    }
    async findAll(filter = {}, skip = 0, limit = 10) {
        return await SubscriptionSchema_1.default.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }
    async update(subscriptionId, updateData) {
        if (updateData.name) {
            updateData.slug = (0, slugify_1.default)(updateData.name, {
                lower: true,
                strict: true,
                trim: true,
            });
        }
        return await SubscriptionSchema_1.default.findByIdAndUpdate(subscriptionId, { $set: updateData }, { new: true, runValidators: true });
    }
    async delete(subscriptionId) {
        const result = await SubscriptionSchema_1.default.findByIdAndDelete(subscriptionId);
        return result !== null;
    }
    async count(filter = {}) {
        return await SubscriptionSchema_1.default.countDocuments(filter);
    }
    async search(query, limit = 10) {
        return await SubscriptionSchema_1.default.find({
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ],
        })
            .limit(limit)
            .sort({ createdAt: -1 });
    }
}
exports.SubscriptionRepository = SubscriptionRepository;
