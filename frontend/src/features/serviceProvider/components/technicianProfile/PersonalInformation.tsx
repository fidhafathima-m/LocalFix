import { useState, useEffect } from 'react'
import AccordionSection from './AccordianSections'
import { CalendarTodayOutlined, FileUploadOutlined } from '@mui/icons-material'
import { technicianAPI, type TechnicianProfile } from '../../../../services/technicianApi'

const PersonalInformation = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    languages: [] as string[],
    bio: '',
    profilePicture: ''
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await technicianAPI.getProfile()
      if (response.data.success) {
        const profileData = response.data.data.profile
        setProfile(profileData)
        
        // Populate form data
        setFormData({
          fullName: profileData.personalInfo?.fullName || profileData.displayName || '',
          phoneNumber: profileData.personalInfo?.phoneNumber || profileData.phone || '',
          email: profileData.email || '',
          dateOfBirth: profileData.personalInfo?.dateOfBirth || '',
          gender: profileData.personalInfo?.gender || '',
          languages: profileData.personalInfo?.languages || [],
          bio: profileData.bio || '',
          profilePicture: profileData.profilePictureUrl || ''
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLanguagesChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setFormData(prev => ({
      ...prev,
      languages: selectedOptions
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const updateData = {
        personalInfo: {
          fullName: formData.fullName,
          phoneNumber: formData.phoneNumber,
          dateOfBirth: formData.dateOfBirth,
          gender: formData.gender,
          languages: formData.languages
        },
        bio: formData.bio,
        ...(formData.profilePicture && { profilePicture: formData.profilePicture })
      }

      const response = await technicianAPI.updateProfile(updateData)
      
      if (response.data.success) {
        // Update local profile state
        if (profile) {
          setProfile({
            ...profile,
            personalInfo: {
              ...profile.personalInfo,
              ...updateData.personalInfo
            },
            bio: formData.bio,
            profilePictureUrl: formData.profilePicture || profile.profilePictureUrl
          })
        }
        alert('Personal information updated successfully!')
      }
    } catch (error) {
      console.error('Error updating profile:', error)
      alert('Failed to update personal information')
    } finally {
      setSaving(false)
    }
  }

  const handlePhotoUpload = async (file: File) => {
    try {
      // Create a FormData object for file upload
      const formData = new FormData()
      formData.append('profilePicture', file)
      
      // You'll need to implement this API endpoint
      const response = await fetch('/api/technician/profile/upload-photo', {
        method: 'POST',
        body: formData,
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setFormData(prev => ({
            ...prev,
            profilePicture: result.data.profilePictureUrl
          }))
          // Refresh profile to get updated data
          fetchProfile()
        }
      }
    } catch (error) {
      console.error('Error uploading photo:', error)
      alert('Failed to upload photo')
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB')
        return
      }
      handlePhotoUpload(file)
    }
  }

  if (loading) {
    return (
      <AccordionSection title="Personal Information" number={1} defaultOpen={true}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AccordionSection>
    )
  }

  return (
    <AccordionSection
      title="Personal Information"
      number={1}
      defaultOpen={true}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Profile Photo */}
        <div className="md:col-span-2 flex flex-col items-center mb-4">
          <div className="relative w-28 h-28 bg-gray-200 rounded-full flex items-center justify-center mb-2 overflow-hidden">
            {formData.profilePicture ? (
              <img 
                src={formData.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="text-gray-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="40"
                  height="40"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
            )}
            <label htmlFor="photo-upload" className="absolute bottom-0 right-0 bg-blue-500 text-white p-1 rounded-full cursor-pointer">
              <FileUploadOutlined />
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
          </div>
          <button 
            className="text-blue-500 text-sm"
            onClick={() => document.getElementById('photo-upload')?.click()}
          >
            Change Photo
          </button>
        </div>

        {/* Full Name */}
        <div>
          <label className="block text-sm mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            placeholder="Enter your full name"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Phone Number */}
        <div>
          <div className="flex justify-between">
            <label className="block text-sm mb-1">Phone Number</label>
            <span className="text-xs text-green-500">(Verified)</span>
          </div>
          <div className="flex">
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter your phone no."
              className="w-full p-2 border rounded-l focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-500 text-white px-4 rounded-r">
              Verify
            </button>
          </div>
        </div>

        {/* Email Address */}
        <div>
          <label className="block text-sm mb-1">Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Enter your email"
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date of Birth */}
        <div>
          <label className="block text-sm mb-1">Date of Birth</label>
          <div className="relative">
            <input
              type="text"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              placeholder="mm/dd/yyyy"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <CalendarTodayOutlined
              className="absolute h-5 w-5 right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
        </div>

        {/* Gender */}
        <div>
          <label className="block text-sm mb-1">Gender</label>
          <select 
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Languages Spoken */}
        <div>
          <label className="block text-sm mb-1">Languages Spoken</label>
          <select 
            multiple
            value={formData.languages}
            onChange={handleLanguagesChange}
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select language</option>
            <option value="english">English</option>
            <option value="spanish">Spanish</option>
            <option value="french">French</option>
            <option value="hindi">Hindi</option>
            <option value="german">German</option>
          </select>
          <p className="text-xs text-gray-500 mt-1">
            Hold Ctrl/Cmd to select multiple languages
          </p>
          {formData.languages.length > 0 && (
            <div className="mt-2">
              <span className="text-sm text-gray-600">Selected: </span>
              {formData.languages.join(', ')}
            </div>
          )}
        </div>

        {/* Bio */}
        <div className="md:col-span-2">
          <label className="block text-sm mb-1">Short Bio / About Me</label>
          <textarea
            name="bio"
            value={formData.bio}
            onChange={handleInputChange}
            placeholder="Tell us about yourself and your experience..."
            className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
            rows={4}
          />
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end mt-6">
        <button 
          onClick={handleSave}
          disabled={saving}
          className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${
            saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
          }`}
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </AccordionSection>
  )
}

export default PersonalInformation