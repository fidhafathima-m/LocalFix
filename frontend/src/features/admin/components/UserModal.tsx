import React, { useState, useEffect } from 'react'
import { CloseOutlined, CheckCircleOutlineOutlined } from '@mui/icons-material'
import type { User } from '../pages/UserManagement'
import { updateUser } from '../api/adminApi'
import toast from 'react-hot-toast'

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
  const [editingMode, setEditingMode] = useState(isEditing)

  const [formData, setFormData] = useState({
    fullName: user.fullName,
    email: user.email ?? '',
    phone: user.phone,
    status: user.status
  })

  useEffect(() => {
    setEditingMode(isEditing)
    setFormData({
      fullName: user.fullName,
      email: user.email ?? '',
      phone: user.phone,
      status: user.status
    })
  }, [isEditing, user])

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent background scrolling
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleStatusChange = (status: Status) => {
    setFormData(prev => ({ ...prev, status }))
  }

  const handleSave = async () => {
  try {
    console.log('Updating user with data:', { 
      userId: user._id, 
      updates: formData,
      endpoint: `${import.meta.env.VITE_BASE_URL}/users/${user._id}/edit`
    });
    
    const updatedUser = await updateUser(user._id, formData);
    
    console.log('User updated successfully:', updatedUser);
    
    onUserUpdated(updatedUser);
    toast.success("User updated successfully!");
    setEditingMode(false);
  } catch (err) {
    console.error("Error updating user:", err);
    toast.error(err instanceof Error ? err.message : "Failed to update user");
  }
};

  return (
    <>
      {/* Overlay that covers only the content area */}
      <div 
        className="fixed inset-0 bg-gray-100 bg-opacity-50 z-40 ml-[240px]"
        onClick={onClose}
      />
      
      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div 
          className="bg-white rounded-lg w-full max-w-md shadow-xl mx-auto pointer-events-auto relative z-50"
          onClick={(e) => e.stopPropagation()} 
        >
          {/* Header */}
          <div className="flex justify-between items-center p-4 border-b">
            <h2 className="text-lg font-medium">{editingMode ? 'Edit User' : 'User Details'}</h2>
            <button 
              onClick={onClose} 
              className="text-gray-400 hover:text-gray-500 p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <CloseOutlined className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                <span className="text-gray-600 text-xl font-medium">
                  {user.fullName.charAt(0)}
                </span>
              </div>

              {editingMode ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className="text-lg font-medium border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center px-2 py-1"
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
                    className="text-xs px-2 py-0.5 rounded-full border focus:outline-none focus:border-blue-500"
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
                      className="border-b border-gray-300 focus:outline-none focus:border-blue-500 w-full px-1 py-1"
                    />
                  ) : (
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (user as any)[field] ?? '—'
                  )}
                />
              ))}

              <DetailItem label="Registered On" value={new Date(user.createdAt).toLocaleDateString()} />
              <DetailItem label="Wallet Balance" value={`₹${user.wallet.balance.toFixed(2)}`} />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end p-4 border-t space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors cursor-pointer"
            >
              Close
            </button>

            {!editingMode && (
              <>
                {user.status === "Blocked" ? (
                  <button
                    onClick={() => onBlock("Active")}
                    className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors cursor-pointer"
                  >
                    Unblock User
                  </button>
                ) : (
                  <button
                    onClick={() => onBlock("Blocked")}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors cursor-pointer"
                  >
                    Block User
                  </button>
                )}
                <button
                  onClick={() => setEditingMode(true)}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
                >
                  Edit User
                </button>
              </>
            )}

            {editingMode && (
              <button
                onClick={handleSave}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
              >
                Save
              </button>
            )}
          </div>
        </div>
      </div>
    </>
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
    <div className="text-sm font-medium pl-0">{value}</div>
  </div>
)