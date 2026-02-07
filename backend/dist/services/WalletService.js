"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletService = void 0;
const responseHelper_1 = require("../utils/responseHelper");
const walletMapper_1 = require("../mappers/walletMapper");
const crypto_1 = __importDefault(require("crypto"));
const razorpay_1 = __importDefault(require("razorpay"));
const BookingSchema_1 = __importDefault(require("../models/BookingSchema"));
const mongoose_1 = require("mongoose");
class WalletService {
    constructor(walletRepository, logger) {
        this._logger = logger;
        this._walletRepository = walletRepository;
        // Initialize Razorpay with your existing credentials
        this.razorpay = new razorpay_1.default({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });
    }
    async getWalletBalance(userId) {
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
            return responseHelper_1.ResponseHelper.success('Wallet balance retrieved successfully', {
                balance,
                currency: 'INR',
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to fetch wallet balance', {
                ...context,
                error: errorMessage,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch wallet balance');
        }
    }
    async createAddMoneyOrder(userId, amountData) {
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
                return responseHelper_1.ResponseHelper.badRequest('Minimum amount is ₹1');
            }
            if (amountInPaise > 10000000) {
                // Maximum ₹100,000 (10,000,000 paise)
                return responseHelper_1.ResponseHelper.badRequest('Maximum amount is ₹100,000');
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
                key: process.env.RAZORPAY_KEY_ID,
            };
            this._logger.info('Add money order created successfully', {
                ...context,
                orderId: razorpayOrder.id,
                amount: razorpayOrder.amount,
                receipt: receipt, // Log the receipt used
            });
            return responseHelper_1.ResponseHelper.success('Order created successfully', orderData);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to create add money order', {
                ...context,
                error: errorMessage,
                razorpayError: error.error?.description,
            });
            // Handle specific Razorpay errors
            if (error.error?.code === 'BAD_REQUEST_ERROR') {
                return responseHelper_1.ResponseHelper.badRequest(error.error.description || 'Invalid amount or currency');
            }
            return responseHelper_1.ResponseHelper.error('Failed to create order');
        }
    }
    async verifyAddMoneyPayment(userId, paymentData) {
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
            const generatedSignature = crypto_1.default
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(paymentData.razorpay_order_id + '|' + paymentData.razorpay_payment_id)
                .digest('hex');
            if (generatedSignature !== paymentData.razorpay_signature) {
                this._logger.warn('Payment signature verification failed', {
                    ...context,
                    expectedSignature: generatedSignature,
                    receivedSignature: paymentData.razorpay_signature,
                });
                return responseHelper_1.ResponseHelper.error('Payment verification failed - invalid signature');
            }
            // Fetch payment details from Razorpay to verify status
            let razorpayPayment;
            try {
                razorpayPayment = await this.razorpay.payments.fetch(paymentData.razorpay_payment_id);
            }
            catch (error) {
                this._logger.error('Failed to fetch payment details from Razorpay', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                return responseHelper_1.ResponseHelper.error('Failed to verify payment status');
            }
            // Check if payment was successful
            if (razorpayPayment.status !== 'captured') {
                this._logger.warn('Payment not captured', {
                    ...context,
                    paymentStatus: razorpayPayment.status,
                });
                return responseHelper_1.ResponseHelper.error('Payment not completed');
            }
            // Get the actual amount from Razorpay order
            const order = await this.razorpay.orders.fetch(paymentData.razorpay_order_id);
            // Handle both string and number types for amount
            const amountInPaise = typeof order.amount === 'string'
                ? parseInt(order.amount, 10)
                : order.amount;
            const amountInRupees = amountInPaise / 100; // Convert from paise to rupees
            const currentBalance = await this._walletRepository.getWalletBalance(userId);
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
            return responseHelper_1.ResponseHelper.success('Payment verified successfully', {
                amount: amountInRupees,
                newBalance,
                paymentMethod: razorpayPayment.method,
                transactionId: paymentData.razorpay_payment_id,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to verify add money payment', {
                ...context,
                error: errorMessage,
            });
            return responseHelper_1.ResponseHelper.error('Failed to verify payment');
        }
    }
    async withdrawMoney(userId, withdrawData) {
        const context = {
            operation: 'withdrawMoney',
            userId,
            amount: withdrawData.amount,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Processing withdrawal request', context);
            const currentBalance = await this._walletRepository.getWalletBalance(userId);
            if (withdrawData.amount < 100) {
                return responseHelper_1.ResponseHelper.badRequest('Minimum withdrawal amount is ₹100');
            }
            if (withdrawData.amount > currentBalance) {
                return responseHelper_1.ResponseHelper.badRequest('Insufficient wallet balance');
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
            return responseHelper_1.ResponseHelper.success('Withdrawal processed successfully', {
                amount: withdrawData.amount,
                newBalance,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to process withdrawal', {
                ...context,
                error: errorMessage,
            });
            return responseHelper_1.ResponseHelper.error('Failed to process withdrawal');
        }
    }
    async getWalletTransactions(userId, page = 1, limit = 10) {
        const context = {
            operation: 'getWalletTransactions',
            userId,
            page,
            limit,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching wallet transactions', context);
            const { transactions, total } = await this._walletRepository.getWalletTransactions(userId, page, limit);
            const transactionDtos = (0, walletMapper_1.toWalletTransactionDtoList)(transactions);
            const balance = await this._walletRepository.getWalletBalance(userId);
            this._logger.info('Wallet transactions retrieved successfully', {
                ...context,
                transactionCount: transactions.length,
                totalTransactions: total,
            });
            return responseHelper_1.ResponseHelper.success('Wallet transactions retrieved successfully', {
                transactions: transactionDtos,
                balance,
                pagination: {
                    page,
                    limit,
                    total,
                    pages: Math.ceil(total / limit),
                },
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to fetch wallet transactions', {
                ...context,
                error: errorMessage,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch wallet transactions');
        }
    }
    async getBankAccounts(userId) {
        const context = {
            operation: 'getBankAccounts',
            userId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Fetching bank accounts', context);
            const accounts = await this._walletRepository.getBankAccounts(userId);
            const accountDtos = (0, walletMapper_1.toBankAccountDtoList)(accounts);
            this._logger.info('Bank accounts retrieved successfully', {
                ...context,
                accountCount: accounts.length,
            });
            return responseHelper_1.ResponseHelper.success('Bank accounts retrieved successfully', {
                accounts: accountDtos,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to fetch bank accounts', {
                ...context,
                error: errorMessage,
            });
            return responseHelper_1.ResponseHelper.error('Failed to fetch bank accounts');
        }
    }
    async addBankAccount(userId, accountData) {
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
                return responseHelper_1.ResponseHelper.badRequest('Invalid IFSC code format');
            }
            // Validate account number (basic validation)
            if (accountData.accountNumber.length < 9 ||
                accountData.accountNumber.length > 18) {
                return responseHelper_1.ResponseHelper.badRequest('Invalid account number');
            }
            const newAccount = await this._walletRepository.addBankAccount(userId, {
                ...accountData,
                isVerified: true,
            });
            // If this is the first account or user wants to set it as default, set it as default
            if (accountData.isDefault) {
                await this._walletRepository.setDefaultBankAccount(userId, newAccount._id.toString());
            }
            const accountDto = (0, walletMapper_1.toBankAccountDtoList)([newAccount])[0];
            this._logger.info('Bank account added successfully', {
                ...context,
                accountId: newAccount._id.toString(),
            });
            return responseHelper_1.ResponseHelper.success('Bank account added successfully', {
                account: accountDto,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to add bank account', {
                ...context,
                error: errorMessage,
            });
            return responseHelper_1.ResponseHelper.error('Failed to add bank account');
        }
    }
    async setDefaultBankAccount(userId, accountId) {
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
            return responseHelper_1.ResponseHelper.success('Default bank account updated successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to set default bank account', {
                ...context,
                error: errorMessage,
            });
            return responseHelper_1.ResponseHelper.error('Failed to set default bank account');
        }
    }
    async deleteBankAccount(userId, accountId) {
        const context = {
            operation: 'deleteBankAccount',
            userId,
            accountId,
            timestamp: new Date().toISOString(),
        };
        try {
            this._logger.info('Deleting bank account', context);
            const deleted = await this._walletRepository.deleteBankAccount(userId, accountId);
            if (!deleted) {
                return responseHelper_1.ResponseHelper.notFound('Bank account not found');
            }
            this._logger.info('Bank account deleted successfully', context);
            return responseHelper_1.ResponseHelper.success('Bank account deleted successfully');
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Failed to delete bank account', {
                ...context,
                error: errorMessage,
            });
            return responseHelper_1.ResponseHelper.error('Failed to delete bank account');
        }
    }
    async refundToWallet(userId, bookingId, amount, reason) {
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
            // Get booking details for description - handle both ObjectId strings and actual IDs
            let bookingCode = 'Unknown';
            let serviceName = 'Service';
            try {
                // Check if bookingId is a valid ObjectId
                if (mongoose_1.Types.ObjectId.isValid(bookingId)) {
                    const booking = await BookingSchema_1.default.findById(bookingId).select('bookingCode serviceName');
                    if (booking) {
                        bookingCode = booking.bookingCode;
                        serviceName = booking.serviceName;
                    }
                    else {
                        this._logger.warn('Booking not found with ID', {
                            ...context,
                            bookingId,
                        });
                        bookingCode = `ID: ${bookingId}`;
                    }
                }
                else {
                    // If bookingId is not a valid ObjectId, use it as the code
                    bookingCode = bookingId;
                    this._logger.info('Using provided booking ID as code', {
                        ...context,
                        bookingCode,
                    });
                }
            }
            catch (error) {
                this._logger.warn('Could not fetch booking details for refund', {
                    ...context,
                    error: error instanceof Error ? error.message : 'Unknown error',
                });
                // Use fallback values
                bookingCode = `ID: ${bookingId}`;
            }
            // Validate user ID
            if (!mongoose_1.Types.ObjectId.isValid(userId)) {
                this._logger.error('Invalid user ID for wallet refund', {
                    ...context,
                    userId,
                });
                return {
                    success: false,
                    message: 'Invalid user ID',
                };
            }
            // Get current balance
            const currentBalance = await this._walletRepository.getWalletBalance(userId);
            const newBalance = currentBalance + amount;
            // Update wallet balance
            await this._walletRepository.updateWalletBalance(userId, newBalance);
            // Generate transaction ID
            const transactionId = `refund_${Date.now()}`;
            // Add refund transaction
            await this._walletRepository.addWalletTransaction(userId, {
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
                    source: 'admin_refund',
                },
            });
            this._logger.info('Wallet refund processed successfully', {
                ...context,
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
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
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
exports.WalletService = WalletService;
