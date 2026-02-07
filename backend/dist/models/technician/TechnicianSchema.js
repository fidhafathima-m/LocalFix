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
exports.Technician = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TechnicianSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true },
    phone: { type: String },
    displayName: { type: String, required: true },
    bio: { type: String },
    experienceYears: { type: Number, default: 0 },
    services: [{ type: String }],
    serviceRates: { type: mongoose_1.Schema.Types.Mixed },
    workAreas: { type: [String], default: [] },
    serviceRadiusKm: { type: Number, default: 10 },
    personalInfo: {
        fullName: { type: String },
        gender: { type: String },
        phoneNumber: { type: String },
        dateOfBirth: { type: Date },
        address: {
            street: { type: String },
            city: { type: String },
            state: { type: String },
            pincode: { type: String },
        },
        languages: { type: [String] },
    },
    identityVerification: {
        idType: {
            type: String,
            enum: ['passport', 'driving_license', 'national_id', 'aadhaar'],
            required: false,
        },
        idNumber: { type: String, required: false },
        idDocument: { type: String, required: false },
        verified: { type: Boolean, default: false },
        verificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending',
        },
        verifiedAt: { type: Date },
    },
    documents: [
        {
            _id: { type: mongoose_1.Schema.Types.ObjectId, auto: true },
            type: {
                type: String,
                enum: [
                    'idProof',
                    'addressProof',
                    'policeVerification',
                    'passportPhoto',
                    'profilePhoto',
                    'tradeLicense',
                ],
                required: true,
            },
            fileName: { type: String, required: true },
            url: { type: String, required: true },
            uploadedAt: { type: Date, default: Date.now },
            verified: { type: Boolean, default: false },
            status: {
                type: String,
                enum: ['pending', 'approved', 'rejected'],
                default: 'pending',
            },
            verifiedAt: { type: Date },
        },
    ],
    paymentDetails: {
        bankAccount: {
            holderName: { type: String },
            accountNumber: { type: String },
            ifscCode: { type: String },
            bankName: { type: String },
        },
        upiId: { type: String },
        withdrawalPreference: {
            type: String,
            enum: ['auto', 'manual'],
            default: 'auto',
        },
    },
    currentLocation: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point',
        },
        coordinates: {
            type: [Number], // [lng, lat]
            index: '2dsphere',
            default: undefined,
        },
    },
    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },
    status: {
        type: String,
        enum: [
            'not-applied',
            'draft',
            'submitted',
            'under_review',
            'approved',
            'rejected',
            'suspended',
        ],
        default: 'not-applied',
    },
    suspensionReason: {
        type: String,
        required: false,
    },
    suspendedAt: {
        type: Date,
        required: false,
    },
    rejectionReason: { type: String },
    rejectedAt: { type: Date },
    resubmittedCount: { type: Number, default: 0 },
    profilePictureUrl: { type: String },
    previousApplicationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TechnicianApplication',
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, {
    timestamps: true,
});
TechnicianSchema.index({ currentLocation: '2dsphere' });
exports.Technician = mongoose_1.default.model('Technician', TechnicianSchema);
