// repositories/WalletRepository.ts
import { Model, Types } from "mongoose";
import {
  IWalletRepository,
  WalletTransaction,
  BankAccount,
} from "../../interfaces/repository/user/IWalletRepository";
import User from "../../models/UserSchema";

export class WalletRepository implements IWalletRepository {
  private userModel: Model<any>;

  constructor() {
    this.userModel = User;
  }

  async getWalletBalance(userId: string): Promise<number> {
    const user = await this.userModel.findById(userId).select("wallet.balance");
    return user?.wallet?.balance || 0;
  }

  async updateWalletBalance(userId: string, newBalance: number): Promise<any> {
    return await this.userModel.findByIdAndUpdate(
      userId,
      { $set: { "wallet.balance": newBalance } },
      { new: true },
    );
  }

  async addWalletTransaction(
    userId: string,
    transaction: Omit<WalletTransaction, "createdAt">,
  ): Promise<any> {
    const transactionWithDate = {
      ...transaction,
      createdAt: new Date(),
    };

    return await this.userModel.findByIdAndUpdate(
      userId,
      {
        $push: {
          "wallet.transactions": transactionWithDate,
        },
      },
      { new: true },
    );
  }

  async getWalletTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10,
  ): Promise<{ transactions: WalletTransaction[]; total: number }> {
    const user = await this.userModel
      .findById(userId)
      .select("wallet.transactions");
    const transactions = user?.wallet?.transactions || [];

    // Sort by date descending and paginate
    const sortedTransactions = transactions.sort(
      (a: any, b: any) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedTransactions = sortedTransactions.slice(
      startIndex,
      endIndex,
    );

    return {
      transactions: paginatedTransactions,
      total: transactions.length,
    };
  }

  async getBankAccounts(userId: string): Promise<BankAccount[]> {
    const user = await this.userModel.findById(userId).select("bankAccounts");
    return user?.bankAccounts || [];
  }

  async addBankAccount(
    userId: string,
    accountData: Omit<
      BankAccount,
      "_id" | "userId" | "createdAt" | "updatedAt"
    >,
  ): Promise<BankAccount> {
    const newAccount = {
      _id: new Types.ObjectId(),
      userId: new Types.ObjectId(userId),
      ...accountData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.userModel.findByIdAndUpdate(userId, {
      $push: {
        bankAccounts: newAccount,
      },
    });

    return newAccount;
  }

  async setDefaultBankAccount(
    userId: string,
    accountId: string,
  ): Promise<void> {
    // First, set all accounts to non-default
    await this.userModel.updateOne(
      { _id: userId },
      { $set: { "bankAccounts.$[].isDefault": false } },
    );

    // Then set the specified account as default
    await this.userModel.updateOne(
      { _id: userId, "bankAccounts._id": new Types.ObjectId(accountId) },
      { $set: { "bankAccounts.$.isDefault": true } },
    );
  }

  async deleteBankAccount(userId: string, accountId: string): Promise<boolean> {
    const result = await this.userModel.updateOne(
      { _id: userId },
      { $pull: { bankAccounts: { _id: new Types.ObjectId(accountId) } } },
    );

    return result.modifiedCount > 0;
  }

  async findBankAccountById(accountId: string): Promise<BankAccount | null> {
    const user = await this.userModel.findOne({
      "bankAccounts._id": new Types.ObjectId(accountId),
    });

    if (!user || !user.bankAccounts) {
      return null;
    }

    return (
      user.bankAccounts.find((acc: any) => acc._id.toString() === accountId) ||
      null
    );
  }
}
