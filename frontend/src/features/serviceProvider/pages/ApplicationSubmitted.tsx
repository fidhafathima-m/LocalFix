import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SuccessIcon } from '../components/SuccessIcon'

export const ApplicationSubmitted: React.FC = () => {
  const [countdown, setCountdown] = useState(5)
  const navigate = useNavigate()

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
       localStorage.removeItem("applicationId");
      localStorage.removeItem("currentTechnicianApplication");
      // Redirect to dashboard when countdown reaches 0
      navigate('/pending-technician/dashboard')
    }
  }, [countdown, navigate])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-md w-full text-center">
        <div className="flex justify-center mb-4">
          <SuccessIcon />
        </div>
        <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
        <p className="text-gray-600 mb-6">
          Thank you for applying to be a LocalFix technician.
          <br />
          Your application has been received and is being reviewed.
        </p>
        <div className="bg-blue-50 rounded-md p-4 mb-8">
          <p className="text-blue-800 text-sm">
            You will be redirected to your technician dashboard in{' '}
            <span className="font-bold">{countdown}</span> seconds.
          </p>
        </div>
        <div className="space-y-4">
          <Link to="/pending-technician/dashboard" className="block bg-blue-600 text-white py-2.5 rounded-md hover:bg-blue-700">
            Go to Dashboard Now
          </Link>
          <Link to="/technicians" className="block text-blue-600 hover:text-blue-800">
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}