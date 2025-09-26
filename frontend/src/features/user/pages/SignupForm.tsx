import React, { useState } from 'react'
import axios from 'axios';
import Header from '../../../components/common/Header';
import Footer from '../../../components/common/Footer';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

import GoogleAuth from '../components/GoogleAuth';
// import FacebookAuth from '../components/FacebookAuth';

const SignUp = () => {
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
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/signup`, {
        fullName: formData.fullName,
        ...(formData.phone ? { phone: formData.phone } : {}),
        ...(formData.email ? { email: formData.email } : {}),
        password: formData.password
      });

      // Store signup data locally
      localStorage.setItem("signupData", JSON.stringify(formData));

      // Show which channel(s) received OTP
      toast.success(response.data.message);

      // Redirect to OTP verification page
      setTimeout(() => navigate('/otp'), 1000);
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("Sign Up failed");
      }
    } finally {
      setLoading(false);
    }
  };

  

  return (
    <>
      <Header />
      <div className="max-w-md mx-auto p-6 shadow-md mt-10">
        {/* Header */}
        <div className="mb-4 text-center">
          <h1 className="text-2xl font-semibold">Create Your Account</h1>
          <p className="text-sm text-gray-500">Join LocalFix to get your appliances fixed by local experts</p>
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
      <Footer />
    </>
  );
};

export default SignUp;
