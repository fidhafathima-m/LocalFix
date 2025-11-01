// services/technician/TechnicianAvailabilityService.ts
import { Types } from "mongoose";
import { RRule, RRuleSet } from "rrule";
import SlotRule, {
  ISlotRule,
  ITimeSlot,
} from "../models/technician/SlotRuleSchema";
import TechnicianAvailability from "../models/technician/TechnicianAvailabilitySchema";
import { ITechnicianAvailabilityService } from "@/interfaces/services/technician/ITechnicianAvailabilityService";

export class TechnicianAvailabilityService
  implements ITechnicianAvailabilityService
{
  // In TechnicianAvailabilityService.ts - FIXED VERSION
async createTechnicianAvailabilityFromApplication(
  technicianId: string,
  applicationAvailability: any
): Promise<void> {
  try {
    console.log("=== CREATE AVAILABILITY FROM APPLICATION ===");
    console.log("Technician ID:", technicianId);
    console.log("Application availability:", JSON.stringify(applicationAvailability, null, 2));
    
    // Verify database connection first
    const dbConnected = await this.verifySlotRuleDatabaseConnection();
    if (!dbConnected) {
      throw new Error("Database connection failed for SlotRule collection");
    }
    
    // Extract availability configuration from application
    const availabilityConfig = this.extractAvailabilityConfig(applicationAvailability);
    console.log("✅ Extracted availability config:", availabilityConfig);
    
    if (availabilityConfig.availableDays.length === 0) {
      console.log("⚠️ No available days found in application availability");
      throw new Error("No available days found in application");
    }
    
    // Create slot rules based on availability
    console.log("🔄 Creating slot rules...");
    await this.createSlotRulesFromAvailability(technicianId, availabilityConfig);
    
    // Verify slot rules were created - use a small delay to ensure database write
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const SlotRule = require('../models/technician/SlotRuleSchema').default;
    const slotRules = await SlotRule.find({ 
      technicianId: new Types.ObjectId(technicianId),
      isActive: true 
    });
    
    console.log(`✅ Verification: ${slotRules.length} slot rules created for technician ${technicianId}`);
    
    if (slotRules.length === 0) {
      // Try one more time with a different query
      const allRules = await SlotRule.find({ technicianId: new Types.ObjectId(technicianId) });
      console.log(`🔍 All rules for technician (including inactive): ${allRules.length}`);
      
      if (allRules.length === 0) {
        throw new Error("Failed to create slot rules - no rules found after creation");
      } else {
        console.log("ℹ️ Found rules but they might not be active:", allRules.map((r: { _id: any; isActive: any; }) => ({ id: r._id, active: r.isActive })));
      }
    }
    
    // Generate actual availability slots for the next 3 months
    console.log("🔄 Generating availability from rules...");
    await this.generateAvailabilityFromRules(technicianId);
    
    console.log("✅ Availability creation completed for technician:", technicianId);
    
  } catch (error) {
    console.error("❌ CRITICAL ERROR creating technician availability:", error);
    throw error;
  }
}

// Add this method to TechnicianAvailabilityService
private async verifySlotRuleDatabaseConnection(): Promise<boolean> {
  try {
    const SlotRule = require('../models/technician/SlotRuleSchema').default;
    
    // Try a simple count operation to verify connection
    const count = await SlotRule.countDocuments();
    console.log(`✅ SlotRule collection connection verified. Document count: ${count}`);
    return true;
  } catch (error) {
    console.error("❌ SlotRule database connection failed:", error);
    return false;
  }
}

private extractAvailabilityConfig(availabilityData: any): {
  availableDays: string[];
  startTime: string;
  endTime: string;
  slotDuration: number;
} {
  console.log("🔄 Extracting availability config from:", availabilityData);

  const availableDays: string[] = [];
  let startTime = "09:00";
  let endTime = "18:00";
  const slotDuration = 60;

  // Handle both direct weeklyPattern and nested structure
  const weeklyPattern = availabilityData?.weeklyPattern || 
                       availabilityData?.availability?.weeklyPattern;

  console.log("Weekly pattern for extraction:", weeklyPattern);

  if (!weeklyPattern) {
    console.log("❌ No weekly pattern found in availability data");
    throw new Error("No weekly pattern found in availability data");
  }

  const dayMap: { [key: string]: any } = {
    monday: RRule.MO,
    tuesday: RRule.TU,
    wednesday: RRule.WE,
    thursday: RRule.TH,
    friday: RRule.FR,
    saturday: RRule.SA,
    sunday: RRule.SU,
  };

  Object.entries(weeklyPattern).forEach(([day, dayInfo]: [string, any]) => {
    const dayLower = day.toLowerCase();
    if (dayInfo?.available === true) {
      availableDays.push(dayLower);
      console.log(`✅ ${dayLower} marked as available`);
      
      // Use timing from this day
      if (dayInfo.startTime && dayInfo.endTime) {
        startTime = dayInfo.startTime;
        endTime = dayInfo.endTime;
        console.log(`⏰ Using timing from ${dayLower}: ${startTime} - ${endTime}`);
      }
    }
  });

  if (availableDays.length === 0) {
    console.log("❌ No available days found in weekly pattern");
    throw new Error("No available days found in weekly pattern");
  }

  console.log("✅ Final extracted config:", {
    availableDays,
    startTime,
    endTime,
    slotDuration
  });

  return {
    availableDays,
    startTime,
    endTime,
    slotDuration,
  };
}

 // In TechnicianAvailabilityService.ts - FIX THE SLOT RULE CREATION
private async createSlotRulesFromAvailability(
  technicianId: string,
  config: { availableDays: string[]; startTime: string; endTime: string; slotDuration: number }
): Promise<void> {
  if (config.availableDays.length === 0) {
    console.log("❌ No available days to create slot rules for technician:", technicianId);
    return;
  }

  console.log("🔄 Creating slot rules for technician:", technicianId, "with config:", config);

  const dayMap: { [key: string]: any } = {
    monday: RRule.MO,
    tuesday: RRule.TU,
    wednesday: RRule.WE,
    thursday: RRule.TH,
    friday: RRule.FR,
    saturday: RRule.SA,
    sunday: RRule.SU,
  };

  const byweekday = config.availableDays.map(day => dayMap[day]).filter(Boolean);

  if (byweekday.length === 0) {
    console.warn("❌ No valid weekdays found for technician:", technicianId);
    return;
  }

  // Create RRule for the availability pattern
  const rule = new RRule({
    freq: RRule.WEEKLY,
    byweekday,
    dtstart: new Date(), // Start from today
    until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months ahead
  });

  const slotRuleData = {
    technicianId: new Types.ObjectId(technicianId),
    name: "Primary Working Hours",
    rruleString: rule.toString(),
    startTime: config.startTime,
    endTime: config.endTime,
    slotDurationMinutes: config.slotDuration,
    bookingBufferBeforeMinutes: 60, // 1 hour buffer
    bookingBufferAfterMinutes: 30, // 30 minutes buffer
    maxBookingsPerSlot: 1,
    effectiveFrom: new Date(),
    isActive: true,
    createdAt: new Date(), // ADD THIS
    updatedAt: new Date(), // ADD THIS
  };

  console.log("🔄 Creating slot rule with data:", slotRuleData);

  try {
    // IMPORTANT: Make sure we're using the correct SlotRule model
    const SlotRule = require('../models/technician/SlotRuleSchema').default;
    
    const createdRule = await SlotRule.create(slotRuleData);
    console.log("✅ Slot rule created successfully:", createdRule._id);
    console.log("✅ RRule string:", createdRule.rruleString);
    
    // Verify the rule was actually saved
    const savedRule = await SlotRule.findById(createdRule._id);
    if (!savedRule) {
      throw new Error("Slot rule was not saved to database");
    }
    console.log("✅ Slot rule verified in database:", savedRule._id);
    
  } catch (error) {
    console.error("❌ Error creating slot rule:", error);
    throw error;
  }
}

  private async generateAvailabilityFromRules(
    technicianId: string
  ): Promise<void> {
    const slotRules = await SlotRule.find({
      technicianId: new Types.ObjectId(technicianId),
      isActive: true,
      effectiveFrom: { $lte: new Date() },
      $or: [
        { effectiveTo: { $exists: false } },
        { effectiveTo: { $gte: new Date() } },
      ],
    });

    if (slotRules.length === 0) {
      console.warn("No active slot rules found for technician:", technicianId);
      return;
    }

    const startDate = new Date();
    const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead

    for (const rule of slotRules) {
      try {
        // FIXED: Use the RRule from the rule string
        const rrule = RRule.fromString(rule.rruleString);
        const occurrences = rrule.between(startDate, endDate, true);

        for (const occurrence of occurrences) {
          // FIXED: Generate slots for this occurrence
          const slots = await this.generateSlotsForDate(rule, occurrence);

          const startOfDay = new Date(occurrence);
          startOfDay.setHours(0, 0, 0, 0);

          const endOfDay = new Date(occurrence);
          endOfDay.setHours(23, 59, 59, 999);

          await TechnicianAvailability.findOneAndUpdate(
            {
              technicianId: new Types.ObjectId(technicianId),
              date: {
                $gte: startOfDay,
                $lt: endOfDay,
              },
            },
            {
              technicianId: new Types.ObjectId(technicianId),
              date: occurrence,
              timeSlots: slots,
              isRecurring: true,
              slotRuleId: rule._id,
            },
            { upsert: true, new: true }
          );
        }
      } catch (error) {
        console.error("Error processing rule:", rule._id, error);
      }
    }
  }

  // FIXED: Add missing method to generate slots for a date
  private async generateSlotsForDate(rule: any, date: Date): Promise<any[]> {
    const slots: any[] = [];

    // Parse start and end times
    const [startHour, startMinute] = rule.startTime.split(":").map(Number);
    const [endHour, endMinute] = rule.endTime.split(":").map(Number);

    const slotStart = new Date(date);
    slotStart.setHours(startHour, startMinute, 0, 0);

    const slotEnd = new Date(date);
    slotEnd.setHours(endHour, endMinute, 0, 0);

    let currentSlotStart = new Date(slotStart);

    while (currentSlotStart < slotEnd) {
      const currentSlotEnd = new Date(
        currentSlotStart.getTime() + rule.slotDurationMinutes * 60000
      );

      if (currentSlotEnd > slotEnd) break;

      slots.push({
        start: new Date(currentSlotStart),
        end: new Date(currentSlotEnd),
        status: "available",
        maxBookings: rule.maxBookingsPerSlot,
        currentBookings: 0,
      });

      currentSlotStart = new Date(currentSlotEnd);
    }

    return slots;
  }

  // Get available slots for a date range
  async getAvailableSlots(
    technicianId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: Date; slots: ITimeSlot[] }>> {
    const availability = await TechnicianAvailability.find({
      technicianId: new Types.ObjectId(technicianId),
      date: {
        $gte: startDate,
        $lte: endDate,
      },
    }).sort({ date: 1 });

    return availability.map((avail) => ({
      date: avail.date,
      slots: (avail.timeSlots as any[])
        .filter((slot: any) => slot.status === "available")
        .map((slot: any) => {
          const plain =
            slot && typeof slot.toObject === "function"
              ? slot.toObject()
              : slot;
          return {
            ...plain,
            start:
              plain.start instanceof Date ? plain.start : new Date(plain.start),
            end: plain.end instanceof Date ? plain.end : new Date(plain.end),
          } as ITimeSlot;
        }),
    }));
  }

  // Update slot rules (for when technician changes availability)
  async updateTechnicianAvailability(
    technicianId: string,
    newAvailabilityConfig: any
  ): Promise<void> {
    // Deactivate old rules
    await SlotRule.updateMany(
      { technicianId: new Types.ObjectId(technicianId), isActive: true },
      { isActive: false, effectiveTo: new Date() }
    );

    // Clear existing availability
    await TechnicianAvailability.deleteMany({
      technicianId: new Types.ObjectId(technicianId),
      date: { $gte: new Date() },
    });

    // Create new availability
    await this.createTechnicianAvailabilityFromApplication(
      technicianId,
      newAvailabilityConfig
    );
  }
}
