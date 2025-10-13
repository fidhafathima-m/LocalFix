import React, { type ReactNode } from 'react'

interface FormStepProps {
  title: string
  children: ReactNode
  onNext?: () => void
  onPrevious?: () => void
  showPrevious?: boolean
  showNext?: boolean
  isLastStep?: boolean
  isLoading?: boolean // Add loading prop
  nextButtonText?: string // Custom next button text
}

export const FormStep: React.FC<FormStepProps> = ({
  title,
  children,
  onNext,
  onPrevious,
  showPrevious = false,
  showNext = true,
  isLastStep = false,
  isLoading = false, // Default to false
  nextButtonText, // Optional custom text
}) => {
  
  // Determine button text
  const getNextButtonText = () => {
    if (nextButtonText) return nextButtonText;
    if (isLastStep) return 'Submit Application';
    return 'Next';
  };

  // Determine button icon
  const getNextButtonIcon = () => {
    if (isLoading) {
      return (
        <svg className="w-5 h-5 ml-2 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      );
    }
    
    if (isLastStep) {
      return (
        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
        </svg>
      );
    }
    
    return (
      <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
      </svg>
    );
  };

  return (
    <div className="w-full">
      <h2 className="text-xl font-medium mb-6">{title}</h2>
      <div className="space-y-6">{children}</div>
      <div className="mt-8 flex justify-between">
        {showPrevious && (
          <button
            onClick={onPrevious}
            disabled={isLoading} // Disable previous button too during loading
            className={`px-6 py-2 border border-gray-300 rounded-md text-gray-700 flex items-center hover:bg-gray-50 ${
              isLoading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Previous
          </button>
        )}
        {!showPrevious && <div></div>}
        {showNext && (
          <button
            onClick={onNext}
            disabled={isLoading}
            className={`px-6 py-2 rounded-md text-white flex items-center ${
              isLoading 
                ? 'bg-gray-400 cursor-not-allowed' 
                : isLastStep 
                  ? 'bg-green-600 hover:bg-green-700 cursor-pointer' 
                  : 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
            }`}
          >
            {getNextButtonText()}
            {getNextButtonIcon()}
          </button>
        )}
      </div>
      
      {/* Optional: Loading overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
            <p className="text-gray-700">Processing, please wait...</p>
          </div>
        </div>
      )}
    </div>
  )
}