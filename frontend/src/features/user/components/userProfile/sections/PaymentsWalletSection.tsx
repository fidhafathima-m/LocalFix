/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import {
  CreditCardOutlined,
  AccountBalanceWalletOutlined,
  AddOutlined,
  ExpandMoreOutlined,
  RefreshOutlined,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { transactionService } from "../../../../../services/user/transactionService";

interface PaymentsWalletSectionProps {
  walletBalance: number;
  onAddMoney: () => void;
  onWithdraw: () => void;
  onRefreshWallet: () => void;
}

export const PaymentsWalletSection: React.FC<PaymentsWalletSectionProps> = ({
  walletBalance,
  onAddMoney,
  onWithdraw,
  onRefreshWallet,
}) => {
  const [activeTab, setActiveTab] = useState<"history" | "wallet">("history");
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [displayedTransactions, setDisplayedTransactions] = useState<any[]>([]);
  const [showAllTransactions, setShowAllTransactions] = useState(false);
  const [allWalletTransactions, setAllWalletTransactions] = useState<any[]>([]);
  const [displayedWalletTransactions, setDisplayedWalletTransactions] =
    useState<any[]>([]);
  const [showAllWalletTransactions, setShowAllWalletTransactions] =
    useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Number of transactions to show initially
  const INITIAL_TRANSACTIONS_COUNT = 5;

  useEffect(() => {
    if (activeTab === "history") {
      fetchTransactions();
    } else {
      fetchWalletTransactions();
    }
  }, [activeTab]);

  const refreshData = async () => {
    try {
      setRefreshing(true);
      if (activeTab === "history") {
        await fetchTransactions();
      } else {
        await fetchWalletTransactions();
      }

      // Call parent refresh if provided
      if (onRefreshWallet) {
        onRefreshWallet();
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    refreshData();
  }, [activeTab]);

  const fetchTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await transactionService.getUserTransactions(1, 20);
      if (response.success && response.data) {
        const transactions = response.data.transactions;
        setAllTransactions(transactions);
        setDisplayedTransactions(
          transactions.slice(0, INITIAL_TRANSACTIONS_COUNT)
        );
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
      toast.error("Failed to load transaction history");
    } finally {
      setTransactionsLoading(false);
    }
  };

  const fetchWalletTransactions = async () => {
    try {
      setTransactionsLoading(true);
      const response = await transactionService.getWalletTransactions();
      if (response.success && response.data) {
        const walletTransactions = response.data.transactions;
        setAllWalletTransactions(walletTransactions);
        setDisplayedWalletTransactions(
          walletTransactions.slice(0, INITIAL_TRANSACTIONS_COUNT)
        );
      }
    } catch (error) {
      console.error("Error fetching wallet transactions:", error);
      toast.error("Failed to load wallet transactions");
    } finally {
      setTransactionsLoading(false);
    }
  };

  const handleShowMoreTransactions = () => {
    setDisplayedTransactions(allTransactions);
    setShowAllTransactions(true);
  };

  const handleShowLessTransactions = () => {
    setDisplayedTransactions(
      allTransactions.slice(0, INITIAL_TRANSACTIONS_COUNT)
    );
    setShowAllTransactions(false);
  };

  const handleShowMoreWalletTransactions = () => {
    setDisplayedWalletTransactions(allWalletTransactions);
    setShowAllWalletTransactions(true);
  };

  const handleShowLessWalletTransactions = () => {
    setDisplayedWalletTransactions(
      allWalletTransactions.slice(0, INITIAL_TRANSACTIONS_COUNT)
    );
    setShowAllWalletTransactions(false);
  };

  const getTransactionStatus = (status: string) => {
    const statusMap: any = {
      success: { text: "Paid", class: "bg-green-100 text-green-700" },
      failed: { text: "Failed", class: "bg-red-100 text-red-700" },
      pending: { text: "Pending", class: "bg-yellow-100 text-yellow-700" },
      refunded: { text: "Refunded", class: "bg-blue-100 text-blue-700" },
      initiated: { text: "Initiated", class: "bg-gray-100 text-gray-700" },
      completed: { text: "Completed", class: "bg-green-100 text-green-700" },
    };

    return (
      statusMap[status] || { text: status, class: "bg-gray-100 text-gray-700" }
    );
  };

  const formatTransactionDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const RefreshButton = () => (
    <button
      onClick={refreshData}
      disabled={refreshing}
      className="flex items-center space-x-1 text-blue-600 hover:text-blue-700 disabled:text-gray-400"
    >
      <RefreshOutlined
        className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`}
      />
      <span className="text-sm">
        {refreshing ? "Refreshing..." : "Refresh"}
      </span>
    </button>
  );

  // Helper function to render show more/less button
  const renderShowMoreButton = (
    showAll: boolean,
    onShowMore: () => void,
    onShowLess: () => void,
    totalCount: number
  ) => {
    if (totalCount <= INITIAL_TRANSACTIONS_COUNT) return null;

    return (
      <div className="flex justify-center pt-4">
        {!showAll ? (
          <button
            onClick={onShowMore}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 cursor-pointer"
          >
            Show All {totalCount} Transactions
            <ExpandMoreOutlined className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={onShowLess}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm flex items-center gap-1 cursor-pointer"
          >
            Show Less
            <ExpandMoreOutlined className="w-4 h-4 rotate-180" />
          </button>
        )}
      </div>
    );
  };
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Payments & Wallet</h2>
        <RefreshButton />
      </div>
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("history")}
          className={`pb-3 px-2 font-medium ${
            activeTab === "history"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          Payment History
        </button>
        <button
          onClick={() => setActiveTab("wallet")}
          className={`pb-3 px-2 font-medium ${
            activeTab === "wallet"
              ? "text-blue-600 border-b-2 border-blue-600"
              : "text-gray-600"
          }`}
        >
          Wallet
        </button>
      </div>

      {activeTab === "wallet" && (
        <div className="bg-blue-600 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between text-white mb-4">
            <div>
              <p className="text-sm opacity-90 mb-1">Available Balance</p>
              <p className="text-3xl font-bold">₹{walletBalance}</p>
            </div>
            <AccountBalanceWalletOutlined className="w-12 h-12 opacity-80" />
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onAddMoney}
              className="flex-1 bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <AddOutlined className="w-4 h-4" />
              <span>Add Money</span>
            </button>
            <button
              onClick={onWithdraw}
              className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 flex items-center justify-center space-x-2 cursor-pointer"
            >
              <CreditCardOutlined className="w-4 h-4" />
              <span>Withdraw</span>
            </button>
          </div>
        </div>
      )}

      <div>
        <h3 className="font-semibold mb-3">
          {activeTab === "history" ? "Payment History" : "Wallet Transactions"}
        </h3>

        {transactionsLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading transactions...</p>
          </div>
        ) : activeTab === "history" ? (
          displayedTransactions.length > 0 ? (
            <div className="space-y-3">
              {displayedTransactions.map((transaction) => {
                const statusConfig = getTransactionStatus(transaction.status);
                return (
                  <div
                    key={transaction._id}
                    className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-900">
                        {transaction.serviceName}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <p className="text-xs text-gray-500">
                          Order: {transaction.orderCode || "Processing..."}
                        </p>
                        <span className="text-xs text-gray-400">•</span>
                        <p className="text-xs text-gray-500">
                          {formatTransactionDate(transaction.createdAt)}
                        </p>
                        {transaction.paymentProvider && (
                          <>
                            <span className="text-xs text-gray-400">•</span>
                            <p className="text-xs text-gray-500 capitalize">
                              {transaction.paymentProvider}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">
                        ₹{transaction.amount}
                      </p>
                      <span
                        className={`text-xs px-2 py-1 rounded font-medium ${statusConfig.class}`}
                      >
                        {statusConfig.text}
                      </span>
                    </div>
                  </div>
                );
              })}

              {renderShowMoreButton(
                showAllTransactions,
                handleShowMoreTransactions,
                handleShowLessTransactions,
                allTransactions.length
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <CreditCardOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No payment history yet</p>
              <p className="text-sm text-gray-400 mt-1">
                Your payment history will appear here after you book services
              </p>
            </div>
          )
        ) : displayedWalletTransactions.length > 0 ? (
          <div className="space-y-3">
            {displayedWalletTransactions.map((transaction, index) => (
              <div
                key={transaction._id || index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <div className="flex-1">
                  <p className="font-medium text-sm text-gray-900">
                    {transaction.description}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    <p className="text-xs text-gray-500">
                      {new Date(transaction.createdAt).toLocaleDateString()}
                    </p>
                    <span className="text-xs text-gray-400">•</span>
                    <span
                      className={`text-xs px-2 py-1 rounded ${
                        transaction.status === "completed"
                          ? "bg-green-100 text-green-700"
                          : transaction.status === "pending"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {transaction.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`font-semibold ${
                      transaction.type === "credit"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "credit" ? "+" : "-"}₹
                    {transaction.amount}
                  </p>
                  <p className="text-xs text-gray-500">
                    Balance: ₹{transaction.balanceAfter}
                  </p>
                </div>
              </div>
            ))}

            {renderShowMoreButton(
              showAllWalletTransactions,
              handleShowMoreWalletTransactions,
              handleShowLessWalletTransactions,
              allWalletTransactions.length
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <AccountBalanceWalletOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500">No wallet transactions yet</p>
          </div>
        )}
      </div>
    </div>
  );
};
