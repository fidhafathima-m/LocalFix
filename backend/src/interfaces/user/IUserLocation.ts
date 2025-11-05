export interface Coordinates {
  type: "Point";
  coordinates: [number, number]; // [longitude, latitude]
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
  formattedAddress?: string;
}

export interface UserLocation {
  _id?: string;
  userId: string;
  location: Coordinates;
  address: Address;
  lastUpdated: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface LocationUpdateData {
  coordinates: [number, number];
  address: Address;
}

export interface NearbyTechniciansQuery {
  lat: number;
  lng: number;
  radius?: number;
  serviceName?: string;
}

export interface TechnicianWithDistance {
  _id: string;
  userId: string;
  address: Address;
  location: Coordinates;
  distance: number;
  technicianInfo: any;
}
