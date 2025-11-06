import React, { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowBackIosNewOutlined, StarBorderOutlined } from '@mui/icons-material'
import Header from '../../../../components/common/Header'
import Footer from '../../../../components/common/Footer'

const ReviewSuccess: React.FC = () => {
  const navigate = useNavigate()
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/orders')
    }, 3000)
    return () => clearTimeout(timer)
  }, [navigate])
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowBackIosNewOutlined className="w-5 h-5 mr-2" />
          Back to Orders
        </Link>
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6">
            <StarBorderOutlined className="w-12 h-12 text-green-600 fill-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-4">
            Thank you for your feedback!
          </h1>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Your review helps us improve our service and helps other customers.
          </p>
          <p className="text-sm text-gray-500">Redirecting to orders page...</p>
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default ReviewSuccess;
