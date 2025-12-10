import React, { useState, useEffect } from "react";
import { ShieldOutlined, Visibility, VisibilityOff } from "@mui/icons-material";
import type { PasswordData } from "./types";
import toast from "react-hot-toast";
import { userService } from "../../../../../services/user/userService";
import {
  checkPasswordStrength,
  validateChangePassword,
} from "../../../../../validation";

export const SecuritySection: React.FC = () => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordData, setPasswordData] = useState<PasswordData>({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    strength: string;
  } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset state when opening/closing password change
  useEffect(() => {
    if (!isChangingPassword) {
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setErrors({});
      setPasswordStrength(null);
      setShowPasswords({
        current: false,
        new: false,
        confirm: false,
      });
    }
  }, [isChangingPassword]);

  // Check password strength in real-time
  useEffect(() => {
    if (passwordData.newPassword) {
      const strength = checkPasswordStrength(passwordData.newPassword);
      setPasswordStrength(strength);
    } else {
      setPasswordStrength(null);
    }
  }, [passwordData.newPassword]);

  const handleChange = (field: keyof PasswordData, value: string) => {
    setPasswordData((prev) => ({ ...prev, [field]: value }));

    // Clear error for this field
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }

    // Clear confirm password error if both passwords match
    if (field === "confirmPassword" && errors.confirmPassword) {
      if (value === passwordData.newPassword) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }

    if (field === "newPassword" && errors.confirmPassword) {
      if (value === passwordData.confirmPassword) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.confirmPassword;
          return newErrors;
        });
      }
    }
  };

  const togglePasswordVisibility = (field: keyof typeof showPasswords) => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleChangePassword = async () => {
    setIsSubmitting(true);
    setErrors({});

    // Frontend validation using Zod
    const validation = validateChangePassword(passwordData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await userService.changePassword(passwordData);

      if (response.success) {
        toast.success("Password updated successfully!");
        setIsChangingPassword(false);
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
        setPasswordStrength(null);
      } else {
        setErrors({
          _error: response.message || "Failed to change password",
        });
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("Error changing password:", err);
      setErrors({
        _error: err.response?.data?.message || "Failed to change password",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setErrors({});
    setPasswordStrength(null);
  };

  // Password requirements checklist
  const passwordRequirements = [
    { label: "At least 8 characters", check: (pw: string) => pw.length >= 8 },
    {
      label: "At least one uppercase letter",
      check: (pw: string) => /[A-Z]/.test(pw),
    },
    {
      label: "At least one lowercase letter",
      check: (pw: string) => /[a-z]/.test(pw),
    },
    { label: "At least one number", check: (pw: string) => /[0-9]/.test(pw) },
    {
      label: "At least one special character",
      check: (pw: string) => /[^A-Za-z0-9]/.test(pw),
    },
    {
      label: "No 3+ consecutive identical characters",
      check: (pw: string) => !/(.)\1\1/.test(pw),
    },
  ];

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-lg font-semibold mb-4">Security & Settings</h2>
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <ShieldOutlined className="w-5 h-5 text-gray-600" />
              <div>
                <p className="font-semibold">Password</p>
                <p className="text-sm text-gray-600">**********</p>
              </div>
            </div>
            {!isChangingPassword && (
              <button
                onClick={() => setIsChangingPassword(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer"
              >
                Change Password
              </button>
            )}
          </div>

          {isChangingPassword && (
            <div className="mt-4 space-y-4">
              {errors._error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                  <p className="text-red-700 text-sm">{errors._error}</p>
                </div>
              )}

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Current Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.current ? "text" : "password"}
                      value={passwordData.currentPassword}
                      onChange={(e) =>
                        handleChange("currentPassword", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.currentPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter current password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("current")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.current ? (
                        <VisibilityOff className="w-5 h-5" />
                      ) : (
                        <Visibility className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.currentPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.currentPassword}
                    </p>
                  )}
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.new ? "text" : "password"}
                      value={passwordData.newPassword}
                      onChange={(e) =>
                        handleChange("newPassword", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.newPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Enter new password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("new")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.new ? (
                        <VisibilityOff className="w-5 h-5" />
                      ) : (
                        <Visibility className="w-5 h-5" />
                      )}
                    </button>
                  </div>

                  {/* Password strength indicator */}
                  {passwordStrength && passwordData.newPassword && (
                    <div className="mt-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-gray-600">
                          Password strength:
                        </span>
                        <span
                          className={`text-xs font-medium ${
                            passwordStrength.score <= 1
                              ? "text-red-600"
                              : passwordStrength.score <= 2
                              ? "text-yellow-600"
                              : passwordStrength.score <= 3
                              ? "text-green-600"
                              : "text-green-700"
                          }`}
                        >
                          {passwordStrength.strength}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full transition-all duration-300 ${
                            passwordStrength.score <= 1
                              ? "bg-red-500 w-1/4"
                              : passwordStrength.score <= 2
                              ? "bg-yellow-500 w-1/2"
                              : passwordStrength.score <= 3
                              ? "bg-green-400 w-3/4"
                              : "bg-green-600 w-full"
                          }`}
                        />
                      </div>
                    </div>
                  )}

                  {/* Password requirements checklist */}
                  {passwordData.newPassword && (
                    <div className="mt-3 space-y-1">
                      <p className="text-xs text-gray-600 font-medium mb-1">
                        Password requirements:
                      </p>
                      {passwordRequirements.map((req, index) => {
                        const isMet = req.check(passwordData.newPassword);
                        return (
                          <div
                            key={index}
                            className="flex items-center gap-2 text-xs"
                          >
                            <div
                              className={`w-3 h-3 rounded-full flex items-center justify-center ${
                                isMet
                                  ? "bg-green-500 text-white"
                                  : "bg-gray-200 text-gray-400"
                              }`}
                            >
                              {isMet ? "✓" : ""}
                            </div>
                            <span
                              className={
                                isMet ? "text-green-600" : "text-gray-500"
                              }
                            >
                              {req.label}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {errors.newPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.newPassword}
                    </p>
                  )}
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm text-gray-600 mb-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswords.confirm ? "text" : "password"}
                      value={passwordData.confirmPassword}
                      onChange={(e) =>
                        handleChange("confirmPassword", e.target.value)
                      }
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                        errors.confirmPassword
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                      placeholder="Confirm new password"
                      disabled={isSubmitting}
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility("confirm")}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    >
                      {showPasswords.confirm ? (
                        <VisibilityOff className="w-5 h-5" />
                      ) : (
                        <Visibility className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword}
                    </p>
                  )}
                  {passwordData.confirmPassword &&
                    passwordData.newPassword ===
                      passwordData.confirmPassword && (
                      <p className="text-green-600 text-xs mt-1">
                        ✓ Passwords match
                      </p>
                    )}
                </div>
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  onClick={handleCancelPasswordChange}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
