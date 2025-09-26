import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NewPassword from '../../../components/common/NewPassword';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import toast from 'react-hot-toast';
import { resetPassword, type ResetPasswordData } from '../../../api/auth';

const AdminResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Get data from location state
  const resetData = location.state as { phone?: string; email?: string; otp: string; userType: string };

  useEffect(() => {
    // Check if we have the necessary data to proceed with password reset
    if (!resetData || (!resetData.phone && !resetData.email) || !resetData.otp) {
      toast.error('Invalid reset password request');
      navigate('/admin/forgot-password');
      return;
    }
  }, [resetData, navigate]);

  const handleResetPassword = async (newPassword: string) => {
    try {
      // Prepare payload for resetPassword API
      const payload: ResetPasswordData = {
        newPassword,
        otp: resetData.otp,
        userType: 'admin'
      };

      // Add phone or email based on what's available
      if (resetData.phone) {
        payload.phone = resetData.phone;
      } else if (resetData.email) {
        payload.email = resetData.email;
      } else {
        throw new Error("Missing contact info for password reset");
      }

      await resetPassword(payload);

      toast.success('Password reset successful');
      
      // Clear localStorage data
      localStorage.removeItem('forgotData');
      
      setTimeout(() => navigate('/admin/login', { replace: true }), 1000);

    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Reset password failed");
      }
    }
  };

  return (
    <>
      <Header userType="admin" />
      <NewPassword userType="admin" onSubmit={handleResetPassword} />
      <Footer />
    </>
  );
};

export default AdminResetPasswordPage;  