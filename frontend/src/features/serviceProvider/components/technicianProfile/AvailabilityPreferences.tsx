import { useState, useEffect } from 'react'
import AccordionSection from './AccordianSections'
import CheckOutlinedIcon from '@mui/icons-material/CheckOutlined';
import { technicianAPI, type TechnicianProfile } from '../../../../services/technicianApi'

interface WeeklyAvailability {
  [key: string]: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  };
}

interface AvailabilityData {
  isAvailable: boolean;
  serviceAreas: string[];
  workRadius: number;
  weeklyAvailability: WeeklyAvailability;
}

const AvailabilityPreferences = () => {
  const [profile, setProfile] = useState<TechnicianProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<AvailabilityData>({
    isAvailable: true,
    serviceAreas: [],
    workRadius: 10,
    weeklyAvailability: {
      monday: { enabled: true, startTime: '09:00', endTime: '19:00' },
      tuesday: { enabled: true, startTime: '09:00', endTime: '19:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '19:00' },
      thursday: { enabled: true, startTime: '09:00', endTime: '19:00' },
      friday: { enabled: true, startTime: '09:00', endTime: '19:00' },
      saturday: { enabled: true, startTime: '09:00', endTime: '19:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '19:00' }
    }
  })

  // Available service areas
  const availableServiceAreas = [
    'Sector 1',
    'Sector 2', 
    'Sector 3',
    'Sector 4',
    'Sector 5',
    'Downtown',
    'Suburbs',
    'Industrial Area',
    'Residential Area'
  ]

  // Days of week for availability
  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

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
        
        // Populate availability data
        const workAreas = profileData.workAreas || []
        const serviceRadiusKm = profileData.serviceRadiusKm || 10
        
        // Get availability from profile or use defaults
        const availability = profileData.availability || {
          isAvailable: true,
          weeklyAvailability: {
            monday: { enabled: true, startTime: '09:00', endTime: '19:00' },
            tuesday: { enabled: true, startTime: '09:00', endTime: '19:00' },
            wednesday: { enabled: true, startTime: '09:00', endTime: '19:00' },
            thursday: { enabled: true, startTime: '09:00', endTime: '19:00' },
            friday: { enabled: true, startTime: '09:00', endTime: '19:00' },
            saturday: { enabled: true, startTime: '09:00', endTime: '19:00' },
            sunday: { enabled: false, startTime: '09:00', endTime: '19:00' }
          }
        }

        setFormData({
          isAvailable: availability.isAvailable !== false,
          serviceAreas: workAreas,
          workRadius: serviceRadiusKm,
          weeklyAvailability: availability.weeklyAvailability || formData.weeklyAvailability
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAvailabilityToggle = (checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      isAvailable: checked
    }))
  }

  const handleServiceAreasChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value)
    setFormData(prev => ({
      ...prev,
      serviceAreas: selectedOptions
    }))
  }

  const handleWorkRadiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      workRadius: parseInt(e.target.value) || 10
    }))
  }

  const handleDayToggle = (dayKey: string, enabled: boolean) => {
    setFormData(prev => ({
      ...prev,
      weeklyAvailability: {
        ...prev.weeklyAvailability,
        [dayKey]: {
          ...prev.weeklyAvailability[dayKey],
          enabled
        }
      }
    }))
  }

  const handleTimeChange = (dayKey: string, field: 'startTime' | 'endTime', value: string) => {
    setFormData(prev => ({
      ...prev,
      weeklyAvailability: {
        ...prev.weeklyAvailability,
        [dayKey]: {
          ...prev.weeklyAvailability[dayKey],
          [field]: value
        }
      }
    }))
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      
      const updateData = {
        availability: {
          isAvailable: formData.isAvailable,
          weeklyAvailability: formData.weeklyAvailability
        },
        workAreas: formData.serviceAreas,
        serviceRadiusKm: formData.workRadius
      }

      const response = await technicianAPI.updateAvailability(updateData)
      
      if (response.data.success) {
        // Update local profile state
        if (profile) {
          setProfile({
            ...profile,
            workAreas: formData.serviceAreas,
            serviceRadiusKm: formData.workRadius,
            availability: {
              isAvailable: formData.isAvailable,
              weeklyAvailability: formData.weeklyAvailability
            }
          })
        }
        alert('Availability preferences updated successfully!')
      }
    } catch (error) {
      console.error('Error updating availability:', error)
      alert('Failed to update availability preferences')
    } finally {
      setSaving(false)
    }
  }

  const getStatusDisplay = () => {
    if (formData.isAvailable) {
      return (
        <div className="flex items-start">
          <div className="text-green-500 bg-green-100 rounded-full p-1 mr-2">
            <CheckOutlinedIcon className='h-5 w-5' />
          </div>
          <span className="text-green-500 text-sm font-medium">Available for new jobs</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-start">
          <div className="text-red-500 bg-red-100 rounded-full p-1 mr-2">
            <CheckOutlinedIcon className='h-5 w-5' />
          </div>
          <span className="text-red-500 text-sm font-medium">Not available for new jobs</span>
        </div>
      )
    }
  }

  if (loading) {
    return (
      <AccordionSection title="Availability & Work Preferences" number={4}>
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </AccordionSection>
    )
  }

  return (
    <AccordionSection title="Availability & Work Preferences" number={4}>
      <div>
        {/* Overall Availability Status */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-sm font-medium">Overall Availability Status</h3>
          <label className="relative inline-block w-12 h-6 cursor-pointer">
            <input 
              type="checkbox" 
              className="opacity-0 w-0 h-0" 
              checked={formData.isAvailable}
              onChange={(e) => handleAvailabilityToggle(e.target.checked)}
            />
            <span className={`absolute top-0 left-0 right-0 bottom-0 rounded-full transition-colors ${
              formData.isAvailable ? 'bg-green-500' : 'bg-gray-300'
            }`}></span>
            <span className={`absolute left-1 bottom-1 bg-white w-4 h-4 rounded-full transition-transform ${
              formData.isAvailable ? 'transform translate-x-6' : 'transform translate-x-0'
            }`}></span>
          </label>
        </div>
        
        {getStatusDisplay()}

        {/* Service Areas and Work Radius */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 mb-6">
          <div>
            <label className="block text-sm font-medium mb-1">Service Areas</label>
            <select 
              multiple
              value={formData.serviceAreas}
              onChange={handleServiceAreasChange}
              className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 min-h-[100px]"
            >
              {availableServiceAreas.map(area => (
                <option key={area} value={area}>{area}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              Hold Ctrl/Cmd to select multiple areas
            </p>
            {formData.serviceAreas.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-green-600 font-medium">
                  Selected: {formData.serviceAreas.join(', ')}
                </p>
              </div>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              Preferred Work Radius: {formData.workRadius} km
            </label>
            <div className="mt-2">
              <input
                type="range"
                min="5"
                max="30"
                step="5"
                value={formData.workRadius}
                onChange={handleWorkRadiusChange}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>5 km</span>
                <span>15 km</span>
                <span>30 km</span>
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Set your preferred maximum distance for service calls
            </p>
          </div>
        </div>

        {/* Weekly Availability */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">Weekly Availability</h3>
          <div className="space-y-3">
            {daysOfWeek.map(({ key, label }) => {
              const dayAvailability = formData.weeklyAvailability[key]
              const isEnabled = dayAvailability?.enabled ?? (key !== 'sunday')
              
              return (
                <div key={key} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id={key}
                    checked={isEnabled}
                    onChange={(e) => handleDayToggle(key, e.target.checked)}
                    className="mr-3 h-5 w-5 text-blue-500 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <label htmlFor={key} className="w-28 font-medium text-sm">
                    {label}
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Start:</span>
                      <input
                        type="time"
                        value={dayAvailability?.startTime || '09:00'}
                        onChange={(e) => handleTimeChange(key, 'startTime', e.target.value)}
                        disabled={!isEnabled}
                        className="w-24 p-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                    <div className="flex items-center">
                      <span className="text-sm text-gray-600 mr-2">End:</span>
                      <input
                        type="time"
                        value={dayAvailability?.endTime || '19:00'}
                        onChange={(e) => handleTimeChange(key, 'endTime', e.target.value)}
                        disabled={!isEnabled}
                        className="w-24 p-1 border border-gray-300 rounded text-center text-sm disabled:bg-gray-100 disabled:text-gray-400"
                      />
                    </div>
                    {!isEnabled && (
                      <span className="text-xs text-gray-400">Unavailable</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <button 
            onClick={handleSave}
            disabled={saving || formData.serviceAreas.length === 0}
            className={`px-6 py-2 rounded font-medium flex items-center ${
              saving || formData.serviceAreas.length === 0
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

export default AvailabilityPreferences