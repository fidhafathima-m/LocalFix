import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import NewPassword from '../../components/ForgetPassword/NewPassword';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import toast from 'react-hot-toast';

const AdminResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();

  // Retrieve stored OTP/admin info
  const adminForgotData = JSON.parse(localStorage.getItem('adminForgotData') || '{}');

  useEffect(() => {
    if (!adminForgotData?.phone) {
      navigate('/admin/forgot-password');
    }
  }, [adminForgotData, navigate]);

  if (!adminForgotData?.phone) return null;

  const handleResetPassword = async (newPassword: string) => {
    try {
      await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/reset-password`, {
        phone: adminForgotData.phone,
        otp: adminForgotData.otp,
        newPassword,
        userType: 'admin'
      });

      toast.success('Password reset successful');
      setTimeout(() => navigate('/admin/login', { replace: true }), 1000)
      
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
