import { Types } from "mongoose";
import TechnicianAvailability from "../models/technician/TechnicianAvailabilitySchema";
import SlotRule from "../models/technician/SlotRuleSchema";

export class TechnicianAvailabilityService {
  async createTechnicianAvailabilityFromApplication(
    technicianId: string,
    applicationAvailability: any
  ): Promise<void> {
    try {
      const availableDays = this.extractAvailableDays(applicationAvailability);

      if (availableDays.length === 0) {
        return;
      }

      const timing = this.extractTiming(
        applicationAvailability,
        availableDays[0]
      );

      // Generate availability for next 8 weeks
      await this.generateAvailabilitySlots(
        technicianId,
        availableDays,
        timing.startTime,
        timing.endTime
      );

      // Create default slot rules
      await this.createDefaultSlotRules(technicianId);
    } catch (error) {
      console.error("Error creating technician availability:", error);
    }
  }

  private extractAvailableDays(availabilityData: any): string[] {
    const availableDays: string[] = [];
    const dayMap: { [key: string]: string } = {
      monday: "monday",
      tuesday: "tuesday",
      wednesday: "wednesday",
      thursday: "thursday",
      friday: "friday",
      saturday: "saturday",
      sunday: "sunday",
    };

    let daysObject = null;

    if (
      availabilityData.availability &&
      availabilityData.availability.availability
    ) {
      daysObject = availabilityData.availability.availability;
    } else if (availabilityData.availability) {
      daysObject = availabilityData.availability;
    } else {
      daysObject = availabilityData;
    }

    // Extract available days from the correct object
    Object.entries(daysObject).forEach(([day, dayInfo]: [string, any]) => {
      // Skip non-day properties
      if (!dayMap[day]) {
        return;
      }

      if (
        dayInfo &&
        typeof dayInfo === "object" &&
        dayInfo.available === true
      ) {
        availableDays.push(day);
      }
    });

    return availableDays;
  }

  private extractTiming(
    availabilityData: any,
    firstDay: string
  ): { startTime: string; endTime: string } {
    const defaultTiming = { startTime: "09:00", endTime: "18:00" };

    let daysObject = null;

    if (
      availabilityData.availability &&
      availabilityData.availability.availability
    ) {
      daysObject = availabilityData.availability.availability;
    } else if (availabilityData.availability) {
      daysObject = availabilityData.availability;
    } else {
      daysObject = availabilityData;
    }

    const dayData = daysObject[firstDay];

    if (!dayData) {
      return defaultTiming;
    }

    return {
      startTime: dayData.startTime || defaultTiming.startTime,
      endTime: dayData.endTime || defaultTiming.endTime,
    };
  }

  private async generateAvailabilitySlots(
    technicianId: string,
    availableDays: string[],
    startTime: string,
    endTime: string
  ): Promise<void> {
    const dayNumbers = this.convertDaysToNumbers(availableDays);
    const dates = this.generateDates(new Date(), 8, dayNumbers);

    for (const date of dates) {
      const timeSlots = this.generateTimeSlots(startTime, endTime, 60);

      await TechnicianAvailability.findOneAndUpdate(
        {
          technicianId: new Types.ObjectId(technicianId),
          date: date,
        },
        {
          technicianId: new Types.ObjectId(technicianId),
          date: date,
          timeSlots: timeSlots,
          isRecurring: false,
        },
        { upsert: true, new: true }
      );
    }
  }

  private async createDefaultSlotRules(technicianId: string): Promise<void> {
    const defaultRule = {
      technicianId: new Types.ObjectId(technicianId),
      name: "Default Working Hours",
      daysOfWeek: [1, 2, 3, 4, 5], // Monday-Friday
      startTime: "09:00",
      endTime: "18:00",
      slotDurationMinutes: 60,
      isActive: true,
      effectiveFrom: new Date(),
    };

    await SlotRule.create(defaultRule);
  }

  // Utility methods
  private convertDaysToNumbers(days: string[]): number[] {
    const dayMap: { [key: string]: number } = {
      sunday: 0,
      monday: 1,
      tuesday: 2,
      wednesday: 3,
      thursday: 4,
      friday: 5,
      saturday: 6,
    };
    return days
      .map((day) => dayMap[day.toLowerCase()])
      .filter((day) => day !== undefined);
  }

  private generateDates(
    startDate: Date,
    weeksAhead: number,
    dayNumbers: number[]
  ): Date[] {
    const dates: Date[] = [];
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + weeksAhead * 7);

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      if (dayNumbers.includes(currentDate.getDay())) {
        dates.push(new Date(currentDate));
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
  }

  private generateTimeSlots(
    startTime: string,
    endTime: string,
    slotDuration: number
  ): any[] {
    const slots: any[] = [];
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

      let slotEndHour = currentHour;
      let slotEndMinute = currentMinute + slotDuration;

      while (slotEndMinute >= 60) {
        slotEndHour++;
        slotEndMinute -= 60;
      }

      const slotEnd = `${slotEndHour
        .toString()
        .padStart(2, "0")}:${slotEndMinute.toString().padStart(2, "0")}`;

      if (
        slotEndHour > endHour ||
        (slotEndHour === endHour && slotEndMinute > endMinute)
      ) {
        break;
      }

      slots.push({
        start: slotStart,
        end: slotEnd,
        status: "available",
      });

      currentMinute += slotDuration;
      while (currentMinute >= 60) {
        currentHour++;
        currentMinute -= 60;
      }
    }

    return slots;
  }
}
