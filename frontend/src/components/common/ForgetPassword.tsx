import React, { useState } from 'react';
import { AxiosError } from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { sendOTP } from '../../api/auth';
import toast from 'react-hot-toast';

type UserType = 'user' | 'serviceProvider' | 'admin';

interface ForgetPasswordProps {
  userType: UserType;
}

const ForgetPassword: React.FC<ForgetPasswordProps> = ({ userType }) => {
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const getTitle = () => {
    switch (userType) {
      case 'user':
        return 'User Forgot Password';
      case 'serviceProvider':
        return 'Technician Forgot Password';
      case 'admin':
        return 'Admin Forgot Password';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validation: require at least one
    if (!phone && !email) {
      setError('Please enter either phone number or email');
      return;
    }

    if (phone && !phoneRegex.test(phone)) {
      setError('Please enter a valid 10-digit phone number');
      return;
    }

    if (email && !emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await sendOTP({ phone: phone || undefined, email: email || undefined, userType });

      localStorage.setItem(
        'forgotData',
        JSON.stringify({ phone: phone || undefined, email: email })
      );

      if (userType === 'admin') {
        navigate('/admin/verify-otp', { state: { userType, context: 'forgot' } });
      } else {
        navigate('/verify-otp', { state: { userType, context: 'forgot' } });
      }
    } catch (err: unknown) {
      const error = err as AxiosError<{ message: string }>;
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold p-5">{getTitle()}</h1>
        <p className="text-sm text-gray-500">
          Enter your phone number or email to receive a verification code
        </p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="p-5">
          <label htmlFor="">Phone number</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        <div className="p-5">
          <label htmlFor="">Email</label>
          <input
            type="text"
            className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-700 text-white p-2 rounded ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-800'
          }`}
        >
          {loading ? 'Sending...' : 'Send Verification Code'}
        </button>

        <button className="w-full text-blue-600 p-2 rounded">
          <Link
            to={
              userType === 'serviceProvider'
                ? '/technicians/login'
                : userType === 'admin'
                ? '/admin/login'
                : '/login'
            }
          >
            Back to login
          </Link>
        </button>
      </form>
    </div>
  );
};

export default ForgetPassword;
