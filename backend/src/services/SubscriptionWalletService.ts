import {
  DebitResult,
  ISubscriptionWalletService,
} from '../interfaces/services/technician/ISubscriptionWalletService';
import { ILogger } from '../interfaces/utils/ILogger';

export class SubscriptionWalletService implements ISubscriptionWalletService {
  private _logger: ILogger;

  constructor(logger: ILogger) {
    this._logger = logger;
  }

  async getBalance(userId: string): Promise<number> {
    const context = {
      operation: 'getBalance',
      data: { userId },
    };

    try {
      this._logger.info('Getting wallet balance for subscription', context);

      // Simulate getting balance from database
      // In real implementation, you would query your wallet collection
      const user = await this._findUserById(userId);
      const balance = user?.wallet?.balance || 0;

      this._logger.info('Wallet balance retrieved', {
        ...context,
        balance,
      });

      return balance;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Get balance failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  async debit(
    userId: string,
    amount: number,
    type: string,
    description: string
  ): Promise<DebitResult> {
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Wallet debit failed', {
        ...context,
        error: errorMessage,
      });
      throw error;
    }
  }

  // Private helper methods
  private async _findUserById(userId: string): Promise<any> {
    // This would be your actual database query
    // For now, returning a mock user
    return {
      _id: userId,
      wallet: {
        balance: 1000, // Mock balance
        transactions: [],
      },
    };
  }

  private async _updateWalletBalance(
    userId: string,
    newBalance: number,
    transaction: {
      transactionId: string;
      type: string;
      amount: number;
      description: string;
      balanceAfter: number;
    }
  ): Promise<void> {
    // This would be your actual database update
    // For now, just logging
    this._logger.info('Updating wallet balance', {
      userId,
      newBalance,
      transaction,
    });
  }
}
