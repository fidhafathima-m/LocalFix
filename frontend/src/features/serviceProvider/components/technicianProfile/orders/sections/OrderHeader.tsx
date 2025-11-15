import { ArrowLeftOutlined } from "@mui/icons-material";
import type { TechnicianOrder } from "../../../../../../interface/technician/IOrderService";

interface OrderHeaderProps {
  order: TechnicianOrder;
  onBack: () => void;
}

const OrderHeader: React.FC<OrderHeaderProps> = ({ order, onBack }) => {
  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      pending: "bg-yellow-50 text-yellow-700",
      accepted: "bg-blue-50 text-blue-600",
      confirmed: "bg-green-50 text-green-600",
      on_the_way: "bg-orange-50 text-orange-600",
      in_progress: "bg-purple-50 text-purple-600",
      completed: "bg-gray-50 text-gray-600",
      cancelled: "bg-red-50 text-red-600",
    };
    return statusColors[status] || "bg-gray-50 text-gray-600";
  };

  const formatStatus = (status: string) => {
    return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div>
      <button
        onClick={onBack}
        className="flex items-center text-blue-600 text-sm font-medium mb-6 hover:text-blue-700"
      >
        <ArrowLeftOutlined className="mr-1" />
        Back to Orders
      </button>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {order.serviceName || "Service"}
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Booking ID: {order.orderCode || order._id}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(
              order.status
            )}`}
          >
            {formatStatus(order.status)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default OrderHeader;
