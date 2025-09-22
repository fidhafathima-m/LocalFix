import React, { useState } from 'react'
import { AdminSidebar } from '../../components/Admin/AdminSidebar'
import { SearchOutlined, ExpandMoreOutlined, FileDownloadOutlined, RemoveRedEyeOutlined, EditOutlined, StarBorderOutlined } from '@mui/icons-material'
import Search from '../../components/Admin/Search'
interface Technician {
  id: string
  name: string
  email: string
  phone: string
  services: string[]
  rating: number
  jobs: number
  status: 'active' | 'inactive' | 'suspended'
  subscription: string
  location: string
}
export const TechnicianManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [serviceFilter, setServiceFilter] = useState('All Services')
  const [ratingFilter, setRatingFilter] = useState('All Ratings')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [activeTab, setActiveTab] = useState('all')
  const technicians: Technician[] = [
    {
      id: '# 1',
      name: 'Rajesh Kumar',
      email: 'rajesh@example.com',
      phone: '+91 9876543220',
      services: ['AC Repair', 'Refrigerator'],
      rating: 4.8,
      jobs: 45,
      status: 'active',
      subscription: 'Premium Plan',
      location: 'Pune',
    },
    {
      id: '# 2',
      name: 'Suresh Patel',
      email: 'suresh@example.com',
      phone: '+91 9876543221',
      services: ['Washing Machine', 'Fan Repair'],
      rating: 4.5,
      jobs: 38,
      status: 'active',
      subscription: 'Standard Plan',
      location: 'Mumbai',
    },
    {
      id: '# 3',
      name: 'Ramesh Singh',
      email: 'ramesh@example.com',
      phone: '+91 9876543223',
      services: ['Plumbing', 'Electrical'],
      rating: 4.7,
      jobs: 41,
      status: 'active',
      subscription: 'Basic Plan',
      location: 'Bangalore',
    },
    {
      id: '# 5',
      name: 'Dinesh Gupta',
      email: 'dinesh@example.com',
      phone: '+91 9876543224',
      services: ['Painting', 'Carpentry'],
      rating: 4.5,
      jobs: 32,
      status: 'active',
      subscription: 'Unsubscribed',
      location: 'Chennai',
    },
  ]
  // Count calculations
  const allTechnicians = technicians.length
  const pendingApplications = 3 // Example hardcoded value
  const suspendedTechnicians = 1 // Example hardcoded value
  // Render star ratings
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        <div className="flex">
          {[...Array(5)].map((_, i) => (
            <StarBorderOutlined
              key={i}
              className={`h-4 w-4 ${i < Math.floor(rating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
            />
          ))}
        </div>
        <span className="ml-1 text-yellow-500 font-medium">
          {rating.toFixed(1)}
        </span>
      </div>
    )
  }
  // Service badge colors
  const getServiceColor = (service: string) => {
    const colors: Record<string, string> = {
      'AC Repair': 'bg-blue-100 text-blue-800',
      Refrigerator: 'bg-blue-100 text-blue-800',
      'Washing Machine': 'bg-indigo-100 text-indigo-800',
      'Fan Repair': 'bg-indigo-100 text-indigo-800',
      Plumbing: 'bg-purple-100 text-purple-800',
      Electrical: 'bg-purple-100 text-purple-800',
      Painting: 'bg-cyan-100 text-cyan-800',
      Carpentry: 'bg-cyan-100 text-cyan-800',
    }
    return colors[service] || 'bg-gray-100 text-gray-800'
  }
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - fixed position */}
      <AdminSidebar activePage="Technicians" />
      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto ml-[240px]">
        {/* Header with search */}
        <Search/>
        {/* Dashboard content */}
        <div className="p-6">
          <div className="flex flex-col md:flex-row justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold mb-1">Technician Management</h1>
              <p className="text-gray-600">
                Manage technicians, review applications, and monitor
                performance.
              </p>
            </div>
            <button className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              <FileDownloadOutlined className="h-4 w-4 mr-2" />
              Export Technicians
            </button>
          </div>
          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex space-x-8">
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 ${activeTab === 'all' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('all')}
              >
                <span>All Technicians</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {allTechnicians}
                </span>
              </button>
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 ${activeTab === 'pending' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('pending')}
              >
                <span>Pending Applications</span>
                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs">
                  {pendingApplications}
                </span>
              </button>
              <button
                className={`py-2 px-1 -mb-px flex items-center space-x-1 ${activeTab === 'suspended' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('suspended')}
              >
                <span>Suspended Technicians</span>
                <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs">
                  {suspendedTechnicians}
                </span>
              </button>
            </div>
          </div>
          {/* Search and filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="col-span-1 md:col-span-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, email or phone"
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <SearchOutlined className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div>
                <div className="relative">
                  <select
                    className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={serviceFilter}
                    onChange={(e) => setServiceFilter(e.target.value)}
                  >
                    <option>All Services</option>
                    <option>AC Repair</option>
                    <option>Refrigerator</option>
                    <option>Washing Machine</option>
                    <option>Fan Repair</option>
                    <option>Plumbing</option>
                    <option>Electrical</option>
                  </select>
                  <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <div className="relative">
                  <select
                    className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Statuses</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Suspended</option>
                  </select>
                  <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div className="md:col-start-2 md:col-span-2">
                <div className="flex space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <select
                        className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        value={ratingFilter}
                        onChange={(e) => setRatingFilter(e.target.value)}
                      >
                        <option>All Ratings</option>
                        <option>5 Star</option>
                        <option>4+ Star</option>
                        <option>3+ Star</option>
                      </select>
                      <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="relative">
                      <select className="appearance-none w-full pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500">
                        <option>All Subscriptions</option>
                        <option>Premium Plan</option>
                        <option>Standard Plan</option>
                        <option>Basic Plan</option>
                        <option>Unsubscribed</option>
                      </select>
                      <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Technicians table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Technician
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Contact
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Services
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Rating
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Jobs
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Subscription
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Location
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {technicians.map((technician) => (
                    <tr key={technician.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-yellow-100 rounded-full flex items-center justify-center">
                            <span className="text-yellow-600 text-sm font-medium">
                              {technician.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {technician.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {technician.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {technician.phone}
                        </div>
                        <div className="text-sm text-gray-500">
                          {technician.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-wrap gap-1">
                          {technician.services.map((service) => (
                            <span
                              key={service}
                              className={`px-2 py-1 inline-flex text-xs leading-4 font-medium rounded-full ${getServiceColor(service)}`}
                            >
                              {service}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {renderStars(technician.rating)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {technician.jobs}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {technician.subscription}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {technician.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="p-1 rounded-full text-blue-600 hover:bg-blue-100">
                            <RemoveRedEyeOutlined className="h-5 w-5" />
                          </button>
                          <button className="p-1 rounded-full text-green-600 hover:bg-green-100">
                            <EditOutlined className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
