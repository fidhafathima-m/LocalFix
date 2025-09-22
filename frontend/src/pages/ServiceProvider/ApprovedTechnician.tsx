import React from 'react'
import {
  CalendarTodayOutlined,
//   SettingsOutlined,
  AccountCircleOutlined,
//   DescriptionOutlined,
//   EmailOutlined,
//   NotificationsOutlined,
  FmdGoodOutlined,
  ChevronRightOutlined,
  StarBorderOutlined,
} from '@mui/icons-material';
export const ApprovedTechnicianDashboard: React.FC = () => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <StarBorderOutlined
            key={i}
            className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                <span className="text-yellow-700 text-lg font-medium">R</span>
              </div>
              <div>
                <div className="flex items-center">
                  <h1 className="text-lg font-semibold mr-2">Rajesh Kumar</h1>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                </div>
                <div className="flex items-center mt-1">
                  <div className="flex items-center">
                    {renderStars(4.8)}
                    <span className="ml-1 text-sm text-gray-600">4.8</span>
                  </div>
                  <span className="mx-2 text-gray-300">|</span>
                  <span className="text-sm text-gray-600 flex items-center">
                    <FmdGoodOutlined className="h-3 w-3 mr-1" /> Pune, Maharashtra
                  </span>
                </div>
              </div>
            </div>
            <div>
              <button className="text-blue-600 text-sm font-medium">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="max-w-3xl mx-auto px-4 py-4">
        <div className="grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CalendarTodayOutlined className="h-5 w-5 text-blue-500 mr-2" />
                <span className="text-xs text-gray-500">Upcoming</span>
              </div>
            </div>
            <div className="mt-1">
              <div className="text-xl font-bold">3</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-green-500 text-lg mr-1">₹</span>
                <span className="text-xs text-gray-500">This Month</span>
              </div>
            </div>
            <div className="mt-1">
              <div className="text-xl font-bold">₹12500</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="text-purple-500 text-xs mr-1">Jobs</span>
              </div>
            </div>
            <div className="mt-1">
              <div className="text-xl font-bold">37</div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <StarBorderOutlined className="h-5 w-5 text-yellow-500 mr-1" />
                <span className="text-xs text-gray-500">Average</span>
              </div>
            </div>
            <div className="mt-1">
              <div className="text-xl font-bold">4.8</div>
            </div>
          </div>
        </div>
      </div>
      {/* Navigation */}
      <div className="border-b border-gray-200 bg-white">
        <div className="max-w-3xl mx-auto px-4">
          <nav className="flex overflow-x-auto">
            <button className="px-3 py-4 text-sm font-medium text-blue-600 border-b-2 border-blue-600 whitespace-nowrap">
              Overview
            </button>
            <button className="px-3 py-4 text-sm font-medium text-gray-500 whitespace-nowrap hover:text-gray-700">
              Bookings
            </button>
            <button className="px-3 py-4 text-sm font-medium text-gray-500 whitespace-nowrap hover:text-gray-700">
              Earnings
            </button>
            <button className="px-3 py-4 text-sm font-medium text-gray-500 whitespace-nowrap hover:text-gray-700">
              Profile
            </button>
            <button className="px-3 py-4 text-sm font-medium text-gray-500 whitespace-nowrap hover:text-gray-700">
              SettingsOutlined
            </button>
            <button className="px-3 py-4 text-sm font-medium text-gray-500 whitespace-nowrap hover:text-gray-700">
              Documents
            </button>
            <button className="px-3 py-4 text-sm font-medium text-gray-500 whitespace-nowrap hover:text-gray-700">
              Messages
            </button>
            <button className="px-3 py-4 text-sm font-medium text-gray-500 whitespace-nowrap hover:text-gray-700">
              Notifications
            </button>
          </nav>
        </div>
      </div>
      {/* Dashboard Content */}
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h2 className="text-lg font-medium mb-4">Dashboard Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Upcoming Bookings */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium flex items-center">
                <CalendarTodayOutlined className="h-4 w-4 text-blue-500 mr-2" />
                Upcoming Bookings
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-sm">AC Repair</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <FmdGoodOutlined className="h-3 w-3 mr-1" />
                    Koregaon Park, Pune
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    Tomorrow
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-sm">AC Repair</div>
                  <div className="flex items-center text-xs text-gray-500 mt-1">
                    <FmdGoodOutlined className="h-3 w-3 mr-1" />
                    Koregaon Park, Pune
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium px-2 py-1 bg-blue-50 text-blue-700 rounded">
                    Tomorrow
                  </div>
                </div>
              </div>
            </div>
            <button className="flex items-center justify-center w-full text-blue-600 text-sm font-medium mt-3">
              <span>View all bookings</span>
              <ChevronRightOutlined className="h-4 w-4 ml-1" />
            </button>
          </div>
          {/* Recent Earnings */}
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium flex items-center">
                <span className="text-green-500 text-lg mr-2">₹</span>
                Recent Earnings
              </h3>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-sm">
                    Washing Machine Repair
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    July 18, 2023
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-green-600">₹850</div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-sm">
                    Washing Machine Repair
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    July 15, 2023
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium text-green-600">₹850</div>
                </div>
              </div>
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div>
                  <div className="font-medium text-sm">
                    Washing Machine Repair
                  </div>
                  <div className="text-xs text-gray-500 mt-1">July 7, 2023</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-green-600">₹850</div>
                </div>
              </div>
            </div>
            <button className="flex items-center justify-center w-full text-blue-600 text-sm font-medium mt-3">
              <span>View earnings history</span>
              <ChevronRightOutlined className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
        {/* Recent Reviews */}
        <div className="mt-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium flex items-center">
                <StarBorderOutlined className="h-4 w-4 text-yellow-500 mr-2 fill-yellow-400" />
                Recent Reviews
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                    <AccountCircleOutlined className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Customer 1</div>
                    <div className="flex mt-1">{renderStars(5)}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Great service! Very professional and fixed my AC quickly.
                  Highly recommended to others.
                </p>
                <p className="text-xs text-gray-400 mt-2">July 16, 2023</p>
              </div>
              <div className="border border-gray-100 rounded-lg p-3">
                <div className="flex items-center mb-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center mr-2">
                    <AccountCircleOutlined className="h-4 w-4 text-gray-500" />
                  </div>
                  <div>
                    <div className="text-sm font-medium">Customer 2</div>
                    <div className="flex mt-1">{renderStars(5)}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Great service! Very professional and fixed my AC quickly.
                  Highly recommended to others.
                </p>
                <p className="text-xs text-gray-400 mt-2">May 30, 2023</p>
              </div>
            </div>
            <button className="flex items-center justify-center w-full text-blue-600 text-sm font-medium mt-4">
              <span>View all reviews</span>
              <ChevronRightOutlined className="h-4 w-4 ml-1" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
