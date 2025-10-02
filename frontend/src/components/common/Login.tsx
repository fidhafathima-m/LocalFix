import React, { useState } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../../api/auth';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import GoogleAuth from '../../features/user/components/GoogleAuth';

type UserType = 'user' | 'serviceProvider' | 'admin';

interface LoginProps {
  userType: UserType;
}

const Login: React.FC<LoginProps> = ({ userType }) => {
  const [identifier, setIdentifier] = useState(''); // email or phone
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [identifierError, setIdentifierError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const { login } = useAuth();

  const validateForm = (): boolean => {
    let valid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\d{10}$/;

    if (!identifier) {
      setIdentifierError('Enter email or phone');
      valid = false;
    } else if (!emailRegex.test(identifier) && !phoneRegex.test(identifier)) {
      setIdentifierError('Enter valid email or phone');
      valid = false;
    } else {
      setIdentifierError('');
    }

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      valid = false;
    } else {
      setPasswordError('');
    }

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      
      const res = await loginUser({ identifier, password, role: userType });
      
      // Check if response data exists
      if (!res || !res.data) {
        throw new Error('No response received from server');
      }
      
      
      // Check if user and token exist in response
      if (!res.data.user || !res.data.token) {
        throw new Error('Invalid response format from server');
      }
      
      login(res.data.user, res.data.token);
      toast.success('Login successful!');

       const userData = {
      ...res.data.user,
      applicationStatus: res.data.user.applicationStatus || 'not-applied'
    };

      // In your Login component - update the redirect logic
setTimeout(() => {
  console.log('Login successful - User data:', userData);
  console.log('Application status:', userData.applicationStatus);
  console.log('User role:', userData.role);

  // Enhanced technician routing logic
  if (userType === 'serviceProvider') {
    // Check application status for routing
    if (userData.applicationStatus === 'submitted' || userData.applicationStatus === 'under_review') {
      console.log('Redirecting to pending technician dashboard - application submitted/under review');
      navigate('/pending-technician/dashboard');
    } else if (userData.applicationStatus === 'approved') {
      console.log('Redirecting to approved technician dashboard');
      navigate('/technician/dashboard');
    } else if (userData.applicationStatus === 'draft') {
      console.log('Redirecting to continue draft application');
      navigate('/technician/apply');
    } else {
      console.log('Redirecting to application form - no application or not applied');
      navigate('/technicians');
    }
  } else if (userType === 'admin') {
    navigate('/admin/dashboard');
  } else {
    navigate('/');
  }
}, 1000);
    } catch (error: unknown) {
      console.error('Login error details:', error);
      
      if (error instanceof Error) {
        toast.error(error.message);
      } else if (axios.isAxiosError(error)) {
        // Detailed Axios error logging
        console.error('Axios error details:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          message: error.message
        });
        
        if (error.response?.data?.message) {
          toast.error(error.response.data.message);
        } else if (error.response?.status === 401) {
          toast.error('Invalid credentials');
        } else if (error.response?.status === 404) {
          toast.error('User not found');
        } else if (error.response?.status === 400) {
          toast.error('Bad request - check your input');
        } else if (error.response?.status === 500) {
          toast.error('Server error - please try again later');
        } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
          toast.error('Cannot connect to server. Check your connection.');
        } else {
          toast.error(`Login failed: ${error.response?.status || 'Unknown error'}`);
        }
      } else {
        toast.error('Login failed - unexpected error');
      }
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (userType) {
      case 'admin':
        return 'Admin Login';
      case 'serviceProvider':
        return 'Technician Login';
      default:
        return 'User Login';
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 shadow-md mt-10">
      {/* Header */}
      <div className="mb-4 text-center">
        <h1 className="text-2xl font-semibold">{getTitle()}</h1>
        <p className="text-sm text-gray-500">Welcome back! Please log in to continue.</p>
      </div>

      {/* Form */}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm mb-1">Email or Phone</label>
          <div className="flex items-center border rounded overflow-hidden">
            <input
              type="text"
              placeholder="Enter email or phone (with no country code)"
              className="flex-1 p-2 text-sm outline-none"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
            />
          </div>
          {identifierError && <p className="text-sm text-red-500 mt-1">{identifierError}</p>}
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            placeholder="******"
            className="w-full border p-2 rounded"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {passwordError && <p className="text-sm text-red-500 mt-1">{passwordError}</p>}
          <Link
            to={
              userType === 'serviceProvider'
                ? '/technicians/forgot-password'
                : userType === 'admin'
                ? '/admin/forgot-password'
                : '/forgot-password'
            }
            className="text-xs text-blue-500 hover:underline"
          >
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded cursor-pointer ${
            loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'
          }`}
        >
          {loading ? 'Logging in...' : 'Continue'}
        </button>
      </form>

      {/* Social login */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">Or continue with</p>
        <div className="flex justify-center gap-4 mt-2">
          <GoogleAuth userType={userType}/>
        </div>
      </div>

      <div className="text-center p-3">
        {userType !== 'serviceProvider' && (
          <p className="text-gray-500">
            Don't have an account? <Link to="/signup" className="text-[#1877F2]">Sign Up</Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default Login;