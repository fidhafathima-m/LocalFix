import React from "react";
import {
  StarBorderOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
} from "@mui/icons-material";

export const ReviewsSection: React.FC = () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const reviews: any[] = []; // Empty for now

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <h2 className="text-lg font-semibold mb-4">Reviews & Ratings</h2>
      {reviews.length > 0 ? (
        <div className="space-y-4">
          {reviews.map((review, index) => (
            <div
              key={index}
              className="border-b border-gray-200 pb-4 last:border-b-0"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <p className="font-semibold">{review.service}</p>
                  <p className="text-sm text-gray-600">
                    Technician: {review.technician}
                  </p>
                </div>
                <span className="text-sm text-gray-500">{review.date}</span>
              </div>
              <div className="flex items-center space-x-1 mb-2">
                {[...Array(review.rating)].map((_, i) => (
                  <StarBorderOutlined
                    key={i}
                    className="w-4 h-4 fill-yellow-400 text-yellow-400"
                  />
                ))}
              </div>
              <p className="text-sm text-gray-600">{review.comment}</p>
              <div className="flex space-x-4 mt-2">
                <button className="text-sm text-blue-600 hover:underline flex items-center space-x-1">
                  <EditOutlined className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button className="text-sm text-red-600 hover:underline flex items-center space-x-1">
                  <DeleteOutlineOutlined className="w-3 h-3" />
                  <span>Delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <StarBorderOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-500">No reviews yet</p>
          <p className="text-sm text-gray-400 mt-1">
            Your reviews will appear here after you book services
          </p>
        </div>
      )}
    </div>
  );
};
