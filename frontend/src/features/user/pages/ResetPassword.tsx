import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NewPassword from '../../../components/common/NewPassword';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import toast from 'react-hot-toast';

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { phone: string; userType: 'user' | 'serviceProvider' | 'admin' };

  useEffect(() => {
    if (!state?.phone || !state?.userType) {
      navigate('/login');
    }
  }, [state, navigate]);

  if (!state?.phone || !state?.userType) {
    return null; 
  }

  const handleResetPassword = async (newPassword: string) => {
    try {
      const otpData = JSON.parse(localStorage.getItem('forgotData') || '{}');
      await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/reset-password`, {
        phone: otpData.phone,
        otp: otpData.otp,
        newPassword,
      });

      toast.success('Password reset successful');
      setTimeout(() => navigate('/login'), 1000)
      
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
        <Header/>
        <NewPassword
        userType={state.userType}
        onSubmit={(password) => handleResetPassword(password)}
        />
        <Footer/>
    </>
  );
};

export default ResetPasswordPage;
