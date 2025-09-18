import React from 'react'
import {
    Google,
    FacebookOutlined
} from '@mui/icons-material';

type UserType = 'user'| 'serviceProvider' | 'admin'

interface LoginProps {
    userType: UserType,
}

const Login: React.FC<LoginProps> = ({ userType }) => {
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
      <form className="space-y-4">
        <div>
          <label className="block text-sm mb-1">Phone Number</label>
          <input
            type="text"
            placeholder="Eg: +91 9876543210"
            className="w-full border p-2 rounded"
          />
        </div>

        <div>
          <label className="block text-sm mb-1">Password</label>
          <input
            type="password"
            placeholder="******"
            className="w-full border p-2 rounded"
          />
          <span className="text-xs text-blue-500 cursor-pointer">Forgot Password?</span>
        </div>

        <div className="flex items-center justify-between text-sm">
          <label className="flex items-center gap-2">
            <input type="checkbox" />
            Remember me
          </label>
          <span className="text-blue-500 cursor-pointer">Login with OTP</span>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Continue
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
        <p className='text-gray-500'>Don't have an account? <span className='text-[#1877F2]'>Sign Up</span></p>
      </div>
    </div>
  );
};

export default Login