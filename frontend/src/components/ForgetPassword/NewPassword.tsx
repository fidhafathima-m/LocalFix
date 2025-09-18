import React, { useState } from 'react'
import {
    VisibilityOutlined,
    VisibilityOffOutlined
} from '@mui/icons-material';

type UserType = 'user' | 'serviceProvider' | 'admin';

interface NewPasswordProps {
    userType: UserType,
    onSubmit: () => void
}


const NewPassword: React.FC<NewPasswordProps> = ({userType, onSubmit}) => {

    const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Basic validation
    if (!password) {
      setError('Password is required')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    onSubmit()
  }

    const getTitle = () => {
        switch(userType) {
            case 'user': return "User Create New Password"
            case 'serviceProvider': return "Technician Create New Password"
            case 'admin': return "Admin Create New Password"
        }
    }
  return (
    <>
        <div className="max-w-md mx-auto p-6 shadow-md mt-10">
        {/* Header */}
        <div className="mb-4 text-center">
            <h1 className="text-2xl font-semibold p-5">{getTitle()}</h1>
            <p className="text-sm text-gray-500">Please create a new password for your account</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className='p-5'>
                <label htmlFor="">New Password</label>
                <input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Enter new password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <VisibilityOffOutlined className="h-5 w-5 text-gray-400" />
            ) : (
              <VisibilityOutlined className="h-5 w-5 text-gray-400" />
            )}
          </button>
                <label htmlFor="">Confirm Password</label>
                <input
            id="confirmPassword"
            name="confirmPassword"
            type={showConfirmPassword ? 'text' : 'password'}
            autoComplete="new-password"
            required
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <VisibilityOffOutlined className="h-5 w-5 text-gray-400" />
            ) : (
              <VisibilityOutlined className="h-5 w-5 text-gray-400" />
            )}
          </button>

            </div>
            {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
            <button 
                type="submit" 
                className='w-full bg-blue-700 text-white p-2 rounded'
            >Reset Password</button>
        </form>
        </div>
    </>
  )
}

export default NewPassword