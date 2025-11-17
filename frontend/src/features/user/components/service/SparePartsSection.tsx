// components/user/SparePartsSection.tsx
import React, { useState } from "react";
import {
  CheckCircleOutlineOutlined,
  BuildOutlined,
  ExpandMoreOutlined,
  ExpandLessOutlined,
  ReceiptOutlined,
} from "@mui/icons-material";
import type { SparePartsRequest } from "../../../../interface/user/ISpareParts";

interface SparePartsSectionProps {
  spareParts: SparePartsRequest[];
  loading: boolean;
  orderStatus: string;
}

const SparePartsSection: React.FC<SparePartsSectionProps> = ({
  spareParts,
  loading,
  orderStatus,
}) => {
  const [expandedRequests, setExpandedRequests] = useState<Set<string>>(
    new Set()
  );
  const [showAll, setShowAll] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const toggleRequest = (requestId: string) => {
    setExpandedRequests((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(requestId)) {
        newSet.delete(requestId);
      } else {
        newSet.add(requestId);
      }
      return newSet;
    });
  };

  const toggleShowAll = () => {
    setShowAll(!showAll);
  };

  const getStatusConfig = (status: string) => {
    const config = {
      approved: {
        color: "bg-green-100 text-green-800 border-green-200",
        icon: CheckCircleOutlineOutlined,
        badge: "bg-green-500",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
        icon: BuildOutlined,
        badge: "bg-yellow-500",
      },
      rejected: {
        color: "bg-red-100 text-red-800 border-red-200",
        icon: BuildOutlined,
        badge: "bg-red-500",
      },
      cancelled: {
        color: "bg-gray-100 text-gray-800 border-gray-200",
        icon: BuildOutlined,
        badge: "bg-gray-500",
      },
    };
    return config[status as keyof typeof config] || config.pending;
  };

  const getTotalAmount = () => {
    return spareParts
      .filter((request) => request.status === "approved")
      .reduce((total, request) => total + request.totalAmount, 0);
  };

  const displayRequests = showAll ? spareParts : spareParts.slice(0, 3);
  const hasMore = spareParts.length > 3;

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">
            Loading spare parts information...
          </span>
        </div>
      </div>
    );
  }

  if (spareParts.length === 0) {
    if (orderStatus === "completed") {
      return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircleOutlineOutlined className="w-8 h-8 text-green-500" />
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              No Additional Parts Required
            </h3>
            <p className="text-gray-500 max-w-md mx-auto">
              The service was completed without requiring any additional spare
              parts.
            </p>
          </div>
        </div>
      );
    }
    return null;
  }

  const totalApprovedAmount = getTotalAmount();

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
            <ReceiptOutlined className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Spare Parts & Additional Costs
            </h2>
            <p className="text-sm text-gray-500">
              {spareParts.length} request{spareParts.length !== 1 ? "s" : ""} •{" "}
              {totalApprovedAmount > 0 &&
                `₹${totalApprovedAmount.toFixed(2)} approved`}
            </p>
          </div>
        </div>

        {totalApprovedAmount > 0 && (
          <div className="text-right">
            <div className="text-2xl font-bold text-green-600">
              ₹{totalApprovedAmount.toFixed(2)}
            </div>
            <div className="text-sm text-green-600 font-medium">
              Total Approved
            </div>
          </div>
        )}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {displayRequests.map((request, index) => {
          const statusConfig = getStatusConfig(request.status);
          const StatusIcon = statusConfig.icon;
          const isExpanded = expandedRequests.has(request._id);
          const isApproved = request.status === "approved";

          return (
            <div
              key={request._id}
              className={`border rounded-lg transition-all duration-200 ${
                isExpanded
                  ? "border-blue-200 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              {/* Request Header */}
              <div
                className="p-4 cursor-pointer"
                onClick={() => toggleRequest(request._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full ${statusConfig.badge}`}
                    ></div>
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        Spare Parts Request #{index + 1}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium border ${statusConfig.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {request.status.charAt(0).toUpperCase() +
                            request.status.slice(1)}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(request.requestedAt)} •{" "}
                          {formatTime(request.requestedAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div
                        className={`text-lg font-bold ${
                          isApproved ? "text-green-600" : "text-gray-700"
                        }`}
                      >
                        ₹{request.totalAmount.toFixed(2)}
                      </div>
                      <div className="text-xs text-gray-500">Total</div>
                    </div>
                    {isExpanded ? (
                      <ExpandLessOutlined className="w-5 h-5 text-gray-400" />
                    ) : (
                      <ExpandMoreOutlined className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                </div>
              </div>

              {/* Expandable Content */}
              {isExpanded && (
                <div className="px-4 pb-4 border-t border-gray-200">
                  {/* Notes */}
                  {(request.technicianNotes || request.customerNotes) && (
                    <div className="mt-4 space-y-3">
                      {request.technicianNotes && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                          <h4 className="font-semibold text-blue-900 text-sm mb-1">
                            Technician Notes
                          </h4>
                          <p className="text-blue-800 text-sm">
                            {request.technicianNotes}
                          </p>
                        </div>
                      )}
                      {request.customerNotes && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                          <h4 className="font-semibold text-green-900 text-sm mb-1">
                            Your Response
                          </h4>
                          <p className="text-green-800 text-sm">
                            {request.customerNotes}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Items Table */}
                  <div className="mt-4">
                    <h4 className="font-semibold text-gray-900 text-sm mb-3">
                      Items Requested ({request.items.length})
                    </h4>
                    <div className="bg-gray-50 rounded-lg overflow-hidden">
                      <div className="grid grid-cols-12 gap-4 px-4 py-3 bg-gray-100 text-xs font-semibold text-gray-700 uppercase tracking-wide">
                        <div className="col-span-6">Item Name</div>
                        <div className="col-span-2 text-center">Unit Price</div>
                        <div className="col-span-2 text-center">Quantity</div>
                        <div className="col-span-2 text-right">Total</div>
                      </div>
                      <div className="divide-y divide-gray-200">
                        {request.items.map((item, itemIndex) => (
                          <div
                            key={itemIndex}
                            className="grid grid-cols-12 gap-4 px-4 py-3 text-sm hover:bg-white transition-colors"
                          >
                            <div className="col-span-6">
                              <div className="font-medium text-gray-900">
                                {item.name}
                              </div>
                            </div>
                            <div className="col-span-2 text-center text-gray-600">
                              ₹{item.price.toFixed(2)}
                            </div>
                            <div className="col-span-2 text-center text-gray-600">
                              ×{item.quantity}
                            </div>
                            <div className="col-span-2 text-right font-semibold text-gray-900">
                              ₹{item.totalPrice.toFixed(2)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Payment Status for Approved Requests */}
                  {isApproved && (
                    <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircleOutlineOutlined className="w-5 h-5 text-green-600" />
                          <span className="font-semibold text-green-800 text-sm">
                            Payment Approved
                          </span>
                        </div>
                        <div className="text-green-700 font-semibold">
                          ₹{request.totalAmount.toFixed(2)} Paid
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Show More/Less Button */}
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={toggleShowAll}
            className="inline-flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 font-semibold transition-colors"
          >
            {showAll ? (
              <>
                <ExpandLessOutlined className="w-5 h-5" />
                Show Less
              </>
            ) : (
              <>
                <ExpandMoreOutlined className="w-5 h-5" />
                Show {spareParts.length - 3} More Requests
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default SparePartsSection;
