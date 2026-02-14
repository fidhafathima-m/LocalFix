export class TimeSlotHelper {
  /**
   * Parse time slot string to start and end times
   * Supports formats: "15:00-16:00", "3:00 PM-4:00 PM", "3 PM - 4 PM"
   */
  static parseTimeSlot(timeSlot: string): { start: Date; end: Date } | null {
    try {
      // Clean the time slot string
      const cleanSlot = timeSlot.trim().toLowerCase();

      // Format 1: "15:00-16:00" (24-hour format)
      if (cleanSlot.includes('-') && cleanSlot.includes(':')) {
        const [startStr, endStr] = cleanSlot.split('-').map(s => s.trim());

        const startTime = this.parseTimeString(startStr);
        const endTime = this.parseTimeString(endStr);

        if (startTime && endTime) {
          // Create dates with the same base date (we'll adjust date later)
          const baseDate = new Date();
          const start = new Date(baseDate);
          start.setHours(startTime.hours, startTime.minutes, 0, 0);

          const end = new Date(baseDate);
          end.setHours(endTime.hours, endTime.minutes, 0, 0);

          return { start, end };
        }
      }

      // Format 2: "3:00 PM - 4:00 PM" (12-hour format)
      if (cleanSlot.includes('pm') || cleanSlot.includes('am')) {
        const [startStr, endStr] = cleanSlot
          .split(/\s+-\s+/)
          .map(s => s.trim());

        const startTime = this.parse12HourTime(startStr);
        const endTime = this.parse12HourTime(endStr);

        if (startTime && endTime) {
          const baseDate = new Date();
          const start = new Date(baseDate);
          start.setHours(startTime.hours, startTime.minutes, 0, 0);

          const end = new Date(baseDate);
          end.setHours(endTime.hours, endTime.minutes, 0, 0);

          return { start, end };
        }
      }

      return null;
    } catch (error) {
      console.error('Error parsing time slot:', error);
      return null;
    }
  }

  private static parseTimeString(
    timeStr: string
  ): { hours: number; minutes: number } | null {
    // Parse "15:30" format
    const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return { hours, minutes };
      }
    }
    return null;
  }

  private static parse12HourTime(
    timeStr: string
  ): { hours: number; minutes: number } | null {
    // Parse "3:30 PM" format
    const match = timeStr.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (match) {
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toLowerCase();

      // Convert 12-hour to 24-hour
      if (period === 'pm' && hours !== 12) {
        hours += 12;
      } else if (period === 'am' && hours === 12) {
        hours = 0;
      }

      if (hours >= 0 && hours <= 23 && minutes >= 0 && minutes <= 59) {
        return { hours, minutes };
      }
    }
    return null;
  }

  /**
   * Check if two time slots overlap
   */
  static doSlotsOverlap(
    slot1Start: Date,
    slot1End: Date,
    slot2Start: Date,
    slot2End: Date
  ): boolean {
    return slot1Start < slot2End && slot2Start < slot1End;
  }

  /**
   * Format time to string for display
   */
  static formatTimeSlot(start: Date, end: Date): string {
    const formatTime = (date: Date) => {
      return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
    };

    return `${formatTime(start)} - ${formatTime(end)}`;
  }

  /**
   * Calculate slot duration in minutes
   */
  static getSlotDuration(start: Date, end: Date): number {
    return (end.getTime() - start.getTime()) / (1000 * 60);
  }
}
