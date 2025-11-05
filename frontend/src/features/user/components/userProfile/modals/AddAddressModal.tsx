/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  DialogTitle,
} from "@headlessui/react";
import { CloseOutlined, MyLocationOutlined } from "@mui/icons-material";
import { OSMLocationPicker } from "../../../../../components/common/OSMLocationPicker";
import LocationService from "../../../../../services/common/locationService";
import toast from "react-hot-toast";
import type { GeocodeResult } from "../../../../../interface/user/ILocationService";

interface AddressFormData {
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

interface AddAddressModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (addressData: AddressFormData) => void;
  loading?: boolean;
}

export const AddAddressModal: React.FC<AddAddressModalProps> = ({
  isOpen,
  onClose,
  onSave,
  loading = false,
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    label: "Home",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    isDefault: false,
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
    formattedAddress: "",
  });

  const [mapSelected, setMapSelected] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);

  const handleLocationSelect = (location: {
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
  }) => {
    setMapSelected(true);
    setFormData((prev) => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat],
      },
      formattedAddress: location.address,
      street: location.addressComponents.street || prev.street,
      city: location.addressComponents.city || prev.city,
      state: location.addressComponents.state || prev.state,
      pincode: location.addressComponents.pincode || prev.pincode,
      landmark: location.addressComponents.landmark || prev.landmark,
    }));
  };

  // Handle automatic location detection
  const handleAutoDetectLocation = async (): Promise<void> => {
    try {
      setDetectingLocation(true);
      const toastId = toast.loading("Detecting your current location...");

      const position = await LocationService.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      const geocodeResult: GeocodeResult = await LocationService.reverseGeocode(
        latitude,
        longitude
      );

      // Update form data with detected location
      setMapSelected(true);
      setFormData((prev) => ({
        ...prev,
        location: {
          type: "Point",
          coordinates: [longitude, latitude],
        },
        formattedAddress: geocodeResult.formattedAddress,
        street: geocodeResult.addressComponents.street || "",
        city: geocodeResult.addressComponents.city || "",
        state: geocodeResult.addressComponents.state || "",
        pincode: geocodeResult.addressComponents.pincode || "",
        landmark: geocodeResult.addressComponents.landmark || "",
      }));

      toast.success("Location detected successfully!", { id: toastId });

      // If you want to also update the map position, you can pass this to the OSMLocationPicker
      // You might need to add a prop to OSMLocationPicker to set initial position
      
    } catch (error: any) {
      console.error("Error getting location:", error);
      toast.dismiss();

      let errorMessage = "Failed to get your current location";
      if (error instanceof GeolocationPositionError) {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage =
              "Location access was denied. Please enable location permissions in your browser.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage =
              "Location information is unavailable. Please try manual location selection.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out. Please try again.";
            break;
        }
      }

      toast.error(errorMessage);

      // Show fallback option
      setTimeout(() => {
        toast(
          (t) => (
            <div className="text-center">
              <p className="text-sm mb-2">Try selecting location on map?</p>
              <div className="flex gap-2 justify-center">
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  OK
                </button>
              </div>
            </div>
          ),
          { duration: 5000 }
        );
      }, 1000);
    } finally {
      setDetectingLocation(false);
    }
  };

  const handleInputChange = (
    field: keyof AddressFormData,
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate required fields
    if (
      !formData.street ||
      !formData.city ||
      !formData.state ||
      !formData.pincode
    ) {
      alert("Please fill in all required address fields");
      return;
    }

    if (!mapSelected) {
      alert("Please select your location on the map or use auto-detect");
      return;
    }

    onSave(formData);
  };

  const resetForm = () => {
    setFormData({
      label: "Home",
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
      isDefault: false,
      location: {
        type: "Point",
        coordinates: [0, 0],
      },
      formattedAddress: "",
    });
    setMapSelected(false);
    setDetectingLocation(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  return (
    <Dialog open={isOpen} onClose={handleClose} className="relative z-50">
      <DialogBackdrop className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />

      <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
        <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
          <DialogPanel className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl">
            <div className="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
              <div className="flex items-center justify-between mb-4">
                <DialogTitle
                  as="h3"
                  className="text-lg font-semibold leading-6 text-gray-900"
                >
                  Add New Address
                </DialogTitle>
                <button
                  onClick={handleClose}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <CloseOutlined className="h-6 w-6" />
                </button>
              </div>

              {/* Auto Detect Location Button */}
              <div className="mb-4">
                <button
                  onClick={handleAutoDetectLocation}
                  disabled={detectingLocation}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <MyLocationOutlined className="w-5 h-5" />
                  {detectingLocation ? "Detecting Location..." : "Auto Detect My Location"}
                </button>
                <p className="text-sm text-gray-600 mt-1">
                  Click to automatically detect your current location using your device's GPS
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Map */}
                <div className="space-y-4">
                  <div className="border rounded-lg overflow-hidden">
                    <OSMLocationPicker
                      onLocationSelect={handleLocationSelect}
                      className="h-full"
                    />
                  </div>

                  {/* Address Preview */}
                  {formData.formattedAddress && (
                    <div className="bg-green-50 border border-green-200 p-3 rounded-lg">
                      <p className="text-sm font-medium text-green-800 mb-1">
                        📍 Address Detected:
                      </p>
                      <p className="text-sm text-green-700">
                        {formData.formattedAddress}
                      </p>
                    </div>
                  )}

                  {/* Detection Status */}
                  {detectingLocation && (
                    <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                        <div>
                          <p className="text-sm font-medium text-blue-800">
                            Detecting Your Location
                          </p>
                          <p className="text-xs text-blue-700">
                            Please allow location access in your browser
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side - Form Fields */}
                <div className="space-y-4">
                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Address Details Form */}
                    <div className="space-y-4">
                      {/* Label */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Address Label
                        </label>
                        <select
                          value={formData.label}
                          onChange={(e) =>
                            handleInputChange("label", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="Home">Home</option>
                          <option value="Work">Work</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>

                      {/* Street Address */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Street Address <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.street}
                          onChange={(e) =>
                            handleInputChange("street", e.target.value)
                          }
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Enter street address"
                          required
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* City */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            City <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.city}
                            onChange={(e) =>
                              handleInputChange("city", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter city"
                            required
                          />
                        </div>

                        {/* State */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            State <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.state}
                            onChange={(e) =>
                              handleInputChange("state", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter state"
                            required
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Pincode */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pincode <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.pincode}
                            onChange={(e) =>
                              handleInputChange("pincode", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter pincode"
                            required
                          />
                        </div>

                        {/* Landmark */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Landmark
                          </label>
                          <input
                            type="text"
                            value={formData.landmark}
                            onChange={(e) =>
                              handleInputChange("landmark", e.target.value)
                            }
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter nearby landmark"
                          />
                        </div>
                      </div>

                      {/* Default Address Toggle */}
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="defaultAddress"
                          checked={formData.isDefault}
                          onChange={(e) =>
                            handleInputChange("isDefault", e.target.checked)
                          }
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label
                          htmlFor="defaultAddress"
                          className="ml-2 block text-sm text-gray-700"
                        >
                          Set as default address
                        </label>
                      </div>
                    </div>

                    {/* Status Message */}
                    {!mapSelected && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <span className="text-yellow-600 text-lg">📍</span>
                          <div>
                            <p className="text-sm font-medium text-yellow-800">
                              Location Required
                            </p>
                            <p className="text-sm text-yellow-700">
                              Please select your location on the map or use "Auto Detect" to fill address details automatically
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Success Message */}
                    {mapSelected && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <span className="text-green-600 text-lg">✅</span>
                          <div>
                            <p className="text-sm font-medium text-green-800">
                              Location Selected
                            </p>
                            <p className="text-sm text-green-700">
                              Address fields have been auto-filled. You can edit them if needed.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={loading || !mapSelected}
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {loading ? "Saving..." : "Save Address"}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </DialogPanel>
        </div>
      </div>
    </Dialog>
  );
};