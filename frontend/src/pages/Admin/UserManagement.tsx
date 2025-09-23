import React, { useEffect, useState } from 'react'
import { AdminSidebar } from '../../components/Admin/AdminSidebar'
import toast from 'react-hot-toast';
import Swal from 'sweetalert2'
import 'sweetalert2/dist/sweetalert2.min.css'
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
import Search from '../../components/Admin/Search'
import axios from 'axios'
import { UserModal } from '../../components/modals/Admin/UserModal'
export interface User {
  _id: string
  fullName: string
  email?: string
  phone: string
  status: "Active" | "Inactive" | "Blocked"
  defaultAddress?: {
    city: string
    state: string
    pincode: string
    location: { type: "Point"; coordinates: [number, number] }
  }
  isVerified: boolean
  role: string
  createdAt: string
  wallet: {balance: number}
}
export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('All Status')

  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [isEditing, setIsEditing] = useState(false)

  // pagination
  const [currentPage, setCurrentPage] = useState(1)
  const usersPerPage = 5

  // Calculate paginated users
  const indexOfLastUser = currentPage * usersPerPage
  const indexOfFirstUser = indexOfLastUser - usersPerPage
  const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser)

  const totalPages = Math.ceil(users.length / usersPerPage)



   useEffect(() => {
  const fetchUsers = async () => {
    try {
      const res = await axios.get<{ users: User[] }>(`${import.meta.env.VITE_BASE_URL}/users`)
      setUsers(res.data?.users ?? []) // fallback to [] if undefined
    } catch (err) {
      console.error('Error fetching users:', err)
      setUsers([]) // fallback on error
    } finally {
      setLoading(false)
    }
  }
  fetchUsers()
}, [])

const handleOpenViewModal = (user: User) => {
  setSelectedUser(user)
  setIsEditing(false)
  setIsModalOpen(true)
}
const handleOpenEditModal = (user: User) => {
  setSelectedUser(user)
  setIsEditing(true)
  setIsModalOpen(true)
}

const handleCloseModal = () => {
  setSelectedUser(null)
  setIsModalOpen(false)
}



 // Block / Unblock user
const handleBlockUser = async (userId: string, newStatus: "Active" | "Inactive" | "Blocked") => {
  const result = await Swal.fire({
    title: `Are you sure?`,
    text: `Do you want to ${newStatus === "Blocked" ? "block" : "unblock"} this user?`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: `Yes, ${newStatus === "Blocked" ? "block" : "unblock"}!`,
  })

  if (!result.isConfirmed) return

  try {
    await axios.patch(`${import.meta.env.VITE_BASE_URL}/users/${userId}/status`, {
      status: newStatus,
    })

    setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u))
    setSelectedUser(prev => prev && prev._id === userId ? { ...prev, status: newStatus } : prev)

    toast.success(`User status changed to ${newStatus}`)
  } catch (err) {
    console.error("Error updating user status:", err)
    toast.error("Failed to update user status")
  }
}

const handleDeleteUser = async (userId: string) => {
  const result = await Swal.fire({
    title: "Are you sure?",
    text: "This action cannot be undone. The user will be permanently deleted.",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Yes, delete it!",
  })

  if (!result.isConfirmed) return

  try {
    await axios.patch(`${import.meta.env.VITE_BASE_URL}/users/${userId}/delete`)

    setUsers(prev => prev.filter(u => u._id !== userId))

    toast.success("User has been deleted.",)
  } catch (err) {
    console.error(err)
    toast.error("Failed to delete user")
  }
}

  
  // Stats calculations
  const totalUsers = users.length
  const activeUsers = users.filter((user) => user.status === 'Active').length
  const blockedUsers = users.filter((user) => user.status === 'Blocked').length
  const newUsers = users.filter((user) => {
    const created = new Date(user.createdAt)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    return created >= thirtyDaysAgo
  }).length



  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - fixed position */}
      <AdminSidebar activePage='Users' />
      {/* Main content - scrollable */}
      <div className="flex-1 overflow-y-auto ml-[240px]">
        {/* Header with search */}
        <Search/>
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
          {loading ? (
            <div className="p-6 text-center text-gray-500">Loading users...</div>
          ) : (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Registered On
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Wallet Balance
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <tr key={user._id} className="hover:bg-gray-50">
                        {/* User Info */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 flex-shrink-0 bg-gray-200 rounded-full flex items-center justify-center">
                              <span className="text-gray-600 text-sm font-medium">
                                {user.fullName.charAt(0)}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {user.fullName}
                              </div>
                              <div className="text-sm text-gray-500">{user._id}</div>
                            </div>
                          </div>
                        </td>

                        {/* Contact */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{user.email || '—'}</div>
                          <div className="text-sm text-gray-500">{user.phone}</div>
                        </td>

                        {/* Status */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                              ${user.status === 'Active'
                                ? 'bg-green-100 text-green-800'
                                : user.status === 'Blocked'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {user.status}
                          </span>
                        </td>

                        {/* Location */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {user.defaultAddress
                            ? `${user.defaultAddress.city}, ${user.defaultAddress.state} (${user.defaultAddress.pincode})`
                            : 'No address'}
                        </td>

                        {/* Registered */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>

                        {/* Wallet */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ₹{user.wallet.balance.toFixed(2)}
                        </td>

                        {/* Actions */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              className="p-1 rounded-full text-blue-600 hover:bg-blue-100 cursor-pointer"
                              onClick={() => handleOpenViewModal(user)}
                            >
                              <RemoveRedEyeOutlined className="h-5 w-5" />
                            </button>
                            <button 
                              className="p-1 rounded-full text-green-600 hover:bg-green-100 cursor-pointer"
                              onClick={() => handleOpenEditModal(user)}
                            >
                              <EditOutlined className="h-5 w-5" />
                            </button>
                            <button
                              className="p-1 rounded-full text-red-600 hover:bg-red-100 cursor-pointer"
                              onClick={() => handleDeleteUser(user._id)}
                            >
                              <DeleteOutlineOutlined className="h-5 w-5" />
                            </button>

                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-6 py-4 text-center text-sm text-gray-500">
                        No users found
                      </td>
                    </tr>
                  )}
                </tbody>


              </table>
            </div>

            {/* pagination */}
            <div className="flex justify-between items-center px-6 py-4 border-t bg-gray-50">
              <span className="text-sm text-gray-600">
                Page {currentPage} of {totalPages}
              </span>

              <div className="flex space-x-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => prev - 1)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Previous
                </button>

                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    onClick={() => setCurrentPage(index + 1)}
                    className={`px-3 py-1 rounded-md text-sm font-medium ${
                      currentPage === index + 1
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => prev + 1)}
                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                    currentPage === totalPages
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-white border border-gray-300 hover:bg-gray-100 text-gray-700"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>


          </div>
          )}
          
        </div>
      </div>
      {selectedUser && (
        <UserModal
          user={selectedUser}
          isOpen={isModalOpen}
          isEditing={isEditing}
          onClose={handleCloseModal}
          onBlock={(status) => selectedUser && handleBlockUser(selectedUser._id, status)}
          onUserUpdated={(updatedUser) => {
            setUsers((prev) =>
              prev.map(u => u._id === updatedUser._id ? updatedUser : u)
            )
            setSelectedUser(updatedUser)
            setIsModalOpen(false)
            toast.success("User updated successfully!")
          }}
        />
      )}

    </div>
    
  )
}
