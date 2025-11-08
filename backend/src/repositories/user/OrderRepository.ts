import { IOrderRepository } from "../../interfaces/repository/user/IOrderRepository";
import Order from "../../models/OrderSchema";
import Booking, { isAddressPopulated } from "../../models/BookingSchema";
import { Types } from "mongoose";
import { IOrder, IOrderPopulated } from "@/interfaces/user/IOrder";
import UserAddressSchema from "@/models/UserAddressSchema";
import { ITechnician } from "../../interfaces/technician/ITechnician";
import { IUser } from "../../interfaces/user/IUser";

export class OrderRepository implements IOrderRepository {
  async createFromBooking(
    bookingId: string,
    paymentData: any
  ): Promise<IOrder | null> {
    try {
      // Find the booking with proper population
      const booking = await Booking.findById(bookingId)
        .populate("userId")
        .populate("technicianId")
        .populate("addressId")
        .exec();

      if (!booking) {
        throw new Error("Booking not found");
      }

      // Get address details
      const address = booking.addressId;

      // Check if address is properly populated
      if (!isAddressPopulated(address)) {
        console.error("Address not properly populated:", address);
        throw new Error("Address details not found or not populated");
      }

      // Generate order code manually
      const orderCount = await Order.countDocuments();
      const orderCode = `ORD${String(orderCount + 1).padStart(6, "0")}`;

      const userId = booking.userId._id || booking.userId;

      // Create order data
      const orderData = {
        orderCode: orderCode,
        bookingId: new Types.ObjectId(bookingId),
        userId: userId,
        technicianId: booking.technicianId._id,
        serviceName: booking.serviceName,
        problemDescription: booking.notes,
        scheduledAt: booking.scheduledAt,
        timeSlot: booking.timeSlot,
        address: {
          label: address.label,
          street: address.street,
          city: address.city,
          state: address.state,
          pincode: address.pincode,
          landmark: address.landmark,
        },
        payment: {
          method: paymentData.method,
          amount: paymentData.amount,
          status: paymentData.status,
          transactionId: paymentData.transactionId,
          paidAt: paymentData.paidAt,
        },
        totalAmount: paymentData.amount,
        orderItems: [],
        status: paymentData.method === "cod" ? "confirmed" : "pending",
        history: [
          {
            status: paymentData.method === "cod" ? "confirmed" : "pending",
            description:
              paymentData.method === "cod"
                ? "Order confirmed with cash on delivery"
                : "Order created with online payment",
            updatedBy: "system",
            timestamp: new Date(),
          },
        ],
      };

      const order = new Order(orderData);
      const savedOrder = await order.save();

      return savedOrder;
    } catch (error) {
      console.error("Error creating order from booking:", error);
      return null;
    }
  }

  async findById(orderId: string): Promise<IOrder | null> {
    return await Order.findById(orderId)
      .populate("userId", "fullName email phone")
      .populate(
        "technicianId",
        "displayName profilePictureUrl averageRating ratingCount services skills"
      )
      .exec();
  }

  async findByUserId(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: IOrder[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ userId: new Types.ObjectId(userId) })
        .populate(
          "technicianId",
          "displayName profilePictureUrl averageRating ratingCount services skills"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Order.countDocuments({ userId: new Types.ObjectId(userId) }),
    ]);

    return { orders, total };
  }

  async updateStatus(
    orderId: string,
    status: string,
    updatedBy: string,
    reason?: string
  ): Promise<IOrder | null> {
    const order = await Order.findById(orderId);
    if (!order) return null;

    // Add to history
    const description = reason
      ? `Status updated to ${status}: ${reason}`
      : `Status updated to ${status}`;

    order.history.push({
      status,
      description,
      updatedBy: updatedBy as "user" | "technician" | "system",
      timestamp: new Date(),
    });

    order.status = status as any;

    // Handle cancellation
    if (status === "cancelled" && reason) {
      order.cancellation = {
        reason,
        cancelledBy: updatedBy as "user" | "technician" | "admin",
        cancelledAt: new Date(),
        refundAmount: order.payment.method === "online" ? order.totalAmount : 0,
      };

      // Update payment status for refund
      if (order.payment.method === "online") {
        order.payment.status = "refunded";
      }
    }

    return await order.save();
  }

  async addOrderItem(orderId: string, itemData: any): Promise<IOrder | null> {
    const order = await Order.findById(orderId);
    if (!order) return null;

    order.orderItems.push({
      ...itemData,
      _id: new Types.ObjectId(),
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Recalculate total amount
    order.totalAmount = order.orderItems.reduce(
      (total, item) => total + item.totalPrice,
      0
    );

    return await order.save();
  }
  async findByTechnicianId(
    technicianId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{ orders: IOrder[]; total: number }> {
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      Order.find({ technicianId: new Types.ObjectId(technicianId) })
        .populate("userId", "fullName email phone")
        .populate(
          "technicianId",
          "displayName profilePictureUrl averageRating ratingCount services skills"
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Order.countDocuments({ technicianId: new Types.ObjectId(technicianId) }),
    ]);

    return { orders, total };
  }

  async getTechnicianStats(technicianId: string): Promise<{
    totalOrders: number;
    pendingOrders: number;
    inProgressOrders: number;
    completedOrders: number;
    monthlyEarnings: number;
  }> {
    const technicianObjectId = new Types.ObjectId(technicianId);
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    const [
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      monthlyEarningsResult,
    ] = await Promise.all([
      // Total orders
      Order.countDocuments({ technicianId: technicianObjectId }),

      // Pending orders
      Order.countDocuments({
        technicianId: technicianObjectId,
        status: "pending",
      }),

      // In progress orders
      Order.countDocuments({
        technicianId: technicianObjectId,
        status: "in_progress",
      }),

      // Completed orders
      Order.countDocuments({
        technicianId: technicianObjectId,
        status: "completed",
      }),

      // Monthly earnings (only from completed orders)
      Order.aggregate([
        {
          $match: {
            technicianId: technicianObjectId,
            status: "completed",
            createdAt: { $gte: startOfMonth, $lte: endOfMonth },
          },
        },
        {
          $group: {
            _id: null,
            totalEarnings: { $sum: "$totalAmount" },
          },
        },
      ]),
    ]);

    const monthlyEarnings =
      monthlyEarningsResult.length > 0
        ? monthlyEarningsResult[0].totalEarnings
        : 0;

    return {
      totalOrders,
      pendingOrders,
      inProgressOrders,
      completedOrders,
      monthlyEarnings,
    };
  }
  // In your OrderRepository.ts file
  // In your OrderRepository.ts file
  async rescheduleOrder(
    orderId: string,
    newDate: string,
    newTimeSlot: string,
    updatedBy: string // This should be "user", "technician", or "system"
  ): Promise<IOrder | null> {
    try {
      const order = await Order.findById(orderId);
      if (!order) return null;

      // Store old values for history
      const oldScheduledAt = order.scheduledAt;
      const oldTimeSlot = order.timeSlot;

      // Update order with new schedule
      order.scheduledAt = new Date(newDate);
      order.timeSlot = newTimeSlot;

      // Add to history - FIX: Use proper enum value
      order.history.push({
        status: order.status,
        description: `Order rescheduled from ${oldScheduledAt.toLocaleDateString()} ${oldTimeSlot} to ${new Date(
          newDate
        ).toLocaleDateString()} ${newTimeSlot}`,
        updatedBy: "user" as "user" | "technician" | "system", // FIX: Use enum value, not user ID
        timestamp: new Date(),
      });

      // Update reschedule info - store the actual user ID here
      order.rescheduleInfo = {
        rescheduledAt: new Date(),
        rescheduledBy: updatedBy, // This can store the user ID
        previousScheduledAt: oldScheduledAt,
        previousTimeSlot: oldTimeSlot,
        rescheduleCount: (order.rescheduleInfo?.rescheduleCount || 0) + 1,
      };

      const savedOrder = await order.save();

      // Update the associated booking if it exists
      await this.updateBookingSchedule(
        order.bookingId.toString(),
        newDate,
        newTimeSlot
      );

      return savedOrder;
    } catch (error) {
      console.error("Error rescheduling order:", error);
      return null;
    }
  }

  private async updateBookingSchedule(
    bookingId: string,
    newDate: string,
    newTimeSlot: string
  ): Promise<void> {
    try {
      await Booking.findByIdAndUpdate(bookingId, {
        scheduledAt: new Date(newDate),
        timeSlot: newTimeSlot,
        updatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error updating booking schedule:", error);
      // Don't throw error here as order reschedule should still succeed
    }
  }

  // In your OrderRepository.ts file
  async findConflictingOrders(
    technicianId: string,
    date: string,
    timeSlot: string,
    excludeOrderId?: string // Add this parameter to exclude current order
  ): Promise<IOrder[]> {
    try {
      const scheduledAt = new Date(date);

      // Build query
      const query: any = {
        technicianId: new Types.ObjectId(technicianId),
        scheduledAt: {
          $gte: new Date(scheduledAt.setHours(0, 0, 0, 0)),
          $lt: new Date(scheduledAt.setHours(23, 59, 59, 999)),
        },
        timeSlot: timeSlot,
        status: { $in: ["pending", "confirmed", "accepted", "in_progress"] },
      };

      // Exclude current order if provided
      if (excludeOrderId) {
        query._id = { $ne: new Types.ObjectId(excludeOrderId) };
      }

      return await Order.find(query).exec();
    } catch (error) {
      console.error("Error finding conflicting orders:", error);
      return [];
    }
  }
  // In OrderRepository.ts
  async findByBookingId(bookingId: string): Promise<IOrderPopulated | null> {
    return await Order.findOne({ bookingId: new Types.ObjectId(bookingId) })
      .populate<{ technicianId: ITechnician }>(
        "technicianId",
        "displayName profilePictureUrl averageRating ratingCount services skills phone"
      )
      .populate<{ userId: IUser }>("userId", "fullName email phone")
      .exec();
  }
}
