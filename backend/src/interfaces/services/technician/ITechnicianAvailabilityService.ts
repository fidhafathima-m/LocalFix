// interfaces/services/technician/ITechnicianAvailabilityService.ts
export interface SetAvailabilityRequest {
  days: string[]; // ['monday', 'tuesday', ...]
  startTime: string;
  endTime: string;
  slotDuration: number;
  startDate: Date;
  weeksAhead: number;
}

export interface ITechnicianAvailabilityService {
  setAvailability(technicianId: string, data: SetAvailabilityRequest): Promise<void>;
  createDefaultSlotRules(technicianId: string): Promise<void>;
  getAvailability(technicianId: string, date: Date): Promise<any>;
  getWeeklyAvailability(technicianId: string, startDate: Date): Promise<any[]>;
  updateTimeSlot(technicianId: string, date: Date, slotIndex: number, updates: any): Promise<any>;
  blockTimeSlot(technicianId: string, date: Date, startTime: string, endTime: string): Promise<any>;
}