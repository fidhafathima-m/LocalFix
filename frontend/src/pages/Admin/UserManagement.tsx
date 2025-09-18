import React, { useState } from 'react'
import { AdminSidebar } from '../../components/Admin/AdminSidebar'
import {
  PeopleAltOutlined,
  VerifiedUserOutlined,
  PersonOffOutlined,
  PersonAddAltOutlined,
  SearchOutlined,
  ExpandMoreOutlined,
  RemoveRedEyeOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
} from '@mui/icons-material'
interface User {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive'
  registrationDate: string
  bookings: number
  location: string
}
export const UserManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')
  const users: User[] = [
    {
      id: '# 1',
      name: 'Amit Sharma',
      email: 'amit@example.com',
      phone: '+91 9876543210',
      status: 'active',
      registrationDate: '15 Jan 2023',
      bookings: 8,
      location: 'Pune',
    },
    {
      id: '# 2',
      name: 'Priya Patel',
      email: 'priya@example.com',
      phone: '+91 9876543211',
      status: 'active',
      registrationDate: '22 Feb 2023',
      bookings: 5,
      location: 'Mumbai',
    },
    {
      id: '# 3',
      name: 'Rahul Verma',
      email: 'rahul@example.com',
      phone: '+91 9876543212',
      status: 'inactive',
      registrationDate: '10 Mar 2023',
      bookings: 3,
      location: 'Delhi',
    },
    {
      id: '# 4',
      name: 'Neha Singh',
      email: 'neha@example.com',
      phone: '+91 9876543213',
      status: 'active',
      registrationDate: '05 Apr 2023',
      bookings: 6,
      location: 'Bangalore',
    },
  ]
  // Stats calculations
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status === 'active').length
  const blockedUsers = 1 // Example hardcoded value
  const newUsers = 3 // Example hardcoded value for last 30 days
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - fixed position */}
      <AdminSidebar activePage='Users' />
      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto ml-[240px]">
        {/* Header with search */}
        <div className="bg-white p-4 sticky top-0 z-10 shadow-sm">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <SearchOutlined className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
            <button className="absolute right-2 top-2 bg-blue-500 text-white rounded-full p-1">
              <SearchOutlined className="h-4 w-4" />
            </button>
          </div>
        </div>
        {/* Dashboard content */}
        <div className="p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-1">User Management</h1>
            <p className="text-gray-600">
              Manage users, view their details, and control account status.
            </p>
          </div>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg flex items-start">
              <div className="p-2 bg-blue-100 rounded-md mr-3">
                <PeopleAltOutlined className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-xl font-bold">{totalUsers}</p>
              </div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg flex items-start">
              <div className="p-2 bg-green-100 rounded-md mr-3">
                <VerifiedUserOutlined className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Users</p>
                <p className="text-xl font-bold">{activeUsers}</p>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-lg flex items-start">
              <div className="p-2 bg-red-100 rounded-md mr-3">
                <PersonOffOutlined className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Blocked Users</p>
                <p className="text-xl font-bold">{blockedUsers}</p>
              </div>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg flex items-start">
              <div className="p-2 bg-yellow-100 rounded-md mr-3">
                <PersonAddAltOutlined className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">
                  New Users (Last 30 days)
                </p>
                <p className="text-xl font-bold">{newUsers}</p>
              </div>
            </div>
          </div>
          {/* Search and filters */}
          <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="w-full md:w-auto flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search users by name, email, or phone"
                    className="w-full pl-10 pr-4 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <SearchOutlined className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
              <div className="w-full md:w-auto">
                <div className="relative">
                  <select
                    className="appearance-none w-full md:w-48 pl-4 pr-10 py-2 rounded-md border border-gray-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                    <option>Blocked</option>
                  </select>
                  <ExpandMoreOutlined className="absolute right-3 top-2.5 h-5 w-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
          {/* Users table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      User
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
                      Status
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Registered On
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      Bookings
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
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                            <span className="text-gray-600 text-sm font-medium">
                              {user.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {user.email}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.phone}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                        >
                          {user.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.registrationDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.bookings}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button className="p-1 rounded-full text-blue-600 hover:bg-blue-100">
                            <RemoveRedEyeOutlined className="h-5 w-5" />
                          </button>
                          <button className="p-1 rounded-full text-green-600 hover:bg-green-100">
                            <EditOutlined className="h-5 w-5" />
                          </button>
                          <button className="p-1 rounded-full text-red-600 hover:bg-red-100">
                            <DeleteOutlineOutlined className="h-5 w-5" />
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
