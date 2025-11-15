import {
  BankAccountDto,
  WalletTransactionDto,
} from "../interfaces/dtos/walletDtos";
import {
  BankAccount,
  WalletTransaction,
} from "../interfaces/repository/user/IWalletRepository";

export const toWalletTransactionDto = (
  transaction: WalletTransaction,
): WalletTransactionDto => ({
  _id: transaction.txId,
  txId: transaction.txId,
  type: transaction.type,
  amount: transaction.amount,
  balanceAfter: transaction.balanceAfter,
  description: transaction.description,
  status: transaction.status,
  metadata: transaction.metadata,
  createdAt: transaction.createdAt.toISOString(),
});

export const toWalletTransactionDtoList = (
  transactions: WalletTransaction[],
): WalletTransactionDto[] => transactions.map(toWalletTransactionDto);

export const toBankAccountDto = (account: BankAccount): BankAccountDto => ({
  _id: account._id.toString(),
  accountNumber: `****${account.accountNumber.slice(-4)}`, // Mask account number
  accountHolderName: account.accountHolderName,
  bankName: account.bankName,
  ifscCode: account.ifscCode,
  isDefault: account.isDefault,
  isVerified: account.isVerified,
  createdAt: account.createdAt.toISOString(),
});

export const toBankAccountDtoList = (
  accounts: BankAccount[],
): BankAccountDto[] => accounts.map(toBankAccountDto);
