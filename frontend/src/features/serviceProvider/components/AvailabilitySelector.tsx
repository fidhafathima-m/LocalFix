import React, { useState } from "react";

export interface TimeSlot {
  start: string;
  end: string;
  available: boolean;
}

export interface DayAvailability {
  available: boolean;
  slots: TimeSlot[];
}

export interface AvailabilityDatas {
  monday: DayAvailability;
  tuesday: DayAvailability;
  wednesday: DayAvailability;
  thursday: DayAvailability;
  friday: DayAvailability;
  saturday: DayAvailability;
  sunday: DayAvailability;
}

interface AvailabilitySelectorProps {
  value: AvailabilityDatas;
  onChange: (availability: AvailabilityDatas) => void;
}

const TIME_SLOTS = [
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
];

export const AvailabilitySelector: React.FC<AvailabilitySelectorProps> = ({
  value,
  onChange,
}) => {
  const [bulkStartTime, setBulkStartTime] = useState("09:00");
  const [bulkEndTime, setBulkEndTime] = useState("18:00");

  const toggleDayAvailability = (day: keyof AvailabilityDatas) => {
    const current = value[day];
    const newAvailability = {
      ...value,
      [day]: {
        ...current,
        available: !current.available,
      },
    };
    onChange(newAvailability);
  };

  const toggleTimeSlot = (day: keyof AvailabilityDatas, slotIndex: number) => {
    const dayAvailability = value[day];
    const newSlots = [...dayAvailability.slots];
    newSlots[slotIndex] = {
      ...newSlots[slotIndex],
      available: !newSlots[slotIndex].available,
    };

    const newAvailability = {
      ...value,
      [day]: {
        ...dayAvailability,
        slots: newSlots,
        available: newSlots.some((slot) => slot.available),
      },
    };
    onChange(newAvailability);
  };

  const applyBulkSlots = () => {
    const newAvailability = { ...value };

    (Object.keys(newAvailability) as Array<keyof AvailabilityDatas>).forEach(
      (day) => {
        const dayAvailability = newAvailability[day];

        if (dayAvailability.available) {
          const newSlots = dayAvailability.slots.map((slot) => ({
            ...slot,
            available: slot.start >= bulkStartTime && slot.end <= bulkEndTime,
          }));

          newAvailability[day] = {
            ...dayAvailability,
            slots: newSlots,
          };
        }
      }
    );

    onChange(newAvailability);
  };

  const DAYS = [
    { key: "monday" as const, label: "Monday" },
    { key: "tuesday" as const, label: "Tuesday" },
    { key: "wednesday" as const, label: "Wednesday" },
    { key: "thursday" as const, label: "Thursday" },
    { key: "friday" as const, label: "Friday" },
    { key: "saturday" as const, label: "Saturday" },
    { key: "sunday" as const, label: "Sunday" },
  ];

  return (
    <div className="space-y-6">
      {/* Bulk Time Selection */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-gray-800 mb-3">
          Quick Set Available Times
        </h4>
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Time
            </label>
            <select
              value={bulkStartTime}
              onChange={(e) => setBulkStartTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Time
            </label>
            <select
              value={bulkEndTime}
              onChange={(e) => setBulkEndTime(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              {TIME_SLOTS.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={applyBulkSlots}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Apply to Selected Days
          </button>
        </div>
      </div>

      {/* Days and Time Slots */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Day
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Available
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                Time Slots
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {DAYS.map((dayObj) => {
              const dayAvailability = value[dayObj.key];

              return (
                <tr key={dayObj.key}>
                  <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {dayObj.label}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={dayAvailability.available}
                      onChange={() => toggleDayAvailability(dayObj.key)}
                      className="w-4 h-4 text-blue-600"
                    />
                  </td>
                  <td className="px-4 py-4">
                    {dayAvailability.available ? (
                      <div className="flex flex-wrap gap-2">
                        {dayAvailability.slots.map((slot, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => toggleTimeSlot(dayObj.key, index)}
                            className={`px-3 py-1 text-xs rounded-full border ${
                              slot.available
                                ? "bg-green-100 text-green-800 border-green-300"
                                : "bg-gray-100 text-gray-600 border-gray-300"
                            }`}
                          >
                            {slot.start} - {slot.end}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">
                        Not available
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
