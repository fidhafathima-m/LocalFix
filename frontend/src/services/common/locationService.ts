/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "../../utils/axiosConfig";

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

class LocationService {
  // Update user location
  async updateUserLocation(locationData: LocationData): Promise<any> {
    try {
      const response = await api.put("/user/location", locationData);
      return response.data;
    } catch (error) {
      console.error("Error updating user location:", error);
      throw error;
    }
  }

  // Get user location
  async getUserLocation(): Promise<any> {
    try {
      const response = await api.get("/user/location");
      return response.data;
    } catch (error) {
      console.error("Error getting user location:", error);
      throw error;
    }
  }

  // Get nearby technicians - FIXED API CALL
  async getNearbyTechnicians(params: NearbyTechniciansParams): Promise<any> {
    try {
      console.log("getNearbyTechnicians called with:", params);
      
      const response = await api.get("/user/nearby-technicians", {
        params: {
          lat: params.lat,    // Fixed: pass as individual parameters
          lng: params.lng,    // Fixed: pass as individual parameters
          radius: params.radius,
          serviceName: params.serviceName,
          page: params.page,
          limit: params.limit,
        }
      });
      
      console.log("getNearbyTechnicians response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error getting nearby technicians:", error);
      throw error;
    }
  }

  // Get current position using browser geolocation
  getCurrentPosition(): Promise<GeolocationPosition> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      };

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });
  }

  // Reverse geocode coordinates to address
  async reverseGeocode(lat: number, lng: number): Promise<GeocodeResult> {
    try {
      // Add a small delay to respect OSM's usage policy
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            "Accept-Language": "en",
            "User-Agent": "LocalFixTechnicianApp/1.0",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: OSMAddressData = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      return this.extractAddressComponents(data);
    } catch (error) {
      console.error("OSM Geocoding error:", error);
      throw error;
    }
  }

  private extractAddressComponents(data: OSMAddressData): GeocodeResult {
    const addressComponents: AddressComponents = {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    };

    if (data.address) {
      const addressData = data.address;

      // Street address extraction
      addressComponents.street =
        addressData.road ||
        addressData.pedestrian ||
        addressData.footway ||
        addressData.residential ||
        addressData.highway ||
        addressData.path ||
        "";

      if (addressComponents.street === "Path" || !addressComponents.street) {
        const streetParts = [
          addressData.house_number,
          addressData.road,
          addressData.suburb,
          addressData.neighbourhood,
        ].filter(Boolean);

        if (streetParts.length > 0) {
          addressComponents.street = streetParts.join(", ");
        } else {
          const firstPart = data.display_name?.split(",")[0];
          if (firstPart && firstPart !== "Path") {
            addressComponents.street = firstPart;
          }
        }
      }

      addressComponents.city =
        addressData.city ||
        addressData.town ||
        addressData.village ||
        addressData.municipality ||
        addressData.county ||
        "";

      addressComponents.state = addressData.state || addressData.region || "";

      addressComponents.pincode = addressData.postcode || "";

      addressComponents.landmark =
        addressData.neighbourhood ||
        addressData.suburb ||
        addressData.hamlet ||
        addressData.locality ||
        "";
    }

    return {
      formattedAddress: data.display_name || "",
      addressComponents,
    };
  }
  // services/common/locationService.ts

// Add this method to your existing LocationService class
async geocodeAddress(address: string): Promise<{
  lat: number;
  lng: number;
  formattedAddress: string;
  addressComponents: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  };
}> {
  try {
    // Add a small delay to respect OSM's usage policy
    await new Promise((resolve) => setTimeout(resolve, 1000));

    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      {
        headers: {
          "Accept-Language": "en",
          "User-Agent": "LocalFixTechnicianApp/1.0",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data || data.length === 0) {
      throw new Error("No results found for this address");
    }

    const result = data[0];
    
    // Extract address components from the display_name
    const addressComponents = this.extractAddressComponentsFromDisplayName(result.display_name);

    return {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      formattedAddress: result.display_name,
      addressComponents,
    };
  } catch (error) {
    console.error("Geocoding error:", error);
    throw new Error(
      `Failed to geocode address: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
  }
}

// Helper method to extract address components from display_name
private extractAddressComponentsFromDisplayName(displayName: string): {
  street?: string;
  city?: string;
  state?: string;
  pincode?: string;
  landmark?: string;
} {
  const parts = displayName.split(',').map(part => part.trim());
  
  const components: {
    street?: string;
    city?: string;
    state?: string;
    pincode?: string;
    landmark?: string;
  } = {};

  // Simple extraction logic - you might want to make this more sophisticated
  if (parts.length > 0) {
    components.street = parts[0]; // First part is usually the street/house number
  }
  
  if (parts.length > 1) {
    components.city = parts[parts.length - 3] || parts[parts.length - 2]; // City is usually 2nd or 3rd from end
  }
  
  if (parts.length > 2) {
    components.state = parts[parts.length - 2]; // State is usually 2nd from end
  }

  // Look for pincode (usually 6-digit number)
  const pincodeMatch = displayName.match(/\b\d{6}\b/);
  if (pincodeMatch) {
    components.pincode = pincodeMatch[0];
  }

  return components;
}
}

export default new LocationService();