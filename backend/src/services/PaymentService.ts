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

export class PaymentService {
  private _logger: ILogger;
  private _paymentRepository: IPaymentRepository;
  private _walletRepository: IWalletRepository;
  private _bookingRepository: IBookingRepository;

  constructor(
    paymentRepository: IPaymentRepository,
    logger: ILogger,
    walletRepository: IWalletRepository,
    bookingRepository: IBookingRepository
  ) {
    this._logger = logger;
    this._paymentRepository = paymentRepository;
    this._walletRepository = walletRepository;
    this._bookingRepository = bookingRepository;
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
}
