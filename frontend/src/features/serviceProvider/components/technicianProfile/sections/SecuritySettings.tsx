import { useState, useEffect } from "react";
import AccordionSection from "./AccordianSections";
import { TechnicianService } from "../../../../services/technician/technicianService";
import { type TechnicianProfile } from "../../../../services/common/technicianApi";

interface SecuritySettingsData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const SecuritySettings = () => {
  const [loading, setLoading] = useState(false);
  const [, setProfile] = useState<TechnicianProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState<SecuritySettingsData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await TechnicianService.getProfile();
      if (response.success) {
        setProfile(
          response.data?.profile ||
            response.data?.data?.profile ||
            response.data
        );
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
    }
  };

  const handleInputChange = (
    field: keyof SecuritySettingsData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    // Clear errors when user starts typing
    if (error) setError(null);
    if (success) setSuccess(null);
  };

  const validatePassword = (password: string): boolean => {
    const minLength = 8;
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    return password.length >= minLength && hasNumber && hasSpecialChar;
  };

  const handleUpdatePassword = async () => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);

      // Validation
      if (!formData.currentPassword) {
        setError("Please enter your current password");
        return;
      }

      if (!formData.newPassword) {
        setError("Please enter a new password");
        return;
      }

      if (!validatePassword(formData.newPassword)) {
        setError(
          "Password must be at least 8 characters with a number and a special character"
        );
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("New passwords do not match");
        return;
      }

      if (formData.currentPassword === formData.newPassword) {
        setError("New password must be different from current password");
        return;
      }

      // Call the update password API with correct structure
      const response = await TechnicianService.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
        confirmPassword: formData.confirmPassword,
      });

      if (response.success) {
        setSuccess("Password updated successfully!");
        // Reset form
        setFormData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
      } else {
        setError(response.message || "Failed to update password");
      }
    } catch (error: unknown) {
      console.error("Error updating password:", error);
      setError(
        error instanceof Error ? error.message : "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <AccordionSection title="Security & Settings" number={7}>
      <div>
        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        <h3 className="text-sm font-medium mb-4">Change Password</h3>
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm mb-1">Current Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter current password"
                value={formData.currentPassword}
                onChange={(e) =>
                  handleInputChange("currentPassword", e.target.value)
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm mb-1">New Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Enter new password"
                value={formData.newPassword}
                onChange={(e) =>
                  handleInputChange("newPassword", e.target.value)
                }
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.newPassword &&
                  !validatePassword(formData.newPassword)
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                disabled={loading}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Password must be at least 8 characters with a number and a special
              character
            </p>
            {formData.newPassword &&
              !validatePassword(formData.newPassword) && (
                <p className="text-xs text-red-500 mt-1">
                  Password must include at least 8 characters, one number, and
                  one special character
                </p>
              )}
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm New Password</label>
            <div className="relative">
              <input
                type="password"
                placeholder="Confirm new password"
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  formData.confirmPassword &&
                  formData.newPassword !== formData.confirmPassword
                    ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                    : "border-gray-300 focus:border-blue-500"
                }`}
                disabled={loading}
              />
            </div>
            {formData.confirmPassword &&
              formData.newPassword !== formData.confirmPassword && (
                <p className="text-xs text-red-500 mt-1">
                  Passwords do not match
                </p>
              )}
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleUpdatePassword}
              disabled={loading}
              className={`px-4 py-2 rounded font-medium flex items-center ${
                loading
                  ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                  : "bg-blue-500 text-white hover:bg-blue-600 cursor-pointer"
              }`}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Updating...
                </>
              ) : (
                "Update Password"
              )}
            </button>
          </div>
        </div>
      </div>
    </AccordionSection>
  );
};

export default SecuritySettings;
