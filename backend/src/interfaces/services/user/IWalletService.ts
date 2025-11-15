// interfaces/services/user/IWalletService.ts
export interface AddMoneyRequest {
  amount: number;
  currency?: string;
}

export interface WithdrawMoneyRequest {
  amount: number;
}

export interface BankAccountData {
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  ifscCode: string;
  isDefault: boolean;
}

export interface IWalletService {
  getWalletBalance(userId: string): Promise<any>;
  createAddMoneyOrder(
    userId: string,
    amountData: AddMoneyRequest,
  ): Promise<any>;
  verifyAddMoneyPayment(userId: string, paymentData: any): Promise<any>;
  withdrawMoney(
    userId: string,
    withdrawData: WithdrawMoneyRequest,
  ): Promise<any>;
  getWalletTransactions(
    userId: string,
    page: number,
    limit: number,
  ): Promise<any>;
  getBankAccounts(userId: string): Promise<any>;
  addBankAccount(userId: string, accountData: BankAccountData): Promise<any>;
  setDefaultBankAccount(userId: string, accountId: string): Promise<any>;
  deleteBankAccount(userId: string, accountId: string): Promise<any>;
}
