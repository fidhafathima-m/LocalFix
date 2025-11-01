import type { TechnicianDetails } from "../../../../../validation/types/technicianTypes";

interface AvailabilityTabProps {
  technician: TechnicianDetails;
  isSuspended?: boolean;
}

const AvailabilityTab: React.FC<AvailabilityTabProps> = ({
  technician,
  isSuspended,
}) => {
  // Helper function to check if technician has any availability data
  const hasAvailabilityData = () => {
    return technician.availability?.schedule && 
           technician.availability.schedule.length > 0 &&
           technician.availability.schedule.some(day => day.slots.length > 0);
  };

  // Helper function to get default availability status
  const getAvailabilityStatus = () => {
    if (isSuspended) {
      return {
        status: "Suspended",
        available: false,
        message: "Not available due to suspension",
        color: "bg-red-100 text-red-800"
      };
    }

    if (technician.availability?.isAvailable === false) {
      return {
        status: "Unavailable",
        available: false,
        message: "Not available",
        color: "bg-red-100 text-red-800"
      };
    }

    if (hasAvailabilityData()) {
      return {
        status: "Available",
        available: true,
        message: "Available for bookings",
        color: "bg-green-100 text-green-800"
      };
    }

    // Default case - no availability data but not explicitly unavailable
    return {
      status: "Available",
      available: true,
      message: "Available for bookings",
      color: "bg-green-100 text-green-800"
    };
  };

  // Format time from Date object or string to HH:MM format
  const formatTime = (time: string | Date): string => {
    if (typeof time === 'string') {
      // If it's already in HH:MM format, return as is
      if (time.match(/^\d{1,2}:\d{2}$/)) {
        return time;
      }
      // Try to parse string as date
      try {
        const date = new Date(time);
        return date.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: false 
        });
      } catch {
        return time;
      }
    } else if (time instanceof Date) {
      return time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit',
        hour12: false 
      });
    }
    return String(time);
  };

  // Get only available days with formatted times
  const getAvailableDays = () => {
    if (!technician.availability?.schedule) return [];

    return technician.availability.schedule
      .filter(day => day.slots.length > 0)
      .map(day => {
        // Get unique time ranges for this day
        const timeRanges = day.slots.map(slot => ({
          start: formatTime(slot.start),
          end: formatTime(slot.end)
        }));

        // Group consecutive time slots
        const groupedRanges = groupConsecutiveSlots(timeRanges);
        
        return {
          day: day.day,
          ranges: groupedRanges
        };
      });
  };

  // Group consecutive time slots into ranges
  const groupConsecutiveSlots = (slots: Array<{start: string, end: string}>): Array<{start: string, end: string}> => {
    if (slots.length === 0) return [];

    const sortedSlots = [...slots].sort((a, b) => a.start.localeCompare(b.start));
    const ranges: Array<{start: string, end: string}> = [];
    
    let currentRange = { ...sortedSlots[0] };

    for (let i = 1; i < sortedSlots.length; i++) {
      const slot = sortedSlots[i];
      
      // If this slot starts when the current range ends, extend the range
      if (slot.start === currentRange.end) {
        currentRange.end = slot.end;
      } else {
        // End the current range and start a new one
        ranges.push(currentRange);
        currentRange = { ...slot };
      }
    }
    
    ranges.push(currentRange);
    return ranges;
  };

  // Format day name for display
  const formatDayName = (day: string): string => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  // Format time range for display
  const formatTimeRange = (range: {start: string, end: string}): string => {
    return `${range.start} - ${range.end}`;
  };

  const availabilityStatus = getAvailabilityStatus();
  const availableDays = getAvailableDays();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-medium mb-6">Availability</h2>
      <div className="space-y-6">
        {/* Current Status */}
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Current Availability</p>
            <p className="text-sm text-gray-600">
              {availabilityStatus.message}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-sm font-medium ${availabilityStatus.color}`}
          >
            {availabilityStatus.status}
          </span>
        </div>


        {/* Weekly Schedule */}
        {availableDays.length > 0 ? (
          <div>
            <h3 className="font-medium mb-4">Weekly Schedule</h3>
            <div className="space-y-3">
              {availableDays.map((dayInfo, index) => (
                <div
                  key={index}
                  className="flex items-start justify-between p-4 border border-gray-200 rounded-lg bg-white"
                >
                  <span className="font-medium text-gray-900 min-w-32">
                    {formatDayName(dayInfo.day)}
                  </span>
                  <div className="text-sm text-gray-700 flex-1 text-right">
                    {dayInfo.ranges.map((range, rangeIndex) => (
                      <div key={rangeIndex} className="mb-1 last:mb-0">
                        {formatTimeRange(range)}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            {/* Summary */}
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700 text-center">
                Available {availableDays.length} days per week 
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-gray-500">No availability schedule configured</p>
            <p className="text-sm text-gray-400 mt-1">
              This technician hasn't set up their weekly availability schedule yet.
            </p>
          </div>
        )}

        {/* Additional Availability Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Work Areas */}
          {technician.workAreas && technician.workAreas.length > 0 && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Service Areas</h4>
              <div className="flex flex-wrap gap-1">
                {technician.workAreas.map((area, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                    {area}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Service Radius */}
          {technician.serviceRadiusKm && (
            <div className="p-4 border border-gray-200 rounded-lg">
              <h4 className="font-medium mb-2">Service Radius</h4>
              <p className="text-sm text-gray-600">{technician.serviceRadiusKm} km</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AvailabilityTab;