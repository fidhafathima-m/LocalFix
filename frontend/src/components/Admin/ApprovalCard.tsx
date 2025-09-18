import React from 'react'
interface ApprovalCardProps {
  title: string
  count: number
  countLabel: string
  actionText: string
  actionUrl: string
  icon: React.ReactNode
  color: 'blue' | 'green' | 'yellow' | 'purple' | 'red'
}
export const ApprovalCard: React.FC<ApprovalCardProps> = ({
  title,
  count,
  countLabel,
  actionText,
  actionUrl,
  icon,
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
    <div className={`${getBgColor()} p-4 rounded-md`}>
      <div className="flex items-center mb-2">
        <div className="mr-2">{icon}</div>
        <h3 className="font-medium">{title}</h3>
      </div>
      <p className="font-bold mb-2">
        {count} {countLabel}
      </p>
      <a href={actionUrl} className={`text-sm font-medium ${getLinkColor()}`}>
        {actionText} →
      </a>
    </div>
  )
}
