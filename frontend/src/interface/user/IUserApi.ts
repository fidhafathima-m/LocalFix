export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  error?: string;
}

export interface AddressFormData {
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
  formattedAddress: string;
  placeId?: string;
}

export interface Address {
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
  formattedAddress: string;
  placeId?: string;
  createdAt: string;
  updatedAt: string;
}