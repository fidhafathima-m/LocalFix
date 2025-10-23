import React, { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 10.8505, // Kerala center
  lng: 76.2711,
};

const LIBRARIES = ["places"] as "places"[];

interface OSMLocationPickerProps {
  onLocationSelect: (location: {
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
  }) => void;
  initialLocation?: { lat: number; lng: number };
  className?: string;
}

interface OSMAddressData {
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

interface AddressComponents {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

export const OSMLocationPicker: React.FC<OSMLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  className = "",
}) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(
    initialLocation || null
  );
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const advancedMarkerRef =
    useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries: LIBRARIES,
  });

  const extractAddressComponents = (data: OSMAddressData): AddressComponents => {
    const addressComponents: AddressComponents = {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    };

    if (data) {
      const addressData = data.address || {};
      const displayName = data.display_name || "";

      // street address extraction
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
          // Use the first part of the formatted address as fallback
          const firstPart = displayName.split(",")[0];
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

      // Clean up the data
      Object.keys(addressComponents).forEach((key) => {
        const componentKey = key as keyof AddressComponents;
        if (addressComponents[componentKey] === undefined) {
          addressComponents[componentKey] = "";
        }
      });
    }

    return addressComponents;
  };

  const reverseGeocodeWithOSM = async (lat: number, lng: number) => {
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

      const addressComponents = extractAddressComponents(data);

      return {
        formattedAddress: data.display_name || "",
        addressComponents,
      };
    } catch (error) {
      console.error("OSM Geocoding error:", error);
      throw new Error(
        `Failed to get address: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  };

  const onMapClick = useCallback(
    async (event: google.maps.MapMouseEvent) => {
      if (!event.latLng) return;

      setIsLoading(true);
      const lat = event.latLng.lat();
      const lng = event.latLng.lng();

      setMarker({ lat, lng });

      try {
        const geocodeResult = await reverseGeocodeWithOSM(lat, lng);

        setAddress(geocodeResult.formattedAddress);

        onLocationSelect({
          lat,
          lng,
          address: geocodeResult.formattedAddress,
          addressComponents: geocodeResult.addressComponents,
        });
      } catch (error) {
        console.error("Error reverse geocoding:", error);

        const fallbackAddress = `Location at ${lat.toFixed(6)}, ${lng.toFixed(
          6
        )}`;
        setAddress(fallbackAddress);

        onLocationSelect({
          lat,
          lng,
          address: fallbackAddress,
          addressComponents: {
            street: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
          },
        });
      } finally {
        setIsLoading(false);
      }
    },
    [onLocationSelect, map]
  );

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    if (advancedMarkerRef.current) {
      advancedMarkerRef.current.map = null;
      advancedMarkerRef.current = null;
    }
    setMap(null);
  }, []);

  if (!isLoaded) {
    return (
      <div
        className={`flex items-center justify-center h-64 bg-gray-100 rounded-lg ${className}`}
      >
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-4">
        <label className="block mb-2 font-medium text-gray-700">
          Select Your Location on Map <span className="text-red-500">*</span>
        </label>
        <p className="text-sm text-gray-600 mb-2">
          Click on the map to mark your exact location. Address fields will be
          automatically filled using OpenStreetMap.
        </p>
        <p className="text-xs text-gray-500">
          💡 <strong>Tip:</strong> If the auto-filled address isn't perfect, you
          can manually edit the fields below.
        </p>
      </div>

      <div className="relative">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={marker || defaultCenter}
          zoom={15}
          onClick={onMapClick}
          onLoad={onMapLoad}
          onUnmount={onUnmount}
          options={{
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
            zoomControl: true,
          }}
        >
          {marker && <Marker position={marker} />}
        </GoogleMap>

        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
            <div className="bg-white p-4 rounded-lg shadow-lg flex items-center space-x-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <div>
                <p className="text-sm font-medium text-gray-700">
                  Getting address...
                </p>
                <p className="text-xs text-gray-500">Querying OpenStreetMap</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {address && (
        <div className="mt-4 p-3 bg-green-50 rounded-md border border-green-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800 flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Address Found via OpenStreetMap
              </p>
              <p className="text-sm text-green-700 mt-1">{address}</p>
              <p className="text-xs text-green-600 mt-2">
                ✓ Address fields below have been auto-filled. You can edit them
                if needed.
              </p>
            </div>
            <div className="bg-green-100 px-2 py-1 rounded text-xs text-green-800 font-medium">
              OSM
            </div>
          </div>
        </div>
      )}

      {!marker && (
        <div className="mt-4 p-3 bg-yellow-50 rounded-md border border-yellow-200">
          <p className="text-sm text-yellow-700 flex items-center">
            <span className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></span>
            Please click on the map to select your location and auto-fill
            address fields
          </p>
        </div>
      )}
    </div>
  );
};