import { useState, useEffect } from "react";
import AccordionSection from "./AccordianSections";
import {
  AccessTimeOutlined,
  CheckCircleOutline,
  Cancel,
  LocationOn,
} from "@mui/icons-material";
import { type TechnicianProfile } from "../../../../services/common/technicianApi";
import { TechnicianService } from "../../../../services/technician/technicianService";
import { OSMLocationPicker } from "../../../../components/common/OSMLocationPicker";
import toast from "react-hot-toast";

interface IdentityVerificationData {
  governmentIdType?: string;
  governmentIdNumber?: string;
  verificationStatus?: "pending" | "approved" | "rejected";
  verified?: boolean;
  verifiedAt?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark: string;
  };
  location?: {
    coordinates: number[];
    formattedAddress: string;
  };
}

interface Address {
  street: string;
  city: string;
  state: string;
  pincode: string;
  landmark: string;
}

const IdentityVerification = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<IdentityVerificationData>({
    governmentIdType: "",
    governmentIdNumber: "",
    verificationStatus: "pending",
    verified: false,
    address: {
      street: "",
      city: "",
      state: "",
      pincode: "",
      landmark: "",
    },
    location: {
      coordinates: [0, 0],
      formattedAddress: "",
    },
  });

  useEffect(() => {
    fetchProfile();
  }, []);

 const fetchProfile = async () => {
  try {
    setLoading(true);
    const response = await TechnicianService.getProfile();
    if (response.success) {
      const profileData = response.data?.data?.profile || response.data?.profile || response.data?.data;
      setProfile(profileData);

      console.log('🔍 Profile Data:', profileData);
      console.log('🔍 Identity Verification Data:', profileData.identityVerification);

      // ✅ CORRECTED: Use the actual field names that are coming from backend
      if (profileData.identityVerification) {
        setFormData({
          governmentIdType: profileData.identityVerification.governmentIdType || "", // ✅ Use governmentIdType directly
          governmentIdNumber: profileData.identityVerification.governmentIdNumber || "", // ✅ Use governmentIdNumber directly
          verificationStatus: profileData.identityVerification.verificationStatus || "pending",
          verified: profileData.identityVerification.verified || false,
          verifiedAt: profileData.identityVerification.verifiedAt,
          address: profileData.personalInfo?.address || {
            street: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
          },
          location: {
            coordinates: profileData.currentLocation?.coordinates || [0, 0],
            formattedAddress: "",
          },
        });
      } else {
        // Initialize with empty values if no data exists
        setFormData({
          governmentIdType: "",
          governmentIdNumber: "",
          verificationStatus: "pending",
          verified: false,
          address: profileData.personalInfo?.address || {
            street: "",
            city: "",
            state: "",
            pincode: "",
            landmark: "",
          },
          location: {
            coordinates: profileData.currentLocation?.coordinates || [0, 0],
            formattedAddress: "",
          },
        });
      }
    }
  } catch (error) {
    console.error("Error fetching profile:", error);
  } finally {
    setLoading(false);
  }
};

const handleSave = async () => {
  try {
    setSaving(true);

    // ✅ CORRECTED: Transform field names to match backend expectations
    const updateData = {
      identityVerification: {
        idType: formData.governmentIdType, // ✅ Transform to idType for backend
        idNumber: formData.governmentIdNumber, // ✅ Transform to idNumber for backend
        verificationStatus: "pending",
        verified: false,
      },
      personalInfo: {
        ...profile?.personalInfo,
        address: formData.address,
      },
    };

    console.log('💾 Saving data:', updateData);

    const response = await TechnicianService.updateIdentityVerification(updateData);

    if (response.success) {
      console.log('✅ Save successful:', response);
      
      // Update local profile state with correct field names
      if (profile) {
        setProfile({
          ...profile,
          identityVerification: {
            ...profile.identityVerification,
            idType: formData.governmentIdType, // ✅ Store as idType
            idNumber: formData.governmentIdNumber, // ✅ Store as idNumber
            verificationStatus: "pending",
            verified: false,
          },
          personalInfo: {
            ...profile.personalInfo,
            address: formData.address,
          },
        });
      }
      
      toast.success("Identity verification details updated successfully! They will be reviewed by our team.");

      // Refresh the data to confirm it's saved
      await fetchProfile();
    } else {
      console.error("❌ Frontend - API returned error:", response);
      toast.error(`Failed to update: ${response.message}`);
    }
  } catch (error) {
    console.error("❌ Frontend - Error updating identity verification:", error);
    toast.error("Failed to update identity verification details");
  } finally {
    setSaving(false);
  }
};
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    if (name.startsWith("address.")) {
      const addressField = name.replace("address.", "") as keyof Address;
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address!,
          [addressField]: value,
        },
        // Reset verification status when address changes
        verificationStatus: "pending",
        verified: false,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        // Reset verification status when ID details change
        verificationStatus: "pending",
        verified: false,
      }));
    }
  };

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
    const locationData = {
      coordinates: [location.lng, location.lat],
      formattedAddress: location.address,
    };

    // Update location coordinates
    setFormData((prev) => ({
      ...prev,
      location: locationData,
      // Reset verification status when location changes
      verificationStatus: "pending",
      verified: false,
    }));

    // Auto-fill address fields with fallbacks for undefined
    if (location.addressComponents) {
      const { street, city, state, pincode, landmark } =
        location.addressComponents;

      setFormData((prev) => ({
        ...prev,
        address: {
          street: street || prev.address?.street || "",
          city: city || prev.address?.city || "",
          state: state || prev.address?.state || "",
          pincode: pincode || prev.address?.pincode || "",
          landmark: landmark || prev.address?.landmark || "",
        },
      }));
    }
  };
  const getStatusDisplay = () => {
    if (!formData.verificationStatus) return null;

    switch (formData.verificationStatus) {
      case "approved":
        return (
          <div className="flex items-center text-green-500">
            <CheckCircleOutline className="h-5 w-5 mr-1" />
            <span className="text-sm">Verified</span>
          </div>
        );
      case "rejected":
        return (
          <div className="flex items-center text-red-500">
            <Cancel className="h-5 w-5 mr-1" />
            <span className="text-sm">Verification Failed</span>
          </div>
        );
      case "pending":
      default:
        return (
          <div className="flex items-center text-yellow-500">
            <AccessTimeOutlined className="h-5 w-5 mr-1" />
            <span className="text-sm">Pending Verification</span>
          </div>
        );
    }
  };

  const maskIdNumber = (idNumber?: string) => {
    if (!idNumber) return "XXXX-XXXX-XXXX";

    // Mask all but last 4 characters
    const visiblePart = idNumber.slice(-4);
    const maskedPart = "X".repeat(Math.max(0, idNumber.length - 4));
    return `${maskedPart}${visiblePart}`;
  };

  if (loading) {
    return (
      <AccordionSection title="Identity & Verification" number={2}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AccordionSection>
    );
  }


  return (
    <AccordionSection title="Identity & Verification" number={2}>
      <div className="space-y-6">
        {/* Verification Status */}
        <div className="flex items-center">
          <span className="text-sm mr-2">Verification Status:</span>
          {getStatusDisplay()}
          {formData.verifiedAt && (
            <span className="text-xs text-gray-500 ml-2">
              Verified on {new Date(formData.verifiedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Government ID Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm mb-1">Government ID Type</label>
            <select
              name="governmentIdType"
              value={formData.governmentIdType || ""}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select ID Type</option>
              <option value="passport">Passport</option>
              <option value="driver_license">Driver's License</option>
              <option value="national_id">National ID</option>
              <option value="aadhaar">Aadhaar Card</option>
              <option value="voter_id">Voter ID</option>
            </select>
          </div>

          <div>
            <label className="block text-sm mb-1">ID Number</label>
            <input
              type="text"
              name="governmentIdNumber"
              value={formData.governmentIdNumber || ""}
              onChange={handleInputChange}
              placeholder="Enter your ID number"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.governmentIdNumber && (
              <p className="text-xs text-gray-500 mt-1">
                Masked ID: {maskIdNumber(formData.governmentIdNumber)}
              </p>
            )}
          </div>
        </div>

        {/* Location Picker */}
        <div className="border-t pt-6">
          <div className="flex items-center mb-4">
            <LocationOn className="h-5 w-5 text-blue-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">
              Location & Address
            </h3>
          </div>

          <OSMLocationPicker
            onLocationSelect={handleLocationSelect}
            initialLocation={
              formData.location?.coordinates?.[1] &&
              formData.location?.coordinates?.[0]
                ? {
                    lat: formData.location.coordinates[1],
                    lng: formData.location.coordinates[0],
                  }
                : undefined
            }
            className="mt-4"
          />

          {/* Address Fields */}
          <div className="mt-6">
            <h3 className="text-lg font-medium text-gray-800 mb-4">
              Address Details
              <span className="text-green-600 text-sm ml-2">
                (Auto-filled from map selection)
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm mb-1">Street Address</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address?.street || ""}
                  onChange={handleInputChange}
                  placeholder="House no, street, area"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address?.city || ""}
                  onChange={handleInputChange}
                  placeholder="City"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address?.state || ""}
                  onChange={handleInputChange}
                  placeholder="State"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">PIN Code</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address?.pincode || ""}
                  onChange={handleInputChange}
                  placeholder="PIN Code"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm mb-1">
                  Landmark (Optional)
                </label>
                <input
                  type="text"
                  name="address.landmark"
                  value={formData.address?.landmark || ""}
                  onChange={handleInputChange}
                  placeholder="Nearby landmark"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-50 rounded">
              <p className="text-sm text-blue-700">
                💡 <strong>Tip:</strong> Click on the map above to automatically
                fill these address fields using OpenStreetMap. You can also
                manually edit them if the auto-filled data needs correction.
              </p>
            </div>
          </div>
        </div>

        {/* Current Location Display */}
        {formData.location?.formattedAddress && (
          <div className="p-4 bg-green-50 rounded border border-green-200">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-green-800 flex items-center">
                  <LocationOn className="h-4 w-4 mr-2" />
                  Current Location
                </p>
                <p className="text-sm text-green-700 mt-1">
                  {formData.location.formattedAddress}
                </p>
                {formData.location.coordinates && (
                  <p className="text-xs text-green-600 mt-1">
                    Coordinates: {formData.location.coordinates[1].toFixed(6)},{" "}
                    {formData.location.coordinates[0].toFixed(6)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end pt-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`bg-blue-500 text-white px-6 py-2 rounded flex items-center ${
              saving ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-600"
            }`}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </div>
    </AccordionSection>
  );
};

export default IdentityVerification;


