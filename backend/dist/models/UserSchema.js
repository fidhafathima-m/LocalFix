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
const mongoose_1 = __importStar(require("mongoose"));
const UserSchema = new mongoose_1.Schema({
    fullName: { type: String, required: true },
    email: {
        type: String,
        sparse: true,
    },
    phone: {
        type: String,
        sparse: true,
    },
    passwordHash: { type: String },
    profilePictureUrl: { type: String },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other", "Prefer not to say"],
    },
    dateOfBirth: { type: String },
    isVerified: { type: Boolean, default: false },
    roles: {
        type: [String],
        enum: ["user", "serviceProvider", "admin"],
        default: ["user"],
    },
    status: {
        type: String,
        enum: ["Active", "Inactive", "Blocked"],
        default: "Active",
    },
    isDeleted: { type: Boolean, default: false },
    wallet: {
        balance: { type: Number, default: 0 },
        transactions: [
            {
                txId: { type: String, required: true },
                type: { type: String, enum: ["credit", "debit"], required: true },
                amount: { type: Number, required: true },
                balanceAfter: { type: Number, required: true },
                description: { type: String },
                createdAt: { type: Date, default: Date.now },
            },
        ],
    },
    applicationStatus: {
        type: String,
        enum: [
            "not-applied",
            "draft",
            "submitted",
            "under_review",
            "approved",
            "rejected",
        ],
        default: "not-applied",
    },
    applicationDate: { type: Date },
    approvalDate: { type: Date },
    rejectionReason: { type: String },
    refreshTokens: [
        {
            token: { type: String, required: true },
            createdAt: { type: Date, default: Date.now },
        },
    ],
    bankAccounts: [
        {
            accountNumber: { type: String, required: true },
            accountHolderName: { type: String, required: true },
            bankName: { type: String, required: true },
            ifscCode: { type: String, required: true },
            isDefault: { type: Boolean, default: false },
            isVerified: { type: Boolean, default: false },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now },
        },
    ],
}, { timestamps: true });
UserSchema.index({ phone: 1 }, {
    sparse: true,
    unique: true,
    partialFilterExpression: { phone: { $exists: true, $ne: null } },
});
UserSchema.index({ email: 1 }, {
    sparse: true,
    unique: true,
    partialFilterExpression: { email: { $exists: true, $ne: null } },
});
// Compound index for email/phone + role queries
UserSchema.index({ email: 1, roles: 1 });
UserSchema.index({ phone: 1, roles: 1 });
exports.default = mongoose_1.default.model("User", UserSchema);
