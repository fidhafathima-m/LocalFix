"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toBankAccountDtoList = exports.toBankAccountDto = exports.toWalletTransactionDtoList = exports.toWalletTransactionDto = void 0;
const toWalletTransactionDto = (transaction) => ({
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
exports.toWalletTransactionDto = toWalletTransactionDto;
const toWalletTransactionDtoList = (transactions) => transactions.map(exports.toWalletTransactionDto);
exports.toWalletTransactionDtoList = toWalletTransactionDtoList;
const toBankAccountDto = (account) => ({
    _id: account._id.toString(),
    accountNumber: `****${account.accountNumber.slice(-4)}`, // Mask account number
    accountHolderName: account.accountHolderName,
    bankName: account.bankName,
    ifscCode: account.ifscCode,
    isDefault: account.isDefault,
    isVerified: account.isVerified,
    createdAt: account.createdAt.toISOString(),
});
exports.toBankAccountDto = toBankAccountDto;
const toBankAccountDtoList = (accounts) => accounts.map(exports.toBankAccountDto);
exports.toBankAccountDtoList = toBankAccountDtoList;
