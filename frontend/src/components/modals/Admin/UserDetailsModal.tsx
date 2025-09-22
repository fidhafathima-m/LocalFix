import React from 'react'
import { CloseOutlined, CheckCircleOutlineOutlined } from '@mui/icons-material'
import type { User } from '../../../pages/Admin/UserManagement'
import { AdminSidebar } from '../../Admin/AdminSidebar'

interface UserDetailsModalProps {
  user: User
  isOpen: boolean
  onClose: () => void
  onEdit: () => void
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  user,
  isOpen,
  onClose,
  onEdit,
}) => {
  if (!isOpen) return null

  return (
    <>
    <AdminSidebar activePage='Users'/>
    <div className="fixed inset-0 bg-gray-200 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">User Details</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <CloseOutlined />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Avatar + Name + Status */}
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2">
              <span className="text-gray-600 text-xl">{user.fullName.charAt(0)}</span>
            </div>
            <h3 className="text-lg font-medium">{user.fullName}</h3>
            <div className="flex items-center mt-1 space-x-2">
              <span
                className={`text-xs px-2 py-0.5 rounded-full ${
                  user.isVerified ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {user.isVerified ? 'Active' : 'Inactive'}
              </span>
              {user.isVerified && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                  <CheckCircleOutlineOutlined className="mr-1" fontSize="small" /> Verified
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <DetailItem
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              }
              label="Email"
              value={user.email ?? '—'}
            />
            <DetailItem
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
              }
              label="Phone"
              value={user.phone}
            />
            <DetailItem
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              }
              label="Registered On"
              value={new Date(user.createdAt).toLocaleDateString()}
            />
            <DetailItem
              icon={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                </svg>
              }
              label="Wallet Balance"
              value={`$${user.wallet.balance.toFixed(2)}`}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md"
          >
            Close
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            Edit User
          </button>
        </div>
      </div>
    </div>
    </>
    
  )
}

interface DetailItemProps {
  icon: React.ReactNode
  label: string
  value: string
}

const DetailItem: React.FC<DetailItemProps> = ({ icon, label, value }) => (
  <div>
    <div className="flex items-center mb-1">
      {icon}
      <span className="text-sm text-gray-500 ml-2">{label}</span>
    </div>
    <p className="text-sm font-medium pl-7">{value}</p>
  </div>
)
