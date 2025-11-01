// components/technician/MonthlyAvailabilitySelector.tsx
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

  const handleDurationChange = (months: number) => {
    const newValue = {
      ...value,
      duration: {
        months,
        startDate: new Date(),
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDayChange = (day: string, field: string, newValue: any) => {
    onChange({
      ...value,
      weeklyPattern: {
        ...value.weeklyPattern,
        [day]: {
          ...value.weeklyPattern[day],
          [field]: newValue,
        },
      },
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
                  : "bg-white text-gray-700 border border-gray-300"
              }`}
            >
              {months} {months === 1 ? "Month" : "Months"}
            </button>
          ))}
        </div>
        <p className="text-sm text-gray-600 mt-2">
          How long will this availability pattern be effective?
        </p>
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
                    : "bg-white text-gray-700 border border-gray-300"
                }`}
              >
                Week {week}
              </button>
            ))}
          </div>
        </div>

        {/* Daily Schedule */}
        <div className="space-y-3">
          {days.map((day) => (
            <div
              key={day.key}
              className="flex items-center justify-between p-3 bg-white rounded-md border"
            >
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={value.weeklyPattern[day.key]?.available || false}
                  onChange={(e) =>
                    handleDayChange(day.key, "available", e.target.checked)
                  }
                  className="w-4 h-4 text-blue-600"
                />
                <span className="font-medium">{day.label}</span>
              </div>

              {value.weeklyPattern[day.key]?.available && (
                <div className="flex items-center space-x-2">
                  <select
                    value={value.weeklyPattern[day.key]?.startTime || "09:00"}
                    onChange={(e) =>
                      handleDayChange(day.key, "startTime", e.target.value)
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {Array.from({ length: 13 }, (_, i) => {
                      const hour = i + 8; // 8 AM to 8 PM
                      return `${hour.toString().padStart(2, "0")}:00`;
                    }).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                  <span>to</span>
                  <select
                    value={value.weeklyPattern[day.key]?.endTime || "18:00"}
                    onChange={(e) =>
                      handleDayChange(day.key, "endTime", e.target.value)
                    }
                    className="px-2 py-1 border border-gray-300 rounded text-sm"
                  >
                    {Array.from({ length: 13 }, (_, i) => {
                      const hour = i + 9; // 9 AM to 9 PM
                      return `${hour.toString().padStart(2, "0")}:00`;
                    }).map((time) => (
                      <option key={time} value={time}>
                        {time}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="bg-blue-50 p-4 rounded-md">
        <h4 className="font-medium text-blue-800 mb-2">Availability Summary</h4>
        <p className="text-sm text-blue-700">
          You'll be available for <strong>{duration} months</strong>, during{" "}
          <strong>weeks {value.availableWeeks.sort().join(", ")}</strong> of
          each month, on selected days with your specified timings.
        </p>
      </div>
    </div>
  );
};
