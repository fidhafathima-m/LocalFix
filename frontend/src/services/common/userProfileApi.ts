/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Address, AddressFormData, ApiResponse } from "../../interface/user/IUserApi";
import { ADMIN_ROUTES } from "../../routes/adminRoutes";
import api from "../../utils/axiosConfig";



export const userProfileApi = {

updateUserProfile: (updateData: any) => {
  // Transform the data to match backend expectations
  const transformedData = {
    fullName: updateData.fullName,
    phone: updateData.phone || updateData.phoneNumber, // Handle both cases
    email: updateData.email,
    dateOfBirth: updateData.dateOfBirth,
    gender: updateData.gender,
  };
  
  console.log("Transformed data for API:", transformedData);
  return api.put<ApiResponse<any>>(ADMIN_ROUTES.UPDATE_USER_PROFILE, transformedData);
},

  uploadProfilePicture: (formData: FormData) =>
    api.post<ApiResponse<any>>(ADMIN_ROUTES.UPDATE_PROFILE_PHOTO, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),

    changePassword: (passwordData: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) =>
    api.post<ApiResponse<any>>(ADMIN_ROUTES.CHANGE_PASSWORD, passwordData),

    getUserAddresses: () =>
    api.get<ApiResponse<{ addresses: Address[] }>>(ADMIN_ROUTES.USER_ADDRESSES),

  createAddress: (addressData: AddressFormData) =>
    api.post<ApiResponse<{ address: Address }>>(ADMIN_ROUTES.CREATE_ADDRESS, addressData),

  updateAddress: (addressId: string, addressData: Partial<AddressFormData>) =>
    api.put<ApiResponse<{ address: Address }>>(ADMIN_ROUTES.UPDATE_ADDRESS(addressId), addressData),

  deleteAddress: (addressId: string) =>
    api.delete<ApiResponse<void>>(ADMIN_ROUTES.DELETE_ADDRESS(addressId)),

  setDefaultAddress: (addressId: string) =>
    api.patch<ApiResponse<{ address: Address }>>(ADMIN_ROUTES.SET_DEFAULT_ADDRESS(addressId)),

};
