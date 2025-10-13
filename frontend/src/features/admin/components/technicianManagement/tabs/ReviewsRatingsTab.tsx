import type { TechnicianDetails } from "../../../../../validation/types/technicianTypes";

interface ReviewsRatingsTabProps {
    technician: TechnicianDetails,
    isSuspended?: boolean
}

const ReviewsRatingsTab: React.FC<ReviewsRatingsTabProps> = ({ technician }) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          i < Math.floor(rating) ? (
            <svg key={i} className="h-5 w-5 text-yellow-400 fill-current" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ) : (
            <svg key={i} className="h-5 w-5 text-gray-300" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          )
        ))}
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium mb-6">Reviews & Ratings</h2>
      
      {/* Rating Overview */}
      <div className="flex items-center space-x-6 mb-6">
        <div className="text-center">
          <p className="text-4xl font-bold text-gray-900">{technician.averageRating.toFixed(1)}</p>
          <div className="flex justify-center mt-1">
            {renderStars(technician.averageRating)}
          </div>
          <p className="text-sm text-gray-600 mt-1">
            {technician.ratingCount} {technician.ratingCount === 1 ? 'review' : 'reviews'}
          </p>
        </div>
      </div>

      {/* Rating Distribution */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <p className="text-sm text-gray-600 text-center">
          Detailed reviews and ratings will be displayed here as customers provide feedback.
        </p>
      </div>
    </div>
  )
}

export default ReviewsRatingsTab