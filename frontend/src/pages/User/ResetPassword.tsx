import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NewPassword from '../../components/ForgetPassword/NewPassword';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { phone: string; userType: 'user' | 'serviceProvider' | 'admin' };

  // Handle missing state via useEffect
  useEffect(() => {
    if (!state?.phone || !state?.userType) {
      navigate('/login');
    }
  }, [state, navigate]);

  if (!state?.phone || !state?.userType) {
    return null; // render nothing while redirecting
  }

  const handleResetPassword = async (newPassword: string) => {
    try {
      const otpData = JSON.parse(localStorage.getItem('forgotData') || '{}');
      await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/reset-password`, {
        phone: otpData.phone,
        otp: otpData.otp,
        newPassword,
      });

      alert('Password reset successful');
      navigate('/login');
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Reset password failed");
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
