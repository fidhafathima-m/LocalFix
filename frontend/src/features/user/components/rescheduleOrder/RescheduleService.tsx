import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowBackIosNewOutlined,
  BuildOutlined,
  CalendarTodayOutlined,
  AccessTimeOutlined,
  HomeOutlined,
  PersonOutlined,
} from "@mui/icons-material";
import Header from "../../../../components/common/Header";
import Footer from "../../../../components/common/Footer";
import { TechnicianMangementService } from "../../../../services/admin/TechnicianManagementService";
import toast from "react-hot-toast";
import { RRule } from "rrule";
import { orderService } from "../../../../services/user/orderService";

interface LocationState {
  orderId: string;
  bookingId: string;
  orderCode: string;
  serviceName: string;
  problemDescription: string;
  currentDate: string;
  currentTimeSlot: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  technician: {
    _id: string;
    displayName: string;
    profilePictureUrl?: string;
  };
}

interface SlotRule {
  _id: string;
  name: string;
  rruleString: string;
  startTime: string;
  endTime: string;
  slotDurationMinutes: number;
  isActive: boolean;
  effectiveFrom: string;
  effectiveTo?: string;
}

interface AvailableSlot {
  date: string;
  dateObj: Date;
  dayName: string;
  timeSlots: string[];
  isToday: boolean;
}

const RescheduleService: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderData = location.state as LocationState;

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingSlots, setFetchingSlots] = useState(false);
  const [, setSlotRules] = useState<SlotRule[]>([]);

  // Fetch technician slot rules and generate availability
  useEffect(() => {
    const fetchTechnicianAvailability = async () => {
      if (!orderData) {
        toast.error("No order data found");
        navigate("/my-orders");
        return;
      }

      try {
        setFetchingSlots(true);

        // Fetch slot rules for the technician
        const slotRulesResponse =
          await TechnicianMangementService.getTechnicianSlotRules(
            orderData.technician._id
          );

        if (
          slotRulesResponse.data?.success &&
          slotRulesResponse.data.data?.slotRules
        ) {
          const rules = slotRulesResponse.data.data.slotRules;
          setSlotRules(rules);

          // Generate availability from slot rules
          const availability = generateAvailabilityFromSlotRules(rules);
          setAvailableSlots(availability);

          // Set initial selected date to first available date
          if (availability.length > 0) {
            setSelectedDate(availability[0].date);
            if (availability[0].timeSlots.length > 0) {
              setSelectedTime(availability[0].timeSlots[0]);
            }
          }
        } else {
          toast.error("No availability data found for this technician");
          setAvailableSlots([]);
        }
      } catch (error) {
        console.error("Error fetching technician availability:", error);
        toast.error("Failed to load technician availability");
        setAvailableSlots([]);
      } finally {
        setFetchingSlots(false);
      }
    };

    fetchTechnicianAvailability();
  }, [orderData, navigate]);

  const generateAvailabilityFromSlotRules = (
    rules: SlotRule[]
  ): AvailableSlot[] => {
    const availableSlots: AvailableSlot[] = [];
    const today = new Date();

    // Get next 14 days for better availability options
    for (let i = 1; i <= 14; i++) {
      const date = new Date();
      date.setDate(today.getDate() + i);

      // Skip if it's Sunday (day 0) or if we want to exclude weekends
      if (date.getDay() === 0) continue;

      const dateString = date.toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });

      const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
      const timeSlots = getTimeSlotsForDate(rules, date);

      // Only include dates that have available time slots
      if (timeSlots.length > 0) {
        availableSlots.push({
          date: dateString,
          dateObj: date,
          dayName,
          timeSlots,
          isToday: i === 1,
        });
      }
    }

    return availableSlots;
  };

  const getTimeSlotsForDate = (rules: SlotRule[], date: Date): string[] => {
    const slots: string[] = [];
    const activeRules = rules.filter((rule) => rule.isActive);

    activeRules.forEach((rule) => {
      try {
        // Parse the RRule and check if it occurs on this date
        const rrule = RRule.fromString(rule.rruleString);
        const occurrences = rrule.between(
          new Date(date.getFullYear(), date.getMonth(), date.getDate()),
          new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1),
          true
        );

        // If this rule applies to the current date, generate time slots
        if (occurrences.length > 0) {
          const timeSlots = generateTimeSlots(
            rule.startTime,
            rule.endTime,
            rule.slotDurationMinutes
          );
          slots.push(...timeSlots);
        }
      } catch (error) {
        console.error("Error processing slot rule:", error);
      }
    });

    // Remove duplicates and sort
    return [...new Set(slots)].sort();
  };

  const generateTimeSlots = (
    startTime: string,
    endTime: string,
    durationMinutes: number
  ): string[] => {
    const slots: string[] = [];

    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute < endMinute)
    ) {
      const slotStart = `${currentHour
        .toString()
        .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

      // Calculate end time
      let slotEndHour = currentHour;
      let slotEndMinute = currentMinute + durationMinutes;

      while (slotEndMinute >= 60) {
        slotEndHour++;
        slotEndMinute -= 60;
      }

      const slotEnd = `${slotEndHour
        .toString()
        .padStart(2, "0")}:${slotEndMinute.toString().padStart(2, "0")}`;

      // Check if slot ends before or at the end time
      if (
        slotEndHour < endHour ||
        (slotEndHour === endHour && slotEndMinute <= endMinute)
      ) {
        // Format for display (convert to 12-hour format)
        const formattedSlot = formatTimeSlot(slotStart, slotEnd);
        slots.push(formattedSlot);
      }

      // Move to next slot
      currentMinute += durationMinutes;
      while (currentMinute >= 60) {
        currentHour++;
        currentMinute -= 60;
      }
    }

    return slots;
  };

  const formatTimeSlot = (start: string, end: string): string => {
    const formatTimeTo12Hour = (time: string): string => {
      const [hours, minutes] = time.split(":").map(Number);
      const period = hours >= 12 ? "PM" : "AM";
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
    };

    return `${formatTimeTo12Hour(start)} - ${formatTimeTo12Hour(end)}`;
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    // Auto-select first time slot for the selected date
    const selectedDateData = availableSlots.find((slot) => slot.date === date);
    if (selectedDateData && selectedDateData.timeSlots.length > 0) {
      setSelectedTime(selectedDateData.timeSlots[0]);
    } else {
      setSelectedTime("");
    }
  };

  const formatDisplayDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatDisplayTimeSlot = (timeSlot: string) => {
    return timeSlot;
  };

  const getTimeSlotsForSelectedDate = (): string[] => {
    const selectedDateData = availableSlots.find(
      (slot) => slot.date === selectedDate
    );
    return selectedDateData?.timeSlots || [];
  };

  const handleConfirmReschedule = async () => {
    if (!selectedDate || !selectedTime || !orderData) {
      toast.error("Please select both date and time");
      return;
    }

    try {
      setLoading(true);

      // Convert selected date to ISO format
      const selectedDateData = availableSlots.find(
        (slot) => slot.date === selectedDate
      );
      if (!selectedDateData) {
        toast.error("Invalid date selected");
        return;
      }

      const scheduledAt = selectedDateData.dateObj.toISOString();

      // Call the reschedule API
      const response = await orderService.rescheduleOrder(
        orderData.orderId,
        scheduledAt,
        selectedTime
      );

      if (response.success) {
        toast.success("Service rescheduled successfully!");
        navigate("/reschedule-success", {
          state: {
            orderCode: orderData.orderCode,
            newDate: selectedDate,
            newTime: selectedTime,
          },
        });
      } else {
        toast.error(response.message || "Failed to reschedule service");
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error rescheduling order:", error);
      toast.error(
        error.response?.data?.message || "Failed to reschedule service"
      );
    } finally {
      setLoading(false);
    }
  };

  if (!orderData) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BuildOutlined className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Order Data</h2>
            <p className="text-gray-600 mb-6">
              Unable to load order details for rescheduling.
            </p>
            <Link
              to="/my-orders"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors inline-block"
            >
              Back to Orders
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link
          to="/my-orders"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-8"
        >
          <ArrowBackIosNewOutlined className="w-5 h-5 mr-2" />
          Back to Orders
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold mb-2">Reschedule Service</h1>
          <p className="text-gray-600 mb-8">
            Select a new date and time for your service
          </p>

          {/* Order Details Card */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-4">
              <div className="bg-blue-100 rounded-full p-3">
                <BuildOutlined className="w-6 h-6 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-1">
                  {orderData.serviceName}
                </h3>
                <p className="text-gray-600 text-sm mb-4">
                  {orderData.problemDescription || "Standard service"}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Current Date */}
                  <div className="flex items-center space-x-3">
                    <CalendarTodayOutlined className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Current Date</p>
                      <p className="font-medium">
                        {formatDisplayDate(orderData.currentDate)}
                      </p>
                    </div>
                  </div>

                  {/* Current Time Slot */}
                  <div className="flex items-center space-x-3">
                    <AccessTimeOutlined className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Current Time Slot</p>
                      <p className="font-medium">
                        {formatDisplayTimeSlot(orderData.currentTimeSlot)}
                      </p>
                    </div>
                  </div>

                  {/* Service Address */}
                  <div className="flex items-center space-x-3 md:col-span-2">
                    <HomeOutlined className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Service Address</p>
                      <p className="font-medium">
                        {orderData.address.street}, {orderData.address.city},{" "}
                        {orderData.address.state} - {orderData.address.pincode}
                        {orderData.address.landmark &&
                          ` (${orderData.address.landmark})`}
                      </p>
                    </div>
                  </div>

                  {/* Technician */}
                  <div className="flex items-center space-x-3">
                    <PersonOutlined className="w-5 h-5 text-gray-500" />
                    <div>
                      <p className="text-xs text-gray-500">Technician</p>
                      <p className="font-medium">
                        {orderData.technician.displayName}
                      </p>
                    </div>
                  </div>

                  {/* Order ID */}
                  <div className="md:col-span-2">
                    <p className="text-xs text-gray-500">
                      Order ID:{" "}
                      <span className="font-medium text-gray-700">
                        {orderData.orderCode}
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Availability Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Available Dates & Times</h3>
              {fetchingSlots && (
                <div className="flex items-center text-sm text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                  Loading availability...
                </div>
              )}
            </div>

            {availableSlots.length === 0 && !fetchingSlots ? (
              <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
                <CalendarTodayOutlined className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600 mb-2">No available slots found</p>
                <p className="text-sm text-gray-500">
                  This technician doesn't have any available slots in the next
                  two weeks.
                </p>
              </div>
            ) : (
              <>
                {/* Date Selection */}
                <div className="mb-6">
                  <h4 className="font-medium mb-3 text-gray-700">
                    Select Date
                  </h4>
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot.date}
                        onClick={() => handleDateSelect(slot.date)}
                        disabled={fetchingSlots}
                        className={`px-3 py-3 rounded-lg border text-sm font-medium transition-colors flex flex-col items-center ${
                          selectedDate === slot.date
                            ? "bg-blue-50 border-blue-500 text-blue-700"
                            : "border-gray-200 hover:border-gray-300 text-gray-700"
                        } ${
                          fetchingSlots ? "opacity-50 cursor-not-allowed" : ""
                        }`}
                      >
                        <span className="font-semibold text-xs mb-1">
                          {slot.date.split(" ")[0]} {slot.date.split(" ")[1]}
                        </span>
                        <span className="text-xs text-gray-500">
                          {slot.dayName.substring(0, 3)}
                        </span>
                        {slot.isToday && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded mt-1">
                            Soon
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slot Selection */}
                {selectedDate && (
                  <div className="mb-6">
                    <h4 className="font-medium mb-3 text-gray-700">
                      Available Time Slots for {selectedDate}
                    </h4>
                    {getTimeSlotsForSelectedDate().length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {getTimeSlotsForSelectedDate().map((time) => (
                          <button
                            key={time}
                            onClick={() => setSelectedTime(time)}
                            className={`px-4 py-3 rounded-lg border text-sm font-medium transition-colors ${
                              selectedTime === time
                                ? "bg-blue-50 border-blue-500 text-blue-700"
                                : "border-gray-200 hover:border-gray-300 text-gray-700"
                            }`}
                          >
                            {time}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-gray-600">
                          No time slots available for this date
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Selected Slot Summary */}
                {selectedDate && selectedTime && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-green-800 mb-1">
                          Selected Slot
                        </h4>
                        <p className="text-green-700">
                          {selectedDate} • {selectedTime}
                        </p>
                      </div>
                      <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                        Confirmed
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={() => navigate("/orders")}
              disabled={loading}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium disabled:opacity-50 cursor-pointer"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmReschedule}
              disabled={
                loading || !selectedDate || !selectedTime || fetchingSlots
              }
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Rescheduling...
                </>
              ) : (
                "Confirm Reschedule"
              )}
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default RescheduleService;
