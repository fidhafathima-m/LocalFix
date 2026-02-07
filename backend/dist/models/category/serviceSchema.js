"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Service = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../../constants");
const serviceSchema = new mongoose_1.Schema({
    categoryId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
        required: [true, "Category ID is required"],
    },
    name: {
        type: String,
        required: [true, "Service name is required"],
        trim: true,
        maxlength: [100, "Service name cannot exceed 100 characters"],
    },
    slug: {
        type: String,
        required: [true, "Slug is required"],
        unique: true,
        lowercase: true,
        trim: true,
    },
    description: {
        type: String,
        required: [true, "Service description is required"],
        trim: true,
        maxlength: [500, "Description cannot exceed 500 characters"],
    },
    avgBasePrice: {
        type: Number,
        required: [true, "Average base price is required"],
        min: [0, "Average base price must be a positive number"],
    },
    iconUrl: {
        type: String,
        default: "",
        trim: true,
    },
    rating: {
        type: Number,
        default: 4.5,
        min: [0, "Rating must be at least 0"],
        max: [5, "Rating cannot exceed 5"],
    },
    estimatedDuration: {
        type: String,
        default: "2-4 hours",
        trim: true,
    },
    features: [
        {
            type: String,
            trim: true,
        },
    ],
    popular: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: Object.values(constants_1.ServiceStatus),
        default: constants_1.ServiceStatus.ACTIVE,
    },
}, {
    timestamps: true,
});
// Create text index for search
serviceSchema.index({ name: "text", description: "text" });
// Create unique index for slug
serviceSchema.index({ slug: 1 }, { unique: true });
// Index for categoryId for faster queries
serviceSchema.index({ categoryId: 1 });
// Compound index for category and status
serviceSchema.index({ categoryId: 1, status: 1 });
// Index for popular services
serviceSchema.index({ popular: 1 });
exports.Service = (0, mongoose_1.model)("Service", serviceSchema);
