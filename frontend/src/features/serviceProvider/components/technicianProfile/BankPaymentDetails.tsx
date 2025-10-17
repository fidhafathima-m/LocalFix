import { useState, useEffect } from 'react'
import AccordionSection from './AccordianSections'
import { technicianAPI, type TechnicianProfile } from '../../../../services/technicianApi'
import api from '../../../../utils/axiosConfig';

interface BankAccount {
  holderName?: string;
  accountNumber?: string;
  ifscCode?: string;
  bankName?: string;
}

interface PaymentDetailsData {
  bankAccount: BankAccount;
  upiId?: string;
  withdrawalPreference: 'auto' | 'manual';
}

const BankPaymentDetails = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<PaymentDetailsData>({
    bankAccount: {
      holderName: '',
      accountNumber: '',
      ifscCode: '',
      bankName: ''
    },
    upiId: '',
    withdrawalPreference: 'auto'
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
  try {
    console.log('🔍 VITE_BASE_URL from env:', import.meta.env.VITE_BASE_URL);
    console.log('🔍 API instance defaults:', {
      baseURL: api.defaults.baseURL,
      fullURL: api.getUri({ url: '/technician/profile' })
    });
    setLoading(true)
    
    const response = await technicianAPI.getProfile()
    console.log('📡 API Response status:', response.status);
    console.log('📡 API Response data:', response.data);
    
    if (response.data.success) {
       console.log('✅ Profile fetch successful');
      const profileData = response.data.data.profile
      console.log('Full profile data:', profileData)
      console.log('Payment details:', profileData.paymentDetails)
      console.log('Bank payment details:', profileData.paymentDetails) // Check this!
      
      // Populate payment details data
      const paymentDetails = profileData.paymentDetails || profileData.paymentDetails || {}
      const bankAccount = paymentDetails.bankAccount || {}
      
      console.log('Final payment details to set:', paymentDetails)
      console.log('Final bank account to set:', bankAccount)
      
      setFormData({
        bankAccount: {
          holderName: bankAccount.holderName || '',
          accountNumber: bankAccount.accountNumber || '',
          ifscCode: bankAccount.ifscCode || '',
          bankName: bankAccount.bankName || ''
        },
        upiId: paymentDetails.upiId || '',
        withdrawalPreference: paymentDetails.withdrawalPreference || 'auto'
      })
    }
  } catch (error) {
    console.error('Error fetching profile:', error)
  } finally {
    setLoading(false)
  }
}

  const handleBankAccountChange = (field: keyof BankAccount, value: string) => {
    setFormData(prev => ({
      ...prev,
      bankAccount: {
        ...prev.bankAccount,
        [field]: value
      }
    }))
  }

  const handleUpiIdChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      upiId: value
    }))
  }

  const handleWithdrawalPreferenceChange = (preference: 'auto' | 'manual') => {
    setFormData(prev => ({
      ...prev,
      withdrawalPreference: preference
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      // Validate required fields
      if (!formData.bankAccount.holderName?.trim()) {
        alert('Please enter bank account holder name')
        return
      }
      
      if (!formData.bankAccount.accountNumber?.trim()) {
        alert('Please enter account number')
        return
      }
      
      if (!formData.bankAccount.ifscCode?.trim()) {
        alert('Please enter IFSC code')
        return
      }

      const updateData = {
        paymentDetails: {
          bankAccount: {
            holderName: formData.bankAccount.holderName.trim(),
            accountNumber: formData.bankAccount.accountNumber.trim(),
            ifscCode: formData.bankAccount.ifscCode.trim().toUpperCase(),
            bankName: formData.bankAccount.bankName?.trim()
          },
          upiId: formData.upiId?.trim() || undefined,
          withdrawalPreference: formData.withdrawalPreference
        }
      }

      const response = await technicianAPI.updateBankPayment(updateData)
      
      if (response.data.success) {
        // Update local profile state
        if (profile) {
          setProfile({
            ...profile,
            paymentDetails: updateData.paymentDetails
          })
        }
        alert('Bank and payment details updated successfully!')
      }
    } catch (error) {
      console.error('Error updating bank payment details:', error)
      alert('Failed to update bank and payment details')
    } finally {
      setSaving(false)
    }
  }

  const maskAccountNumber = (accountNumber: string) => {
    if (!accountNumber) return ''
    // Show first 2 and last 4 characters, mask the rest
    const firstTwo = accountNumber.slice(0, 2)
    const lastFour = accountNumber.slice(-4)
    const maskedLength = accountNumber.length - 6
    const masked = '•'.repeat(maskedLength > 0 ? maskedLength : 0)
    return `${firstTwo}${masked}${lastFour}`
  }

  const validateUpiId = (upiId: string) => {
    if (!upiId) return true
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/
    return upiRegex.test(upiId)
  }

  const validateIfscCode = (ifscCode: string) => {
    if (!ifscCode) return false
    const ifscRegex = /^[A-Z]{4}0[A-Z0-9]{6}$/
    return ifscRegex.test(ifscCode.toUpperCase())
  }

  if (loading) {
    return (
      <AccordionSection title="Bank & Payment Details" number={5}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AccordionSection>
    )
  }

  const isFormValid = 
    formData.bankAccount.holderName?.trim() && 
    formData.bankAccount.accountNumber?.trim() && 
    formData.bankAccount.ifscCode?.trim() &&
    validateIfscCode(formData.bankAccount.ifscCode) &&
    validateUpiId(formData.upiId || '')

  return (
    <AccordionSection title="Bank & Payment Details" number={5}>
      <div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Bank Account Holder Name */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Bank Account Holder Name
            </label>
            <input
              type="text"
              value={formData.bankAccount.holderName}
              onChange={(e) => handleBankAccountChange('holderName', e.target.value)}
              placeholder="Enter account holder name as per bank records"
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {!formData.bankAccount.holderName?.trim() && (
              <p className="text-xs text-red-500 mt-1">This field is required</p>
            )}
          </div>

          {/* Account Number */}
          <div>
            <label className="block text-sm font-medium mb-1">Account Number</label>
            <div className="relative">
              <input
                type="text"
                value={formData.bankAccount.accountNumber}
                onChange={(e) => handleBankAccountChange('accountNumber', e.target.value.replace(/\D/g, ''))}
                placeholder="Enter account number"
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                maxLength={18}
              />
              {formData.bankAccount.accountNumber && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {maskAccountNumber(formData.bankAccount.accountNumber)}
                  </span>
                </div>
              )}
            </div>
            {!formData.bankAccount.accountNumber?.trim() ? (
              <p className="text-xs text-red-500 mt-1">This field is required</p>
            ) : (
              <p className="text-xs text-gray-500 mt-1">
                Numbers only, no spaces or special characters
              </p>
            )}
          </div>

          {/* IFSC Code */}
          <div>
            <label className="block text-sm font-medium mb-1">IFSC Code</label>
            <input
              type="text"
              value={formData.bankAccount.ifscCode}
              onChange={(e) => handleBankAccountChange('ifscCode', e.target.value.toUpperCase())}
              placeholder="Enter IFSC code"
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.bankAccount.ifscCode && !validateIfscCode(formData.bankAccount.ifscCode)
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
              maxLength={11}
            />
            {!formData.bankAccount.ifscCode?.trim() ? (
              <p className="text-xs text-red-500 mt-1">This field is required</p>
            ) : !validateIfscCode(formData.bankAccount.ifscCode) ? (
              <p className="text-xs text-red-500 mt-1">Please enter a valid IFSC code</p>
            ) : (
              <p className="text-xs text-green-500 mt-1">✓ Valid IFSC code format</p>
            )}
          </div>

          {/* UPI ID */}
          <div>
            <label className="block text-sm font-medium mb-1">UPI ID (optional)</label>
            <input
              type="text"
              value={formData.upiId}
              onChange={(e) => handleUpiIdChange(e.target.value)}
              placeholder="username@paytm / username@ybl / etc."
              className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formData.upiId && !validateUpiId(formData.upiId)
                  ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 focus:border-blue-500'
              }`}
            />
            {formData.upiId && !validateUpiId(formData.upiId) && (
              <p className="text-xs text-red-500 mt-1">Please enter a valid UPI ID</p>
            )}
            <p className="text-xs text-gray-500 mt-1">
              For instant payments. Format: username@provider
            </p>
          </div>
        </div>


        {/* Withdrawal Preferences */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Withdrawal Preferences</h3>
          <div className="space-y-3">
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="radio"
                id="auto-withdrawal"
                name="withdrawal"
                checked={formData.withdrawalPreference === 'auto'}
                onChange={() => handleWithdrawalPreferenceChange('auto')}
                className="mr-3 h-5 w-5 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="auto-withdrawal" className="flex-1">
                <div className="font-medium">Automatic weekly withdrawal</div>
                <p className="text-xs text-gray-600 mt-1">
                  Your earnings will be automatically transferred to your bank account every Monday
                </p>
              </label>
            </div>
            <div className="flex items-center p-3 bg-gray-50 rounded-lg">
              <input
                type="radio"
                id="manual-withdrawal"
                name="withdrawal"
                checked={formData.withdrawalPreference === 'manual'}
                onChange={() => handleWithdrawalPreferenceChange('manual')}
                className="mr-3 h-5 w-5 text-blue-500 focus:ring-blue-500"
              />
              <label htmlFor="manual-withdrawal" className="flex-1">
                <div className="font-medium">Manual withdrawal request</div>
                <p className="text-xs text-gray-600 mt-1">
                  You need to manually request withdrawals when you want to transfer funds
                </p>
              </label>
            </div>
          </div>
        </div>

        {/* Security Note */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Security Information</h4>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Your bank details are encrypted and stored securely</li>
            <li>• We never store your full account number in readable format</li>
            <li>• Only authorized personnel can view your payment information</li>
            <li>• You will receive email confirmation for any payment updates</li>
          </ul>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button 
            onClick={handleSave}
            disabled={saving || !isFormValid}
            className={`px-6 py-2 rounded font-medium flex items-center ${
              saving || !isFormValid
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-blue-500 text-white hover:bg-blue-600'
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

export default BankPaymentDetails