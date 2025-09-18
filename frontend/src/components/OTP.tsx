import React from 'react'

type UserType = 'user' | 'serviceProvider' | 'admin';

interface OTPProps {
    userType: UserType,
    phone: string
}

const OTP: React.FC<OTPProps> = ({userType, phone}) => {
    const getTitle = () => {
        switch(userType) {
            case 'user': return "User OTP Verify"
            case 'serviceProvider': return "Technician OTP Verify"
            case 'admin': return "Admin OTP Verify"
        }
    }
  return (
    <>
        <div className="max-w-md mx-auto p-6 shadow-md mt-10">
        {/* Header */}
        <div className="mb-4 text-center">
            <h1 className="text-2xl font-semibold p-5">{getTitle()}</h1>
            <p className="text-sm text-gray-500">Please enter six digit pin sent to your Phone</p>
            <p className='text-blue-600 font-semibold p-2'>{phone}</p>
        </div>

        {/* Form */}
        <form className="space-y-4">
            <div className='text-center p-5'>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

            </div>
            
            <div className='flex justify-between pb-5'>
                <p className='text-gray-500'>Resent code</p>
                <p className='font-semibold text-blue-600'>0:59</p>
            </div>
            <button type="submit" className='w-full bg-blue-700 text-white p-2 rounded'>Verify</button>
        </form>
        </div>
    </>
  )
}

export default OTP