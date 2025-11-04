/* eslint-disable @typescript-eslint/no-explicit-any */
// components/UserModal.tsx - Improved Version
import React, { useState, useEffect } from "react";
import { 
  CloseOutlined, 
  CheckCircleOutlineOutlined,
  LocationOnOutlined,
  PersonOutlined,
  EmailOutlined,
  PhoneOutlined,
  CalendarTodayOutlined,
  AccountBalanceWalletOutlined,
  BadgeOutlined,
  SecurityOutlined
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { adminAPI } from "../../../../services/common/adminApi";
import type { User } from "../../../../interface/admin/IUser";

type Status = "Active" | "Inactive" | "Blocked";

interface UserModalProps {
  user: User;
  isOpen: boolean;
  isEditing: boolean;
  onClose: () => void;
  onBlock: (status: Status) => void;
  onUserUpdated: (updatedUser: User) => void;
}

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  status: Status;
}

interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
  isDefault: boolean;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  formattedAddress?: string;
  placeId?: string;
  createdAt: string;
  updatedAt: string;
}

// Define string fields that exist in User interface
type StringField = "fullName" | "email" | "phone" | "status";

export const UserModal: React.FC<UserModalProps> = ({
  user,
  isOpen,
  isEditing,
  onClose,
  onBlock,
  onUserUpdated,
}) => {
  const [editingMode, setEditingMode] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    fullName: user.fullName,
    email: user.email ?? "",
    phone: user.phone,
    status: user.status,
  });

  useEffect(() => {
    setEditingMode(isEditing);
    setFormData({
      fullName: user.fullName,
      email: user.email ?? "",
      phone: user.phone,
      status: user.status,
    });
  }, [isEditing, user]);

  // Load addresses when modal opens
  useEffect(() => {
    if (isOpen && user._id) {
      loadUserAddresses();
    }
  }, [isOpen, user._id]);

  // Close modal on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const loadUserAddresses = async () => {
    try {
      setLoadingAddresses(true);
      const response = await adminAPI.getPublicUserById(user._id) as any;
      
      if (response.data.success && response.data.data?.user?.addresses) {
        setAddresses(response.data.data.user.addresses);
      } else {
        setAddresses(user.addresses || []);
      }
    } catch (error) {
      console.error("Error loading addresses:", error);
      setAddresses(user.addresses || []);
    } finally {
      setLoadingAddresses(false);
    }
  };

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: Status) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleSave = async () => {
    if (!formData.fullName?.trim()) {
      toast.error("Full name is required");
      return;
    }

    if (isSaving) return;

    setIsSaving(true);
    try {
      const response = await adminAPI.updateUser(user._id, formData);

      if (response.data.success) {
        const updatedUser = response.data.data?.user;

        if (updatedUser) {
          onUserUpdated(updatedUser);
          toast.success("User updated successfully!");
          setEditingMode(false);
        } else {
          throw new Error("User data not found in response");
        }
      } else {
        throw new Error(response.data.message || "Failed to update user");
      }
    } catch (err: unknown) {
      console.error("Error updating user:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update user";
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getFieldValue = (field: keyof FormData): string => {
    return formData[field];
  };

  const getUserFieldValue = (field: StringField): string => {
    const value = user[field];
    return value ?? "—";
  };

  const getWalletBalance = (): string => {
    if (!user.wallet) {
      return "₹0.00";
    }
    const balance = user.wallet.balance ?? 0;
    return `₹${balance.toFixed(2)}`;
  };

  const getRegistrationDate = (): string => {
    if (!user.createdAt) {
      return "—";
    }
    return new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDateOfBirth = (): string => {
    if (!user.dateOfBirth) {
      return "—";
    }
    return new Date(user.dateOfBirth).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoles = (): string => {
    if (!user.roles || !Array.isArray(user.roles)) {
      return "user";
    }
    return user.roles.map(role => role.charAt(0).toUpperCase() + role.slice(1)).join(', ');
  };

  const formatAddress = (address: Address): string => {
    const parts = [
      address.street,
      address.landmark,
      address.city,
      address.state,
      address.pincode
    ].filter(part => part && part.trim() !== '');
    
    return parts.join(', ');
  };

  const getCoordinates = (address: Address): string => {
    if (!address.location?.coordinates) return "No coordinates";
    const [lng, lat] = address.location.coordinates;
    return `Lat: ${lat.toFixed(6)}, Lng: ${lng.toFixed(6)}`;
  };

  const getProfilePictureUrl = (): string => {
    return user.profilePicture || user.profilePictureUrl || '';
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 text-gray-400 bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div className="ml-[240px]"></div>
      </div>

      {/* Modal container */}
      <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
        <div
          className="bg-white rounded-xl w-full max-w-4xl shadow-2xl mx-auto pointer-events-auto relative z-50 max-h-[90vh] overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {editingMode ? "Edit User" : "User Details"}
              </h2>
              <p className="text-gray-600 text-sm mt-1">
                {editingMode ? "Update user information" : "View and manage user account"}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              <CloseOutlined className="h-6 w-6" />
            </button>
          </div>

          {/* Body with scrolling */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* User Profile Header */}
              <div className="flex items-start space-x-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6">
                <div className="flex-shrink-0">
                  {getProfilePictureUrl() ? (
                    <img
                      src={getProfilePictureUrl()}
                      alt={user.fullName}
                      className="w-24 h-24 rounded-2xl object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center border-4 border-white shadow-lg">
                      <PersonOutlined className="h-12 w-12 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      {editingMode ? (
                        <input
                          type="text"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                          className="text-2xl font-bold bg-transparent border-b-2 border-blue-300 focus:outline-none focus:border-blue-500 w-full px-2 py-1 text-gray-900"
                          placeholder="Full Name"
                        />
                      ) : (
                        <h1 className="text-2xl font-bold text-gray-900 truncate">
                          {user.fullName || "Unknown User"}
                        </h1>
                      )}
                      
                      <div className="flex items-center flex-wrap gap-2 mt-3">
                        {editingMode ? (
                          <select
                            name="status"
                            value={formData.status}
                            onChange={(e) =>
                              handleStatusChange(e.target.value as Status)
                            }
                            className="px-3 py-1 rounded-full border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Blocked">Blocked</option>
                          </select>
                        ) : (
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-medium ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-700 border border-green-200"
                                : user.status === "Blocked"
                                ? "bg-red-100 text-red-700 border border-red-200"
                                : "bg-yellow-100 text-yellow-700 border border-yellow-200"
                            }`}
                          >
                            {user.status || "Unknown"}
                          </span>
                        )}

                        {user.isVerified && user.status !== "Blocked" && (
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-200 flex items-center">
                            <CheckCircleOutlineOutlined
                              className="mr-1"
                              fontSize="small"
                            />
                            Verified
                          </span>
                        )}

                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm font-medium border border-purple-200 flex items-center">
                          <SecurityOutlined className="mr-1" fontSize="small" />
                          {getRoles()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <PersonOutlined className="mr-2 text-blue-500" />
                    Personal Information
                  </h3>
                  <div className="space-y-3">
                    <InfoItem
                      icon={<EmailOutlined className="text-gray-400" />}
                      label="Email Address"
                      value={
                        editingMode ? (
                          <input
                            type="email"
                            name="email"
                            value={getFieldValue("email")}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Email address"
                          />
                        ) : (
                          <span className="text-gray-900">{getUserFieldValue("email")}</span>
                        )
                      }
                    />
                    <InfoItem
                      icon={<PhoneOutlined className="text-gray-400" />}
                      label="Phone Number"
                      value={
                        editingMode ? (
                          <input
                            type="tel"
                            name="phone"
                            value={getFieldValue("phone")}
                            onChange={handleChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Phone number"
                          />
                        ) : (
                          <span className="text-gray-900">{getUserFieldValue("phone")}</span>
                        )
                      }
                    />
                    <InfoItem
                      icon={<CalendarTodayOutlined className="text-gray-400" />}
                      label="Date of Birth"
                      value={<span className="text-gray-900">{getDateOfBirth()}</span>}
                    />
                    <InfoItem
                      icon={<BadgeOutlined className="text-gray-400" />}
                      label="Gender"
                      value={<span className="text-gray-900">{user.gender || "—"}</span>}
                    />
                  </div>
                </div>

                {/* Account Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <SecurityOutlined className="mr-2 text-green-500" />
                    Account Information
                  </h3>
                  <div className="space-y-3">
                    <InfoItem
                      icon={<CalendarTodayOutlined className="text-gray-400" />}
                      label="Registered On"
                      value={<span className="text-gray-900">{getRegistrationDate()}</span>}
                    />
                    <InfoItem
                      icon={<AccountBalanceWalletOutlined className="text-gray-400" />}
                      label="Wallet Balance"
                      value={<span className="text-green-600 font-semibold">{getWalletBalance()}</span>}
                    />
                    <InfoItem
                      icon={<BadgeOutlined className="text-gray-400" />}
                      label="User ID"
                      value={<span className="font-mono text-sm text-gray-600">{user._id}</span>}
                    />
                  </div>
                </div>
              </div>

              {/* Addresses Section */}
              <div className="border-t border-gray-200 pt-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                    <LocationOnOutlined className="mr-2 text-red-500" />
                    Addresses
                  </h3>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {addresses.length} address{addresses.length !== 1 ? 'es' : ''}
                  </span>
                </div>

                {loadingAddresses ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-2">Loading addresses...</p>
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div
                        key={address.id}
                        className={`border rounded-xl p-4 transition-all duration-200 hover:shadow-md ${
                          address.isDefault 
                            ? 'border-blue-300 bg-blue-50 shadow-sm' 
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center">
                            <span className="font-semibold text-gray-900">
                              {address.label}
                            </span>
                            {address.isDefault && (
                              <span className="ml-2 bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-medium">
                                Default
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="space-y-2 text-sm">
                          <p className="text-gray-700 leading-relaxed">{formatAddress(address)}</p>
                          
                          {address.formattedAddress && (
                            <p className="text-gray-500 text-xs bg-white p-2 rounded border">
                              {address.formattedAddress}
                            </p>
                          )}
                          
                          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                            <span className="text-xs text-gray-500 font-mono">
                              {getCoordinates(address)}
                            </span>
                            <span className="text-xs text-gray-400">
                              Added: {new Date(address.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <LocationOnOutlined className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                    <p className="text-gray-500 font-medium">No addresses found</p>
                    <p className="text-gray-400 text-sm mt-1">This user hasn't added any addresses yet.</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-between items-center p-6 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Last updated: {new Date(user.updatedAt || user.createdAt).toLocaleDateString()}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 cursor-pointer shadow-sm"
              >
                Close
              </button>

              {!editingMode && (
                <>
                  {user.status === "Blocked" ? (
                    <button
                      onClick={() => onBlock("Active")}
                      className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors duration-200 cursor-pointer shadow-sm"
                    >
                      Unblock User
                    </button>
                  ) : (
                    <button
                      onClick={() => onBlock("Blocked")}
                      className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors duration-200 cursor-pointer shadow-sm"
                    >
                      Block User
                    </button>
                  )}
                  <button
                    onClick={() => setEditingMode(true)}
                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200 cursor-pointer shadow-sm"
                  >
                    Edit User
                  </button>
                </>
              )}

              {editingMode && (
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className={`px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg transition-colors duration-200 cursor-pointer shadow-sm ${
                    isSaving 
                      ? "opacity-50 cursor-not-allowed" 
                      : "hover:bg-blue-700"
                  }`}
                >
                  {isSaving ? (
                    <span className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Saving...
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// InfoItem component
interface InfoItemProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoItem: React.FC<InfoItemProps> = ({ icon, label, value }) => (
  <div className="flex items-start space-x-3 p-3 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
    <div className="flex-shrink-0 mt-1">{icon}</div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-base">{value}</div>
    </div>
  </div>
);