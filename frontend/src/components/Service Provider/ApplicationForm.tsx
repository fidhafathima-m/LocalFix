import React, { useState } from 'react'
import { StepIndicator } from './StepIndicator'
import { FormStep } from './FormStep'
import { FileUpload } from './FileUpload'
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Define all possible steps
const STEPS = [
  'Personal Information',
  'Identity & Verification',
  'Skills & Services',
  'Work Experience',
  'Availability',
  'Banking Details',
  'Background Check',
  'Review & Submit',
]
export const ApplicationForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [submissionSuccess, setSubmissionSuccess] = useState(false)
  // Form data state
  const [formData, setFormData] = useState({
    // Step 1: Personal Information
    fullName: '',
    phoneNumber: '',
    email: '',
    dateOfBirth: '',
    gender: '',
    profilePhoto: null as File | null,
    // Step 2: Identity & Verification
    idType: '',
    idNumber: '',
    idProof: null as File | null,
    addressProof: null as File | null,
    currentAddress: '',
    // Step 3: Skills & Services
    services: [] as string[],
    yearsOfExperience: '',
    certifications: null as File | null,
    languages: [] as string[],
    bio: '',
    // Step 4: Availability & Work Preferences
    serviceAreas: [] as string[],
    workRadius: '',
    availability: {
      monday: {
        available: false,
        startTime: '09:00',
        endTime: '18:00',
      },
      tuesday: {
        available: false,
        startTime: '09:00',
        endTime: '18:00',
      },
      wednesday: {
        available: false,
        startTime: '09:00',
        endTime: '18:00',
      },
      thursday: {
        available: false,
        startTime: '09:00',
        endTime: '18:00',
      },
      friday: {
        available: false,
        startTime: '09:00',
        endTime: '18:00',
      },
      saturday: {
        available: false,
        startTime: '09:00',
        endTime: '18:00',
      },
      sunday: {
        available: false,
        startTime: '09:00',
        endTime: '18:00',
      },
    },
    // Step 5: Banking Details
    accountHolderName: '',
    accountNumber: '',
    ifscCode: '',
    upiId: '',
    // Step 6: Documents
    policeVerification: null as File | null,
    tradeLicense: null as File | null,
    passportPhoto: null as File | null,
    // Step 7: Agreement & Consent
    termsAgreed: false,
    verificationConsent: false,
    marketingConsent: false,
  })
  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      const { name } = e.target as HTMLInputElement
      setFormData((prev) => {
        // Services checkboxes
        if (name.startsWith('service-')) {
          const service = name.replace('service-', '')
          const updatedServices = checked
            ? [...prev.services, service]
            : prev.services.filter((s) => s !== service)
          return {
            ...prev,
            services: updatedServices,
          }
        }
        // Languages checkboxes
        if (name.startsWith('language-')) {
          const language = name.replace('language-', '')
          const updatedLanguages = checked
            ? [...prev.languages, language]
            : prev.languages.filter((l) => l !== language)
          return {
            ...prev,
            languages: updatedLanguages,
          }
        }
        // Service areas checkboxes
        if (name.startsWith('area-')) {
          const area = name.replace('area-', '')
          const updatedAreas = checked
            ? [...prev.serviceAreas, area]
            : prev.serviceAreas.filter((a) => a !== area)
          return {
            ...prev,
            serviceAreas: updatedAreas,
          }
        }
        // Availability checkboxes
        if (name.startsWith('available-')) {
          const day = name.replace('available-', '')
          return {
            ...prev,
            availability: {
              ...prev.availability,
              [day]: {
                ...prev.availability[day as keyof typeof prev.availability],
                available: checked,
              },
            },
          }
        }
        // Agreement checkboxes
        if (
          name === 'termsAgreed' ||
          name === 'verificationConsent' ||
          name === 'marketingConsent'
        ) {
          return {
            ...prev,
            [name]: checked,
          }
        }
        return prev
      })
    } else {
      // Handle time inputs for availability
      if (name.includes('Time-')) {
        const [timeType, day] = name.split('-')
        setFormData((prev) => ({
          ...prev,
          availability: {
            ...prev.availability,
            [day]: {
              ...prev.availability[day as keyof typeof prev.availability],
              [timeType === 'start' ? 'startTime' : 'endTime']: value,
            },
          },
        }))
      } else {
        // Handle all other text/select inputs
        setFormData((prev) => ({
          ...prev,
          [name]: value,
        }))
      }
    }
  }
  const handleFileChange = (field: string) => (file: File | null) => {
    setFormData((prev) => ({
      ...prev,
      [field]: file,
    }))
  }
  const handleNext = () => {
    // Mark current step as completed
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep])
    }
    // Move to next step
    if (currentStep < STEPS.length) {
      setCurrentStep((prev) => prev + 1)
      window.scrollTo(0, 0)
    }
  }
  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1)
      window.scrollTo(0, 0)
    }
  }
  const handleSubmit = () => {
    // Add final step to completed steps
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps((prev) => [...prev, currentStep])
    }
    setIsSubmitted(true)
    // Simulate API call with a delay
    setTimeout(() => {
      setSubmissionSuccess(true)
    }, 1500)
  }
  // Show success message after form submission
  if (isSubmitted && submissionSuccess) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <StepIndicator
          steps={STEPS}
          currentStep={STEPS.length}
          completedSteps={Array.from(
            {
              length: STEPS.length,
            },
            (_, i) => i + 1,
          )}
        />
        <div className="py-10 flex flex-col items-center">
          <div className="bg-green-100 rounded-full p-4 mb-6">
            <CheckCircleIcon className="w-16 h-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Application Submitted Successfully!
          </h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Thank you for applying to join LocalFix. Our team will review your
            application shortly.
          </p>
          <div className="bg-gray-50 rounded-lg p-6 w-full max-w-md">
            <h3 className="font-medium text-lg mb-4 text-gray-800">
              What happens next?
            </h3>
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-blue-600 font-medium">1</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">
                    Application Review
                  </p>
                  <p className="text-sm text-gray-600">
                    Our admin team will review your application and documents
                    within 24-48 hours.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-blue-600 font-medium">2</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Verification Call</p>
                  <p className="text-sm text-gray-600">
                    We may call you to verify details and discuss your skills
                    and experience.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-blue-600 font-medium">3</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">Onboarding</p>
                  <p className="text-sm text-gray-600">
                    Once approved, you'll receive access to the technician app
                    and onboarding materials.
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                  <span className="text-blue-600 font-medium">4</span>
                </div>
                <div className="text-left">
                  <p className="font-medium text-gray-800">
                    Start Receiving Jobs
                  </p>
                  <p className="text-sm text-gray-600">
                    You'll begin receiving service requests based on your skills
                    and availability.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
            <div className="bg-yellow-50 p-4 rounded-lg">
              <p className="font-medium text-yellow-800 mb-1">
                Processing Time
              </p>
              <p className="text-sm text-yellow-700">
                Application review typically takes 1-2 business days. You'll
                receive updates via SMS and email.
              </p>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="font-medium text-blue-800 mb-1">Need Help?</p>
              <p className="text-sm text-blue-700">
                If you have any questions, contact our support team at
                support@localfix.in or call +91 9876543210.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }
  // Show loading state while submitting
  if (isSubmitted) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 flex flex-col items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mb-4"></div>
        <p className="text-lg text-gray-700">Submitting your application...</p>
      </div>
    )
  }
  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <FormStep
            title="Step 1: Personal Information"
            onNext={handleNext}
            showPrevious={false}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex">
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-l-md"
                    required
                  />
                  <button className="bg-blue-600 text-white px-4 py-2 rounded-r-md">
                    Verify
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  We'll send an OTP for verification
                </p>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Date of Birth <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Gender <span className="text-red-500">*</span>
                </label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select gender</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium text-gray-700">
                  Profile Photo <span className="text-red-500">*</span>
                </label>
                <FileUpload
                  onFileChange={handleFileChange('profilePhoto')}
                  required
                />
              </div>
            </div>
          </FormStep>
        )
      case 2:
        return (
          <FormStep
            title="Step 2: Identity & Verification"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Government ID Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="idType"
                  value={formData.idType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select ID type</option>
                  <option value="passport">Passport</option>
                  <option value="drivingLicense">Driving License</option>
                  <option value="nationalId">National ID</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Government ID Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="idNumber"
                  value={formData.idNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your ID number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium text-gray-700">
                  Upload ID Proof <span className="text-red-500">*</span>
                </label>
                <FileUpload
                  onFileChange={handleFileChange('idProof')}
                  required
                />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium text-gray-700">
                  Upload Address Proof{' '}
                  <span className="text-gray-500">
                    (Optional if included in ID)
                  </span>
                </label>
                <FileUpload onFileChange={handleFileChange('addressProof')} />
              </div>
              <div className="md:col-span-2">
                <label className="block mb-1 font-medium text-gray-700">
                  Current Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="currentAddress"
                  value={formData.currentAddress}
                  onChange={handleInputChange}
                  placeholder="House no, street, city, pin code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>
          </FormStep>
        )
      case 3:
        return (
          <FormStep
            title="Step 3: Skills & Services"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
          >
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Select Services <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'AC Repair',
                    'AC Installation',
                    'Washing Machine',
                    'Refrigerator',
                    'TV Repair',
                    'Fan Repair',
                    'Microwave Oven',
                    'Water Purifier',
                    'Geyser/Water Heater',
                  ].map((service) => (
                    <div key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`service-${service}`}
                        name={`service-${service}`}
                        checked={formData.services.includes(service)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label
                        htmlFor={`service-${service}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {service}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Years of Experience <span className="text-red-500">*</span>
                </label>
                <select
                  name="yearsOfExperience"
                  value={formData.yearsOfExperience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select years</option>
                  <option value="1">1 year</option>
                  <option value="2">2 years</option>
                  <option value="3">3 years</option>
                  <option value="4">4 years</option>
                  <option value="5+">5+ years</option>
                </select>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Certifications <span className="text-gray-500">(If any)</span>
                </label>
                <FileUpload
                  label="Upload files"
                  onFileChange={handleFileChange('certifications')}
                />
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Languages Known <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'English',
                    'Hindi',
                    'Malayalam',
                    'Tamil',
                    'Kannada',
                    'Telugu',
                  ].map((language) => (
                    <div key={language} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`language-${language}`}
                        name={`language-${language}`}
                        checked={formData.languages.includes(language)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label
                        htmlFor={`language-${language}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {language}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Short Bio/Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="E.g., 10 years experience in AC repair and installation, worked with LG service center"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-24"
                  required
                ></textarea>
                <p className="text-xs text-gray-500 mt-1">
                  Briefly describe your experience and expertise (50-200 words)
                </p>
              </div>
            </div>
          </FormStep>
        )
      case 4:
        return (
          <FormStep
            title="Step 4: Availability & Work Preferences"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
          >
            <div className="space-y-6">
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Service Areas <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    'Kannur',
                    'Kochi',
                    'Kollam',
                    'Thiruvananthapuram',
                    'Thrissur',
                    'Malappuram',
                    'Kozhikode',
                    'Trivandrum',
                  ].map((area) => (
                    <div key={area} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`area-${area}`}
                        name={`area-${area}`}
                        checked={formData.serviceAreas.includes(area)}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-blue-600"
                      />
                      <label
                        htmlFor={`area-${area}`}
                        className="ml-2 text-sm text-gray-700"
                      >
                        {area}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Preferred Work Radius <span className="text-red-500">*</span>
                </label>
                <select
                  name="workRadius"
                  value={formData.workRadius}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">Select radius</option>
                  <option value="5">5 km</option>
                  <option value="10">10 km</option>
                  <option value="15">15 km</option>
                  <option value="20">20 km</option>
                  <option value="25+">25+ km</option>
                </select>
              </div>
              <div>
                <label className="block mb-2 font-medium text-gray-700">
                  Availability <span className="text-red-500">*</span>
                </label>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Day
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Available
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Start Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          End Time
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {Object.entries(formData.availability).map(
                        ([day, { available, startTime, endTime }]) => (
                          <tr key={day}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                              {day}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="checkbox"
                                id={`available-${day}`}
                                name={`available-${day}`}
                                checked={available}
                                onChange={handleInputChange}
                                className="w-4 h-4 text-blue-600"
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="time"
                                name={`start-Time-${day}`}
                                value={startTime}
                                onChange={handleInputChange}
                                disabled={!available}
                                className={`px-2 py-1 border border-gray-300 rounded-md ${!available ? 'bg-gray-100 text-gray-400' : ''}`}
                              />
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <input
                                type="time"
                                name={`end-Time-${day}`}
                                value={endTime}
                                onChange={handleInputChange}
                                disabled={!available}
                                className={`px-2 py-1 border border-gray-300 rounded-md ${!available ? 'bg-gray-100 text-gray-400' : ''}`}
                              />
                            </td>
                          </tr>
                        ),
                      )}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Select the days and times you are available to work
                </p>
              </div>
            </div>
          </FormStep>
        )
      case 5:
        return (
          <FormStep
            title="Step 5: Bank / Payment Details"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
          >
            <div className="space-y-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Bank Account Holder Name{' '}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountHolderName"
                  value={formData.accountHolderName}
                  onChange={handleInputChange}
                  placeholder="Enter account holder's name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Bank Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="accountNumber"
                  value={formData.accountNumber}
                  onChange={handleInputChange}
                  placeholder="Enter your account number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ifscCode"
                  value={formData.ifscCode}
                  onChange={handleInputChange}
                  placeholder="Enter IFSC code"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  IFSC code is an 11-character code that identifies your bank
                  branch
                </p>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  UPI ID <span className="text-gray-500">(Optional)</span>
                </label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="Enter UPI ID (e.g., name@upi)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-md">
                <h4 className="font-medium text-blue-800 mb-2">
                  Why we need your bank details
                </h4>
                <p className="text-sm text-blue-700">
                  Your bank details are required for processing payments after
                  successful job completions. We ensure your information is
                  secure and only used for payment purposes.
                </p>
              </div>
            </div>
          </FormStep>
        )
      case 6:
        return (
          <FormStep
            title="Step 6: Documents"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
          >
            <div className="space-y-6">
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Police Verification Certificate{' '}
                  <span className="text-gray-500">
                    (Optional but recommended)
                  </span>
                </label>
                <FileUpload
                  onFileChange={handleFileChange('policeVerification')}
                  accept="image/png,image/jpeg,application/pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  A police verification certificate can help build trust with
                  customers.
                </p>
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Trade License / Work Permit{' '}
                  <span className="text-gray-500">(If available)</span>
                </label>
                <FileUpload
                  onFileChange={handleFileChange('tradeLicense')}
                  accept="image/png,image/jpeg,application/pdf"
                />
              </div>
              <div>
                <label className="block mb-1 font-medium text-gray-700">
                  Recent Passport Size Photo{' '}
                  <span className="text-red-500">*</span>
                </label>
                <FileUpload
                  onFileChange={handleFileChange('passportPhoto')}
                  accept="image/png,image/jpeg"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  This photo will be used for your profile and ID card.
                </p>
              </div>
              <div className="bg-yellow-50 p-4 rounded-md">
                <h4 className="font-medium text-yellow-800 mb-2">
                  Document Verification
                </h4>
                <p className="text-sm text-yellow-700">
                  All documents will be verified by our team. Clear, legible
                  scans or photos are required. Verification typically takes 1-3
                  business days.
                </p>
              </div>
            </div>
          </FormStep>
        )
      case 7:
        return (
          <FormStep
            title="Step 7: Agreement & Consent"
            onNext={handleNext}
            onPrevious={handlePrevious}
            showPrevious={true}
          >
            <div className="space-y-6">
              <div className="bg-gray-50 p-6 rounded-md">
                <h3 className="font-medium text-lg mb-4">Terms & Conditions</h3>
                <div className="space-y-4 text-sm">
                  <div>
                    <h4 className="font-medium text-gray-800">
                      1. Service Provider Relationship
                    </h4>
                    <p className="text-gray-600">
                      By registering as a technician on LocalFix, you
                      acknowledge that you are an independent service provider
                      and not an employee of LocalFix. You are responsible for
                      your own taxes, insurance, and compliance with local
                      regulations.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-800">
                      2. Service Quality
                    </h4>
                    <p className="text-gray-600">
                      You agree to provide services with professional care and
                      skill, using appropriate materials and adhering to
                      industry standards. You will communicate clearly with
                      customers about service details, timing, and pricing.
                    </p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="termsAgreed"
                    name="termsAgreed"
                    checked={formData.termsAgreed}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                    required
                  />
                  <label htmlFor="termsAgreed" className="ml-2 text-gray-700">
                    I have read and agree to LocalFix's{' '}
                    <span className="text-blue-600 hover:underline">
                      Terms & Conditions
                    </span>{' '}
                    and{' '}
                    <span className="text-blue-600 hover:underline">
                      Code of Conduct
                    </span>
                  </label>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="verificationConsent"
                    name="verificationConsent"
                    checked={formData.verificationConsent}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                    required
                  />
                  <label
                    htmlFor="verificationConsent"
                    className="ml-2 text-gray-700"
                  >
                    I consent to the verification of my documents and
                    information provided in this application
                  </label>
                </div>
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    id="marketingConsent"
                    name="marketingConsent"
                    checked={formData.marketingConsent}
                    onChange={handleInputChange}
                    className="mt-1 w-4 h-4 text-blue-600"
                  />
                  <label
                    htmlFor="marketingConsent"
                    className="ml-2 text-gray-700"
                  >
                    I would like to receive updates, tips, and promotional
                    offers from LocalFix via email and SMS
                  </label>
                </div>
              </div>
              <div className="text-sm text-gray-600 italic mt-4">
                By proceeding, you confirm that all information provided is
                accurate and complete to the best of your knowledge.
              </div>
            </div>
          </FormStep>
        )
      case 8:
        return (
          <FormStep
            title="Step 8: Submit Application"
            onNext={handleSubmit}
            onPrevious={handlePrevious}
            showPrevious={true}
            isLastStep={true}
          >
            <div className="space-y-8">
              <div className="flex flex-col items-center py-8">
                <div className="bg-green-100 rounded-full p-3 mb-4">
                  <CheckCircleIcon className="w-10 h-10 text-green-500" />
                </div>
                <h3 className="text-xl font-medium text-gray-800 mb-2">
                  Ready to Submit Your Application
                </h3>
                <p className="text-gray-600 text-center">
                  Thank you for completing the application form. Please review
                  all your information before submitting.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-md">
                <h3 className="font-medium text-lg mb-4">What happens next?</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-600 font-medium">1</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Application Review
                      </p>
                      <p className="text-sm text-gray-600">
                        Our admin team will review your application and
                        documents within 24-48 hours.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-600 font-medium">2</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Verification Call
                      </p>
                      <p className="text-sm text-gray-600">
                        We may call you to verify details and discuss your
                        skills and experience.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-600 font-medium">3</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">Onboarding</p>
                      <p className="text-sm text-gray-600">
                        Once approved, you'll receive access to the technician
                        app and onboarding materials.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-blue-100 rounded-full w-8 h-8 flex items-center justify-center mr-3 flex-shrink-0">
                      <span className="text-blue-600 font-medium">4</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        Start Receiving Jobs
                      </p>
                      <p className="text-sm text-gray-600">
                        You'll begin receiving service requests based on your
                        skills and availability.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-yellow-50 p-4 rounded-md">
                  <p className="font-medium text-yellow-800 mb-1">
                    Processing Time
                  </p>
                  <p className="text-sm text-yellow-700">
                    Application review typically takes 1-2 business days. You'll
                    receive updates via SMS and email.
                  </p>
                </div>
                <div className="bg-blue-50 p-4 rounded-md">
                  <p className="font-medium text-blue-800 mb-1">Need Help?</p>
                  <p className="text-sm text-blue-700">
                    If you have any questions, contact our support team at
                    support@localfix.in or call +91 9876543210.
                  </p>
                </div>
              </div>
            </div>
          </FormStep>
        )
      default:
        return <div>Step content not available</div>
    }
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-8">
      <StepIndicator
        steps={STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
      />
      {renderStepContent()}
    </div>
  )
}
