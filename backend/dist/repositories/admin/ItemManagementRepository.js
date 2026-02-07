"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemRepository = void 0;
const itemSchema_1 = require("../../models/category/itemSchema");
class ItemRepository {
    async create(itemData) {
        if (!itemData.sku) {
            itemData.sku = this.generateSKU(itemData.name);
        }
        const item = new itemSchema_1.Item(itemData);
        return await item.save();
    }
    async findById(itemId) {
        return await itemSchema_1.Item.findById(itemId);
    }
    async findBySku(sku) {
        return await itemSchema_1.Item.findOne({ sku: sku.toUpperCase() });
    }
    async findByName(name) {
        return await itemSchema_1.Item.findOne({
            name: { $regex: new RegExp(`^${name}$`, "i") },
        });
    }
    async findByServiceId(serviceId) {
        return await itemSchema_1.Item.find({ serviceId }).sort({ createdAt: -1 });
    }
    async findAll(filter = {}, skip = 0, limit = 10) {
        return await itemSchema_1.Item.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }
    async update(itemId, updateData) {
        return await itemSchema_1.Item.findByIdAndUpdate(itemId, { $set: updateData }, { new: true, runValidators: true });
    }
    async delete(itemId) {
        const result = await itemSchema_1.Item.findByIdAndDelete(itemId);
        return result !== null;
    }
    async count(filter = {}) {
        return await itemSchema_1.Item.countDocuments(filter);
    }
    async search(query, limit = 10) {
        return await itemSchema_1.Item.find({
            $or: [
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { sku: { $regex: query, $options: "i" } },
            ],
        })
            .limit(limit)
            .sort({ createdAt: -1 });
    }
    async searchByService(serviceId, query, limit = 10) {
        return await itemSchema_1.Item.find({
            serviceId,
            $or: [
                { name: { $regex: query, $options: "i" } },
                { description: { $regex: query, $options: "i" } },
                { sku: { $regex: query, $options: "i" } },
            ],
        })
            .limit(limit)
            .sort({ createdAt: -1 });
    }
    generateSKU(name) {
        const prefix = name.substring(0, 3).toUpperCase();
        const timestamp = Date.now().toString().slice(-6);
        const random = Math.random().toString(36).substring(2, 5).toUpperCase();
        return `${prefix}-${timestamp}-${random}`;
    }
}
exports.ItemRepository = ItemRepository;
