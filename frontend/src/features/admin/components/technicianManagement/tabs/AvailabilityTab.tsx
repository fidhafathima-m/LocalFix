import type { TechnicianDetails } from "../../../../../validation/types/technicianTypes";

interface AvailabilityTabProps {
    technician: TechnicianDetails,
    isSuspended?: boolean
}

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({ technician, isSuspended }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium mb-6">Availability</h2>
      <div className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Current Availability</p>
            <p className="text-sm text-gray-600">
              {isSuspended 
                ? 'Not available due to suspension' 
                : technician.availability?.isAvailable 
                  ? 'Available for bookings' 
                  : 'Not available'
              }
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            technician.availability?.isAvailable 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}>
            {isSuspended ? 'Suspended' : (technician.availability?.isAvailable ? 'Available' : 'Unavailable')}
          </span>
        </div>

        {/* Weekly Schedule */}
        {technician.availability?.schedule && (
          <div>
            <h3 className="font-medium mb-4">Weekly Schedule</h3>
            <div className="space-y-2">
              {technician.availability.schedule.map((daySchedule, index) => (
                <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                  <span className="font-medium capitalize">{daySchedule.day}</span>
                  <div className="text-sm text-gray-600">
                    {daySchedule.slots.length > 0 
                      ? daySchedule.slots.map(slot => `${slot.start} - ${slot.end}`).join(', ')
                      : 'Not available'
                    }
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


export default AvailabilityTab