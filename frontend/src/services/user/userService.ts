/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Address, AddressFormData } from "../../interface/user/IUserApi";
import { adminAPI } from "../common/adminApi";
import { userProfileApi } from "../common/userProfileApi";

export const userService = {
  getUserProfile: async () => {
    try {
      const response = await adminAPI.getUserProfile();
      return response.data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      throw error;
    }
  },
  getUserById: async (userId: string) => {
    try {
      const response = await adminAPI.getPublicUserById(userId);
      return response.data;
    } catch (error) {
      console.error("Error fetching user:", error);
      throw error;
    }
  },

  updateUserProfile: async (updateData: any) => {
    try {
      const response = await userProfileApi.updateUserProfile(updateData);
      return response.data;
    } catch (error) {
      console.error("Error updating user profile:", error);
      throw error;
    }
  },

  uploadProfilePicture: async (file: File) => {
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await userProfileApi.uploadProfilePicture(formData);
      return response.data;
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      throw error;
    }
  },

  changePassword: async (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    try {
      const response = await userProfileApi.changePassword(passwordData);
      return response.data;
    } catch (error) {
      console.error("Error changing password:", error);
      throw error;
    }
  },

  // Mock data for features under development
  getMockUserData: () => ({
    personalInfo: {
      fullName: "John Doe",
      phoneNumber: "+91 9876543210",
      email: "john.doe@example.com",
      dateOfBirth: "15/03/1990",
      gender: "Male",
    },
    addresses: [
      {
        id: 1,
        type: "Home",
        address: "123 Main Street, Apartment 4B",
        landmark: "Near City Park",
        pincode: "400001",
      },
    ],
    // Mock data for under-development features
    notifications: [],
    paymentHistory: [],
    reviews: [],
  }),

  getUserAddresses: async (): Promise<{
    success: boolean;
    data?: { addresses: Address[] };
    message?: string;
  }> => {
    try {
      const response = await userProfileApi.getUserAddresses();
      return response.data;
    } catch (error) {
      console.error("Error fetching user addresses:", error);
      throw error;
    }
  },

  createAddress: async (
    addressData: AddressFormData
  ): Promise<{
    success: boolean;
    data?: { address: Address };
    message?: string;
  }> => {
    try {
      const response = await userProfileApi.createAddress(addressData);
      return response.data;
    } catch (error) {
      console.error("Error creating address:", error);
      throw error;
    }
  },

  updateAddress: async (
    addressId: string,
    addressData: Partial<AddressFormData>
  ): Promise<{
    success: boolean;
    data?: { address: Address };
    message?: string;
  }> => {
    try {
      const response = await userProfileApi.updateAddress(
        addressId,
        addressData
      );
      return response.data;
    } catch (error) {
      console.error("Error updating address:", error);
      throw error;
    }
  },

  deleteAddress: async (
    addressId: string
  ): Promise<{ success: boolean; message?: string }> => {
    try {
      const response = await userProfileApi.deleteAddress(addressId);
      return response.data;
    } catch (error) {
      console.error("Error deleting address:", error);
      throw error;
    }
  },

  setDefaultAddress: async (
    addressId: string
  ): Promise<{
    success: boolean;
    data?: { address: Address };
    message?: string;
  }> => {
    try {
      const response = await userProfileApi.setDefaultAddress(addressId);
      return response.data;
    } catch (error) {
      console.error("Error setting default address:", error);
      throw error;
    }
  },
};
