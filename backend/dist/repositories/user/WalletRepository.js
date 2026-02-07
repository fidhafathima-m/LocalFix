"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRepository = void 0;
const mongoose_1 = require("mongoose");
const UserSchema_1 = __importDefault(require("../../models/UserSchema"));
class WalletRepository {
    constructor() {
        this.userModel = UserSchema_1.default;
    }
    async getWalletBalance(userId) {
        const user = await this.userModel.findById(userId).select('wallet.balance');
        return user?.wallet?.balance || 0;
    }
    async updateWalletBalance(userId, newBalance) {
        return await this.userModel.findByIdAndUpdate(userId, { $set: { 'wallet.balance': newBalance } }, { new: true });
    }
    async addWalletTransaction(userId, transaction) {
        const transactionWithDate = {
            ...transaction,
            createdAt: new Date(),
        };
        return await this.userModel.findByIdAndUpdate(userId, {
            $push: {
                'wallet.transactions': transactionWithDate,
            },
        }, { new: true });
    }
    async getWalletTransactions(userId, page = 1, limit = 10) {
        const user = await this.userModel
            .findById(userId)
            .select('wallet.transactions');
        const transactions = user?.wallet?.transactions || [];
        // Sort by date descending and paginate
        const sortedTransactions = transactions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedTransactions = sortedTransactions.slice(startIndex, endIndex);
        return {
            transactions: paginatedTransactions,
            total: transactions.length,
        };
    }
    async getBankAccounts(userId) {
        const user = await this.userModel.findById(userId).select('bankAccounts');
        return user?.bankAccounts || [];
    }
    async addBankAccount(userId, accountData) {
        const newAccount = {
            _id: new mongoose_1.Types.ObjectId(),
            userId: new mongoose_1.Types.ObjectId(userId),
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
    async setDefaultBankAccount(userId, accountId) {
        // First, set all accounts to non-default
        await this.userModel.updateOne({ _id: userId }, { $set: { 'bankAccounts.$[].isDefault': false } });
        // Then set the specified account as default
        await this.userModel.updateOne({ _id: userId, 'bankAccounts._id': new mongoose_1.Types.ObjectId(accountId) }, { $set: { 'bankAccounts.$.isDefault': true } });
    }
    async deleteBankAccount(userId, accountId) {
        const result = await this.userModel.updateOne({ _id: userId }, { $pull: { bankAccounts: { _id: new mongoose_1.Types.ObjectId(accountId) } } });
        return result.modifiedCount > 0;
    }
    async findBankAccountById(accountId) {
        const user = await this.userModel.findOne({
            'bankAccounts._id': new mongoose_1.Types.ObjectId(accountId),
        });
        if (!user || !user.bankAccounts) {
            return null;
        }
        return (user.bankAccounts.find((acc) => acc._id.toString() === accountId) ||
            null);
    }
}
exports.WalletRepository = WalletRepository;
