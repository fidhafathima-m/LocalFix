import React, { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import NewPassword from "../../../components/common/NewPassword";
import Header from "../../../components/common/Header";
import Footer from "../../../components/common/Footer";
import toast from "react-hot-toast";
import { authAPI } from "../../../services/authApi"; 

const AdminResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state
  const resetData = location.state as {
    phone?: string;
    email?: string;
    otp: string;
    userType: string;
  };

  useEffect(() => {
    if (
      !resetData ||
      (!resetData.phone && !resetData.email) ||
      !resetData.otp
    ) {
      toast.error("Invalid reset password request");
      navigate("/admin/forgot-password");
      return;
    }
  }, [resetData, navigate]);

  const handleResetPassword = async (newPassword: string, confirmPassword: string) => {
    try {
      // Validate passwords match
      if (newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      // Prepare payload using the new service interface
      const payload = {
        password: newPassword,
        confirmPassword: confirmPassword,
        otp: resetData.otp,
        userType: "admin" as const,
        phone: resetData.phone,
        email: resetData.email,
      };

      // Use the new authAPI service
      const response = await authAPI.resetPassword(payload);

      if (response.success) {
        toast.success(response.message || "Password reset successfully");

        // Clear any stored reset data
        localStorage.removeItem("forgotData");

        // Navigate to login after success
        setTimeout(() => navigate("/admin/login", { replace: true }), 1000);
      } else {
        toast.error(response.message || "Password reset failed");
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Reset password error:", error);
      
      // Handle error from the service
      const errorMessage = error.response?.data?.message || error.message || "Reset password failed";
      toast.error(errorMessage);
    }
  };

  return (
    <>
      <Header userType="admin" />
      <NewPassword 
        userType="admin" 
        onSubmit={handleResetPassword} 
      />
      <Footer />
    </>
  );
};

export default AdminResetPasswordPage;