/* eslint-disable @typescript-eslint/no-explicit-any */
// hooks/useAdminActions.ts
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import toast from 'react-hot-toast';
import { 
  approveApplication, 
  rejectApplication, 
  updateTechnicianStatus 
} from '../features/admin/api/technicianApi';

interface UseAdminActionsProps {
  onStatusUpdate?: () => void;
  redirectOnSuccess?: boolean;
}

export const useAdminActions = ({ 
  onStatusUpdate, 
  redirectOnSuccess = true 
}: UseAdminActionsProps = {}) => {
  const navigate = useNavigate();
  const [actionInProgress, setActionInProgress] = useState(false);
  const [lastActionMessage, setLastActionMessage] = useState('');

  const redirectToTechManagement = () => {
    if (redirectOnSuccess) {
      setTimeout(() => {
        navigate("/admin/technician-management");
      }, 1500);
    }
  };

  // Common success handler
  const handleSuccess = (message: string) => {
    setLastActionMessage(message);
    onStatusUpdate?.();
    redirectToTechManagement();
    return message;
  };

  // Common error handler
  const handleError = (error: any, defaultMessage: string) => {
    return error.response?.data?.message || defaultMessage;
  };

  // Handle technician status change
  const handleStatusChange = async (
    technicianId: string, 
    newStatus: string, 
    technicianName: string
  ) => {
    if (!technicianId) return;

    const action = newStatus === 'suspended' ? 'suspend' : 'activate';
    const actionTitle = newStatus === 'suspended' ? 'Suspend Technician?' : 'Activate Technician?';
    const actionText = newStatus === 'suspended' 
      ? `Are you sure you want to suspend ${technicianName}? They will not be able to accept new jobs.`
      : `Are you sure you want to activate ${technicianName}? They will be able to accept new jobs.`;

    // Add reason input for suspension
    let reason = '';
    if (newStatus === 'suspended') {
      const { value: suspensionReason } = await Swal.fire({
        title: 'Suspension Reason',
        html: `Please provide a reason for suspending <strong>${technicianName}</strong>:`,
        icon: 'warning',
        input: 'textarea',
        inputLabel: 'Suspension Reason',
        inputPlaceholder: 'Enter the reason for suspension...',
        inputAttributes: { 'aria-label': 'Enter the reason for suspension' },
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Continue to Suspend',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        background: '#ffffff',
        inputValidator: (value) => {
          if (!value) return 'Please provide a suspension reason!';
          if (value.length < 10) return 'Reason must be at least 10 characters long';
        }
      });

      if (!suspensionReason) return; // User cancelled
      reason = suspensionReason;
    }

    const result = await Swal.fire({
      title: actionTitle,
      html: `
        ${actionText}
        ${newStatus === 'suspended' ? `<br><br><strong>Reason:</strong> ${reason}` : ''}
        <br><br>
        <div style="text-align: left; background: #f0f9ff; padding: 10px; border-radius: 5px; margin-top: 10px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="emailNotification" checked style="margin: 0;">
            <span>Send email notification to technician</span>
          </label>
        </div>
      `,
      icon: newStatus === 'suspended' ? 'warning' : 'question',
      showCancelButton: true,
      confirmButtonColor: newStatus === 'suspended' ? '#EF4444' : '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: newStatus === 'suspended' ? 'Yes, Suspend!' : 'Yes, Activate!',
      reverseButtons: true,
      background: '#ffffff',
      didRender: () => {
        const checkbox = document.getElementById('emailNotification') as HTMLInputElement;
        if (checkbox) checkbox.checked = true;
      },
      preConfirm: () => {
        const checkbox = document.getElementById('emailNotification') as HTMLInputElement;
        return {
          emailNotification: checkbox ? checkbox.checked : true
        };
      }
    });

    if (result.isConfirmed && result.value) {
      const { emailNotification } = result.value;
      setActionInProgress(true);

      const statusPromise = updateTechnicianStatus(
        technicianId, 
        newStatus, 
        emailNotification,
        reason
      );

      const successMessage = newStatus === 'suspended' 
        ? `${technicianName} has been suspended successfully.${emailNotification ? ' Email notification sent.' : ''}`
        : `${technicianName} has been activated successfully.${emailNotification ? ' Email notification sent.' : ''}`;

      toast.promise(
        statusPromise,
        {
          loading: `${action === 'suspend' ? 'Suspending' : 'Activating'} ${technicianName}...`,
          success: () => {
            return handleSuccess(successMessage);
          },
          error: (error) => {
            return handleError(error, `Failed to ${action} technician. Please try again.`);
          }
        },
        {
          success: { duration: 4000 },
          error: { duration: 4000 }
        }
      ).finally(() => {
        setActionInProgress(false);
      });
    }
  };

  // Handle application approval
  const handleApproveApplication = async (applicationId: string, technicianName: string) => {
    if (!applicationId) return;

    const result = await Swal.fire({
      title: 'Approve Application?',
      html: `
        Are you sure you want to approve <strong>${technicianName}</strong>'s application?
        <br><br>
        <div style="text-align: left; background: #f0f9ff; padding: 10px; border-radius: 5px; margin-top: 10px;">
          <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="emailNotification" checked style="margin: 0;">
            <span>Send approval email to technician</span>
          </label>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10B981',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Yes, Approve!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: '#ffffff',
      iconColor: '#10B981',
      preConfirm: () => {
        const checkbox = document.getElementById('emailNotification') as HTMLInputElement;
        return {
          emailNotification: checkbox ? checkbox.checked : true
        };
      }
    });

    if (result.isConfirmed && result.value) {
      const { emailNotification } = result.value;
      setActionInProgress(true);

      const approvePromise = approveApplication(applicationId, emailNotification);

      const successMessage = `Application approved! ${technicianName} is now an active technician.${emailNotification ? ' Email sent.' : ''}`;

      toast.promise(
        approvePromise,
        {
          loading: `Approving ${technicianName}'s application...`,
          success: () => {
            return handleSuccess(successMessage);
          },
          error: (error) => {
            return handleError(error, 'Failed to approve application. Please try again.');
          }
        },
        {
          success: { duration: 4000 },
          error: { duration: 4000 }
        }
      ).finally(() => {
        setActionInProgress(false);
      });
    }
  };

  // Handle application rejection
  const handleRejectApplication = async (applicationId: string, technicianName: string) => {
    if (!applicationId) return;

    const { value: formValues } = await Swal.fire({
      title: 'Reject Application?',
      html: `
        <div style="text-align: left;">
          <p>Please provide a reason for rejecting <strong>${technicianName}</strong>'s application:</p>
          <textarea 
            id="rejectionReason" 
            placeholder="Enter the reason for rejection..." 
            style="width: 100%; height: 100px; padding: 10px; border: 1px solid #ddd; border-radius: 5px; margin: 10px 0; resize: vertical;"
          ></textarea>
          <div style="background: #f0f9ff; padding: 10px; border-radius: 5px; margin-top: 10px;">
            <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
              <input type="checkbox" id="emailNotification" checked style="margin: 0;">
              <span>Send rejection email to applicant</span>
            </label>
          </div>
        </div>
      `,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#EF4444',
      cancelButtonColor: '#6B7280',
      confirmButtonText: 'Reject Application',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
      background: '#ffffff',
      focusConfirm: false,
      preConfirm: () => {
        const reasonInput = document.getElementById('rejectionReason') as HTMLTextAreaElement;
        const checkbox = document.getElementById('emailNotification') as HTMLInputElement;
        
        const reason = reasonInput ? reasonInput.value : '';
        
        if (!reason) {
          Swal.showValidationMessage('Please provide a rejection reason!');
          return false;
        }
        if (reason.length < 10) {
          Swal.showValidationMessage('Reason must be at least 10 characters long');
          return false;
        }
        
        return {
          rejectionReason: reason,
          emailNotification: checkbox ? checkbox.checked : true
        };
      }
    });

    if (formValues) {
      const { rejectionReason, emailNotification } = formValues;
      setActionInProgress(true);

      try {
        const rejectPromise = rejectApplication(applicationId, rejectionReason, emailNotification);

        const successMessage = `Application rejected.${emailNotification ? ' Email sent to applicant.' : ''}`;

        toast.promise(
          rejectPromise,
          {
            loading: `Rejecting ${technicianName}'s application...`,
            success: () => {
              return handleSuccess(successMessage);
            },
            error: (error) => {
              return handleError(error, 'Failed to reject application. Please try again.');
            }
          },
          {
            success: { duration: 4000 },
            error: { duration: 4000 }
          }
        ).finally(() => {
          setActionInProgress(false);
        });
      } catch (error) {
        console.error('Rejection error:', error);
        setActionInProgress(false);
      }
    }
  };

  return {
    actionInProgress,
    lastActionMessage,
    handleStatusChange,
    handleApproveApplication,
    handleRejectApplication
  };
};