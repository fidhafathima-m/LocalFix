import React from 'react'
interface StatsCardProps {
  title: string
  value: string
  icon: React.ReactNode
  linkText: string
  linkUrl: string
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}
export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  linkText,
  linkUrl,
  color,
}) => {
  const getBgColor = () => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50'
      case 'green':
        return 'bg-green-50'
      case 'yellow':
        return 'bg-yellow-50'
      case 'purple':
        return 'bg-purple-50'
      case 'red':
        return 'bg-red-50'
      default:
        return 'bg-gray-50'
    }
  }
  const getLinkColor = () => {
    switch (color) {
      case 'blue':
        return 'text-blue-600 hover:text-blue-700'
      case 'green':
        return 'text-green-600 hover:text-green-700'
      case 'yellow':
        return 'text-yellow-600 hover:text-yellow-700'
      case 'purple':
        return 'text-purple-600 hover:text-purple-700'
      case 'red':
        return 'text-red-600 hover:text-red-700'
      default:
        return 'text-gray-600 hover:text-gray-700'
    }
  }
  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-2xl font-bold mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-md ${getBgColor()}`}>{icon}</div>
      </div>
      <a
        href={linkUrl}
        className={`text-sm mt-4 inline-block ${getLinkColor()}`}
      >
        {linkText} →
      </a>
    </div>
  )
}
