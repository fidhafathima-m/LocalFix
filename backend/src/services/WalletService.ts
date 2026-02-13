import {
  IWalletService,
  AddMoneyRequest,
  WithdrawMoneyRequest,
  BankAccountData,
} from '../interfaces/services/user/IWalletService';
import { IWalletRepository } from '../interfaces/repository/user/IWalletRepository';
import { ILogger } from '../interfaces/utils/ILogger';
import { ResponseHelper } from '../utils/responseHelper';
import {
  toWalletTransactionDtoList,
  toBankAccountDtoList,
} from '../mappers/walletMapper';
import crypto from 'crypto';
import Razorpay from 'razorpay';
import BookingSchema from '../models/BookingSchema';
import { Types } from 'mongoose';

export class WalletService implements IWalletService {
  private _logger: ILogger;
  private _walletRepository: IWalletRepository;
  private razorpay: Razorpay;

  constructor(walletRepository: IWalletRepository, logger: ILogger) {
    this._logger = logger;
    this._walletRepository = walletRepository;

    // Initialize Razorpay with your existing credentials
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });
  }

  async getWalletBalance(userId: string) {
    const context = {
      operation: 'getWalletBalance',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching wallet balance', context);

      const balance = await this._walletRepository.getWalletBalance(userId);

      this._logger.info('Wallet balance retrieved successfully', {
        ...context,
        balance,
      });

      return ResponseHelper.success('Wallet balance retrieved successfully', {
        balance,
        currency: 'INR',
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch wallet balance', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to fetch wallet balance');
    }
  }

  async createAddMoneyOrder(userId: string, amountData: AddMoneyRequest) {
    const context = {
      operation: 'createAddMoneyOrder',
      userId,
      amount: amountData.amount,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Creating add money order', context);

      // Convert to paise (Razorpay works in paise)
      const amountInPaise = Math.round(amountData.amount * 100);

      if (amountInPaise < 100) {
        // Minimum ₹1 (100 paise)
        return ResponseHelper.badRequest('Minimum amount is ₹1');
      }

      if (amountInPaise > 10000000) {
        // Maximum ₹100,000 (10,000,000 paise)
        return ResponseHelper.badRequest('Maximum amount is ₹100,000');
      }

      const receipt = `w_${Date.now()}`;

      // Create Razorpay order
      const orderOptions = {
        amount: amountInPaise,
        currency: amountData.currency || 'INR',
        receipt: receipt,
        notes: {
          userId: userId,
          type: 'wallet_topup',
          description: 'Wallet top-up',
        },
        payment_capture: 1, // Auto capture payment
      };

      const razorpayOrder = await this.razorpay.orders.create(orderOptions);

      const orderData = {
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        key: process.env.RAZORPAY_KEY_ID!,
      };

      this._logger.info('Add money order created successfully', {
        ...context,
        orderId: razorpayOrder.id,
        amount: razorpayOrder.amount,
        receipt: receipt, // Log the receipt used
      });

      return ResponseHelper.success('Order created successfully', orderData);
    } catch (error: any) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to create add money order', {
        ...context,
        error: errorMessage,
        razorpayError: error.error?.description,
      });

      // Handle specific Razorpay errors
      if (error.error?.code === 'BAD_REQUEST_ERROR') {
        return ResponseHelper.badRequest(
          error.error.description || 'Invalid amount or currency'
        );
      }

      return ResponseHelper.error('Failed to create order');
    }
  }

  async verifyAddMoneyPayment(userId: string, paymentData: any) {
    const context = {
      operation: 'verifyAddMoneyPayment',
      userId,
      orderId: paymentData.razorpay_order_id,
      paymentId: paymentData.razorpay_payment_id,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Verifying add money payment', context);

      // Verify Razorpay signature
      const generatedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(
          paymentData.razorpay_order_id + '|' + paymentData.razorpay_payment_id
        )
        .digest('hex');

      if (generatedSignature !== paymentData.razorpay_signature) {
        this._logger.warn('Payment signature verification failed', {
          ...context,
          expectedSignature: generatedSignature,
          receivedSignature: paymentData.razorpay_signature,
        });
        return ResponseHelper.error(
          'Payment verification failed - invalid signature'
        );
      }

      // Fetch payment details from Razorpay to verify status
      let razorpayPayment;
      try {
        razorpayPayment = await this.razorpay.payments.fetch(
          paymentData.razorpay_payment_id
        );
      } catch (error) {
        this._logger.error('Failed to fetch payment details from Razorpay', {
          ...context,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        return ResponseHelper.error('Failed to verify payment status');
      }

      // Check if payment was successful
      if (razorpayPayment.status !== 'captured') {
        this._logger.warn('Payment not captured', {
          ...context,
          paymentStatus: razorpayPayment.status,
        });
        return ResponseHelper.error('Payment not completed');
      }

      // Get the actual amount from Razorpay order
      const order = await this.razorpay.orders.fetch(
        paymentData.razorpay_order_id
      );

      // Handle both string and number types for amount
      const amountInPaise =
        typeof order.amount === 'string'
          ? parseInt(order.amount, 10)
          : order.amount;

      const amountInRupees = amountInPaise / 100; // Convert from paise to rupees

      const currentBalance =
        await this._walletRepository.getWalletBalance(userId);
      const newBalance = currentBalance + amountInRupees;

      // Update wallet balance
      await this._walletRepository.updateWalletBalance(userId, newBalance);

      // Add transaction record
      await this._walletRepository.addWalletTransaction(userId, {
        txId: paymentData.razorpay_payment_id,
        type: 'credit',
        amount: amountInRupees,
        balanceAfter: newBalance,
        description: 'Wallet top-up via Razorpay',
        status: 'completed',
        metadata: {
          razorpayOrderId: paymentData.razorpay_order_id,
          razorpayPaymentId: paymentData.razorpay_payment_id,
          razorpayPaymentStatus: razorpayPayment.status,
          method: razorpayPayment.method,
          bank: razorpayPayment.bank,
          wallet: razorpayPayment.wallet,
          vpa: razorpayPayment.vpa,
        },
      });

      this._logger.info('Add money payment verified successfully', {
        ...context,
        amount: amountInRupees,
        newBalance,
        paymentMethod: razorpayPayment.method,
      });

      return ResponseHelper.success('Payment verified successfully', {
        amount: amountInRupees,
        newBalance,
        paymentMethod: razorpayPayment.method,
        transactionId: paymentData.razorpay_payment_id,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to verify add money payment', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to verify payment');
    }
  }

  async withdrawMoney(userId: string, withdrawData: WithdrawMoneyRequest) {
    const context = {
      operation: 'withdrawMoney',
      userId,
      amount: withdrawData.amount,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Processing withdrawal request', context);

      const currentBalance =
        await this._walletRepository.getWalletBalance(userId);

      if (withdrawData.amount < 100) {
        return ResponseHelper.badRequest('Minimum withdrawal amount is ₹100');
      }

      if (withdrawData.amount > currentBalance) {
        return ResponseHelper.badRequest('Insufficient wallet balance');
      }

      // Simply reduce the wallet balance
      const newBalance = currentBalance - withdrawData.amount;

      // Update wallet balance
      await this._walletRepository.updateWalletBalance(userId, newBalance);

      // Add withdrawal transaction
      await this._walletRepository.addWalletTransaction(userId, {
        txId: `withdraw_${Date.now()}`,
        type: 'debit',
        amount: withdrawData.amount,
        balanceAfter: newBalance,
        description: 'Money withdrawn from wallet',
        status: 'completed',
        metadata: {
          withdrawalType: 'wallet_withdrawal',
          timestamp: new Date().toISOString(),
        },
      });

      this._logger.info('Withdrawal processed successfully', {
        ...context,
        newBalance,
      });

      return ResponseHelper.success('Withdrawal processed successfully', {
        amount: withdrawData.amount,
        newBalance,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to process withdrawal', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to process withdrawal');
    }
  }

  async getWalletTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const context = {
      operation: 'getWalletTransactions',
      userId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching wallet transactions', context);

      const { transactions, total } =
        await this._walletRepository.getWalletTransactions(userId, page, limit);
      const transactionDtos = toWalletTransactionDtoList(transactions);

      const balance = await this._walletRepository.getWalletBalance(userId);

      this._logger.info('Wallet transactions retrieved successfully', {
        ...context,
        transactionCount: transactions.length,
        totalTransactions: total,
      });

      return ResponseHelper.success(
        'Wallet transactions retrieved successfully',
        {
          transactions: transactionDtos,
          balance,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch wallet transactions', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to fetch wallet transactions');
    }
  }

  async getBankAccounts(userId: string) {
    const context = {
      operation: 'getBankAccounts',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching bank accounts', context);

      const accounts = await this._walletRepository.getBankAccounts(userId);
      const accountDtos = toBankAccountDtoList(accounts);

      this._logger.info('Bank accounts retrieved successfully', {
        ...context,
        accountCount: accounts.length,
      });

      return ResponseHelper.success('Bank accounts retrieved successfully', {
        accounts: accountDtos,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch bank accounts', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to fetch bank accounts');
    }
  }

  async addBankAccount(userId: string, accountData: BankAccountData) {
    const context = {
      operation: 'addBankAccount',
      userId,
      bankName: accountData.bankName,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Adding bank account', context);

      // Validate IFSC code format (basic validation)
      const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscRegex.test(accountData.ifscCode)) {
        return ResponseHelper.badRequest('Invalid IFSC code format');
      }

      // Validate account number (basic validation)
      if (
        accountData.accountNumber.length < 9 ||
        accountData.accountNumber.length > 18
      ) {
        return ResponseHelper.badRequest('Invalid account number');
      }

      const newAccount = await this._walletRepository.addBankAccount(userId, {
        ...accountData,
        isVerified: true,
      });

      // If this is the first account or user wants to set it as default, set it as default
      if (accountData.isDefault) {
        await this._walletRepository.setDefaultBankAccount(
          userId,
          newAccount._id.toString()
        );
      }

      const accountDto = toBankAccountDtoList([newAccount])[0];

      this._logger.info('Bank account added successfully', {
        ...context,
        accountId: newAccount._id.toString(),
      });

      return ResponseHelper.success('Bank account added successfully', {
        account: accountDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to add bank account', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to add bank account');
    }
  }

  async setDefaultBankAccount(userId: string, accountId: string) {
    const context = {
      operation: 'setDefaultBankAccount',
      userId,
      accountId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Setting default bank account', context);

      await this._walletRepository.setDefaultBankAccount(userId, accountId);

      this._logger.info('Default bank account set successfully', context);

      return ResponseHelper.success(
        'Default bank account updated successfully'
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to set default bank account', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to set default bank account');
    }
  }

  async deleteBankAccount(userId: string, accountId: string) {
    const context = {
      operation: 'deleteBankAccount',
      userId,
      accountId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Deleting bank account', context);

      const deleted = await this._walletRepository.deleteBankAccount(
        userId,
        accountId
      );

      if (!deleted) {
        return ResponseHelper.notFound('Bank account not found');
      }

      this._logger.info('Bank account deleted successfully', context);

      return ResponseHelper.success('Bank account deleted successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to delete bank account', {
        ...context,
        error: errorMessage,
      });
      return ResponseHelper.error('Failed to delete bank account');
    }
  }

  // In WalletService.ts - update refundToWallet method
  async refundToWallet(
    userId: string,
    bookingId: string,
    amount: number,
    reason: string
  ): Promise<{
    success: boolean;
    data?: { newBalance: number; transactionId: string };
    message?: string;
  }> {
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

      // FIX: Extract userId if it's an object string
      let actualUserId = userId;
      if (userId.includes('ObjectId')) {
        // Extract ObjectId from stringified object
        const match = userId.match(/ObjectId\('([^']+)'\)/);
        if (match && match[1]) {
          actualUserId = match[1];
        } else {
          // Try to parse as JSON
          try {
            const parsed = JSON.parse(
              userId.replace(/\n/g, ' ').replace(/\s+/g, ' ')
            );
            actualUserId = parsed._id?.toString() || parsed.toString();
          } catch (e) {
            // Ignore parsing error
          }
        }
      }

      this._logger.info('Extracted user ID for refund', {
        original: userId,
        extracted: actualUserId,
      });

      // Validate user ID
      if (!Types.ObjectId.isValid(actualUserId)) {
        this._logger.error('Invalid user ID for wallet refund', {
          ...context,
          userId,
          actualUserId,
        });
        return {
          success: false,
          message: 'Invalid user ID',
        };
      }

      // Get booking details for description
      let bookingCode = 'Unknown';
      let serviceName = 'Service';

      try {
        if (Types.ObjectId.isValid(bookingId)) {
          const booking = await BookingSchema.findById(bookingId).select(
            'bookingCode serviceName'
          );
          if (booking) {
            bookingCode = booking.bookingCode;
            serviceName = booking.serviceName;
          }
        }
      } catch (error) {
        this._logger.warn('Could not fetch booking details for refund', {
          ...context,
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        bookingCode = `ID: ${bookingId}`;
      }

      // Get current balance
      const currentBalance =
        await this._walletRepository.getWalletBalance(actualUserId);
      const newBalance = currentBalance + amount;

      // Update wallet balance
      await this._walletRepository.updateWalletBalance(
        actualUserId,
        newBalance
      );

      // Generate transaction ID
      const transactionId = `refund_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Add refund transaction
      await this._walletRepository.addWalletTransaction(actualUserId, {
        txId: transactionId,
        type: 'credit',
        amount: amount,
        balanceAfter: newBalance,
        description: `Refund for booking ${bookingCode} - ${reason}`,
        status: 'completed',
        metadata: {
          bookingId: bookingId,
          bookingCode: bookingCode,
          serviceName: serviceName,
          refundReason: reason,
          type: 'refund',
          source: 'order_cancellation',
        },
      });

      this._logger.info('Wallet refund processed successfully', {
        ...context,
        userId: actualUserId,
        bookingCode,
        newBalance,
        transactionId,
      });

      return {
        success: true,
        data: {
          newBalance,
          transactionId,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to process wallet refund', {
        ...context,
        error: errorMessage,
      });
      return {
        success: false,
        message: 'Failed to process wallet refund',
      };
    }
  }
}
