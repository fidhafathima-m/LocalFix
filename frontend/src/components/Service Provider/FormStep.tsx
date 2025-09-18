import React, { type ReactNode } from 'react'
interface FormStepProps {
  title: string
  children: ReactNode
  onNext?: () => void
  onPrevious?: () => void
  showPrevious?: boolean
  showNext?: boolean
  isLastStep?: boolean
}
export const FormStep: React.FC<FormStepProps> = ({
  title,
  children,
  onNext,
  onPrevious,
  showPrevious = false,
  showNext = true,
  isLastStep = false,
}) => {
  return (
    <div className="w-full">
      <h2 className="text-xl font-medium mb-6">{title}</h2>
      <div className="space-y-6">{children}</div>
      <div className="mt-8 flex justify-between">
        {showPrevious && (
          <button
            onClick={onPrevious}
            className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center hover:bg-gray-50"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            Previous
          </button>
        )}
        {!showPrevious && <div></div>}
        {showNext && (
          <button
            onClick={onNext}
            className={`px-6 py-2 rounded-md text-white flex items-center ${isLastStep ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
          >
            {isLastStep ? 'Submit Application' : 'Next'}
            {!isLastStep && (
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 5l7 7-7 7"
                ></path>
              </svg>
            )}
            {isLastStep && (
              <svg
                className="w-5 h-5 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M5 13l4 4L19 7"
                ></path>
              </svg>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
