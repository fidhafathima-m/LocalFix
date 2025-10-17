import { ITechnician } from "@/interfaces/technician/ITechnician";
import mongoose, { Schema, Document } from "mongoose";

const TechnicianSchema = new Schema<ITechnician>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String },
    displayName: { type: String, required: true },
    bio: { type: String },
    experienceYears: { type: Number, default: 0 },
    services: [{ type: String }],
    serviceRates: { type: Schema.Types.Mixed },
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

    paymentDetails: {
      bankAccount: {
        holderName: { type: String },
        accountNumber: { type: String },
        ifscCode: { type: String },
        bankName: { type: String }
      },
      upiId: { type: String },
      withdrawalPreference: { 
        type: String, 
        enum: ['auto', 'manual'], 
        default: 'auto' 
      }
    },

    currentLocation: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [lng, lat]
        index: "2dsphere",
        default: undefined,
      },
    },

    averageRating: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    status: {
      type: String,
      enum: [
        "not-applied",
        "draft",
        "submitted",
        "under_review",
        "approved",
        "rejected",
        "suspended",
      ],
      default: "not-applied",
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
      type: Schema.Types.ObjectId,
      ref: "TechnicianApplication",
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

TechnicianSchema.index({ currentLocation: "2dsphere" });

export const Technician = mongoose.model<ITechnician>(
  "Technician",
  TechnicianSchema
);