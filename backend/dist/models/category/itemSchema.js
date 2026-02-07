"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Item = void 0;
const mongoose_1 = require("mongoose");
const itemSchema = new mongoose_1.Schema({
    serviceId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Service",
        required: [true, "Service ID is required"],
    },
    name: {
        type: String,
        required: [true, "Item name is required"],
        trim: true,
        maxlength: [100, "Item name cannot exceed 100 characters"],
    },
    description: {
        type: String,
        required: [true, "Item description is required"],
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
    },
    sku: {
        type: String,
        required: [true, "SKU is required"],
        unique: true,
        uppercase: true,
        trim: true,
    },
    price: {
        type: Number,
        required: [true, "Price is required"],
        min: [0, "Price must be a positive number"],
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Create text index for search
itemSchema.index({ name: "text", description: "text" });
// Create unique index for sku
itemSchema.index({ sku: 1 }, { unique: true });
// Index for serviceId for faster queries
itemSchema.index({ serviceId: 1 });
// Compound index for service and active status
itemSchema.index({ serviceId: 1, isActive: 1 });
exports.Item = (0, mongoose_1.model)("Item", itemSchema);
