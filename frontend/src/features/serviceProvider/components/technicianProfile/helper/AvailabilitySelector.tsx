import React from "react";

export interface WeeklyAvailability {
  availableWeeks: number[]; // Week numbers (1-4) in each month
  weeklyPattern: {
    [key: string]: {
      available: boolean;
      startTime: string;
      endTime: string;
    };
  };
}

interface WeeklyAvailabilitySelectorProps {
  value: WeeklyAvailability;
  onChange: (availability: WeeklyAvailability) => void;
}

export const WeeklyAvailabilitySelector: React.FC<
  WeeklyAvailabilitySelectorProps
> = ({ value, onChange }) => {
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
      endTime: "18:00",
    };

    onChange({
      ...value,
      weeklyPattern: {
        ...value.weeklyPattern,
        [day]: {
          ...dayPattern,
          available,
          startTime: dayPattern.startTime || "09:00",
          endTime: dayPattern.endTime || "18:00",
        },
      },
    });
  };

  const handleTimeChange = (
    day: string,
    field: "startTime" | "endTime",
    newTime: string
  ) => {
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
    const startHour = parseInt(startTime.split(":")[0]);
    return timeOptions.filter((time) => {
      const hour = parseInt(time.split(":")[0]);
      return hour > startHour; // End time must be after start time
    });
  };

  return (
    <div className="space-y-6">
      {/* Information Note */}
      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg
              className="w-5 h-5 text-blue-600 mt-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Schedule Information
            </h3>
            <div className="mt-1 text-sm text-blue-700">
              <p>
                This schedule will be automatically effective for{" "}
                <strong>1 month</strong>. After 1 month, it will automatically
                reset. If you are not available for the next day, kindly update
                that in your profile.
              </p>
              <p className="mt-1">
                You can modify your availability schedule anytime from your
                technician profile.
              </p>
            </div>
          </div>
        </div>
      </div>

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
              endTime: "18:00",
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
      <div className="bg-green-50 p-4 rounded-md border border-green-200">
        <h4 className="font-medium text-green-800 mb-2">
          Availability Summary
        </h4>
        <p className="text-sm text-green-700">
          You'll be available during{" "}
          <strong>weeks {value.availableWeeks.sort().join(", ")}</strong> of
          each month, on selected days with your specified timings.
        </p>
        <p className="text-sm text-green-700 mt-1">
          This schedule is valid for <strong>1 month</strong> and can be updated
          anytime from your profile.
        </p>
      </div>
    </div>
  );
};
