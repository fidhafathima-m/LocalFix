import React from 'react'
import Swal from 'sweetalert2'
import toast from 'react-hot-toast'
import api from '../../../../utils/axiosConfig'
import { useAuth } from '../../../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

interface AdminActionsProps {
  type: 'approved' | 'pending' | 'suspended' | 'rejected'
  technicianId?: string
  applicationId?: string
  technicianName: string
  onStatusUpdate?: () => void
}

export const AdminActions: React.FC<AdminActionsProps> = ({
  type,
  technicianId,
  applicationId,
  technicianName,
  onStatusUpdate
}) => {
  const { token } = useAuth()
  const navigate = useNavigate();

  const redirectToTechManagement = () => {
    setTimeout(() => {
      navigate("/admin/technician-management")
    }, 1500)
  }

  // Handle technician status change
  const handleStatusChange = async (newStatus: string) => {
    if (!technicianId) return

    const action = newStatus === 'suspended' ? 'suspend' : 'activate'
    const actionTitle = newStatus === 'suspended' ? 'Suspend Technician?' : 'Activate Technician?'
    const actionText = newStatus === 'suspended' 
      ? `Are you sure you want to suspend ${technicianName}? They will not be able to accept new jobs.`
      : `Are you sure you want to activate ${technicianName}? They will be able to accept new jobs.`
    const confirmColor = newStatus === 'suspended' ? '#EF4444' : '#10B981'
    const confirmText = newStatus === 'suspended' ? 'Yes, Suspend!' : 'Yes, Activate!'

    const result = await Swal.fire({
      title: actionTitle,
      html: actionText,
      icon: newStatus === 'suspended' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: confirmColor,
      cancelButtonColor: '#6B7280',
      confirmButtonText: confirmText,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: '#ffffff'
    })

    if (result.isConfirmed) {
      const statusPromise = api.patch(
        `${import.meta.env.VITE_BASE_URL}/technicians/${technicianId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      const successMessage = newStatus === 'suspended' 
        ? `${technicianName} has been suspended successfully.`
        : `${technicianName} has been activated successfully.`

      toast.promise(
        statusPromise,
        {
          loading: `${action === 'suspend' ? 'Suspending' : 'Activating'} ${technicianName}...`,
          success: () => {
            onStatusUpdate?.()
            redirectToTechManagement()
            return successMessage
          },
          error: `Failed to ${action} technician. Please try again.`
        },
        {
          success: {
            duration: 3000,
          },
          error: {
            duration: 3000,
          }
        }
      )
    }
  }

  // Handle application approval
  const handleApproveApplication = async () => {
    if (!applicationId) return

    const result = await Swal.fire({
      title: 'Approve Application?',
      html: `Are you sure you want to approve <strong>${technicianName}</strong>'s application?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Approve!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: '#ffffff',
      iconColor: '#10B981'
    })

    if (result.isConfirmed) {
      const approvePromise = api.patch(
        `${import.meta.env.VITE_BASE_URL}/technicians/applications/${applicationId}/approve`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      toast.promise(
        approvePromise,
        {
          loading: `Approving ${technicianName}'s application...`,
          success: () => {
            onStatusUpdate?.()
            redirectToTechManagement()
            return `Application approved! ${technicianName} is now an active technician.`
          },
          error: 'Failed to approve application. Please try again.'
        },
        {
          success: {
            duration: 4000,
          },
          error: {
            duration: 4000,
          }
        }
      )
    }
  }

  // Handle application rejection
  const handleRejectApplication = async () => {
    if (!applicationId) return

    const { value: reason } = await Swal.fire({
      title: 'Reject Application?',
      html: `Please provide a reason for rejecting <strong>${technicianName}</strong>'s application:`,
      icon: 'warning',
      input: 'textarea',
      inputLabel: 'Rejection Reason',
      inputPlaceholder: 'Enter the reason for rejection...',
      inputAttributes: {
        'aria-label': 'Enter the reason for rejection'
      },
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Reject Application',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: '#ffffff',
      inputValidator: (value) => {
        if (!value) {
          return 'Please provide a rejection reason!'
        }
        if (value.length < 10) {
          return 'Reason must be at least 10 characters long'
        }
      }
    })

    if (reason) {
      const rejectPromise = api.patch(
        `${import.meta.env.VITE_BASE_URL}/technicians/applications/${applicationId}/reject`,
        { rejectionReason: reason },
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      )

      toast.promise(
        rejectPromise,
        {
          loading: `Rejecting ${technicianName}'s application...`,
          success: () => {
            onStatusUpdate?.()
            redirectToTechManagement()
            return `Application rejected. ${technicianName} has been notified.`
          },
          error: 'Failed to reject application. Please try again.'
        },
        {
          success: {
            duration: 4000,
          },
          error: {
            duration: 4000,
          }
        }
      )
    }
  }

  // Handle reset password
  // const handleResetPassword = async () => {
  //   const result = await Swal.fire({
  //     title: 'Reset Password?',
  //     html: `Are you sure you want to reset password for <strong>${technicianName}</strong>?`,
  //     icon: 'question',
  //     showCancelButton: true,
  //     confirmButtonColor: '#3B82F6',
  //     cancelButtonColor: '#6B7280',
  //     confirmButtonText: 'Yes, Reset Password!',
  //     cancelButtonText: 'Cancel',
  //     reverseButtons: true,
  //     background: '#ffffff'
  //   })

  //   if (result.isConfirmed) {
  //     // Implement password reset logic here
  //     toast.success(`Password reset link sent to ${technicianName}`)
  //   }
  // }

  // Handle edit details
  const handleEditDetails = () => {
    toast.success(`Edit details for ${technicianName}`)
    // Implement edit details logic here
  }

  // Handle assign booking
  // const handleAssignBooking = () => {
  //   toast.success(`Assign booking to ${technicianName}`)
  //   // Implement assign booking logic here
  // }

  // // Handle process payout
  // const handleProcessPayout = () => {
  //   toast.success(`Process payout for ${technicianName}`)
  //   // Implement process payout logic here
  // }

  // // Handle send message
  // const handleSendMessage = () => {
  //   toast.success(`Send message to ${technicianName}`)
  //   // Implement send message logic here
  // }

  // For rejected technicians - no actions needed
  if (type === 'rejected') {
    return null // Don't show any admin actions for rejected technicians
  }

  // For pending applications
  if (type === 'pending') {
    return (
      <div className="border-t border-gray-200 mt-8 pt-6">
        <h3 className="text-base font-medium mb-4">Application Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={handleApproveApplication}
            className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-md hover:bg-green-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Approve Application
          </button>
          <button 
            onClick={handleRejectApplication}
            className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
            Reject Application
          </button>
        </div>
      </div>
    )
  }

  // For suspended technicians - only show activate button
  if (type === 'suspended') {
    return (
      <div className="border-t border-gray-200 mt-8 pt-6">
        <h3 className="text-base font-medium mb-4">Admin Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={() => handleStatusChange('approved')}
            className="flex items-center justify-center px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-md hover:bg-green-100 transition-colors "
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
            Activate Technician
          </button>
        </div>
      </div>
    )
  }

  // For approved technicians - show all actions including suspend
  return (
    <div className="border-t border-gray-200 mt-8 pt-6">
      <h3 className="text-base font-medium mb-4">Admin Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {technicianId && (
          <>
            <button 
              onClick={() => handleStatusChange('suspended')}
              className="flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 border border-red-200 rounded-md hover:bg-red-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="9" y1="9" x2="15" y2="15"></line>
                <line x1="15" y1="9" x2="9" y2="15"></line>
              </svg>
              Suspend Technician
            </button>
            {/* <button 
              onClick={handleResetPassword}
              className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
              Reset Password
            </button> */}
          </>
        )}
        <button 
          onClick={handleEditDetails}
          className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
          Edit Details
        </button>
        {/* <button 
          onClick={handleAssignBooking}
          className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg>
          Assign Booking
        </button>
        <button 
          onClick={handleProcessPayout}
          className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <line x1="12" y1="1" x2="12" y2="23"></line>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
          </svg>
          Process Payout
        </button>
        <button 
          onClick={handleSendMessage}
          className="flex items-center justify-center px-4 py-2 bg-gray-50 text-gray-600 border border-gray-200 rounded-md hover:bg-gray-100 transition-colors"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          Send Message
        </button> */}
      </div>
    </div>
  )
}