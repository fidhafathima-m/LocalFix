import {
  CheckCircleOutlineOutlined,
  DeleteOutlineOutlined,
  FlagOutlined,
  Person2Outlined,
  StarBorderOutlined,
} from "@mui/icons-material";

interface ReviewCardProps {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  rating: number;
  date: string;
  status: "published" | "flagged" | "pending";
  service: string;
  technician: string;
  technicianId: string;
  review: string;
  onFlag?: () => void;
  onDelete?: () => void;
  onApprove?: () => void;
}
const ReviewCard = ({
  customerName,
  customerEmail,
  customerPhone,
  rating,
  date,
  status,
  service,
  technician,
  technicianId,
  review,
  onFlag,
  onDelete,
  onApprove,
}: ReviewCardProps) => {
  const getStatusBadge = () => {
    switch (status) {
      case "published":
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
            Published
          </span>
        );
      case "flagged":
        return (
          <span className="px-3 py-1 bg-red-100 text-red-700 rounded text-xs font-medium">
            Flagged
          </span>
        );
      case "pending":
        return (
          <span className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded text-xs font-medium">
            Pending Review
          </span>
        );
    }
  };
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-4">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-4">
          <div className="bg-gray-100 rounded-full p-3">
            <Person2Outlined className="w-6 h-6 text-gray-500" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{customerName}</h3>
            <p className="text-sm text-gray-600">{customerEmail}</p>
            <p className="text-sm text-gray-600">+91 {customerPhone}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="flex mb-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <StarBorderOutlined
                  key={star}
                  className={`w-4 h-4 ${
                    star <= rating
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">{date}</p>
          </div>
          {getStatusBadge()}
        </div>
      </div>
      <div className="space-y-2 mb-4">
        <p className="text-sm">
          <span className="font-semibold">Service:</span> {service}
        </p>
        <p className="text-sm">
          <span className="font-semibold">Technician:</span> {technician}{" "}
          <span className="text-gray-500">(ID: {technicianId})</span>
        </p>
        <p className="text-sm">
          <span className="font-semibold">Review:</span> {review}
        </p>
      </div>
      <div className="flex items-center space-x-3">
        {status === "pending" && onApprove && (
          <button
            onClick={onApprove}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
          >
            <CheckCircleOutlineOutlined className="w-4 h-4" />
            <span>Approve</span>
          </button>
        )}
        {status !== "flagged" && onFlag && (
          <button
            onClick={onFlag}
            className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
          >
            <FlagOutlined className="w-4 h-4" />
            <span>Flag</span>
          </button>
        )}
        {onDelete && (
          <button
            onClick={onDelete}
            className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors text-sm font-medium"
          >
            <DeleteOutlineOutlined className="w-4 h-4" />
            <span>Delete</span>
          </button>
        )}
      </div>
    </div>
  );
}

export default ReviewCard
