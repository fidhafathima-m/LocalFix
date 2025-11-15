// dtos/wallet/WalletDto.ts
export interface WalletBalanceDto {
  balance: number;
  currency: string;
}

export interface WalletTransactionDto {
  _id: string;
  txId: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  description: string;
  status: "pending" | "completed" | "failed";
  metadata?: any;
  createdAt: string;
}

export interface BankAccountDto {
  _id: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: string;
}

export interface RazorpayOrderDto {
  orderId: string;
  amount: number;
  currency: string;
  key: string;
}
