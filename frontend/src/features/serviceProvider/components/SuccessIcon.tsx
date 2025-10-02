import React from 'react'
interface SuccessIconProps {
  size?: string
  className?: string
}
export const SuccessIcon: React.FC<SuccessIconProps> = ({
  size = 'h-16 w-16',
  className = '',
}) => {
  return (
    <div
      className={`rounded-full bg-green-100 p-3 flex items-center justify-center ${size} ${className}`}
    >
      <svg
        className="w-3/4 h-3/4 text-green-500"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M5 13l4 4L19 7"
        />
      </svg>
    </div>
  )
}
