import type { TechnicianOrder } from "../../../../../../interface/technician/IOrderService";

interface PricePaymentProps {
  order: TechnicianOrder;
}

const PricePayment: React.FC<PricePaymentProps> = ({ order }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
    }).format(amount);
  };

  const getPaymentStatus = (status: string) => {
    const paymentStatusMap: { [key: string]: { text: string; color: string } } =
      {
        pending: { text: "To be collected", color: "text-blue-600" },
        paid: { text: "Paid", color: "text-green-600" },
        cancelled: { text: "Cancelled", color: "text-red-600" },
        completed: { text: "Completed", color: "text-green-600" },
      };

    return (
      paymentStatusMap[status] || {
        text: "To be collected",
        color: "text-blue-600",
      }
    );
  };

  const paymentStatus = getPaymentStatus(order.status);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mt-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Price & Payment
      </h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Base Price</span>
          <span className="text-sm font-medium text-gray-900">
            {formatCurrency(order.totalAmount || 0)}
          </span>
        </div>

        {/* Additional charges can be added here based on your order structure */}
        {order.orderItems && order.orderItems.length > 0 && (
          <>
            {order.orderItems.map((item, index) => (
              <div key={index} className="flex justify-between">
                <span className="text-sm text-gray-600">
                  {item.customName || `Item ${index + 1}`}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {formatCurrency(item.totalPrice || 0)}
                </span>
              </div>
            ))}
          </>
        )}

        <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between">
          <span className="text-base font-semibold text-gray-900">
            Total Amount
          </span>
          <span className="text-base font-bold text-gray-900">
            {formatCurrency(order.totalAmount || 0)}
          </span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-sm text-gray-600">Payment Status</span>
          <span className={`text-sm font-medium ${paymentStatus.color}`}>
            ● {paymentStatus.text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PricePayment;
