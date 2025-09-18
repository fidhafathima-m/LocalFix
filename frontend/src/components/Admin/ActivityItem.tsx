import React from 'react'
interface ActivityItemProps {
  name: string
  action: string
  time: string
  icon: React.ReactNode
  iconBg: string
  rating?: number
}
export const ActivityItem: React.FC<ActivityItemProps> = ({
  name,
  action,
  time,
  icon,
  iconBg,
  rating,
}) => {
  return (
    <div className="flex items-start">
      <div className={`${iconBg} p-2 rounded-md mr-3`}>{icon}</div>
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <p className="font-medium">{name}</p>
          <span className="text-xs text-gray-500">{time}</span>
        </div>
        <p className="text-sm text-gray-600">{action}</p>
        {rating && (
          <div className="flex mt-1">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
