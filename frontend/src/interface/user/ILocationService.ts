export interface Coordinates {
  lat: number;
  lng: number;
}

export interface AddressComponents {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

export interface GeocodeResult {
  formattedAddress: string;
  addressComponents: AddressComponents;
}

export interface LocationData {
  coordinates: [number, number];
  address: AddressComponents;
}

export interface NearbyTechniciansParams {
  lat: number;
  lng: number;
  radius?: number;
  serviceName?: string;
  page?: number;
  limit?: number;
}

export interface OSMAddressData {
  address?: {
    road?: string;
    pedestrian?: string;
    footway?: string;
    residential?: string;
    highway?: string;
    path?: string;
    house_number?: string;
    suburb?: string;
    neighbourhood?: string;
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    county?: string;
    state?: string;
    region?: string;
    postcode?: string;
    hamlet?: string;
    locality?: string;
  };
  display_name?: string;
  error?: string;
}