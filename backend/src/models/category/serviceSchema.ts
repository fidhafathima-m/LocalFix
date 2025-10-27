import { Schema, model } from "mongoose";
import { IService } from "../../interfaces/admin/IServiceManagement";
import { ServiceStatus } from "../../constants";

const serviceSchema = new Schema<IService>(
  {
    categoryId: {
      type: Schema.Types.ObjectId,
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
    status: {
      type: String,
      enum: Object.values(ServiceStatus),
      default: ServiceStatus.ACTIVE,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
serviceSchema.index({ name: "text", description: "text" });

// Create unique index for slug
serviceSchema.index({ slug: 1 }, { unique: true });

// Index for categoryId for faster queries
serviceSchema.index({ categoryId: 1 });

// Compound index for category and status
serviceSchema.index({ categoryId: 1, status: 1 });

export const Service = model<IService>("Service", serviceSchema);