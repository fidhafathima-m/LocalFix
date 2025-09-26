import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { verifyOTP } from '../../api/auth';
import type { UserType, OTPContext } from '../../api/auth';
import { AxiosError } from 'axios';
import type {VerifyOTPData} from '../../api/auth'

interface OTPProps {
  userType: UserType;
  context: OTPContext;
}

const OTP: React.FC<OTPProps> = ({ userType, context }) => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  // Load stored data (signupData or forgotData)
  const contextData = JSON.parse(
    localStorage.getItem(context === 'signup' ? 'signupData' : 'forgotData') || '{}'
  );

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
        const res = await verifyOTP({
          otp,
          userType,
          context: 'signup',
          ...contextData,
        });

        login(res.user, res.token);
        toast.success('OTP verified successfully');

        const redirect = userType === 'user' ? '/' :
                         userType === 'serviceProvider' ? '/technicians' :
                         '/admin/dashboard';
        navigate(redirect, { replace: true });
      } else {
        // forgot password context
        const data: VerifyOTPData = {
          otp,
          context: 'forgot',
          userType,
        };

        // Use phone/email from contextData
        if (contextData.phone) data.phone = contextData.phone;
        if (contextData.email) data.email = contextData.email;

        await verifyOTP(data);

        // Store OTP locally for reset password page
        const storageKey = userType === 'admin' ? 'adminForgotData' : 'forgotData';
        localStorage.setItem(storageKey, JSON.stringify({ ...contextData, otp }));

        toast.success('OTP verified successfully');

        const redirect = userType === 'admin'
          ? '/admin/reset-password'
          : '/reset-password';

        navigate(redirect, { state: { ...contextData, otp, userType } });
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold p-5">{getTitle()}</h1>
        <p className="text-sm text-gray-500">Please enter the six-digit pin sent to:</p>
        {contextData?.phone && <p className="text-blue-600 font-semibold">{contextData.phone}</p>}
        {contextData?.email && <p className="text-blue-600 font-semibold">{contextData.email}</p>}
      </div>

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="text-center p-5">
          <input
            type="text"
            maxLength={6}
            placeholder="Enter OTP"
            className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={otp}
            onChange={e => setOtp(e.target.value)}
          />
          {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
        </div>

        <div className="flex justify-between pb-5">
          <p className="text-gray-500">Resend code</p>
          <p className="font-semibold text-blue-600">0:59</p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-700 text-white p-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'}`}
        >
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
    </div>
  );
};

export default OTP;
