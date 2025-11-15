// interfaces/repository/user/IWalletRepository.ts
import { Types } from "mongoose";

export interface WalletTransaction {
  txId: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  description: string;
  status: "pending" | "completed" | "failed";
  metadata?: any;
  createdAt: Date;
}

export interface BankAccount {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
  isDefault: boolean;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IWalletRepository {
  getWalletBalance(userId: string): Promise<number>;
  updateWalletBalance(userId: string, newBalance: number): Promise<any>;
  addWalletTransaction(
    userId: string,
    transaction: Omit<WalletTransaction, "createdAt">,
  ): Promise<any>;
  getWalletTransactions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<{ transactions: WalletTransaction[]; total: number }>;

  // Bank Account methods
  getBankAccounts(userId: string): Promise<BankAccount[]>;
  addBankAccount(
    userId: string,
    accountData: Omit<
      BankAccount,
      "_id" | "userId" | "createdAt" | "updatedAt"
    >,
  ): Promise<BankAccount>;
  setDefaultBankAccount(userId: string, accountId: string): Promise<void>;
  deleteBankAccount(userId: string, accountId: string): Promise<boolean>;
  findBankAccountById(accountId: string): Promise<BankAccount | null>;
}
