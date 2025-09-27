import React, { useState } from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import GoogleAuth from '../../features/user/components/GoogleAuth';
import { signupAPI } from '../../api/auth';
// import FacebookAuth from '../components/FacebookAuth';

interface SignUpProps {
  userType?: 'user' | 'serviceProvider';
}

const SignUp: React.FC<SignUpProps> = ({userType = 'user'}) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const [error, setError] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });


  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Validate form
  const validateForm = (): boolean => {
    let valid = true;
    const newErrors = {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    };

    const phoneRegex = /^\d{10}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
      valid = false;
    }

    // At least one of phone/email required
    if (!formData.phone && !formData.email) {
      newErrors.phone = "Enter phone or email";
      newErrors.email = "Enter phone or email";
      valid = false;
    } else {
      if (formData.phone && !phoneRegex.test(formData.phone)) {
        newErrors.phone = "Enter valid phone number";
        valid = false;
      }
      if (formData.email && !emailRegex.test(formData.email)) {
        newErrors.email = "Enter valid email";
        valid = false;
      }
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
      valid = false;
    }

    if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
      valid = false;
    }

    setError(newErrors);
    return valid;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setLoading(true);
  try {
    console.log('Form data being sent:', {
      fullName: formData.fullName,
      phone: formData.phone,
      email: formData.email,
      userType: userType
    });

    const response = await signupAPI({
      fullName: formData.fullName,
      ...(formData.phone ? { phone: formData.phone } : {}),
      ...(formData.email ? { email: formData.email } : {}),
      password: formData.password,
      userType: userType
    });

    console.log('Signup API response:', response);

    // Store signup data locally including userType
    localStorage.setItem("signupData", JSON.stringify({
      ...formData,
      userType: userType
    }));

    toast.success(response.message || response.data?.message || 'OTP sent successfully');

    // Redirect to correct OTP route based on userType
    const otpRoute = userType === 'serviceProvider' 
      ? '/technicians/verify-otp' 
      : '/otp';

    console.log('Navigating to:', otpRoute, 'with userType:', userType);

    navigate(otpRoute, {
      state: {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        userType: userType
      },
      replace: true
    });

  } catch (error: unknown) {
    console.error('Signup error details:', error);
    
    if (axios.isAxiosError(error)) {
      console.error('Axios error response:', error.response);
      if (error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Sign Up failed - Network error");
      }
    } else {
      toast.error("Sign Up failed - Unexpected error");
    }
  } finally {
    setLoading(false);
  }
};
  

  return (
    <>
      <div className="max-w-md mx-auto p-6 shadow-md mt-10">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-semibold">Create Your Account</h1>
          {userType === 'user' 
            ? <p className="text-sm text-gray-500">Join LocalFix to get your appliances fixed by local experts</p>
            :<p className="text-sm text-gray-500">Join LocalFix to start your services</p>}
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-1">Full Name</label>
            <input
              type="text"
              name='fullName'
              placeholder="Eg: John Doe"
              className="w-full border p-2 rounded"
              value={formData.fullName}
              onChange={handleChange}
            />
            {error.fullName && <p className='text-sm text-red-500 mt-1'>{error.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Phone Number (optional)</label>
            <div className='flex items-center border rounded overflow-hidden'>
              <span className="px-4 py-2 bg-gray-200 text-sm border-r">+91</span>
              <input
                type="text"
                name='phone'
                placeholder="Eg: 9876543210"
                className="flex-1 p-2 text-sm outline-none"
                value={formData.phone}
                onChange={handleChange}
              />
            </div>
            {error.phone && <p className='text-sm text-red-500 mt-1'>{error.phone}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Email (optional)</label>
            <input
              type="text"
              name='email'
              placeholder="Eg: jondoe@gmail.com"
              className="w-full border p-2 rounded"
              value={formData.email}
              onChange={handleChange}
            />
            {error.email && <p className='text-sm text-red-500 mt-1'>{error.email}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Password</label>
            <input
              type="password"
              name='password'
              placeholder="******"
              className="w-full border p-2 rounded"
              value={formData.password}
              onChange={handleChange}
            />
            {error.password && <p className='text-sm text-red-500 mt-1'>{error.password}</p>}
          </div>

          <div>
            <label className="block text-sm mb-1">Confirm Password</label>
            <input
              type="password"
              name='confirmPassword'
              placeholder="******"
              className="w-full border p-2 rounded"
              value={formData.confirmPassword}
              onChange={handleChange}
            />
            {error.confirmPassword && <p className='text-sm text-red-500 mt-1'>{error.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-2 rounded cursor-pointer ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Social login */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">Or continue with</p>
          <div className="flex justify-center gap-4 mt-2">
            {/* <FacebookAuth/> */}
            <GoogleAuth/>

          </div>
        </div>

        <div className='text-center p-3'>
          <p className='text-gray-500'>Already have an account? <Link to='/login' className='text-[#1877F2]'>Login</Link></p>
        </div>
      </div>
    </>
  );
};

export default SignUp;
