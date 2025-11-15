/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "../../utils/axiosConfig";

export interface TransactionResponse {
  _id: string;
  bookingId: string;
  orderCode: string;
  serviceName: string;
  amount: number;
  status: "initiated" | "pending" | "success" | "failed" | "refunded";
  type: "service" | "subscription" | "spare_part";
  paymentProvider: string;
  createdAt: string;
  confirmedAt?: string;
  refundedAt?: string;
}

export interface TransactionsResponse {
  success: boolean;
  data: {
    transactions: TransactionResponse[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
  message?: string;
}

export interface WalletTransaction {
  txId: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  description: string;
  createdAt: string;
}

export interface WalletResponse {
  success: boolean;
  data: {
    transactions: WalletTransaction[];
    balance: number;
  };
  message?: string;
}

class TransactionService {
  async getUserTransactions(
    page: number = 1,
    limit: number = 10
  ): Promise<TransactionsResponse> {
    try {
      const response = await api.get(
        `/user/payments/transactions?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch transactions"
      );
    }
  }

  async getWalletTransactions(): Promise<WalletResponse> {
    try {
      const response = await api.get("/user/wallet/transactions");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching wallet transactions:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch wallet transactions"
      );
    }
  }
}

export const transactionService = new TransactionService();
