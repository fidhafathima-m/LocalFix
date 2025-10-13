// components/technicianManagement/AdminActions.tsx
import React from 'react';
import { useAdminActions } from '../../../../hooks/useAdminActions';
import { ActionButton } from './ActionButtons';

interface AdminActionsProps {
  type: 'approved' | 'pending' | 'suspended' | 'rejected';
  technicianId?: string;
  applicationId?: string;
  technicianName: string;
  onStatusUpdate?: () => void;
}

export const AdminActions: React.FC<AdminActionsProps> = ({
  type,
  technicianId,
  applicationId,
  technicianName,
  onStatusUpdate
}) => {
  const {
    actionInProgress,
    handleStatusChange,
    handleApproveApplication,
    handleRejectApplication
  } = useAdminActions({ onStatusUpdate });

  // For rejected technicians - no actions needed
  if (type === 'rejected') {
    return null;
  }

  // For pending applications
  if (type === 'pending') {
    return (
      <div className="border-t border-gray-200 mt-8 pt-6">
        <h3 className="text-base font-medium mb-4">Application Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <ActionButton
            type="approve"
            onClick={() => handleApproveApplication(applicationId!, technicianName)}
            disabled={!applicationId || actionInProgress}
            loading={actionInProgress}
          />
          <ActionButton
            type="reject"
            onClick={() => handleRejectApplication(applicationId!, technicianName)}
            disabled={!applicationId || actionInProgress}
          />
        </div>
      </div>
    );
  }

  // For suspended technicians - only show activate button
  if (type === 'suspended') {
    return (
      <div className="border-t border-gray-200 mt-8 pt-6">
        <h3 className="text-base font-medium mb-4">Admin Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          <ActionButton
            type="activate"
            onClick={() => handleStatusChange(technicianId!, 'approved', technicianName)}
            disabled={!technicianId || actionInProgress}
            loading={actionInProgress}
          />
        </div>
      </div>
    );
  }

  // For approved technicians - show all actions including suspend
  return (
    <div className="border-t border-gray-200 mt-8 pt-6">
      <h3 className="text-base font-medium mb-4">Admin Actions</h3>
      <div className="grid grid-cols-2 gap-4">
        {technicianId && (
          <ActionButton
            type="suspend"
            onClick={() => handleStatusChange(technicianId, 'suspended', technicianName)}
            disabled={actionInProgress}
            loading={actionInProgress}
          />
        )}
        <ActionButton
          type="edit"
          onClick={() => {/* Implement edit logic */}}
          disabled={actionInProgress}
        />
      </div>
    </div>
  );
};