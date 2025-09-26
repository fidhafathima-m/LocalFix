import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import NewPassword from '../../../components/common/NewPassword';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import toast from 'react-hot-toast';
import { resetPassword, type ResetPasswordData } from '../../../api/auth';

const ResetPasswordPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get the state passed from OTP component
  const state = location.state as { 
    phone?: string; 
    email?: string; 
    otp: string; 
    userType: 'user' | 'serviceProvider' | 'admin' 
  };

  useEffect(() => {
    
    // Check if we have the necessary data (either phone or email + otp + userType)
    if ((!state?.phone && !state?.email) || !state?.otp || !state?.userType) {
      console.error('Missing required data for password reset:', state);
      toast.error('Invalid reset password request');
      navigate('/forgot-password');
      return;
    }
  }, [state, navigate]);

  // Show nothing if data is missing (will redirect in useEffect)
  if ((!state?.phone && !state?.email) || !state?.otp || !state?.userType) {
    return null; 
  }

  const handleResetPassword = async (newPassword: string) => {
    try {
      // Use the data from location state instead of localStorage
      const payload: ResetPasswordData = {
        newPassword,
        otp: state.otp,
        userType: state.userType
      };

      // Add phone or email based on what's available
      if (state.phone) {
        payload.phone = state.phone;
      } else if (state.email) {
        payload.email = state.email;
      }


      await resetPassword(payload);

      toast.success('Password reset successfully');
      
      // Clear any stored data
      localStorage.removeItem('forgotData');
      
      // Redirect to appropriate login page after 1 second
      setTimeout(() => {
        let loginPath = '/login';
        if (state.userType === 'admin') {
          loginPath = '/admin/login';
        } else if (state.userType === 'serviceProvider') {
          loginPath = '/technicians/login';
        }
        navigate(loginPath, { replace: true });
      }, 1000);
      
    } catch (error: unknown) {
      console.error('Reset password error:', error);
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Reset password failed");
      }
    }
  };

  return (
    <>
      <Header userType={state.userType} />
      <NewPassword
        userType={state.userType}
        onSubmit={handleResetPassword}
      />
      <Footer />
    </>
  );
};

export default ResetPasswordPage;