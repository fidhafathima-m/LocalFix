import React from 'react'
import type { TechnicianDetails } from '../../../../../validation/types/technicianTypes';

interface PersonalInfoTabProps {
  technician: TechnicianDetails
  isSuspended?: boolean
}

const PersonalInfoTab: React.FC<PersonalInfoTabProps> = ({ technician, isSuspended }) => {

  // Helper function to get phone number from multiple possible sources
  const getPhoneNumber = () => {
    return technician.personalInfo?.phoneNumber || 
           technician.user?.phone || 
           technician.phone || 
           'Not provided';
  };

  // Helper function to format address
  const getFormattedAddress = () => {
    if (!technician.personalInfo?.address) {
      return 'Not specified';
    }
    
    const { street, city, state, pincode } = technician.personalInfo.address;
    const addressParts = [street, city, state, pincode].filter(part => part && part.trim() !== '');
    return addressParts.length > 0 ? addressParts.join(', ') : 'Not specified';
  };

  // ✅ FIXED: Helper to get gender with proper fallback
  const getGender = () => {
    return technician.personalInfo?.gender || 'Not specified';
  };

  // ✅ FIXED: Helper to get date of birth with proper formatting
  const getDateOfBirth = () => {
    if (!technician.personalInfo?.dateOfBirth || technician.personalInfo.dateOfBirth === 'Not specified') {
      return 'Not specified';
    }
    
    try {
      // Check if it's already a valid date string
      const date = new Date(technician.personalInfo.dateOfBirth);
      return !isNaN(date.getTime()) ? date.toLocaleDateString() : 'Not specified';
    } catch (error) {
      console.error(error)
      return 'Not specified';
    }
  };

  // ✅ FIXED: Helper to get languages
  const getLanguages = () => {
    return technician.personalInfo?.languages || [];
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {isSuspended && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700 text-sm">
            <strong>Note:</strong> Personal information is view-only while technician is suspended.
          </p>
        </div>
      )}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-medium">Personal Information</h2>
        {!isSuspended && (
          <button className="flex items-center text-blue-600 hover:text-blue-800">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-1"
            >
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
            <span>Edit</span>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
        {/* Full Name */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <p className="text-sm text-gray-500">Full Name</p>
          </div>
          <p className="font-medium">
            {technician.personalInfo?.fullName || technician.displayName}
          </p>
        </div>

        {/* Gender - ✅ FIXED */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 8v4l3 3"></path>
            </svg>
            <p className="text-sm text-gray-500">Gender</p>
          </div>
          <p className="font-medium">{getGender()}</p>
        </div>

        {/* Date of Birth - ✅ FIXED */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            <p className="text-sm text-gray-500">Date of Birth</p>
          </div>
          <p className="font-medium">
            {getDateOfBirth()}
          </p>
        </div>

        {/* Phone Number - ✅ FIXED */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            <p className="text-sm text-gray-500">Phone Number</p>
          </div>
          <p className="font-medium">{getPhoneNumber()}</p>
        </div>

        {/* Email Address */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
            <p className="text-sm text-gray-500">Email Address</p>
          </div>
          <p className="font-medium">{technician.user?.email || technician.email || 'Not provided'}</p>
        </div>

        {/* Address - ✅ FIXED */}
        <div>
          <div className="flex items-center mb-1">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-gray-400 mr-2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
              <circle cx="12" cy="10" r="3"></circle>
            </svg>
            <p className="text-sm text-gray-500">Address</p>
          </div>
          <p className="font-medium">
            {getFormattedAddress()}
          </p>
        </div>
      </div>

      {/* Languages Spoken - ✅ FIXED */}
      {getLanguages().length > 0 && (
        <div className="mt-8">
          <h3 className="text-base font-medium mb-4">Languages Spoken</h3>
          <div className="flex flex-wrap gap-2">
            {getLanguages().map((language, index) => (
              <span 
                key={index}
                className="px-3 py-1 bg-gray-100 rounded-full text-sm border border-gray-200"
              >
                {language}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonalInfoTab