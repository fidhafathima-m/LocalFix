import { IOrder, IOrderItem } from "@/interfaces/user/IOrder";
import mongoose, { Schema, Document, Types } from "mongoose";

const orderItemSchema = new Schema<IOrderItem>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
    },
    serviceItemId: {
      type: Schema.Types.ObjectId,
      ref: "ServiceItem",
    },
    customName: {
      type: String,
      required: true,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "Technician",
      required: true,
    },
    status: {
      type: String,
      enum: ["requested", "accepted", "approved", "rejected", "purchased"],
      default: "requested",
    },
  },
  {
    timestamps: true,
  }
);

const orderSchema = new Schema<IOrder>(
  {
    bookingId: {
      type: Schema.Types.ObjectId,
      ref: "Booking",
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    technicianId: {
      type: Schema.Types.ObjectId,
      ref: "Technician",
      required: true,
    },
    orderCode: {
      type: String,
      required: true,
      unique: true,
    },
    serviceName: {
      type: String,
      required: true,
    },
    problemDescription: {
      type: String,
    },
    scheduledAt: {
      type: Date,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    address: {
      label: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      pincode: {
        type: String,
        required: true,
      },
      landmark: {
        type: String,
      },
    },
    status: {
      type: String,
      enum: [
        "pending",
        "accepted",
        "confirmed",
        "on_the_way",
        "in_progress",
        "completed",
        "cancelled",
        "refunded",
      ],
      default: "pending",
    },
    payment: {
      method: {
        type: String,
        enum: ["online", "cod"],
        required: true,
      },
      amount: {
        type: Number,
        required: true,
        min: 0,
      },
      status: {
        type: String,
        enum: ["pending", "paid", "failed", "refunded"],
        required: true,
      },
      transactionId: {
        type: String,
      },
      paidAt: {
        type: Date,
      },
    },
    orderItems: [orderItemSchema],
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    technicianRating: {
      type: Number,
      min: 1,
      max: 5,
    },
    userReview: {
      type: String,
    },
    cancellation: {
      reason: String,
      cancelledBy: {
        type: String,
        enum: ["user", "technician", "admin"],
      },
      cancelledAt: Date,
      refundAmount: Number,
    },
    rescheduleInfo: {
      rescheduledAt: Date,
      rescheduledBy: String,
      previousScheduledAt: Date,
      previousTimeSlot: String,
      rescheduleCount: { type: Number, default: 0 },
      reason: String,
    },
    history: [
      {
        status: {
          type: String,
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        updatedBy: {
          type: String,
          enum: ["user", "technician", "system"],
          required: true,
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Generate order code
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderCode) {
    try {
      const OrderModel = mongoose.model<IOrder>("Order");
      const count = await OrderModel.countDocuments();
      this.orderCode = `ORD${String(count + 1).padStart(6, "0")}`;

      // Add initial history
      if (this.history.length === 0) {
        this.history.push({
          status: "pending",
          description: "Order created successfully",
          updatedBy: "system",
          timestamp: new Date(),
        });
      }
    } catch (error) {
      return next(error as Error);
    }
  }
  next();
});

export default mongoose.model<IOrder>("Order", orderSchema);
