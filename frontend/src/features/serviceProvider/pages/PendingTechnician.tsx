import React from 'react'
import {
  ErrorOutlineOutlined,
  CheckCircleOutlineOutlined,
  AccessTimeOutlined,
  CircleOutlined,
  ChevronRightOutlined,
  ClearOutlined,
  EditOutlined,
  MarkChatUnreadOutlined,
  HelpOutlineOutlined,
} from '@mui/icons-material';
export const PendingTechnicianApplication: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-3xl mx-auto space-y-4">
        {/* Header Card */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center">
            <div className="h-12 w-12 bg-gray-200 rounded-full flex items-center justify-center mr-4">
              <span className="text-gray-600 text-lg font-medium">R</span>
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-semibold">Rajesh Kumar</h1>
              <div className="flex items-center">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  <AccessTimeOutlined className="w-3 h-3 mr-1" />
                  Pending Verification
                </span>
              </div>
            </div>
            <button className="text-blue-500 flex items-center text-sm font-medium">
              <EditOutlined className="w-4 h-4 mr-1" />
              Edit Profile
            </button>
          </div>
          <div className="mt-2">
            <p className="text-sm text-gray-500">Application Date: 7/15/2023</p>
          </div>
        </div>
        {/* Application Status */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-medium mb-4">Application Status</h2>
          <div className="flex items-center justify-between mb-6">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-2">
                <CheckCircleOutlineOutlined className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-600 text-center">
                Profile Completed
              </span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-green-200"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500 mb-2">
                <CheckCircleOutlineOutlined className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-600 text-center">
                Documents Submitted
              </span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-yellow-200"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-500 mb-2">
                <AccessTimeOutlined className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-600 text-center">
                Admin Verification
              </span>
            </div>
            <div className="flex-1 h-1 mx-2 bg-gray-200"></div>
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mb-2">
                <CircleOutlined className="w-5 h-5" />
              </div>
              <span className="text-xs text-gray-600 text-center">
                Start Accepting Jobs
              </span>
            </div>
          </div>
          {/* Verification in Progress */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 mb-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <ErrorOutlineOutlined className="h-5 w-5 text-blue-500" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Verification in Progress
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <p>
                    Your application is currently under review by our admin
                    team. This typically takes 24-48 hours from submission.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* Document Status */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-medium mb-4">Document Status</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleOutlineOutlined className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm">ID Proof</span>
              </div>
              <span className="text-xs text-green-600">Verified</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleOutlineOutlined className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm">Address Proof</span>
              </div>
              <span className="text-xs text-green-600">Verified</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <AccessTimeOutlined className="w-5 h-5 text-yellow-500 mr-2" />
                <span className="text-sm">Police Verification</span>
              </div>
              <span className="text-xs text-yellow-600">Not submitted</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CheckCircleOutlineOutlined className="w-5 h-5 text-green-500 mr-2" />
                <span className="text-sm">Passport Photo</span>
              </div>
              <span className="text-xs text-green-600">Verified</span>
            </div>
          </div>
        </div>
        {/* Next Steps */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-medium mb-3">Next Steps:</h2>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">-</span>
              <span>Wait for admin verification (24-48 hours)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">-</span>
              <span>Keep your phone available for verification calls</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">-</span>
              <span>Submit police verification certificate (recommended)</span>
            </li>
          </ul>
        </div>
        {/* Restrictions */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-medium mb-3">Restrictions During Verification</h2>
          <div className="space-y-3">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                  <ClearOutlined className="h-3 w-3 text-red-500" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700 font-medium">
                  Cannot accept bookings
                </p>
                <p className="text-xs text-gray-500">
                  You'll be able to accept job requests after verification
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                  <ClearOutlined className="h-3 w-3 text-red-500" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700 font-medium">
                  Cannot access earnings
                </p>
                <p className="text-xs text-gray-500">
                  Earnings features will be available after verification
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-5 w-5 rounded-full bg-red-100 flex items-center justify-center">
                  <ClearOutlined className="h-3 w-3 text-red-500" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700 font-medium">
                  Cannot chat with customers
                </p>
                <p className="text-xs text-gray-500">
                  Messaging will be available once your account is verified
                </p>
              </div>
            </div>
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-0.5">
                <div className="h-5 w-5 rounded-full bg-green-100 flex items-center justify-center">
                  <CheckCircleOutlineOutlined className="h-3 w-3 text-green-500" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm text-gray-700 font-medium">
                  Can update profile & documents
                </p>
                <p className="text-xs text-gray-500">
                  You can make changes to your profile during verification
                </p>
              </div>
            </div>
          </div>
        </div>
        {/* Update Documents */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-medium mb-3">Update Documents</h2>
          <p className="text-sm text-gray-600 mb-4">
            Need to update or add missing documents? You can do that here.
          </p>
          <button className="w-full flex items-center justify-center px-4 py-2 border border-blue-300 text-blue-600 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <span className="text-sm font-medium">Manage Documents</span>
          </button>
        </div>
        {/* Need Help */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <h2 className="font-medium mb-4">Need Help?</h2>
          <div className="mb-4">
            <h3 className="text-sm font-medium mb-2">
              Frequently Asked Questions
            </h3>
            <div className="space-y-2">
              <button className="w-full flex items-center justify-between text-left p-2 hover:bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700">
                  How long does verification take?
                </span>
                <ChevronRightOutlined className="h-4 w-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between text-left p-2 hover:bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700">
                  Can I update my documents?
                </span>
                <ChevronRightOutlined className="h-4 w-4 text-gray-400" />
              </button>
              <button className="w-full flex items-center justify-between text-left p-2 hover:bg-gray-50 rounded-md">
                <span className="text-sm text-gray-700">
                  What happens after verification?
                </span>
                <ChevronRightOutlined className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2">Contact Support</h3>
            <button className="w-full bg-blue-600 text-white rounded-md py-2.5 px-4 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center justify-center mb-2">
              <MarkChatUnreadOutlined className="w-4 h-4 mr-2" />
              Chat with Support
            </button>
            <button className="w-full text-gray-700 flex items-center justify-center py-2 hover:bg-gray-50 rounded-md">
              <HelpOutlineOutlined className="w-4 h-4 mr-2 text-gray-500" />
              View Help Center
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
