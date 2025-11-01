import React, { useState } from "react";
import { Dialog, DialogBackdrop, DialogPanel, DialogTitle } from "@headlessui/react";
import { CloseOutlined } from "@mui/icons-material";
import { OSMLocationPicker } from "../../../components/common/OSMLocationPicker";

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
    setFormData(prev => ({
      ...prev,
      location: {
        type: "Point",
        coordinates: [location.lng, location.lat], // Note: MongoDB uses [lng, lat]
      },
      formattedAddress: location.address,
      street: location.addressComponents.street || prev.street,
      city: location.addressComponents.city || prev.city,
      state: location.addressComponents.state || prev.state,
      pincode: location.addressComponents.pincode || prev.pincode,
      landmark: location.addressComponents.landmark || prev.landmark,
    }));
  };

  const handleInputChange = (field: keyof AddressFormData, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.street || !formData.city || !formData.state || !formData.pincode) {
      alert("Please fill in all required address fields");
      return;
    }

    if (!mapSelected) {
      alert("Please select your location on the map");
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
                <DialogTitle as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                  Add New Address
                </DialogTitle>
                <button
                  onClick={handleClose}
                  className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <CloseOutlined className="h-6 w-6" />
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Side - Map */}
                <div className="space-y-4">
                  
                  <OSMLocationPicker
                    onLocationSelect={handleLocationSelect}
                    className="h-full"
                  />

                  {/* Address Preview */}
                  {formData.formattedAddress && (
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Full Address Preview:</p>
                      <p className="text-sm text-gray-600">{formData.formattedAddress}</p>
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
                          onChange={(e) => handleInputChange("label", e.target.value)}
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
                          onChange={(e) => handleInputChange("street", e.target.value)}
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
                            onChange={(e) => handleInputChange("city", e.target.value)}
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
                            onChange={(e) => handleInputChange("state", e.target.value)}
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
                            onChange={(e) => handleInputChange("pincode", e.target.value)}
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
                            onChange={(e) => handleInputChange("landmark", e.target.value)}
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
                          onChange={(e) => handleInputChange("isDefault", e.target.checked)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label htmlFor="defaultAddress" className="ml-2 block text-sm text-gray-700">
                          Set as default address
                        </label>
                      </div>
                    </div>

                    {/* Status Message */}
                    {!mapSelected && (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-700">
                          ⚠️ Please select your location on the map to auto-fill address details
                        </p>
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