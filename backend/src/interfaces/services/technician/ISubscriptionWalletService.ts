export interface DebitResult {
  success: boolean;
  transactionId: string;
  newBalance: number;
  message?: string;
}

export interface ISubscriptionWalletService {
  getBalance(userId: string): Promise<number>;
  debit(
    userId: string,
    amount: number,
    type: string,
    description: string
  ): Promise<DebitResult>;
}
