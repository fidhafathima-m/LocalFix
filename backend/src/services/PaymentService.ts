import { IPayment } from '../models/PaymentSchema';
import { IPaymentRepository } from '../interfaces/repository/user/IPaymentRepository';
import {
  razorpay,
  RazorpayOrderResponse,
  RazorpayPaymentResponse,
} from '../config/razorpay';
import { ResponseHelper, ApiResponse } from '../utils/responseHelper';
import { Types } from 'mongoose';
import {
  CreatePaymentRequest,
  PaymentResponseDto,
} from '@/interfaces/user/IPayment';
import { ILogger } from '@/interfaces/utils/ILogger';
import { IWalletRepository } from '../interfaces/repository/user/IWalletRepository';
import { IBookingRepository } from '../interfaces/repository/user/IBookingRepository';
import { ISparePartsRequestRepository } from '../interfaces/repository/technician/ISparePartsRequestRepository';
import { IOrderRepository } from '../interfaces/repository/user/IOrderRepository';

export class PaymentService {
  private _logger: ILogger;
  private _paymentRepository: IPaymentRepository;
  private _walletRepository: IWalletRepository;
  private _bookingRepository: IBookingRepository;
  private _sparePartsRequestRepository: ISparePartsRequestRepository;
  private _orderRepository: IOrderRepository;

  constructor(
    paymentRepository: IPaymentRepository,
    logger: ILogger,
    walletRepository: IWalletRepository,
    bookingRepository: IBookingRepository,
    sparePartRequestRepository: ISparePartsRequestRepository,
    orderRepository: IOrderRepository
  ) {
    this._logger = logger;
    this._paymentRepository = paymentRepository;
    this._walletRepository = walletRepository;
    this._bookingRepository = bookingRepository;
    this._sparePartsRequestRepository = sparePartRequestRepository;
    this._orderRepository = orderRepository;
  }

  async createPaymentOrder(
    paymentData: CreatePaymentRequest
  ): Promise<ApiResponse<PaymentResponseDto>> {
    const context = {
      operation: 'createPaymentOrder',
      data: paymentData,
    };

    try {
      this._logger.info('Creating payment order', context);

      // Create Razorpay order
      const razorpayOrder = await razorpay.orders.create({
        amount: paymentData.amount * 100, // Convert to paise
        currency: paymentData.currency || 'INR',
        receipt: `booking_${paymentData.bookingId}`,
        notes: {
          bookingId: paymentData.bookingId,
          userId: paymentData.userId,
          type: paymentData.type,
        },
      });

      this._logger.debug('Razorpay order created', {
        ...context,
        razorpayOrderId: razorpayOrder.id,
      });

      // Create payment record with proper typing
      const paymentModel: Partial<IPayment> = {
        bookingId: new Types.ObjectId(paymentData.bookingId),
        userId: new Types.ObjectId(paymentData.userId),
        paymentProvider: 'razorpay' as const,
        providerOrderId: razorpayOrder.id,
        amount: paymentData.amount,
        currency: paymentData.currency || 'INR',
        type: paymentData.type,
        sparePartId: paymentData.sparePartId
          ? new Types.ObjectId(paymentData.sparePartId)
          : undefined,
        status: 'initiated' as const,
        rawResponse: razorpayOrder,
      };

      const newPayment = await this._paymentRepository.create(paymentModel);

      if (!newPayment) {
        this._logger.error('Failed to create payment record', context);
        return ResponseHelper.error('Failed to create payment record');
      }

      this._logger.info('Payment order created successfully', {
        ...context,
        paymentId: newPayment._id?.toString(),
      });

      const paymentDto = this.mapToDto(newPayment, razorpayOrder);
      return ResponseHelper.success(
        'Payment order created successfully',
        paymentDto
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error creating payment order', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to create payment order');
    }
  }

  async verifyPayment(
    razorpayPaymentId: string,
    razorpayOrderId: string,
    razorpaySignature: string
  ): Promise<ApiResponse<any>> {
    const context = {
      operation: 'verifyPayment',
      data: { razorpayPaymentId, razorpayOrderId },
    };

    try {
      this._logger.info('Verifying payment', context);

      // Find payment record
      const payment =
        await this._paymentRepository.findByOrderId(razorpayOrderId);

      if (!payment) {
        this._logger.warn('Payment record not found', context);
        return ResponseHelper.notFound('Payment record not found');
      }

      // Verify signature
      const crypto = require('crypto');
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(razorpayOrderId + '|' + razorpayPaymentId)
        .digest('hex');

      if (expectedSignature !== razorpaySignature) {
        this._logger.warn('Invalid payment signature', context);
        return ResponseHelper.badRequest('Invalid payment signature');
      }

      // Fetch payment details from Razorpay
      const razorpayPayment = await razorpay.payments.fetch(razorpayPaymentId);

      // Update payment record
      const updatedPayment = await this._paymentRepository.update(
        payment.id.toString(),
        {
          providerPaymentId: razorpayPaymentId,
          status: razorpayPayment.status === 'captured' ? 'success' : 'failed',
          confirmedAt: new Date(),
          rawResponse: razorpayPayment,
        }
      );

      if (!updatedPayment) {
        this._logger.error('Failed to update payment record', context);
        return ResponseHelper.error('Failed to update payment record');
      }

      this._logger.info('Payment verified successfully', {
        ...context,
        status: updatedPayment.status,
      });

      return ResponseHelper.success('Payment verified successfully', {
        payment: this.mapToDto(updatedPayment),
        bookingId: payment.bookingId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error verifying payment', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to verify payment');
    }
  }

  private mapToDto(payment: IPayment, razorpayOrder?: any): PaymentResponseDto {
    return {
      _id: payment.id.toString(),
      bookingId: payment.bookingId.toString(),
      userId: payment.userId.toString(),
      paymentProvider: payment.paymentProvider,
      providerOrderId: payment.providerOrderId,
      amount: payment.amount,
      currency: payment.currency,
      type: payment.type,
      status: payment.status,
      razorpayOrder: razorpayOrder
        ? {
            id: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            key: process.env.RAZORPAY_KEY_ID!,
          }
        : undefined!,
    };
  }

  async processWalletPayment(
    userId: string,
    bookingId: string,
    amount: number
  ) {
    const context = {
      operation: 'processWalletPayment',
      userId,
      bookingId,
      amount,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Processing wallet payment', context);

      // Get booking details to access bookingCode
      const booking = await this._bookingRepository.findById(bookingId);

      if (!booking) {
        return ResponseHelper.notFound('Booking not found');
      }

      // Get user's wallet balance
      const walletBalance =
        await this._walletRepository.getWalletBalance(userId);

      if (walletBalance < amount) {
        return ResponseHelper.badRequest('Insufficient wallet balance');
      }

      // Deduct amount from wallet
      const newBalance = walletBalance - amount;
      await this._walletRepository.updateWalletBalance(userId, newBalance);

      // Add wallet transaction with bookingCode in description
      await this._walletRepository.addWalletTransaction(userId, {
        txId: `wallet_pay_${Date.now()}`,
        type: 'debit',
        amount: amount,
        balanceAfter: newBalance,
        description: `Payment for booking ${booking.bookingCode} - ${booking.serviceName}`,
        status: 'completed',
        metadata: {
          bookingId: bookingId,
          bookingCode: booking.bookingCode,
          serviceName: booking.serviceName,
          paymentType: 'service_booking',
        },
      });

      this._logger.info('Wallet payment processed successfully', {
        ...context,
        bookingCode: booking.bookingCode,
        newBalance,
      });

      return ResponseHelper.success('Wallet payment processed successfully', {
        amount,
        newBalance,
        bookingId,
        bookingCode: booking.bookingCode,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to process wallet payment', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to process wallet payment');
    }
  }

  async refundToWallet(
    userId: string,
    bookingId: string,
    amount: number,
    reason: string
  ) {
    const context = {
      operation: 'refundToWallet',
      userId,
      bookingId,
      amount,
      reason,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Processing wallet refund', context);

      // Get current balance
      const currentBalance =
        await this._walletRepository.getWalletBalance(userId);
      const newBalance = currentBalance + amount;

      // Update wallet balance
      await this._walletRepository.updateWalletBalance(userId, newBalance);

      // Add refund transaction
      await this._walletRepository.addWalletTransaction(userId, {
        txId: `refund_${Date.now()}`,
        type: 'credit',
        amount: amount,
        balanceAfter: newBalance,
        description: `Refund for booking ${bookingId} - ${reason}`,
        status: 'completed',
        metadata: {
          bookingId: bookingId,
          refundReason: reason,
          type: 'refund',
        },
      });

      this._logger.info('Wallet refund processed successfully', {
        ...context,
        newBalance,
      });

      return ResponseHelper.success('Refund processed successfully', {
        amount,
        newBalance,
        bookingId,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to process wallet refund', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to process wallet refund');
    }
  }

  async processSparePartsWalletPayment(
    userId: string,
    orderId: string,
    requestId: string,
    amount: number
  ): Promise<ApiResponse<any>> {
    const context = {
      operation: 'processSparePartsWalletPayment',
      userId,
      orderId,
      requestId,
      amount,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Processing spare parts wallet payment', context);

      // Validate spare parts request exists and belongs to user
      const sparePartsRequest =
        await this._sparePartsRequestRepository.findById(requestId);

      if (!sparePartsRequest) {
        this._logger.warn('Spare parts request not found', context);
        return ResponseHelper.notFound('Spare parts request not found');
      }

      // Debug: Check what sparePartsRequest.orderId contains
      this._logger.info('Spare parts request orderId structure:', {
        requestOrderId: sparePartsRequest.orderId,
        requestOrderIdType: typeof sparePartsRequest.orderId,
        isObject: typeof sparePartsRequest.orderId === 'object',
        isString: typeof sparePartsRequest.orderId === 'string',
      });

      // Safe order ID extraction from spare parts request
      let requestOrderId: string;

      if (
        sparePartsRequest.orderId &&
        typeof sparePartsRequest.orderId === 'object'
      ) {
        // If orderId is a populated object, get the _id from it
        const orderObj = sparePartsRequest.orderId as Record<string, any>;
        requestOrderId = orderObj._id?.toString() || orderObj.id?.toString();
      } else if (sparePartsRequest.orderId) {
        // If orderId is already a string, ObjectId, or other primitive
        requestOrderId = String(sparePartsRequest.orderId);
      } else {
        this._logger.warn('No orderId found in spare parts request', context);
        return ResponseHelper.badRequest(
          'Invalid order data in spare parts request'
        );
      }

      // Verify the order belongs to the user
      const order = await this._orderRepository.findById(orderId);
      if (!order) {
        this._logger.warn('Order not found', context);
        return ResponseHelper.notFound('Order not found');
      }

      // Safe user ID extraction from order
      let orderUserId: string;

      if (order.userId && typeof order.userId === 'object') {
        // If userId is a populated object, get the _id from it
        const userObj = order.userId as Record<string, any>;
        orderUserId = userObj._id?.toString() || userObj.id?.toString();
      } else if (order.userId) {
        // If userId is already a string, ObjectId, or other primitive
        orderUserId = String(order.userId);
      } else {
        this._logger.warn('No userId found in order', context);
        return ResponseHelper.badRequest('Invalid order user data');
      }

      // Validate we got valid IDs
      if (!orderUserId) {
        this._logger.warn('Could not extract valid user ID from order', {
          ...context,
          extractedUserId: orderUserId,
        });
        return ResponseHelper.badRequest('Invalid user data in order');
      }

      if (!requestOrderId) {
        this._logger.warn(
          'Could not extract valid order ID from spare parts request',
          {
            ...context,
            extractedOrderId: requestOrderId,
          }
        );
        return ResponseHelper.badRequest(
          'Invalid order data in spare parts request'
        );
      }

      // Check if order belongs to the user
      if (orderUserId !== userId) {
        this._logger.warn('User not authorized for this order', {
          ...context,
          orderUserId,
          currentUserId: userId,
        });
        return ResponseHelper.unauthorized('Not authorized for this order');
      }

      // Check if spare parts request belongs to the order
      if (requestOrderId !== orderId) {
        this._logger.warn('Spare parts request does not belong to order', {
          ...context,
          requestOrderId,
          expectedOrderId: orderId,
        });
        return ResponseHelper.badRequest(
          'Invalid spare parts request for this order'
        );
      }

      // Check if request is still pending
      if (sparePartsRequest.status !== 'pending') {
        this._logger.warn('Spare parts request already processed', {
          ...context,
          currentStatus: sparePartsRequest.status,
        });
        return ResponseHelper.badRequest(
          'Spare parts request already processed'
        );
      }

      // Verify amount matches
      if (sparePartsRequest.totalAmount !== amount) {
        this._logger.warn('Amount mismatch', {
          ...context,
          expectedAmount: sparePartsRequest.totalAmount,
          providedAmount: amount,
        });
        return ResponseHelper.badRequest(
          'Amount does not match spare parts request'
        );
      }

      // Get user's wallet balance
      const walletBalance =
        await this._walletRepository.getWalletBalance(userId);

      if (walletBalance < amount) {
        this._logger.warn('Insufficient wallet balance', {
          ...context,
          walletBalance,
          requiredAmount: amount,
        });
        return ResponseHelper.badRequest('Insufficient wallet balance');
      }

      // Deduct amount from wallet
      const newBalance = walletBalance - amount;
      await this._walletRepository.updateWalletBalance(userId, newBalance);

      // Add wallet transaction for spare parts payment
      await this._walletRepository.addWalletTransaction(userId, {
        txId: `spare_parts_${Date.now()}`,
        type: 'debit',
        amount: amount,
        balanceAfter: newBalance,
        description: `Payment for spare parts - Order ${order.orderCode}`,
        status: 'completed',
        metadata: {
          orderId: orderId,
          requestId: requestId,
          orderCode: order.orderCode,
          serviceName: order.serviceName,
          paymentType: 'spare_parts',
          itemsCount: sparePartsRequest.items.length,
          totalAmount: amount,
        },
      });

      // Create payment record for spare parts
      const paymentModel: Partial<IPayment> = {
        orderId: new Types.ObjectId(orderId),
        userId: new Types.ObjectId(userId),
        paymentProvider: 'wallet' as const,
        providerOrderId: `spare_parts_${requestId}_${Date.now()}`,
        amount: amount,
        currency: 'INR',
        type: 'spare_part' as const,
        sparePartId: new Types.ObjectId(requestId),
        status: 'success' as const,
        confirmedAt: new Date(),
        rawResponse: {
          paymentType: 'wallet',
          sparePartsRequestId: requestId,
          items: sparePartsRequest.items,
        },
      };

      await this._paymentRepository.create(paymentModel);

      // Update spare parts request status to approved
      await this._sparePartsRequestRepository.updateStatus(
        requestId,
        'approved',
        'Wallet payment completed successfully'
      );

      this._logger.info('Spare parts wallet payment processed successfully', {
        ...context,
        newBalance,
        itemsCount: sparePartsRequest.items.length,
      });

      return ResponseHelper.success(
        'Spare parts payment processed successfully',
        {
          amount,
          newBalance,
          orderId,
          requestId,
          orderCode: order.orderCode,
          itemsCount: sparePartsRequest.items.length,
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to process spare parts wallet payment', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error(
        'Failed to process spare parts wallet payment'
      );
    }
  }
}
