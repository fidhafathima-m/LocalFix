/* eslint-disable @typescript-eslint/no-explicit-any */

import api from "../../utils/axiosConfig";

export interface AddMoneyRequest {
  amount: number;
  currency?: string;
}

export interface WithdrawMoneyRequest {
  amount: number;
}

export interface WalletTransaction {
  _id: string;
  type: "credit" | "debit";
  amount: number;
  balanceAfter: number;
  description: string;
  status: "pending" | "completed" | "failed";
  createdAt: string;
  metadata?: any;
}

export interface WalletResponse {
  success: boolean;
  data: {
    balance: number;
    transactions: WalletTransaction[];
  };
  message?: string;
}

export interface RazorpayOrderResponse {
  success: boolean;
  data: {
    orderId: string;
    amount: number;
    currency: string;
    key: string;
  };
}

class WalletService {
  async getWalletBalance(): Promise<WalletResponse> {
    try {
      const response = await api.get("/user/wallet/balance");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching wallet balance:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch wallet balance"
      );
    }
  }

  async createAddMoneyOrder(
    amountData: AddMoneyRequest
  ): Promise<RazorpayOrderResponse> {
    try {
      const response = await api.post(
        "/user/wallet/add-money/order",
        amountData
      );
      return response.data;
    } catch (error: any) {
      console.error("Error creating add money order:", error);
      throw new Error(
        error.response?.data?.message || "Failed to create order"
      );
    }
  }

  async verifyAddMoneyPayment(paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) {
    try {
      const response = await api.post(
        "/user/wallet/add-money/verify",
        paymentData
      );
      return response.data;
    } catch (error: any) {
      console.error("Error verifying payment:", error);
      throw new Error(
        error.response?.data?.message || "Payment verification failed"
      );
    }
  }

  async withdrawMoney(withdrawData: WithdrawMoneyRequest) {
    try {
      const response = await api.post("/user/wallet/withdraw", withdrawData);
      return response.data;
    } catch (error: any) {
      console.error("Error withdrawing money:", error);
      throw new Error(error.response?.data?.message || "Withdrawal failed");
    }
  }

  async getWalletTransactions(page: number = 1, limit: number = 10) {
    try {
      const response = await api.get(
        `/user/wallet/transactions?page=${page}&limit=${limit}`
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching wallet transactions:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch transactions"
      );
    }
  }

  async getBankAccounts() {
    try {
      const response = await api.get("/user/wallet/bank-accounts");
      return response.data;
    } catch (error: any) {
      console.error("Error fetching bank accounts:", error);
      throw new Error(
        error.response?.data?.message || "Failed to fetch bank accounts"
      );
    }
  }

  async addBankAccount(accountData: any) {
    try {
      const response = await api.post(
        "/user/wallet/bank-accounts",
        accountData
      );
      return response.data;
    } catch (error: any) {
      console.error("Error adding bank account:", error);
      throw new Error(
        error.response?.data?.message || "Failed to add bank account"
      );
    }
  }
}

export const walletService = new WalletService();
