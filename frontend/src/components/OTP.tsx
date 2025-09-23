import axios from 'axios';
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type UserType = 'user' | 'serviceProvider' | 'admin';
type OTPContext = 'signup' | 'forgot'

interface OTPProps {
    userType: UserType,
    context: OTPContext,
}

const OTP: React.FC<OTPProps> = ({userType, context}) => {

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const {login} = useAuth()
    
    const getTitle = () => {
        let role = '';
        switch(userType) {
            case 'user': role = "User"; break;
            case 'serviceProvider': role = "Technician"; break;
            case 'admin': role = "Admin"; break;
        }

        return context === 'signup'
            ? `${role} OTP Verification`
            : `${role} Forgot Password OTP Verification`;
        }


    const contextData = JSON.parse(localStorage.getItem(context === 'signup' ? 'signupData' : 'forgotData') || "{}");


    const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if(!otp || otp.length !== 6) {
        setError('Please enter a valid 6 digit otp');
        return;
    }
    setLoading(true);
    setError('');

    try {
        let res;

        if (context === 'signup') {
            res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/verify-otp`, {
                phone: contextData.phone,
                otp,
                fullName: contextData.fullName,
                email: contextData.email,
                password: contextData.password,
            });

            login(res.data.user, res.data.token);

            alert("OTP verified successfully");

            // Force context update to propagate before navigation
            setTimeout(() => {
                if(userType === 'user') navigate('/', { replace: true });
                else if(userType === 'serviceProvider') navigate('/technicians', { replace: true });
                else if(userType === 'admin') navigate('/admin/dashboard', { replace: true });
            }, 50);

        } else if (context === 'forgot') {
            res = await axios.post(`${import.meta.env.VITE_BASE_URL}/auth/verify-reset-otp`, {
                phone: contextData.phone,
                otp,
            });

            localStorage.setItem(
                'forgotData',
                JSON.stringify({
                    ...contextData,
                    otp,
                })
            );

            alert("OTP verified successfully");
            navigate('/reset-password', { state: { phone: contextData.phone, userType } });
        }

    } catch (error: unknown) {
        if (axios.isAxiosError(error) && error.response?.data?.message) {
            alert(error.response.data.message);
        } else {
            alert("OTP Verification failed");
        }
    } finally {
        setLoading(false)
    }
}


  return (
    <>
        <div className="max-w-md mx-auto p-6 shadow-md mt-10">
        {/* Header */}
        <div className="mb-4 text-center">
            <h1 className="text-2xl font-semibold p-5">{getTitle()}</h1>
            <p className="text-sm text-gray-500">Please enter six digit pin sent to your Phone</p>
            <p className='text-blue-600 font-semibold p-2'>{contextData?.phone || ''}</p>
        </div>

        {/* Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className='text-center p-5'>
                <input
                    type="text"
                    className="w-full border border-gray-300 rounded px-4 py-2 text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                    maxLength={6}
                    placeholder='Enter OTP'
                    value={otp}
                    onChange={e => setOtp(e.target.value)}
                />
                {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
            </div>
            
            <div className='flex justify-between pb-5'>
                <p className='text-gray-500'>Resent code</p>
                <p className='font-semibold text-blue-600'>0:59</p>
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
    </>
  )
}

export default OTP