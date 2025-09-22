import React, { useState } from 'react'
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

import {
    Google,
    FacebookOutlined
} from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

type UserType = 'user'| 'serviceProvider' | 'admin'

interface LoginProps {
    userType: UserType,
}

const Login: React.FC<LoginProps> = ({ userType }) => {

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();
  const {login} = useAuth();

  const validateForm = (): boolean => {
  let valid = true;

  const phoneRegex = /\d{10}$/;
  if (!phone || !phoneRegex.test(phone)) {
    setPhoneError("Please enter a valid phone number");
    valid = false;
  } else {
    setPhoneError('');
  }

  if (!password || password.length < 6) {
    setPasswordError("Password must be at least 6 characters");
    valid = false;
  } else {
    setPasswordError('');
  }

  return valid;
};


  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if(!validateForm()) return;
    setLoading(true)
    try {
      const res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/login`, {
        phone, password
      });
      login(res.data.user, res.data.token);
      alert("Login successful")
      if(userType === 'serviceProvider') navigate('/technicians');
      else navigate('/')
      

    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert("Login failed");
      }
    } finally {
      setLoading(false)
    }
  }

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
          <label className="block text-sm mb-1">Phone Number</label>
          
          <div className="flex items-center border rounded overflow-hidden">
            <span className="px-4 py-2 bg-gray-200 text-sm border-r">+91</span>
            <input
              type="text"
              placeholder="9876543210"
              className="flex-1 p-2 text-sm outline-none"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          {phoneError && <p className="text-sm text-red-500 mt-1">{phoneError}</p>}
        </div>


        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            placeholder="******"
            className="w-full border p-2 rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          {passwordError && <p className='text-sm text-red-500 mt-1'>{passwordError}</p>}
          <Link 
            to={
              userType === 'serviceProvider' ? '/technicians/forgot-password' :
              userType === 'admin' ? '/admin/forgot-password' :
              '/forgot-password'
            } 
            className="text-xs text-blue-500 hover:underline"
          >
            Forgot Password?
          </Link>


        </div>

        {/* <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Remember me
          </label>
          <span className="text-blue-500 cursor-pointer">Login with OTP</span>
        </div> */}

        <button
          type="submit"
          disabled={loading}
          className={`w-full bg-blue-600 text-white py-2 rounded ${loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
        >
          {loading ? 'Logging in...' : 'Continue'}
        </button>

      </form>

      {/* Social login */}
      <div className="text-center mt-6">
        <p className="text-sm text-gray-500">Or continue with</p>
        <div className="flex justify-center gap-4 mt-2">
          <button className="flex items-center gap-2 border border-gray-300 p-2 px-10 rounded text-sm">
            <FacebookOutlined sx={{color: '#1877F2'}}/> Facebook
          </button>
          <button className="flex items-center gap-2 border border-gray-300 p-2 px-10 rounded text-sm">
            <Google sx={{color: '#1877F2'}}/> Google
          </button>
        </div>
      </div>
      <div className='text-center p-3'>
        {userType !== 'serviceProvider' && <p className='text-gray-500'>Don't have an account? <Link to='/signup' className='text-[#1877F2]'>Sign Up</Link></p>}
      </div>
    </div>
  );
};

export default Login