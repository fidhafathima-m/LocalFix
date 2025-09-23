import React, { useState, useEffect } from 'react'
import { CloseOutlined, CheckCircleOutlineOutlined } from '@mui/icons-material'
import type { User } from '../../../pages/Admin/UserManagement'

type Status = "Active" | "Inactive" | "Blocked"

interface UserModalProps {
  user: User
  isOpen: boolean
  isEditing: boolean
  onClose: () => void
  onBlock: (status: Status) => void
  onUserUpdated: (updatedUser: User) => void
}

export const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  isEditing,
  onClose,
  onBlock,
  onUserUpdated
}) => {
  // Local state for toggling edit mode
  const [editingMode, setEditingMode] = useState(isEditing)

  // Local state for form data
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email ?? '',
    phone: user.phone,
    status: user.status
  })

  // Sync editing mode and form data when user or modal opens
  useEffect(() => {
    setEditingMode(isEditing)
    setFormData({
      fullName: user.fullName,
      email: user.email ?? '',
      phone: user.phone,
      status: user.status
    })
  }, [isEditing, user])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (status: Status) => {
    setFormData(prev => ({ ...prev, status }))
  }

  const handleSave = () => {
    const updatedUser = { ...user, ...formData }
    onUserUpdated(updatedUser)
    setEditingMode(false)
  }

  return (
    <div className="fixed inset-0 bg-gray-200 bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-md shadow-lg">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-medium">{editingMode ? 'Edit User' : 'User Details'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
            <CloseOutlined />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="flex flex-col items-center">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2">
              <span className="text-gray-600 text-xl">{user.fullName.charAt(0)}</span>
            </div>

            {editingMode ? (
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className="text-lg font-medium border-b border-gray-300 focus:outline-none text-center"
              />
            ) : (
              <h3 className="text-lg font-medium">{user.fullName}</h3>
            )}

            <div className="flex items-center mt-1 space-x-2">
              {editingMode ? (
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) => handleStatusChange(e.target.value as Status)}
                  className="text-xs px-2 py-0.5 rounded-full border focus:outline-none"
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                  <option value="Blocked">Blocked</option>
                </select>
              ) : (
                <span
                  className={`text-xs px-2 py-0.5 rounded-full ${
                    user.status === "Active"
                      ? "bg-green-100 text-green-600"
                      : user.status === "Blocked"
                      ? "bg-red-100 text-red-600"
                      : "bg-gray-100 text-gray-600"
                  }`}
                >
                  {user.status}
                </span>
              )}

              {user.isVerified && user.status !== "Blocked" && (
                <span className="bg-blue-100 text-blue-600 text-xs px-2 py-0.5 rounded-full flex items-center">
                  <CheckCircleOutlineOutlined className="mr-1" fontSize="small" /> Verified
                </span>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            {['email', 'phone'].map((field) => (
              <DetailItem
                key={field}
                label={field === 'email' ? 'Email' : 'Phone'}
                value={editingMode ? (
                  <input
                    type={field === 'email' ? 'email' : 'tel'}
                    name={field}
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    value={(formData as any)[field]}
                    onChange={handleChange}
                    className="border-b border-gray-300 focus:outline-none w-full"
                  />
                ) : (
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (user as any)[field] ?? '—'
                )}
              />
            ))}

            <DetailItem label="Registered On" value={new Date(user.createdAt).toLocaleDateString()} />
            <DetailItem label="Wallet Balance" value={`$${user.wallet.balance.toFixed(2)}`} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-4 border-t space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md cursor-pointer"
          >
            Close
          </button>

          {!editingMode && (
            <>
              {user.status === "Blocked" ? (
                <button
                  onClick={() => onBlock("Active")}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md cursor-pointer"
                >
                  Unblock User
                </button>
              ) : (
                <button
                  onClick={() => onBlock("Blocked")}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md cursor-pointer"
                >
                  Block User
                </button>
              )}
              <button
                onClick={() => setEditingMode(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer"
              >
                Edit User
              </button>
            </>
          )}

          {editingMode && (
            <button
              onClick={handleSave}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer"
            >
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

// DetailItem component
interface DetailItemProps {
  label: string
  value: React.ReactNode
}

const DetailItem: React.FC<DetailItemProps> = ({ label, value }) => (
  <div>
    <div className="flex items-center mb-1">
      <span className="text-sm text-gray-500">{label}</span>
    </div>
    <p className="text-sm font-medium pl-0">{value}</p>
  </div>
)
