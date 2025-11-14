import mongoose, { Schema, Document, Types } from "mongoose";
import { INotification } from "../interfaces/notification/INotification";

export interface INotificationDocument
  extends Omit<INotification, "_id">,
    Document {
  _id: Types.ObjectId;
}

const NotificationSchema = new Schema<INotificationDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      refPath: "userType",
    },
    userType: {
      type: String,
      required: true,
      enum: ["technician", "customer", "admin"],
    },
    type: {
      type: String,
      required: true,
      enum: [
        // Customer notifications
        "booking_confirmed",
        "technician_assigned",
        "on_the_way",
        "service_in_progress",
        "service_completed",
        "booking_cancelled",
        "payment_success",
        "payment_failed",
        "reminder",
        "order_status_update",
        "review_created",

        // Technician notifications
        "application_approved",
        "new_booking",
        "rating_received",
        "order_update",

        // Common
        "system",
      ],
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      default: {},
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
  },
  {
    timestamps: true,
  },
);

NotificationSchema.index({ userId: 1, createdAt: -1 });
NotificationSchema.index({ userId: 1, isRead: 1 });

export const Notification = mongoose.model<INotificationDocument>(
  "Notification",
  NotificationSchema,
);
