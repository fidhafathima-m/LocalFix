// repositories/user/OrderRepository.ts
import { IOrderRepository } from "../../interfaces/repository/user/IOrderRepository";
import Order from "../../models/OrderSchema";
import Booking, { isAddressPopulated } from "../../models/BookingSchema";
import { Types } from "mongoose";
import { IOrder } from "@/interfaces/user/IOrder";
import UserAddressSchema from "@/models/UserAddressSchema";

export class OrderRepository implements IOrderRepository {
  // In your OrderRepository - createFromBooking method
async createFromBooking(bookingId: string, paymentData: any): Promise<IOrder | null> {
  try {
    console.log('Starting createFromBooking with bookingId:', bookingId);

    // Find the booking with proper population
    const booking = await Booking.findById(bookingId)
      .populate('userId')
      .populate('technicianId')
      .populate('addressId')
      .exec();

    if (!booking) {
      throw new Error("Booking not found");
    }

    // DEBUG: Check the booking user ID
    console.log('Booking user ID:', booking.userId?._id?.toString());
    console.log('Booking user ID type:', typeof booking.userId);
    console.log('Booking user ID value:', booking.userId);

    // Get address details
    const address = booking.addressId;

    // Check if address is properly populated
    if (!isAddressPopulated(address)) {
      console.error('Address not properly populated:', address);
      throw new Error("Address details not found or not populated");
    }

    // Generate order code manually
    const orderCount = await Order.countDocuments();
    const orderCode = `ORD${String(orderCount + 1).padStart(6, '0')}`;

    // Make sure we're using the correct user ID from the booking
    const userId = booking.userId._id || booking.userId;
    console.log('Final user ID to be used for order:', userId);

    // Create order data
    const orderData = {
      orderCode: orderCode,
      bookingId: new Types.ObjectId(bookingId),
      userId: userId, // This should be the booking's user ID
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
      status: paymentData.method === 'cod' ? 'confirmed' : 'pending',
      history: [{
        status: paymentData.method === 'cod' ? 'confirmed' : 'pending',
        description: paymentData.method === 'cod' 
          ? 'Order confirmed with cash on delivery' 
          : 'Order created with online payment',
        updatedBy: 'system',
        timestamp: new Date(),
      }],
    };

    console.log('Order data with userId:', orderData.userId);

    const order = new Order(orderData);
    const savedOrder = await order.save();
    
    console.log('Order saved with ID:', savedOrder._id);
    console.log('Order user ID after save:', savedOrder.userId);
    
    return savedOrder;
  } catch (error) {
    console.error("Error creating order from booking:", error);
    return null;
  }
}


  async findById(orderId: string): Promise<IOrder | null> {
    return await Order.findById(orderId)
      .populate('userId', 'fullName email phone')
      .populate('technicianId', 'displayName profilePictureUrl averageRating ratingCount services skills')
      .exec();
  }

  async findByUserId(userId: string, page: number = 1, limit: number = 10): Promise<{ orders: IOrder[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [orders, total] = await Promise.all([
      Order.find({ userId: new Types.ObjectId(userId) })
        .populate('technicianId', 'displayName profilePictureUrl averageRating ratingCount services skills')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      Order.countDocuments({ userId: new Types.ObjectId(userId) })
    ]);

    return { orders, total };
  }

  async updateStatus(orderId: string, status: string, updatedBy: string, reason?: string): Promise<IOrder | null> {
    const order = await Order.findById(orderId);
    if (!order) return null;

    // Add to history
    const description = reason 
      ? `Status updated to ${status}: ${reason}`
      : `Status updated to ${status}`;

    order.history.push({
      status,
      description,
      updatedBy: updatedBy as 'user' | 'technician' | 'system',
      timestamp: new Date(),
    });

    order.status = status as any;
    
    // Handle cancellation
    if (status === 'cancelled' && reason) {
      order.cancellation = {
        reason,
        cancelledBy: updatedBy as 'user' | 'technician' | 'admin',
        cancelledAt: new Date(),
        refundAmount: order.payment.method === 'online' ? order.totalAmount : 0,
      };
      
      // Update payment status for refund
      if (order.payment.method === 'online') {
        order.payment.status = 'refunded';
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
    order.totalAmount = order.orderItems.reduce((total, item) => total + item.totalPrice, 0);

    return await order.save();
  }
}