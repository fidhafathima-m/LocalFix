// components/common/OSMLocationPicker.tsx
import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default markers in react-leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter: [number, number] = [10.8505, 76.2711]; // Kerala center

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

// Component to handle map clicks
function MapClickHandler({ onMapClick }: { onMapClick: (lat: number, lng: number) => void }) {
  useMapEvents({
    click: (e) => {
      const { lat, lng } = e.latlng;
      onMapClick(lat, lng);
    },
  });
  return null;
}

export const OSMLocationPicker: React.FC<OSMLocationPickerProps> = ({
  onLocationSelect,
  initialLocation,
  className = "",
}) => {
  const [marker, setMarker] = useState<[number, number] | null>(
    initialLocation ? [initialLocation.lat, initialLocation.lng] : null
  );
  const [address, setAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [clickedPosition, setClickedPosition] = useState<[number, number] | null>(null);

  const extractAddressComponents = (data: OSMAddressData): AddressComponents => {
    const addressComponents: AddressComponents = {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    };

    if (data && data.address) {
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

  const handleMapClick = async (lat: number, lng: number) => {
    setIsLoading(true);
    setClickedPosition([lat, lng]); // Show temporary marker immediately
    setMarker([lat, lng]);

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

      const fallbackAddress = `Location at ${lat.toFixed(6)}, ${lng.toFixed(6)}`;
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
      setClickedPosition(null);
    }
  };

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

        <MapContainer
          center={marker || defaultCenter}
          zoom={13}
          style={mapContainerStyle}
          className="rounded-lg border border-gray-300"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapClickHandler onMapClick={handleMapClick} />
          
          {/* Temporary loading marker */}
          {clickedPosition && isLoading && (
            <Marker position={clickedPosition}>
              <Popup>
                <div className="text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto mb-2"></div>
                  <p className="text-sm font-medium">Getting address...</p>
                  <p className="text-xs text-gray-600">Please wait</p>
                </div>
              </Popup>
            </Marker>
          )}
          
          {/* Permanent marker after loading completes */}
          {marker && !isLoading && (
            <Marker position={marker}>
              <Popup>
                Selected Location <br />
                Lat: {marker[0].toFixed(6)}, Lng: {marker[1].toFixed(6)}
              </Popup>
            </Marker>
          )}
        </MapContainer>

        {/* Enhanced loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-black bg-opacity-10 flex items-center justify-center rounded-lg z-[999]">
            <div className="bg-white p-6 rounded-lg shadow-xl flex flex-col items-center space-y-3 max-w-xs text-center">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-2 h-2 bg-blue-600 rounded-full animate-ping"></div>
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Getting Address Details
                </p>
                <p className="text-xs text-gray-600">
                  Querying OpenStreetMap database...
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  This usually takes 2-3 seconds
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Address result with loading state */}
      {isLoading ? (
        <div className="mt-4 p-4 bg-blue-50 rounded-md border border-blue-200">
          <div className="flex items-center space-x-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            <div>
              <p className="text-sm font-medium text-blue-800">
                Processing your location...
              </p>
              <p className="text-xs text-blue-700">
                Getting address information from OpenStreetMap
              </p>
            </div>
          </div>
        </div>
      ) : address ? (
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
      ) : (
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