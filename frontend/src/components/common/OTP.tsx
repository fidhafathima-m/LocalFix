import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { verifyOTP, resendOTP } from '../../api/auth';
import type { UserType, OTPContext } from '../../api/auth';
import { AxiosError } from 'axios';
import type { VerifyOTPData } from '../../api/auth';

interface OTPProps {
  userType: UserType;
  context: OTPContext;
}

const OTP: React.FC<OTPProps> = ({ userType, context }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(60);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  // Get data from location state
  const locationData = location.state as { phone?: string; email?: string; userType: UserType };

  // Also check localStorage as fallback
  const storageKey = context === 'signup' ? 'signupData' : 'forgotData';
  const contextData = JSON.parse(localStorage.getItem(storageKey) || '{}');

  // Use location data first, then fallback to localStorage
  const finalData = {
    ...contextData,
    ...locationData
  };

  // Countdown timer effect
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [countdown]);

  const getTitle = () => {
    const role = userType === 'user' ? 'User' : userType === 'serviceProvider' ? 'Technician' : 'Admin';
    return context === 'signup' 
      ? `${role} OTP Verification` 
      : `${role} Forgot Password OTP Verification`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }

    setLoading(true);
    setError('');

    try {
      if (context === 'signup') {
        // Signup OTP verification
        const res = await verifyOTP({ otp, userType, context, ...finalData });
        login(res.user, res.token);
        toast.success('OTP verified successfully');

        const redirect = userType === 'user' ? '/' : 
                        userType === 'serviceProvider' ? '/technicians' : 
                        '/admin/dashboard';
        navigate(redirect, { replace: true });
      } else {
        // Forgot password OTP verification - Use verifyResetOtp endpoint
        const data: VerifyOTPData = {
          otp,
          context: 'forgot',
          userType,
          phone: finalData.phone,
          email: finalData.email,
        };

        // Call the verifyResetOtp endpoint for forgot password
        await verifyOTP(data);

        // Determine the correct reset password route based on userType
        let resetPath = '/reset-password';
        if (userType === 'admin') {
          resetPath = '/admin/reset-password';
        } else if (userType === 'serviceProvider') {
          resetPath = '/technicians/reset-password';
        }


        // Navigate to reset password with all necessary data
        navigate(resetPath, {
          state: {
            phone: finalData.phone,
            email: finalData.email,
            otp, // Pass the OTP for the reset password step
            userType
          },
          replace: true
        });

        toast.success('OTP verified successfully');
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      console.error('OTP verification error:', error.response?.data);
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (countdown > 0) return;

    setResendLoading(true);
    
    try {
      const purpose = context === 'signup' ? 'signup' : 'reset';
      
      await resendOTP({
        phone: finalData.phone,
        email: finalData.email,
        purpose,
        userType
      });

      setCountdown(60);
      toast.success('OTP resent successfully!');
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Failed to resend OTP');
    } finally {
      setResendLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold p-5">{getTitle()}</h1>
        <p className="text-sm text-gray-500">Please enter the six-digit pin sent to:</p>
        {finalData?.phone && <p className="text-blue-600 font-semibold">{finalData.phone}</p>}
        {finalData?.email && <p className="text-blue-600 font-semibold">{finalData.email}</p>}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="text-center p-5">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter OTP"
            className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={otp}
            onChange={e => {
              setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
              setError('');
            }}
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex justify-between items-center pb-5">
          <button
            type="button"
            onClick={handleResendOTP}
            disabled={countdown > 0 || resendLoading}
            className={`text-blue-600 font-semibold ${
              countdown > 0 || resendLoading 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'hover:text-blue-800'
            }`}
          >
            {resendLoading ? 'Sending...' : 'Resend code'}
          </button>
          <p className="font-semibold text-blue-600">
            {formatTime(countdown)}
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-700 text-white p-2 rounded ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'
          }`}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>

      <div className="text-center mt-4">
        <p className="text-xs text-gray-500">
          Didn't receive the code? Check your spam folder or try resending.
        </p>
      </div>
    </div>
  );
};

export default OTP;