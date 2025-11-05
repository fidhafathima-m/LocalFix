import { ITimeSlot } from "@/models/technician/SlotRuleSchema";

export interface SetAvailabilityRequest {
  days: string[]; // ['monday', 'tuesday', ...]
  startTime: string;
  endTime: string;
  slotDuration: number;
  startDate: Date;
  weeksAhead: number;
}

export interface ITechnicianAvailabilityService {
  createTechnicianAvailabilityFromApplication(
    technicianId: string,
    applicationAvailability: any
  ): Promise<void>;
  getAvailableSlots(
    technicianId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: Date; slots: ITimeSlot[] }>>;
  updateTechnicianAvailability(
    technicianId: string,
    newAvailabilityConfig: any
  ): Promise<void>;
}
