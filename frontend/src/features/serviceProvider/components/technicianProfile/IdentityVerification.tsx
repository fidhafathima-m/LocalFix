import { useState, useEffect } from 'react'
import AccordionSection from './AccordianSections'
import { AccessTimeOutlined, FileUploadOutlined, CheckCircleOutline, Cancel } from '@mui/icons-material'
import { technicianAPI, type TechnicianProfile } from '../../../../services/technicianApi'

interface IdentityVerificationData {
  governmentIdType?: string;
  governmentIdNumber?: string;
  idDocument?: string;
  verificationStatus?: "pending" | "approved" | "rejected";
  verified?: boolean;
  verifiedAt?: string;
}

const IdentityVerification = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState<IdentityVerificationData>({
    governmentIdType: '',
    governmentIdNumber: '',
    idDocument: '',
    verificationStatus: 'pending',
    verified: false
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
  try {
    setLoading(true)
    const response = await technicianAPI.getProfile()
    if (response.success) {
      const profileData = response.data?.data?.profile
      setProfile(profileData)
      
      // Populate identity verification data with null checks
      if (profileData.identityVerification) {
        setFormData({
          governmentIdType: profileData.identityVerification.governmentIdType || '',
          governmentIdNumber: profileData.identityVerification.governmentIdNumber || '',
          idDocument: profileData.identityVerification.idDocument || '',
          verificationStatus: profileData.identityVerification.verificationStatus || 'pending',
          verified: profileData.identityVerification.verified || false,
          verifiedAt: profileData.identityVerification.verifiedAt
        })
      } else {
        // Initialize with empty values if identityVerification doesn't exist
        setFormData({
          governmentIdType: '',
          governmentIdNumber: '',
          idDocument: '',
          verificationStatus: 'pending',
          verified: false
        })
      }
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    setLoading(false)
  }
}

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
      // Reset verification status when ID details change
      verificationStatus: 'pending',
      verified: false
    }))
  }

  const handleSave = async () => {
  try {
    setSaving(true)
    
    const updateData = {
      identityVerification: {
        governmentIdType: formData.governmentIdType,
        governmentIdNumber: formData.governmentIdNumber,
        idDocument: formData.idDocument,
        verificationStatus: 'pending' as const, // Reset to pending when updated
        verified: false
      }
    }

    const response = await technicianAPI.updateIdentityVerification(updateData)
    
    if (response.data.success) {
      // Update local profile state with proper null checks
      if (profile) {
        setProfile({
          ...profile,
          identityVerification: {
            ...profile.identityVerification, // This might be undefined
            ...updateData.identityVerification
          }
        })
      }
      alert('Identity verification details updated successfully! They will be reviewed by our team.')
    }
  } catch (error) {
    console.error('Error updating identity verification:', error)
    alert('Failed to update identity verification details')
  } finally {
    setSaving(false)
  }
}

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true)
      
      // Create FormData for file upload
      const uploadFormData  = new FormData()
      uploadFormData.append('document', file)
      uploadFormData.append('type', 'id_proof')
      uploadFormData.append('documentType', formData.governmentIdType || 'id_proof')

      // Upload document
      const response = await technicianAPI.uploadDocument(uploadFormData)
      
      if (response.data.success) {
        // Update form data with the uploaded document URL
        setFormData(prev => ({
          ...prev,
          idDocument: response.data.data.document.url
        }))
        
        alert('ID document uploaded successfully!')
      }
    } catch (error) {
      console.error('Error uploading document:', error)
      alert('Failed to upload document')
    } finally {
      setUploading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
      if (!validTypes.includes(file.type)) {
        alert('Please select a valid file type (JPEG, PNG, JPG, PDF)')
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        alert('File size should be less than 5MB')
        return
      }
      handleFileUpload(file)
    }
  }

  const getStatusDisplay = () => {
    if (!formData.verificationStatus) return null

    switch (formData.verificationStatus) {
      case 'approved':
        return (
          <div className="flex items-center text-green-500">
            <CheckCircleOutline className="h-5 w-5 mr-1" />
            <span className="text-sm">Verified</span>
          </div>
        )
      case 'rejected':
        return (
          <div className="flex items-center text-red-500">
            <Cancel className="h-5 w-5 mr-1" />
            <span className="text-sm">Verification Failed</span>
          </div>
        )
      case 'pending':
      default:
        return (
          <div className="flex items-center text-yellow-500">
            <AccessTimeOutlined className="h-5 w-5 mr-1" />
            <span className="text-sm">Pending Verification</span>
          </div>
        )
    }
  }

  const maskIdNumber = (idNumber?: string) => {
    if (!idNumber) return 'XXXX-XXXX-XXXX'
    
    // Mask all but last 4 characters
    const visiblePart = idNumber.slice(-4)
    const maskedPart = 'X'.repeat(Math.max(0, idNumber.length - 4))
    return `${maskedPart}${visiblePart}`
  }

  if (loading) {
    return (
      <AccordionSection title="Identity & Verification" number={2}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AccordionSection>
    )
  }

  return (
    <AccordionSection title="Identity & Verification" number={2}>
      <div>
        {/* Verification Status */}
        <div className="flex items-center mb-6">
          <span className="text-sm mr-2">Verification Status:</span>
          {getStatusDisplay()}
          {formData.verifiedAt && (
            <span className="text-xs text-gray-500 ml-2">
              Verified on {new Date(formData.verifiedAt).toLocaleDateString()}
            </span>
          )}
        </div>

        {/* Government ID Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm mb-1">Government ID Type</label>
            <select 
              name="governmentIdType"
              value={formData.governmentIdType || ''}
              onChange={handleInputChange}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select ID Type</option>
              <option value="passport">Passport</option>
              <option value="driver_license">Driver's License</option>
              <option value="national_id">National ID</option>
              <option value="aadhaar">Aadhaar Card</option>
              <option value="voter_id">Voter ID</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm mb-1">ID Number</label>
            <input
              type="text"
              name="governmentIdNumber"
              value={formData.governmentIdNumber || ''}
              onChange={handleInputChange}
              placeholder="Enter your ID number"
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {formData.governmentIdNumber && (
              <p className="text-xs text-gray-500 mt-1">
                Masked ID: {maskIdNumber(formData.governmentIdNumber)}
              </p>
            )}
          </div>
        </div>

        {/* Document Upload */}
        <div className="mb-6">
          <label className="block text-sm mb-1">
            Upload / Replace ID Proof
          </label>
          
          {/* Current Document Display */}
          {formData.idDocument && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <CheckCircleOutline className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-green-700">
                    Document uploaded successfully
                  </span>
                </div>
                <a 
                  href={formData.idDocument} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-500 text-sm hover:underline"
                >
                  View Document
                </a>
              </div>
            </div>
          )}

          {/* Upload Area */}
          <label htmlFor="id-document-upload" className="cursor-pointer">
            <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center hover:border-blue-300 transition-colors">
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2"></div>
                  <div className="text-blue-500">Uploading...</div>
                </div>
              ) : (
                <>
                  <FileUploadOutlined className="h-8 w-8 text-gray-400 mb-2" />
                  <div className="text-blue-500 font-medium mb-1">
                    {formData.idDocument ? 'Replace Document' : 'Upload a file'}
                  </div>
                  <div className="text-sm text-gray-500">or drag and drop</div>
                  <div className="text-xs text-gray-400 mt-1">
                    PNG, JPG, PDF up to 5MB
                  </div>
                </>
              )}
            </div>
          </label>
          
          <input
            id="id-document-upload"
            type="file"
            accept=".jpg,.jpeg,.png,.pdf"
            className="hidden"
            onChange={handleFileChange}
            disabled={uploading}
          />

          {/* Upload Instructions */}
          <div className="mt-3 p-3 bg-blue-50 rounded">
            <h4 className="text-sm font-medium text-blue-800 mb-2">Upload Requirements:</h4>
            <ul className="text-xs text-blue-700 list-disc list-inside space-y-1">
              <li>Clear, readable image of your government ID</li>
              <li>File must be in JPG, PNG, or PDF format</li>
              <li>Maximum file size: 5MB</li>
              <li>Ensure all details are visible and not blurry</li>
            </ul>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end">
          <button 
            onClick={handleSave}
            disabled={saving || uploading}
            className={`bg-blue-500 text-white px-4 py-2 rounded flex items-center ${
              saving || uploading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
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
      </div>
    </AccordionSection>
  )
}

export default IdentityVerification