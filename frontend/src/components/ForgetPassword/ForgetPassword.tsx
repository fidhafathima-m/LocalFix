import React from 'react'

type UserType = 'user' | 'serviceProvider' | 'admin';

interface ForgetPasswordProps {
    userType: UserType,
}

const ForgetPassword: React.FC<ForgetPasswordProps> = ({userType}) => {
    const getTitle = () => {
        switch(userType) {
            case 'user': return "User Forget Password"
            case 'serviceProvider': return "Technician Forget Password"
            case 'admin': return "Admin Forget Password"
        }
    }
  return (
    <>
        <div className="max-w-md mx-auto p-6 shadow-md mt-10">
        {/* Header */}
        <div className="mb-4 text-center">
            <h1 className="text-2xl font-semibold p-5">{getTitle()}</h1>
            <p className="text-sm text-gray-500">Enter your phone number to receive a verification code</p>
        </div>

        {/* Form */}
        <form className="space-y-4">
            <div className='p-5'>
                <label htmlFor="">Phone number</label>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder='Enter your phone number'
                />

            </div>
            <button 
                type="submit" 
                className='w-full bg-blue-700 text-white p-2 rounded'
            >Send verificatin code</button>
            <button className='w-full text-blue-600 p-2 rounded'><a href="/login">Back to login</a></button>
        </form>
        </div>
    </>
  )
}

export default ForgetPassword