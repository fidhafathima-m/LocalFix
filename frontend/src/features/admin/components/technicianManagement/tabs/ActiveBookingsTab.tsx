import type { TechnicianDetails } from "../../../../../validation/types/technicianTypes";

interface ActiveBookingsTabProps {
    technician: TechnicianDetails,
    isSuspended?: boolean
}

const ActiveBookingsTab: React.FC<ActiveBookingsTabProps> = ({ technician }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium mb-6">Active Bookings</h2>
      
      <div className="bg-gray-50 p-6 rounded-lg text-center">
        <p className="text-gray-600 mb-2">
          {technician.ongoingJobs && technician.ongoingJobs > 0 
            ? `${technician.ongoingJobs} active ${technician.ongoingJobs === 1 ? 'booking' : 'bookings'}`
            : 'No active bookings'
          }
        </p>
        <p className="text-sm text-gray-500">
          Detailed booking information and scheduling will be displayed here.
        </p>
      </div>
    </div>
  )
}

export default ActiveBookingsTab