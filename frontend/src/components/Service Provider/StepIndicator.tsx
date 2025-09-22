import React from 'react'
interface StepIndicatorProps {
  steps: string[]
  currentStep: number
  completedSteps: number[]
}
export const StepIndicator: React.FC<StepIndicatorProps> = ({
  steps,
  currentStep,
}) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center relative">
        {steps.map((_ , index) => {
          const isActive = currentStep === index + 1
          console.log(isActive)
          const isCompleted = index + 1 < currentStep;
          // Create connector lines between steps
          if (index < steps.length - 1) {
            const lineClass =
              index < currentStep - 1 || isCompleted
                ? 'bg-blue-600'
                : 'bg-gray-200'
            // This creates the connecting line
            const lineStyle = {
              position: 'absolute' as const,
              height: '2px',
              left: `${(index / (steps.length - 1)) * 100}%`,
              right: `${100 - ((index + 1) / (steps.length - 1)) * 100}%`,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 1,
            }
            return (
              <div
                key={`line-${index}`}
                className={lineClass}
                style={lineStyle}
              ></div>
            )
          }
          return null
        })}
        {steps.map((_ , index) => {
          const isActive = currentStep === index + 1
          const isCompleted = index + 1 < currentStep;
          let circleClasses =
            'w-10 h-10 rounded-full flex items-center justify-center z-10'
          if (isActive) {
            circleClasses += ' bg-blue-600 text-white'
          } else if (isCompleted) {
            circleClasses += ' bg-blue-600 text-white'
          } else {
            circleClasses += ' bg-gray-200 text-gray-600'
          }
          return (
            <div key={index} className="flex flex-col items-center">
              <div className={circleClasses}>
                {isCompleted ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <div className="text-xs mt-1 text-gray-500">
                {index === 0
                  ? 'Start'
                  : index === steps.length - 1
                    ? 'Submit'
                    : ''}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
