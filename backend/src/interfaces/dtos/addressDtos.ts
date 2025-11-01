// Base DTO interfaces
export interface BaseResponseDto {
  success: boolean;
  message: string;
  statusCode: number;
}

// Address DTOs
export interface AddressDto {
  id: string;
  label: string;
  landmark?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  formattedAddress: string;
  placeId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AddressListDto {
  addresses: AddressDto[];
}

export interface AddressResponseDto extends BaseResponseDto {
  address?: AddressDto;
}

export interface AddressListResponseDto extends BaseResponseDto {
  addresses?: AddressDto[];
}

// Request DTOs
export interface CreateAddressRequestDto {
  label: string;
  landmark?: string;
  street: string;
  city: string;
  state: string;
  pincode: string;
  isDefault?: boolean;
  location: {
    type: "Point";
    coordinates: [number, number];
  };
  formattedAddress: string;
  placeId?: string;
}

export interface UpdateAddressRequestDto {
  label?: string;
  landmark?: string;
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  isDefault?: boolean;
  location?: {
    type: "Point";
    coordinates: [number, number];
  };
  formattedAddress?: string;
  placeId?: string;
}

// Map Location DTOs
export interface MapLocationDto {
  lat: number;
  lng: number;
  address: string;
  addressComponents: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
}

export interface LocationResponseDto extends BaseResponseDto {
  location?: MapLocationDto;
}