// components/technicianManagement/ActionButtons.tsx
import React from 'react';
import { 
  CheckCircleOutlined, 
  BlockOutlined,
  RemoveRedEyeOutlined,
  EditOutlined
} from '@mui/icons-material';

// Define the specific action types
export type ActionType = 'view' | 'approve' | 'reject' | 'suspend' | 'activate' | 'edit';

interface ActionButtonProps {
  type: ActionType;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  title?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  type,
  onClick,
  disabled = false,
  loading = false,
  title,
  size = 'md'
}) => {
  const getButtonConfig = () => {
    const config = {
      view: {
        icon: <RemoveRedEyeOutlined className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />,
        color: 'text-blue-600 hover:bg-blue-100',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        text: 'View'
      },
      approve: {
        icon: <CheckCircleOutlined className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />,
        color: 'text-green-600 hover:bg-green-100',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        text: 'Approve'
      },
      reject: {
        icon: <BlockOutlined className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />,
        color: 'text-red-600 hover:bg-red-100',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        text: 'Reject'
      },
      suspend: {
        icon: <BlockOutlined className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />,
        color: 'text-red-600 hover:bg-red-100',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        text: 'Suspend'
      },
      activate: {
        icon: <CheckCircleOutlined className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />,
        color: 'text-green-600 hover:bg-green-100',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        text: 'Activate'
      },
      edit: {
        icon: <EditOutlined className={`${size === 'sm' ? 'h-4 w-4' : 'h-5 w-5'}`} />,
        color: 'text-gray-600 hover:bg-gray-100',
        bgColor: 'bg-gray-50',
        borderColor: 'border-gray-200',
        text: 'Edit'
      }
    };

    return config[type];
  };

  const config = getButtonConfig();
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-2 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      title={title}
      className={`
        flex items-center justify-center rounded-md border transition-colors
        ${config.bgColor} ${config.borderColor} ${config.color}
        ${sizeClasses[size]}
        ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''}
      `}
    >
      {loading ? (
        <>
          <div className={`animate-spin rounded-full border-2 ${config.color.split(' ')[0]} border-t-transparent mr-2 ${
            size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
          }`}></div>
          Processing...
        </>
      ) : (
        <>
          {config.icon}
          <span className="ml-1 font-medium">{config.text}</span>
        </>
      )}
    </button>
  );
};

// Quick action buttons for tables
interface QuickActionButtonsProps {
  type: 'icon' | 'text';
  actions: Array<{
    type: ActionType;
    onClick: () => void;
    disabled?: boolean;
    loading?: boolean;
    title?: string;
  }>;
}

export const QuickActionButtons: React.FC<QuickActionButtonsProps> = ({ 
  type, 
  actions 
}) => {
  if (type === 'icon') {
    return (
      <div className="flex justify-end space-x-1">
        {actions.map((action, index) => (
          <button
            key={index}
            onClick={action.onClick}
            disabled={action.disabled || action.loading}
            title={action.title}
            className={`
              p-1 rounded-full transition-colors
              ${action.disabled || action.loading ? 'opacity-50 cursor-not-allowed' : ''}
              ${
                action.type === 'view' ? 'text-blue-600 hover:bg-blue-100' :
                action.type === 'approve' ? 'text-green-600 hover:bg-green-100' :
                action.type === 'reject' ? 'text-red-600 hover:bg-red-100' :
                action.type === 'suspend' ? 'text-red-600 hover:bg-red-100' :
                action.type === 'activate' ? 'text-green-600 hover:bg-green-100' :
                'text-gray-600 hover:bg-gray-100'
              }
            `}
          >
            {action.loading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
            ) : (
              action.type === 'view' ? <RemoveRedEyeOutlined className="h-4 w-4" /> :
              action.type === 'approve' ? <CheckCircleOutlined className="h-4 w-4" /> :
              action.type === 'reject' ? <BlockOutlined className="h-4 w-4" /> :
              action.type === 'suspend' ? <BlockOutlined className="h-4 w-4" /> :
              action.type === 'activate' ? <CheckCircleOutlined className="h-4 w-4" /> :
              <EditOutlined className="h-4 w-4" />
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-2">
      {actions.map((action, index) => (
        <ActionButton
          key={index}
          type={action.type}
          onClick={action.onClick}
          disabled={action.disabled}
          loading={action.loading}
          title={action.title}
          size="sm"
        />
      ))}
    </div>
  );
};