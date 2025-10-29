import { Types } from "mongoose";
import { ITechnicianAvailabilityRepository } from "../../interfaces/repository/technician/ITechncianAvailabilityRepository";
import TechnicianAvailability, {
  ITechnicianAvailability,
  ITimeSlot,
} from "../../models/technician/TechnicianAvailabilitySchema";
import SlotRule, { ISlotRule } from "../../models/technician/SlotRuleSchema";

export class TechnicianAvailabilityRepository
  implements ITechnicianAvailabilityRepository
{
  // Availability methods
  async findByTechnicianAndDate(
    technicianId: Types.ObjectId,
    date: Date
  ): Promise<ITechnicianAvailability | null> {
    return await TechnicianAvailability.findOne({
      technicianId,
      date: {
        $gte: new Date(date.setHours(0, 0, 0, 0)),
        $lt: new Date(date.setHours(23, 59, 59, 999)),
      },
    });
  }

  async findByTechnicianAndDateRange(
    technicianId: Types.ObjectId,
    startDate: Date,
    endDate: Date
  ): Promise<ITechnicianAvailability[]> {
    return await TechnicianAvailability.find({
      technicianId,
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });
  }

  async upsertAvailability(
    availabilityData: Partial<ITechnicianAvailability>
  ): Promise<ITechnicianAvailability> {
    if (!availabilityData.technicianId || !availabilityData.date) {
      throw new Error("technicianId and date are required");
    }

    return await TechnicianAvailability.findOneAndUpdate(
      {
        technicianId: availabilityData.technicianId,
        date: availabilityData.date,
      },
      availabilityData,
      { upsert: true, new: true, runValidators: true }
    );
  }

  async updateTimeSlot(
    technicianId: Types.ObjectId,
    date: Date,
    slotIndex: number,
    updates: Partial<ITimeSlot>
  ): Promise<ITechnicianAvailability | null> {
    const setUpdate: any = {};
    for (const [key, value] of Object.entries(updates)) {
      setUpdate[`timeSlots.${slotIndex}.${key}`] = value;
    }

    return await TechnicianAvailability.findOneAndUpdate(
      {
        technicianId,
        date: {
          $gte: new Date(date.setHours(0, 0, 0, 0)),
          $lt: new Date(date.setHours(23, 59, 59, 999)),
        },
      },
      { $set: setUpdate },
      { new: true }
    );
  }

  // SlotRule methods
  async createSlotRule(slotRuleData: Partial<ISlotRule>): Promise<ISlotRule> {
    const slotRule = new SlotRule(slotRuleData);
    return await slotRule.save();
  }

  async findActiveSlotRulesByTechnician(
    technicianId: Types.ObjectId
  ): Promise<ISlotRule[]> {
    const now = new Date();
    return await SlotRule.find({
      technicianId,
      isActive: true,
      effectiveFrom: { $lte: now },
      $or: [
        { effectiveTo: { $exists: false } },
        { effectiveTo: { $gte: now } },
      ],
    });
  }

  async findDefaultSlotRules(): Promise<ISlotRule[]> {
    const now = new Date();
    return await SlotRule.find({
      technicianId: { $exists: false },
      isActive: true,
      effectiveFrom: { $lte: now },
      $or: [
        { effectiveTo: { $exists: false } },
        { effectiveTo: { $gte: now } },
      ],
    });
  }
}
