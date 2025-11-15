/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { userService } from "../../../../services/user/userService";
import toast from "react-hot-toast";
import type {
  Address,
  AddressFormData,
} from "../../../../interface/user/IUserApi";
import type { PersonalInfo, UserData } from "./sections/types";
import Header from "../../../../components/common/Header";
import Footer from "../../../../components/common/Footer";
import { ProfileHeader } from "./sections/ProfileHeader";
import { PersonalInfoSection } from "./sections/PersonalInfoSection";
import { AddressSection } from "./sections/AddressSection";
import { PaymentsWalletSection } from "./sections/PaymentsWalletSection";
import { ReviewsSection } from "./sections/ReviewsSection";
import { NotificationsSection } from "./sections/NotificationsSection";
import { SupportSection } from "./sections/SupportSection";
import { SecuritySection } from "./sections/SecuritySection";
import { AddAddressModal } from "./modals/AddAddressModal";
import { EditAddressModal } from "./modals/EditAddressModal";
import { AddMoneyModal } from "./modals/AddMoneyModal";
import { WithdrawMoneyModal } from "./modals/WithdrawMoneyModal";

const UserProfile: React.FC = () => {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    fullName: "",
    phoneNumber: "",
    email: "",
    dateOfBirth: "",
    gender: "Male",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Address states
  const [userAddresses, setUserAddresses] = useState<Address[]>([]);
  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [savingAddress, setSavingAddress] = useState(false);
  const [updatingAddress, setUpdatingAddress] = useState(false);

  // Wallet states
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);

  // Personal info editing
  const [isEditingPersonal, setIsEditingPersonal] = useState(false);

  const navigate = useNavigate();

  // Load user data
  useEffect(() => {
    fetchUserData();
  }, []);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await userService.getUserProfile();

      if (response.success && response.data) {
        const user = response.data.user;
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
          gender: user.gender || "",
          defaultAddress: user.defaultAddress,
        });

        setPersonalInfo({
          fullName: user.fullName || "",
          phoneNumber: user.phone || "Not provided",
          email: user.email || "",
          dateOfBirth: user.dateOfBirth || "Not set",
          gender: user.gender || "Not specified",
        });

        if (user.addresses && Array.isArray(user.addresses)) {
          setUserAddresses(user.addresses);
        } else {
          setUserAddresses([]);
        }

        if (user.wallet) {
          setWalletBalance(user.wallet.balance);
        }
      } else {
        setError("Failed to load user data");
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  // Handler functions
  const handleProfilePictureChange = async (file: File) => {
    try {
      setUploadingPhoto(true);
      const response = await userService.uploadProfilePicture(file);

      if (response.success && response.data?.profilePictureUrl) {
        setUserData((prev) =>
          prev
            ? { ...prev, profilePicture: response.data.profilePictureUrl }
            : null
        );
        toast.success("Profile picture updated successfully!");
      } else {
        toast.error(response.message || "Failed to upload profile picture");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to upload profile picture");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const refreshWalletData = async () => {
    try {
      const response = await userService.getUserProfile();
      if (response.success && response.data) {
        const user = response.data.user;
        setUserData((prev) =>
          prev
            ? {
                ...prev,
                wallet: user.wallet || { balance: 0 },
              }
            : null
        );

        if (user.wallet) {
          setWalletBalance(user.wallet.balance);
        }
      }
    } catch (error) {
      console.error("Error refreshing wallet data:", error);
    }
  };

  const handleSavePersonalInfo = async (newInfo: PersonalInfo) => {
    try {
      const updateData = {
        fullName: newInfo.fullName.trim(),
        phone: newInfo.phoneNumber.trim(),
        email: newInfo.email.trim(),
        dateOfBirth:
          newInfo.dateOfBirth === "Not set" ? "" : newInfo.dateOfBirth,
        gender: newInfo.gender,
      };

      const response = await userService.updateUserProfile(updateData);

      if (response.success && response.data) {
        const updatedUser = response.data.user;
        setPersonalInfo({
          fullName: updatedUser.fullName || newInfo.fullName,
          phoneNumber: updatedUser.phone || newInfo.phoneNumber,
          email: updatedUser.email || newInfo.email,
          dateOfBirth: updatedUser.dateOfBirth || newInfo.dateOfBirth,
          gender: updatedUser.gender || newInfo.gender,
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
        toast.success("Profile updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update profile");
      }
    } catch (err: any) {
      console.error("Error updating profile:", err);
      toast.error(err.response?.data?.message || "Failed to update profile");
      throw err; // Re-throw to let the component handle it
    }
  };

  const handleAddAddress = async (addressData: AddressFormData) => {
    try {
      setSavingAddress(true);
      const response = await userService.createAddress(addressData);
      if (response.success && response.data) {
        setUserAddresses((prev) => [...prev, response.data!.address]);
        setShowAddAddressModal(false);
        toast.success("Address added successfully!");
      } else {
        throw new Error(response.message || "Failed to add address");
      }
    } catch (err: any) {
      console.error("Error adding address:", err);
      toast.error(err.response?.data?.message || "Failed to add address");
      throw err;
    } finally {
      setSavingAddress(false);
    }
  };

  const handleEditAddress = async (
    addressId: string,
    addressData: AddressFormData
  ) => {
    try {
      setUpdatingAddress(true);
      const response = await userService.updateAddress(addressId, addressData);
      if (response.success && response.data) {
        setUserAddresses((prev) =>
          prev.map((addr) =>
            addr.id === addressId ? response.data!.address : addr
          )
        );
        setShowEditAddressModal(false);
        setEditingAddress(null);
        toast.success("Address updated successfully!");
      } else {
        throw new Error(response.message || "Failed to update address");
      }
    } catch (err: any) {
      console.error("Error updating address:", err);
      toast.error(err.response?.data?.message || "Failed to update address");
      throw err;
    } finally {
      setUpdatingAddress(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    try {
      const response = await userService.deleteAddress(addressId);
      if (response.success) {
        setUserAddresses((prev) =>
          prev.filter((addr) => addr.id !== addressId)
        );
        toast.success("Address deleted successfully!");
      } else {
        throw new Error(response.message || "Failed to delete address");
      }
    } catch (err: any) {
      console.error("Error deleting address:", err);
      toast.error(err.response?.data?.message || "Failed to delete address");
      throw err;
    }
  };

  const handleSetDefaultAddress = async (addressId: string) => {
    try {
      const response = await userService.setDefaultAddress(addressId);
      if (response.success && response.data) {
        setUserAddresses((prev) =>
          prev.map((addr) => ({
            ...addr,
            isDefault: addr.id === addressId,
          }))
        );
        toast.success("Default address updated successfully!");
      } else {
        throw new Error(response.message || "Failed to set default address");
      }
    } catch (err: any) {
      console.error("Error setting default address:", err);
      toast.error(
        err.response?.data?.message || "Failed to set default address"
      );
      throw err;
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
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
          </div>

          <ProfileHeader
            userData={userData}
            personalInfo={personalInfo}
            onProfilePictureChange={handleProfilePictureChange}
            uploadingPhoto={uploadingPhoto}
            onNavigateToServices={() => navigate("/services")}
          />

          <PersonalInfoSection
            personalInfo={personalInfo}
            isEditing={isEditingPersonal}
            onEditStart={() => setIsEditingPersonal(true)}
            onSave={handleSavePersonalInfo}
            onCancel={() => setIsEditingPersonal(false)}
          />

          <AddressSection
            addresses={userAddresses}
            onAddAddress={() => setShowAddAddressModal(true)}
            onEditAddress={(address) => {
              setEditingAddress(address);
              setShowEditAddressModal(true);
            }}
            onDeleteAddress={handleDeleteAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
          />

          <PaymentsWalletSection
            walletBalance={walletBalance}
            onAddMoney={() => setShowAddMoneyModal(true)}
            onWithdraw={() => setShowWithdrawModal(true)}
            onRefreshWallet={refreshWalletData}
          />

          <ReviewsSection />

          <NotificationsSection userData={userData} />

          <SupportSection />

          <SecuritySection />
        </div>
      </div>

      {/* Modals */}
      <AddAddressModal
        isOpen={showAddAddressModal}
        onClose={() => setShowAddAddressModal(false)}
        onSave={handleAddAddress}
        loading={savingAddress}
      />

      <EditAddressModal
        isOpen={showEditAddressModal}
        onClose={() => {
          setShowEditAddressModal(false);
          setEditingAddress(null);
        }}
        onSave={handleEditAddress}
        loading={updatingAddress}
        address={editingAddress}
      />

      <AddMoneyModal
        open={showAddMoneyModal}
        onClose={() => setShowAddMoneyModal(false)}
        onSuccess={(amount) => {
          setWalletBalance((prev) => prev + amount);
          toast.success(`₹${amount} added to wallet successfully!`);
        }}
      />

      <WithdrawMoneyModal
        open={showWithdrawModal}
        onClose={() => setShowWithdrawModal(false)}
        onSuccess={(amount) => {
          setWalletBalance((prev) => prev - amount);
          toast.success(
            `Withdrawal request for ₹${amount} submitted successfully!`
          );
        }}
        walletBalance={walletBalance}
      />

      <Footer />
    </>
  );
};

export default UserProfile;
