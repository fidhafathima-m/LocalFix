import { Types } from "mongoose";
import {
  ITechnicianAvailability,
  ITimeSlot,
} from "../../../models/technician/TechnicianAvailabilitySchema";
import { ISlotRule } from "../../../models/technician/SlotRuleSchema";

export interface ITechnicianAvailabilityRepository {
  // Availability methods
  findByTechnicianAndDate(
    technicianId: Types.ObjectId,
    date: Date
  ): Promise<ITechnicianAvailability | null>;
  findByTechnicianAndDateRange(
    technicianId: Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<ITechnicianAvailability[]>;
  upsertAvailability(
    availabilityData: Partial<ITechnicianAvailability>
  ): Promise<ITechnicianAvailability>;
  updateTimeSlot(
    technicianId: Types.ObjectId,
    date: Date,
    slotIndex: number,
    updates: Partial<ITimeSlot>
  ): Promise<ITechnicianAvailability | null>;

  // SlotRule methods
  createSlotRule(slotRuleData: Partial<ISlotRule>): Promise<ISlotRule>;
  findActiveSlotRulesByTechnician(
    technicianId: Types.ObjectId
  ): Promise<ISlotRule[]>;
  findDefaultSlotRules(): Promise<ISlotRule[]>;
}
