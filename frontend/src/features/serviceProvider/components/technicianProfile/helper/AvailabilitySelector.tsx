import React, { useState } from "react";

export interface MonthlyAvailability {
  duration: {
    months: number;
    startDate: Date;
  };
  availableWeeks: number[]; // Week numbers (1-4) in each month
  weeklyPattern: {
    [key: string]: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
  };
}

interface MonthlyAvailabilitySelectorProps {
  value: MonthlyAvailability;
  onChange: (availability: MonthlyAvailability) => void;
}

export const MonthlyAvailabilitySelector: React.FC<
  MonthlyAvailabilitySelectorProps
> = ({ value, onChange }) => {
  const [duration, setDuration] = useState(value.duration.months || 3);

  const monthOptions = [1, 2, 3, 6, 12];
  const weekOptions = [1, 2, 3, 4];
  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  // Time options from 08:00 to 20:00
  const timeOptions = Array.from({ length: 13 }, (_, i) => {
    const hour = i + 8; // 8 AM to 8 PM
    return `${hour.toString().padStart(2, "0")}:00`;
  });

  const handleDurationChange = (months: number) => {
    const newValue = {
      ...value,
      duration: {
        months,
        startDate: value.duration.startDate || new Date(), 
      },
    };
    setDuration(months);
    onChange(newValue);
  };

  const handleWeekToggle = (week: number) => {
    const newAvailableWeeks = value.availableWeeks.includes(week)
      ? value.availableWeeks.filter((w) => w !== week)
      : [...value.availableWeeks, week];

    onChange({
      ...value,
      availableWeeks: newAvailableWeeks,
    });
  };

  const handleDayAvailabilityToggle = (day: string, available: boolean) => {
    const dayPattern = value.weeklyPattern[day] || {
      available: false,
      startTime: "09:00",
      endTime: "18:00"
    };

    onChange({
      ...value,
      weeklyPattern: {
        ...value.weeklyPattern,
        [day]: {
          ...dayPattern,
          available,
          startTime: dayPattern.startTime || "09:00",
          endTime: dayPattern.endTime || "18:00"
        },
      },
    });
  };

  const handleTimeChange = (day: string, field: "startTime" | "endTime", newTime: string) => {
    const dayPattern = value.weeklyPattern[day];
    if (!dayPattern) return;

    // Basic time format validation
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    let validatedTime = newTime;
    
    if (!timeRegex.test(newTime)) {
      console.warn(`Invalid time format: ${newTime}`);
      validatedTime = field === "startTime" ? "09:00" : "18:00";
    }

    onChange({
      ...value,
      weeklyPattern: {
        ...value.weeklyPattern,
        [day]: {
          ...dayPattern,
          [field]: validatedTime,
        },
      },
    });
  };

  // Get end time options based on selected start time
  const getEndTimeOptions = (startTime: string) => {
    const startHour = parseInt(startTime.split(':')[0]);
    return timeOptions.filter(time => {
      const hour = parseInt(time.split(':')[0]);
      return hour > startHour; // End time must be after start time
    });
  };

  return (
    <div className="space-y-6">
      {/* Duration Selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">Availability Duration</h3>
        <div className="flex flex-wrap gap-2">
          {monthOptions.map((months) => (
            <button
              key={months}
              type="button"
              onClick={() => handleDurationChange(months)}
              className={`px-4 py-2 rounded-md ${
                duration === months
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {months} {months === 1 ? "Month" : "Months"}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          How long will this availability pattern be effective?
        </p>
        {/* Debug info */}
        <div className="mt-2 text-xs text-gray-500">
          Current duration: {value.duration.months} months
        </div>
      </div>

      {/* Rest of your component remains the same */}
      {/* Weekly Pattern */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-3">
          Weekly Availability Pattern
        </h3>

        {/* Week Selection */}
        <div className="mb-4">
          <h4 className="font-medium mb-2">Available Weeks in Month</h4>
          <div className="flex gap-2">
            {weekOptions.map((week) => (
              <button
                key={week}
                type="button"
                onClick={() => handleWeekToggle(week)}
                className={`px-3 py-1 rounded-md text-sm ${
                  value.availableWeeks.includes(week)
                    ? "bg-green-600 text-white"
                    : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Week {week}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="space-y-3">
          {days.map((day) => {
            const dayPattern = value.weeklyPattern[day.key] || {
              available: false,
              startTime: "09:00",
              endTime: "18:00"
            };
            const endTimeOptions = getEndTimeOptions(dayPattern.startTime);

            return (
              <div
                key={day.key}
                className="flex items-center justify-between p-3 bg-white rounded-md border"
              >
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={dayPattern.available}
                    onChange={(e) =>
                      handleDayAvailabilityToggle(day.key, e.target.checked)
                    }
                    className="w-4 h-4 text-blue-600"
                  />
                  <span className="font-medium">{day.label}</span>
                </div>

                {dayPattern.available && (
                  <div className="flex items-center space-x-2">
                    <select
                      value={dayPattern.startTime}
                      onChange={(e) =>
                        handleTimeChange(day.key, "startTime", e.target.value)
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {timeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                    <span>to</span>
                    <select
                      value={dayPattern.endTime}
                      onChange={(e) =>
                        handleTimeChange(day.key, "endTime", e.target.value)
                      }
                      className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      {endTimeOptions.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="font-medium text-blue-800 mb-2">Availability Summary</h4>
        <p className="text-sm text-blue-700">
          You'll be available for <strong>{value.duration.months} months</strong>, during{" "}
          <strong>weeks {value.availableWeeks.sort().join(", ")}</strong> of
          each month, on selected days with your specified timings.
        </p>
      </div>
    </div>
  );
};