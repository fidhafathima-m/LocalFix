"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionWalletService = void 0;
class SubscriptionWalletService {
    constructor(logger) {
        this._logger = logger;
    }
    async getBalance(userId) {
        const context = {
            operation: 'getBalance',
            data: { userId },
        };
        try {
            this._logger.info('Getting wallet balance for subscription', context);
            const user = await this._findUserById(userId);
            const balance = user?.wallet?.balance || 0;
            this._logger.info('Wallet balance retrieved', {
                ...context,
                balance,
            });
            return balance;
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Get balance failed', {
                ...context,
                error: errorMessage,
            });
            throw error;
        }
    }
    async debit(userId, amount, type, description) {
        const context = {
            operation: 'debit',
            data: { userId, amount, type, description },
        };
        try {
            this._logger.info('Processing wallet debit for subscription', context);
            // Get current balance
            const currentBalance = await this.getBalance(userId);
            if (currentBalance < amount) {
                throw new Error('Insufficient wallet balance');
            }
            // Calculate new balance
            const newBalance = currentBalance - amount;
            const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // Update wallet balance in database
            await this._updateWalletBalance(userId, newBalance, {
                transactionId,
                type: 'debit',
                amount,
                description,
                balanceAfter: newBalance,
            });
            this._logger.info('Wallet debit processed successfully', {
                ...context,
                transactionId,
                newBalance,
            });
            return {
                success: true,
                transactionId,
                newBalance,
            };
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Wallet debit failed', {
                ...context,
                error: errorMessage,
            });
            throw error;
        }
    }
    // Private helper methods
    async _findUserById(userId) {
        return {
            _id: userId,
            wallet: {
                balance: 1000, // Mock balance
                transactions: [],
            },
        };
    }
    async _updateWalletBalance(userId, newBalance, transaction) {
        this._logger.info('Updating wallet balance', {
            userId,
            newBalance,
            transaction,
        });
    }
}
exports.SubscriptionWalletService = SubscriptionWalletService;
