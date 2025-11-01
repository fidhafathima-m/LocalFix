/* eslint-disable @typescript-eslint/no-explicit-any */
import { adminAPI } from "../common/adminApi";

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
      const response = await adminAPI.updateUserProfile(updateData);
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

      const response = await adminAPI.uploadProfilePicture(formData);
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
      const response = await adminAPI.changePassword(passwordData);
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
};
