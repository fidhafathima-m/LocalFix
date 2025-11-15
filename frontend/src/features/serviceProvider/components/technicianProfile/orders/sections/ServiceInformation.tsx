import { WarningAmberOutlined } from "@mui/icons-material";
import type { TechnicianOrder } from "../../../../../../interface/technician/IOrderService";

interface ServiceInformationProps {
  order: TechnicianOrder;
}

const ServiceInformation: React.FC<ServiceInformationProps> = ({ order }) => {
  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Service Information
      </h3>
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Service Type</span>
          <span className="text-sm font-medium text-gray-900">
            {order.serviceName || "Service"}
          </span>
        </div>

        {order.brand && (
          <div className="flex justify-between">
            <span className="text-sm text-gray-600">Brand</span>
            <span className="text-sm font-medium text-gray-900">
              {order.brand}
            </span>
          </div>
        )}

        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Scheduled Date</span>
          <span className="text-sm font-medium text-gray-900">
            {order.scheduledAt
              ? formatDateTime(order.scheduledAt)
              : "Not scheduled"}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-sm text-gray-600">Scheduled Time</span>
          <span className="text-sm font-medium text-gray-900">
            {order.scheduledAt
              ? formatTime(order.scheduledAt)
              : order.timeSlot || "Not set"}
          </span>
        </div>

        {order.problemDescription && (
          <div>
            <p className="text-sm text-gray-600 mb-2">Problem Description</p>
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 flex items-start">
              <WarningAmberOutlined className="text-yellow-600 mr-2 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                {order.problemDescription}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ServiceInformation;
