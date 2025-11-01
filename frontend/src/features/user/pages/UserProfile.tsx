/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from "react";
import {
  FmdGoodOutlined,
  EditOutlined,
  DeleteOutlineOutlined,
  CreditCardOutlined,
  AccountBalanceWalletOutlined,
  NotificationsNoneOutlined,
  HelpOutlineOutlined,
  ShieldOutlined,
  CheckCircleOutlineOutlined,
  StarBorderOutlined,
  ExpandMoreOutlined,
  MessageOutlined,
  AddOutlined,
  CameraAltOutlined,
} from "@mui/icons-material";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import { userService } from "../../../services/user/userService";
import toast from "react-hot-toast";
import { AddAddressModal } from "../components/AddAddressModal";
import Swal from "sweetalert2";
import type { Address, AddressFormData } from "../../../services/common/userProfileApi";

interface UserData {
  _id: string;
  fullName: string;
  email?: string;
  phone: string;
  status: "Active" | "Inactive" | "Blocked";
  defaultAddress?: {
    city: string;
    state: string;
    pincode: string;
    location: { type: "Point"; coordinates: [number, number] };
  };
  isVerified: boolean;
  role: string;
  createdAt: string;
  wallet: { balance: number };
  profilePicture?: string;
  dateOfBirth?: string;
  gender?: string;
}

const UserProfile: React.FC = () => {
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [showChatSupport, setShowChatSupport] = useState(false);
  const [activeTab, setActiveTab] = useState<"history" | "wallet">("history");
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Real user data state
  const [userData, setUserData] = useState<UserData | null>(null);
  const [personalInfo, setPersonalInfo] = useState({
    fullName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "Male",
  });
  const [tempPersonalInfo, setTempPersonalInfo] = useState(personalInfo);

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);

  // Add this state to your UserProfile component
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);

  // Add this handler function
  const handleChangePassword = async () => {
    try {
      setPasswordError(null);
      setPasswordSuccess(null);

      // Validate passwords
      if (
        !passwordData.currentPassword ||
        !passwordData.newPassword ||
        !passwordData.confirmPassword
      ) {
        setPasswordError("All fields are required");
        return;
      }

      if (passwordData.newPassword.length < 6) {
        setPasswordError("Password must be at least 6 characters long");
        return;
      }

      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setPasswordError("New passwords do not match");
        return;
      }

      const response = await userService.changePassword(passwordData);

      if (response.success) {
        setPasswordSuccess("Password changed successfully!");
        toast.success("Password updated successfully!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsChangingPassword(false);
      } else {
        setPasswordError(response.message || "Failed to change password");
      }
    } catch (err: any) {
      console.error("Error changing password:", err);
      setPasswordError(
        err.response?.data?.message || "Failed to change password"
      );
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPasswordError(null);
    setPasswordSuccess(null);
  };

  const transactions = [
    {
      id: "#8090",
      service: "Refrigerator Repair",
      amount: "₹1200",
      date: "15/12/2023",
      status: "Paid",
    },
    {
      id: "#7899",
      service: "TV Repair - Cancelled",
      amount: "₹800",
      date: "10/12/2023",
      status: "Refund",
    },
    {
      id: "#6789",
      service: "AC Service",
      amount: "₹1500",
      date: "05/12/2023",
      status: "Paid",
    },
  ];

  const reviews: any[] = []; // Empty for now - no reviews yet

  const notifications: any[] = []; // Empty for now - under development

  const faqs = [
    {
      question: "How do I reschedule my booking?",
      answer:
        "You can reschedule your booking by going to My Bookings > Upcoming, and clicking on the 'Reschedule' button next to the booking you want to change. Please note that rescheduling must be done at least 4 hours before the scheduled appointment time.",
    },
    {
      question: "What is your cancellation policy?",
      answer:
        "You can cancel a booking up to 4 hours before the scheduled appointment time without any charges. For cancellations made less than 4 hours before the appointment, a cancellation fee of ₹200 or 10% of the service cost (whichever is higher) may apply.",
    },
    {
      question: "How can I get an invoice for my service?",
      answer:
        "Invoices are automatically generated after the service is completed and the payment is processed. You can find and download your invoices by going to Payments & Wallet Payment History and clicking on the 'Invoice' button next to the respective payment.",
    },
    {
      question: "Are your technicians verified?",
      answer:
        "Yes, all our technicians undergo a thorough background verification process. We check their identity, address, professional certifications, and work experience before onboarding them on our platform. You can see the 'Verified' badge on all technician profiles.",
    },
    {
      question: "How can I report an issue with my service?",
      answer:
        "If you're facing any issues with your service, you can either raise a ticket from the Support section or contact our customer support team directly at +91-9876543210. We aim to resolve all service-related issues within 24 hours.",
    },
  ];

  // In your fetchUserData function - FIXED version
  // In your fetchUserData function - Update this part
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await userService.getUserProfile();

        console.log("🔍 Full API Response:", response);
        console.log(
          "🔍 Response data structure:",
          JSON.stringify(response.data, null, 2)
        );

        if (response.success && response.data) {
          const user = response.data.user;

          console.log("🔍 User data from API - ALL FIELDS:", user);
          console.log("🔍 User addresses:", user.addresses); // Check if addresses exist

          setUserData({
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            phone: user.phone || "Not provided",
            status: user.status || "Active",
            isVerified: user.isVerified,
            role: user.role || "user",
            createdAt: user.createdAt,
            wallet: user.wallet || { balance: 0 },
            profilePicture: user.profilePicture,
            dateOfBirth: user.dateOfBirth || "Not set",
            gender: user.gender || "Not specified",
            defaultAddress: user.defaultAddress,
          });

          setPersonalInfo({
            fullName: user.fullName || "",
            phoneNumber: user.phone || "Not provided",
            email: user.email || "",
            dateOfBirth: user.dateOfBirth || "Not set",
            gender: user.gender || "Not specified",
          });

          // Set addresses from user data if available
          if (user.addresses && Array.isArray(user.addresses)) {
            setUserAddresses(user.addresses);
          } else {
            setUserAddresses([]);
          }

          console.log("🔍 Addresses set to:", user.addresses);
        } else {
          // Fallback to mock data
          console.log("No user data found, using mock data");
          setUserData(userService.getMockUserData() as any);
          setPersonalInfo(userService.getMockUserData().personalInfo);
          setUserAddresses([]);
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data");
        setUserData(userService.getMockUserData() as any);
        setPersonalInfo(userService.getMockUserData().personalInfo);
        setUserAddresses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSavePersonal = async () => {
    try {
      setError(null);

      // Validate required fields
      if (!tempPersonalInfo.fullName.trim()) {
        setError("Full name is required");
        return;
      }

      if (!tempPersonalInfo.phoneNumber.trim()) {
        setError("Phone number is required");
        return;
      }

      // Prepare update data with proper mapping
      const updateData = {
        fullName: tempPersonalInfo.fullName.trim(),
        phone: tempPersonalInfo.phoneNumber.trim(), // Changed to 'phone' to match backend
        email: tempPersonalInfo.email.trim(),
        dateOfBirth: tempPersonalInfo.dateOfBirth,
        gender: tempPersonalInfo.gender,
      };

      console.log("Sending update data:", updateData);

      // Call API to update user
      const response = await userService.updateUserProfile(updateData);

      console.log("Update response:", response);

      if (response.success && response.data) {
        // FIX: Use the actual response structure
        const updatedUser = response.data.user;

        console.log("Updated user from response:", updatedUser);

        // Update both personalInfo and userData with the response data
        setPersonalInfo({
          fullName: updatedUser.fullName || tempPersonalInfo.fullName,
          phoneNumber: updatedUser.phone || tempPersonalInfo.phoneNumber, // Use 'phone' from response
          email: updatedUser.email || tempPersonalInfo.email,
          dateOfBirth: updatedUser.dateOfBirth || tempPersonalInfo.dateOfBirth,
          gender: updatedUser.gender || tempPersonalInfo.gender,
        });

        setUserData((prev) =>
          prev
            ? {
                ...prev,
                fullName: updatedUser.fullName,
                phone: updatedUser.phone,
                email: updatedUser.email,
                dateOfBirth: updatedUser.dateOfBirth,
                gender: updatedUser.gender,
              }
            : null
        );

        setIsEditingPersonal(false);

        // Show success message
        console.log("Profile updated successfully! Frontend state updated.");
      } else {
        setError(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      setError(err.response?.data?.message || "Failed to update profile");
    }
  };

  const handleCancelPersonal = () => {
    setTempPersonalInfo(personalInfo);
    setIsEditingPersonal(false);
  };

  // Add this to debug state changes
  useEffect(() => {
    console.log("🔄 Current userData:", userData);
  }, [userData]);

  useEffect(() => {
    console.log("🔄 Current personalInfo:", personalInfo);
  }, [personalInfo]);

  const handleProfilePictureClick = () => {
    fileInputRef.current?.click();
  };

  const handleProfilePictureChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploadingPhoto(true);
      setError(null);

      const response = await userService.uploadProfilePicture(file);

      if (response.success && response.data?.profilePictureUrl) {
        // Update the profile picture in state - use profilePicture field
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                profilePicture: response.data.profilePictureUrl,
              }
            : null
        );

        // Also update the profile picture immediately in the UI
        const imgElement = document.querySelector(
          ".profile-picture"
        ) as HTMLImageElement;
        if (imgElement && response.data.profilePictureUrl) {
          imgElement.src = response.data.profilePictureUrl;
        }
      } else {
        setError(response.message || "Failed to upload profile picture");
      }
    } catch (err) {
      console.error("Error uploading profile picture:", err);
      setError("Failed to upload profile picture");
    } finally {
      setUploadingPhoto(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  // Add address handler
  // In UserProfile.tsx - handleAddAddress function
  const handleAddAddress = async (addressData: AddressFormData) => {
    try {
      console.log(
        "🔍 [Frontend] Creating address with data:",
        JSON.stringify(addressData, null, 2)
      );

      setSavingAddress(true);
      setError(null);

      const response = await userService.createAddress(addressData);
      console.log("🔍 [Frontend] Address creation response:", response);

      if (response.success && response.data) {
        console.log(
          "✅ [Frontend] Address created successfully:",
          response.data.address
        );

        // Add new address to the list
        setUserAddresses((prev) => [...prev, response.data!.address]);
        setShowAddAddressModal(false);
        toast.success("Address added successfully!");

        // Force refresh addresses from server
        const freshResponse = await userService.getUserAddresses();
        if (freshResponse.success && freshResponse.data) {
          setUserAddresses(freshResponse.data.addresses);
          console.log(
            "🔍 [Frontend] Refreshed addresses:",
            freshResponse.data.addresses
          );
        }
      } else {
        console.log("❌ [Frontend] Address creation failed:", response.message);
        setError(response.message || "Failed to add address");
      }
    } catch (err: any) {
      console.error("❌ [Frontend] Error adding address:", err);
      setError(err.response?.data?.message || "Failed to add address");
    } finally {
      setSavingAddress(false);
    }
  };

  // Delete address handler
  const handleDeleteAddress = async (addressId: string) => {
  try {
    const result = await Swal.fire({
      title: 'Delete Address?',
      text: "This action cannot be undone.",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#dc2626',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      setError(null);

      // Show loading toast
      toast.loading('Deleting address...', { id: 'delete-address' });

      const response = await userService.deleteAddress(addressId);

      if (response.success) {
        // Remove address from the list
        setUserAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
        
        // Update toast to success
        toast.success('Address deleted successfully!', { 
          id: 'delete-address',
          duration: 3000,
        });
      } else {
        // Update toast to error
        toast.error(response.message || 'Failed to delete address', { 
          id: 'delete-address',
          duration: 4000,
        });
      }
    }
  } catch (err: any) {
    console.error('Error deleting address:', err);
    
    // Update toast to error
    toast.error(err.response?.data?.message || 'Failed to delete address', { 
      id: 'delete-address',
      duration: 4000,
    });
  }
};

  // Set default address handler
  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      setError(null);

      const response = await userService.setDefaultAddress(addressId);

      if (response.success && response.data) {
        // Update all addresses - set the selected one as default, others as not default
        setUserAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr.id === addressId,
          }))
        );
        toast.success("Default address updated successfully!");
      } else {
        setError(response.message || "Failed to set default address");
      }
    } catch (err: any) {
      console.error("Error setting default address:", err);
      setError(err.response?.data?.message || "Failed to set default address");
    }
  };

  if (loading) {
    return (
      <>
        <Header />
        <div className="w-full min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading profile...</span>
        </div>
        <Footer />
      </>
    );
  }

  if (error && !userData) {
    return (
      <>
        <Header />
        <div className="w-full min-h-screen bg-gray-50 flex justify-center items-center">
          <div className="text-center">
            <p className="text-red-500 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="w-full min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {error && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <p className="text-yellow-800">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">My Profile</h1>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
              Book a Service
            </button>
          </div>

          {/* Profile Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {/* Add class to profile image */}
                  <img
                    src={
                      userData?.profilePicture ||
                      "https://imgs.search.brave.com/rwE-hC6ESt3hBJZhImPkb-KvU26bLDKVe-OKv1y50-M/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9pLnBp/bmltZy5jb20vb3Jp/Z2luYWxzLzE0LzQz/LzU1LzE0NDM1NWQ3/YjM2YzVmNjQ2NDM1/NDIzNzk4MjgxY2U5/LmpwZw"
                    }
                    alt="Profile"
                    className="w-20 h-20 rounded-full object-cover profile-picture" // Added profile-picture class
                  />
                  <button
                    onClick={handleProfilePictureClick}
                    disabled={uploadingPhoto}
                    className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors cursor-pointer"
                  >
                    {uploadingPhoto ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <CameraAltOutlined className="w-4 h-4" />
                    )}
                  </button>
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleProfilePictureChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
                <div>
                  <h2 className="text-xl font-bold">{personalInfo.fullName}</h2>
                  <p className="text-sm text-gray-600">
                    {personalInfo.phoneNumber}
                  </p>
                  <p className="text-sm text-green-600 flex items-center mt-1">
                    <CheckCircleOutlineOutlined className="w-4 h-4 mr-1" />
                    {userData?.isVerified ? "Verified" : "Not Verified"}
                  </p>
                  <p className="text-sm text-gray-600">{personalInfo.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Personal Information</h2>
              {!isEditingPersonal && (
                <button
                  onClick={() => {
                    setIsEditingPersonal(true);
                    setTempPersonalInfo(personalInfo);
                  }}
                  className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
                >
                  <EditOutlined className="w-4 h-4" />
                  <span className="text-sm">Edit</span>
                </button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Full Name
                </label>
                {isEditingPersonal ? (
                  <input
                    type="text"
                    value={tempPersonalInfo.fullName}
                    onChange={(e) =>
                      setTempPersonalInfo({
                        ...tempPersonalInfo,
                        fullName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="font-medium">{personalInfo.fullName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Phone Number
                </label>
                {isEditingPersonal ? (
                  <input
                    type="tel"
                    value={tempPersonalInfo.phoneNumber}
                    onChange={(e) =>
                      setTempPersonalInfo({
                        ...tempPersonalInfo,
                        phoneNumber: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="font-medium">{personalInfo.phoneNumber}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Email
                </label>
                {isEditingPersonal ? (
                  <input
                    type="email"
                    value={tempPersonalInfo.email}
                    onChange={(e) =>
                      setTempPersonalInfo({
                        ...tempPersonalInfo,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="font-medium">{personalInfo.email}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Date of Birth
                </label>
                {isEditingPersonal ? (
                  <input
                    type="date"
                    value={tempPersonalInfo.dateOfBirth}
                    onChange={(e) =>
                      setTempPersonalInfo({
                        ...tempPersonalInfo,
                        dateOfBirth: e.target.value,
                      })
                    }
                    min={
                      new Date(new Date().getFullYear() - 100, 0, 1)
                        .toISOString()
                        .split("T")[0]
                    } // 100 years ago
                    max={
                      new Date(
                        new Date().getFullYear() - 15,
                        new Date().getMonth(),
                        new Date().getDate()
                      )
                        .toISOString()
                        .split("T")[0]
                    } // 15 years ago
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                ) : (
                  <p className="font-medium">
                    {personalInfo.dateOfBirth === "Not set"
                      ? "Not set"
                      : new Date(personalInfo.dateOfBirth).toLocaleDateString()}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">
                  Gender
                </label>
                {isEditingPersonal ? (
                  <select
                    value={tempPersonalInfo.gender}
                    onChange={(e) =>
                      setTempPersonalInfo({
                        ...tempPersonalInfo,
                        gender: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                ) : (
                  <p className="font-medium">{personalInfo.gender}</p>
                )}
              </div>
            </div>
            {isEditingPersonal && (
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={handleCancelPersonal}
                  className="px-6 py-2 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSavePersonal}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            )}
          </div>

          {/* Saved Addresses */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Saved Addresses</h2>
              <button
                onClick={() => setShowAddAddressModal(true)}
                className="text-blue-600 hover:text-blue-700 flex items-center space-x-1 cursor-pointer"
              >
                <AddOutlined className="w-4 h-4" />
                <span className="text-sm">Add New Address</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {userAddresses.length > 0 ? (
                userAddresses.map((address) => (
                  <div
                    key={address.id}
                    className={`border rounded-lg p-4 ${
                      address.isDefault
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-2">
                        <FmdGoodOutlined className="w-5 h-5 text-blue-600" />
                        <div>
                          <span className="font-semibold">{address.label}</span>
                          {address.isDefault && (
                            <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                              Default
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address.id)}
                            className="text-gray-600 hover:text-blue-600 text-sm cursor-pointer"
                            title="Set as default"
                          >
                            Set Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address.id)}
                          className="text-gray-600 hover:text-red-600 cursor-pointer"
                          title="Delete address"
                        >
                          <DeleteOutlineOutlined className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <p className="text-sm text-gray-600">{address.street}</p>
                      <p className="text-sm text-gray-600">
                        {address.city}, {address.state} - {address.pincode}
                      </p>
                      {address.landmark && (
                        <p className="text-sm text-gray-500">
                          Landmark: {address.landmark}
                        </p>
                      )}
                      <p className="text-xs text-gray-400 mt-2">
                        Added on{" "}
                        {new Date(address.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-8">
                  <FmdGoodOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No addresses saved yet</p>
                  <button
                    onClick={() => setShowAddAddressModal(true)}
                    className="mt-2 text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
                  >
                    Add your first address
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Add Address Modal */}
          <AddAddressModal
            isOpen={showAddAddressModal}
            onClose={() => setShowAddAddressModal(false)}
            onSave={handleAddAddress}
            loading={savingAddress}
          />

          {/* Under Development Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 text-sm font-bold">!</span>
              </div>
              <div>
                <h3 className="font-semibold text-yellow-800">
                  Feature Under Development
                </h3>
                <p className="text-yellow-700 text-sm">
                  Notifications, Payment History, and Reviews features are
                  currently being developed and will be available soon.
                </p>
              </div>
            </div>
          </div>

          {/* Payments & Wallet */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Payments & Wallet</h2>
            <div className="flex space-x-4 mb-6 border-b border-gray-200">
              <button
                onClick={() => setActiveTab("history")}
                className={`pb-3 px-2 font-medium ${
                  activeTab === "history"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                Payment History
              </button>
              <button
                onClick={() => setActiveTab("wallet")}
                className={`pb-3 px-2 font-medium ${
                  activeTab === "wallet"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600"
                }`}
              >
                Wallet
              </button>
            </div>

            {activeTab === "wallet" && (
              <div className="bg-blue-600 rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between text-white mb-4">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Available Balance</p>
                    <p className="text-3xl font-bold">
                      ₹{userData?.wallet?.balance || 0}
                    </p>
                  </div>
                  <AccountBalanceWalletOutlined className="w-12 h-12 opacity-80" />
                </div>
                <div className="flex space-x-3">
                  <button className="flex-1 bg-white text-blue-600 py-2 rounded-lg font-semibold hover:bg-blue-50 flex items-center justify-center space-x-2">
                    <AddOutlined className="w-4 h-4" />
                    <span>Add Money</span>
                  </button>
                  <button className="flex-1 bg-blue-700 text-white py-2 rounded-lg font-semibold hover:bg-blue-800 flex items-center justify-center space-x-2">
                    <CreditCardOutlined className="w-4 h-4" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            )}

            <div>
              <h3 className="font-semibold mb-3">Transaction History</h3>
              {transactions.length > 0 ? (
                <div className="space-y-3">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="flex items-center justify-between p-3 border border-gray-200 rounded-lg"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-sm">
                          {transaction.service}
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{transaction.amount}</p>
                        <span
                          className={`text-xs px-2 py-1 rounded ${
                            transaction.status === "Paid"
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {transaction.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CreditCardOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500">No transactions yet</p>
                </div>
              )}
            </div>
          </div>

          {/* Reviews & Ratings */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Reviews & Ratings</h2>
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((review, index) => (
                  <div
                    key={index}
                    className="border-b border-gray-200 pb-4 last:border-b-0"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">{review.service}</p>
                        <p className="text-sm text-gray-600">
                          Technician: {review.technician}
                        </p>
                      </div>
                      <span className="text-sm text-gray-500">
                        {review.date}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1 mb-2">
                      {[...Array(review.rating)].map((_, i) => (
                        <StarBorderOutlined
                          key={i}
                          className="w-4 h-4 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-sm text-gray-600">{review.comment}</p>
                    <div className="flex space-x-4 mt-2">
                      <button className="text-sm text-blue-600 hover:underline flex items-center space-x-1">
                        <EditOutlined className="w-3 h-3" />
                        <span>Edit</span>
                      </button>
                      <button className="text-sm text-red-600 hover:underline flex items-center space-x-1">
                        <DeleteOutlineOutlined className="w-3 h-3" />
                        <span>Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <StarBorderOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No reviews yet</p>
                <p className="text-sm text-gray-400 mt-1">
                  Your reviews will appear here after you book services
                </p>
              </div>
            )}
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <button className="text-sm text-blue-600 hover:underline">
                Mark all as read
              </button>
            </div>
            {notifications.length > 0 ? (
              <div className="space-y-3">
                {notifications.map((notification, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                  >
                    {notification.icon}
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {notification.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <NotificationsNoneOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No notifications</p>
                <p className="text-sm text-gray-400 mt-1">
                  You'll see notifications about your bookings here
                </p>
              </div>
            )}
            <button className="w-full mt-4 py-2 text-sm text-blue-600 hover:underline">
              View All Notifications
            </button>
          </div>

          {/* Support & Help */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">Support & Help</h2>
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setShowChatSupport(false)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  !showChatSupport
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <HelpOutlineOutlined className="w-5 h-5" />
                <span>FAQs</span>
              </button>
              <button
                onClick={() => setShowChatSupport(true)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
                  showChatSupport
                    ? "bg-blue-50 text-blue-600"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <MessageOutlined className="w-5 h-5" />
                <span>Chat Support</span>
              </button>
            </div>
            {!showChatSupport ? (
              <div>
                <h3 className="font-semibold mb-3">
                  Frequently Asked Questions
                </h3>
                <div className="space-y-2">
                  {faqs.map((faq, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg"
                    >
                      <button
                        onClick={() =>
                          setExpandedFaq(expandedFaq === index ? null : index)
                        }
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
                      >
                        <span className="font-medium text-sm">
                          {faq.question}
                        </span>
                        <ExpandMoreOutlined
                          className={`w-5 h-5 text-gray-400 transition-transform ${
                            expandedFaq === index ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {expandedFaq === index && (
                        <div className="px-4 pb-4">
                          <p className="text-sm text-gray-600">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-gray-200 rounded-lg p-6">
                <div className="text-center mb-4">
                  <MessageOutlined className="w-12 h-12 text-blue-600 mx-auto mb-2" />
                  <h3 className="font-semibold mb-1">Chat with Support</h3>
                  <p className="text-sm text-gray-600">
                    Our support team is here to help you
                  </p>
                </div>
                <button className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700">
                  Start Chat
                </button>
                <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 mb-2">
                    Messages
                  </p>
                  <p className="text-sm text-blue-700">
                    Send us a message about anything
                  </p>
                </div>
                <div className="mt-4 text-center">
                  <p className="text-sm text-gray-600 mb-2">
                    Need urgent help?
                  </p>
                  <p className="text-sm">Call our customer support team</p>
                  <p className="text-lg font-semibold text-blue-600 mt-1">
                    +91 9876543210
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Security & Settings */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold mb-4">Security & Settings</h2>
            <div className="space-y-4">
              <div className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <ShieldOutlined className="w-5 h-5 text-gray-600" />
                    <div>
                      <p className="font-semibold">Password</p>
                      <p className="text-sm text-gray-600">**********</p>
                    </div>
                  </div>
                  {!isChangingPassword && (
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer"
                    >
                      Change Password
                    </button>
                  )}
                </div>

                {isChangingPassword && (
                  <div className="mt-4 space-y-4">
                    {passwordError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-700 text-sm">{passwordError}</p>
                      </div>
                    )}
                    {passwordSuccess && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-green-700 text-sm">
                          {passwordSuccess}
                        </p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Current Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter current password"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter new password (min 6 characters)"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">
                          Confirm New Password
                        </label>
                        <input
                          type="password"
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Confirm new password"
                        />
                      </div>
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={handleCancelPasswordChange}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleChangePassword}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer"
                      >
                        Update Password
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default UserProfile;
