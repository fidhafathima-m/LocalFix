import { Schema, model } from "mongoose";
import { ICategory } from "../../interfaces/admin/ICategoryManagement";

const categorySchema = new Schema<ICategory>(
  {
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [100, "Category name cannot exceed 100 characters"],
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
      required: [true, "Category description is required"],
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },
    iconUrl: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create text index for search
categorySchema.index({ name: "text", description: "text" });

// Create unique index for slug
categorySchema.index({ slug: 1 }, { unique: true });

export const Category = model<ICategory>("Category", categorySchema);
