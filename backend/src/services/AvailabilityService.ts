import { Types } from "mongoose";
import { RRule, RRuleSet } from "rrule";
import SlotRule, {
  ISlotRule,
  ITimeSlot,
} from "../models/technician/SlotRuleSchema";
import TechnicianAvailability from "../models/technician/TechnicianAvailabilitySchema";
import { ITechnicianAvailabilityService } from "@/interfaces/services/technician/ITechnicianAvailabilityService";
import { LoggerService } from "../services/LoggerService";

export class TechnicianAvailabilityService
  implements ITechnicianAvailabilityService
{
  private logger: LoggerService;

  constructor() {
    this.logger = new LoggerService();
  }

  async createTechnicianAvailabilityFromApplication(
    technicianId: string,
    applicationAvailability: any
  ): Promise<void> {
    const context = {
      operation: "createTechnicianAvailabilityFromApplication",
      data: { technicianId },
    };

    try {
      this.logger.info(
        "Creating technician availability from application",
        context
      );

      // Verify database connection first
      const dbConnected = await this.verifySlotRuleDatabaseConnection();
      if (!dbConnected) {
        this.logger.error(
          "Database connection failed for SlotRule collection",
          context
        );
        throw new Error("Database connection failed for SlotRule collection");
      }

      this.logger.debug("Database connection verified successfully", context);

      // Extract availability configuration from application
      const availabilityConfig = this.extractAvailabilityConfig(
        applicationAvailability
      );

      this.logger.info("Availability configuration extracted", {
        ...context,
        config: {
          availableDays: availabilityConfig.availableDays,
          startTime: availabilityConfig.startTime,
          endTime: availabilityConfig.endTime,
          slotDuration: availabilityConfig.slotDuration,
        },
      });

      if (availabilityConfig.availableDays.length === 0) {
        this.logger.warn("No available days found in application", context);
        throw new Error("No available days found in application");
      }

      // Create slot rules based on availability
      await this.createSlotRulesFromAvailability(
        technicianId,
        availabilityConfig
      );

      this.logger.debug("Slot rules created, verifying creation", context);

      // Verify slot rules were created - use a small delay to ensure database write
      await new Promise((resolve) => setTimeout(resolve, 100));

      const SlotRule = require("../models/technician/SlotRuleSchema").default;
      const slotRules = await SlotRule.find({
        technicianId: new Types.ObjectId(technicianId),
        isActive: true,
      });

      this.logger.debug("Slot rule verification query completed", {
        ...context,
        activeRulesFound: slotRules.length,
      });

      if (slotRules.length === 0) {
        const allRules = await SlotRule.find({
          technicianId: new Types.ObjectId(technicianId),
        });

        this.logger.warn("No active slot rules found after creation", {
          ...context,
          totalRulesFound: allRules.length,
        });

        if (allRules.length === 0) {
          throw new Error(
            "Failed to create slot rules - no rules found after creation"
          );
        } else {
          this.logger.info(
            "Found inactive rules, proceeding with generation",
            context
          );
        }
      } else {
        this.logger.info("Active slot rules verified successfully", {
          ...context,
          rulesCount: slotRules.length,
        });
      }

      // Generate actual availability slots for the next 3 months
      this.logger.info("Generating availability slots from rules", context);
      await this.generateAvailabilityFromRules(technicianId);

      this.logger.info(
        "Technician availability creation completed successfully",
        context
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("CRITICAL ERROR creating technician availability", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private async verifySlotRuleDatabaseConnection(): Promise<boolean> {
    const context = {
      operation: "verifySlotRuleDatabaseConnection",
    };

    try {
      this.logger.debug("Verifying SlotRule database connection", context);

      const SlotRule = require("../models/technician/SlotRuleSchema").default;

      const count = await SlotRule.countDocuments();

      this.logger.debug("SlotRule database connection verified", {
        ...context,
        documentCount: count,
      });

      return true;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("SlotRule database connection failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return false;
    }
  }

  private extractAvailabilityConfig(availabilityData: any): {
    availableDays: string[];
    startTime: string;
    endTime: string;
    slotDuration: number;
  } {
    const context = {
      operation: "extractAvailabilityConfig",
      data: {
        hasAvailabilityData: !!availabilityData,
        hasWeeklyPattern: !!(
          availabilityData?.weeklyPattern ||
          availabilityData?.availability?.weeklyPattern
        ),
      },
    };

    this.logger.debug("Extracting availability configuration", context);

    const availableDays: string[] = [];
    let startTime = "09:00";
    let endTime = "18:00";
    const slotDuration = 60;

    // Handle both direct weeklyPattern and nested structure
    const weeklyPattern =
      availabilityData?.weeklyPattern ||
      availabilityData?.availability?.weeklyPattern;

    if (!weeklyPattern) {
      this.logger.error(
        "No weekly pattern found in availability data",
        context
      );
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

        // Use timing from this day
        if (dayInfo.startTime && dayInfo.endTime) {
          startTime = dayInfo.startTime;
          endTime = dayInfo.endTime;
        }
      }
    });

    this.logger.debug("Processed weekly pattern", {
      ...context,
      availableDays,
      finalStartTime: startTime,
      finalEndTime: endTime,
    });

    if (availableDays.length === 0) {
      this.logger.error("No available days found in weekly pattern", {
        ...context,
        weeklyPatternKeys: Object.keys(weeklyPattern),
      });
      throw new Error("No available days found in weekly pattern");
    }

    this.logger.info("Availability configuration extracted successfully", {
      ...context,
      availableDaysCount: availableDays.length,
      timeRange: `${startTime} - ${endTime}`,
    });

    return {
      availableDays,
      startTime,
      endTime,
      slotDuration,
    };
  }

  private async createSlotRulesFromAvailability(
    technicianId: string,
    config: {
      availableDays: string[];
      startTime: string;
      endTime: string;
      slotDuration: number;
    }
  ): Promise<void> {
    const context = {
      operation: "createSlotRulesFromAvailability",
      data: { technicianId, availableDays: config.availableDays },
    };

    try {
      this.logger.info(
        "Creating slot rules from availability configuration",
        context
      );

      if (config.availableDays.length === 0) {
        this.logger.warn(
          "No available days provided for slot rule creation",
          context
        );
        return;
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

      const byweekday = config.availableDays
        .map((day) => dayMap[day])
        .filter(Boolean);

      this.logger.debug("Mapped available days to RRule weekdays", {
        ...context,
        byweekdayCount: byweekday.length,
        availableDays: config.availableDays,
      });

      if (byweekday.length === 0) {
        this.logger.warn("No valid weekdays found for technician", {
          ...context,
          availableDays: config.availableDays,
        });
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
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this.logger.debug("Creating slot rule in database", {
        ...context,
        slotRuleData: {
          ...slotRuleData,
          technicianId: slotRuleData.technicianId.toString(),
          rruleString: slotRuleData.rruleString.substring(0, 100) + "...", // truncate long string
        },
      });

      const SlotRule = require("../models/technician/SlotRuleSchema").default;

      const createdRule = await SlotRule.create(slotRuleData);

      this.logger.debug("Slot rule created, verifying save", {
        ...context,
        createdRuleId: createdRule._id?.toString(),
      });

      const savedRule = await SlotRule.findById(createdRule._id);
      if (!savedRule) {
        this.logger.error("Slot rule was not saved to database", {
          ...context,
          createdRuleId: createdRule._id?.toString(),
        });
        throw new Error("Slot rule was not saved to database");
      }

      this.logger.info("Slot rule created and verified successfully", {
        ...context,
        ruleId: savedRule._id?.toString(),
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error creating slot rule", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private async generateAvailabilityFromRules(
    technicianId: string
  ): Promise<void> {
    const context = {
      operation: "generateAvailabilityFromRules",
      data: { technicianId },
    };

    try {
      this.logger.info("Generating availability from slot rules", context);

      const slotRules = await SlotRule.find({
        technicianId: new Types.ObjectId(technicianId),
        isActive: true,
        effectiveFrom: { $lte: new Date() },
        $or: [
          { effectiveTo: { $exists: false } },
          { effectiveTo: { $gte: new Date() } },
        ],
      });

      this.logger.debug("Found active slot rules", {
        ...context,
        activeRulesCount: slotRules.length,
      });

      if (slotRules.length === 0) {
        this.logger.warn("No active slot rules found for technician", context);
        return;
      }

      const startDate = new Date();
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead

      this.logger.info("Processing slot rules to generate availability", {
        ...context,
        rulesToProcess: slotRules.length,
        dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      });

      let totalOccurrences = 0;
      let totalSlotsGenerated = 0;

      for (const rule of slotRules) {
        try {
          this.logger.debug("Processing rule for availability generation", {
            ...context,
            ruleId: rule._id?.toString(),
            ruleName: rule.name,
          });

          const rrule = RRule.fromString(rule.rruleString);
          const occurrences = rrule.between(startDate, endDate, true);

          this.logger.debug("Rule occurrences calculated", {
            ...context,
            ruleId: rule._id?.toString(),
            occurrencesCount: occurrences.length,
          });

          totalOccurrences += occurrences.length;

          for (const occurrence of occurrences) {
            const slots = await this.generateSlotsForDate(rule, occurrence);

            const startOfDay = new Date(occurrence);
            startOfDay.setHours(0, 0, 0, 0);

            const endOfDay = new Date(occurrence);
            endOfDay.setHours(23, 59, 59, 999);

            totalSlotsGenerated += slots.length;

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

          this.logger.debug("Rule processing completed", {
            ...context,
            ruleId: rule._id?.toString(),
            occurrencesProcessed: occurrences.length,
          });
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : "Unknown error occurred";
          this.logger.error(
            "Error processing rule for availability generation",
            {
              ...context,
              ruleId: rule._id?.toString(),
              error: errorMessage,
              stack: error instanceof Error ? error.stack : undefined,
            }
          );
        }
      }

      this.logger.info("Availability generation completed successfully", {
        ...context,
        totalOccurrences,
        totalSlotsGenerated,
        rulesProcessed: slotRules.length,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error generating availability from rules", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private async generateSlotsForDate(rule: any, date: Date): Promise<any[]> {
    const context = {
      operation: "generateSlotsForDate",
      data: {
        ruleId: rule._id?.toString(),
        date: date.toISOString(),
      },
    };

    try {
      this.logger.debug("Generating slots for date", context);

      const slots: any[] = [];

      // Parse start and end times
      const [startHour, startMinute] = rule.startTime.split(":").map(Number);
      const [endHour, endMinute] = rule.endTime.split(":").map(Number);

      const slotStart = new Date(date);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      this.logger.debug("Time range calculated for slots", {
        ...context,
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        slotDuration: rule.slotDurationMinutes,
      });

      let currentSlotStart = new Date(slotStart);
      let slotCount = 0;

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
        slotCount++;
      }

      this.logger.debug("Slots generated successfully", {
        ...context,
        slotsGenerated: slotCount,
      });

      return slots;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error generating slots for date", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return [];
    }
  }

  // Get available slots for a date range
  async getAvailableSlots(
    technicianId: string,
    startDate: Date,
    endDate: Date
  ): Promise<Array<{ date: Date; slots: ITimeSlot[] }>> {
    const context = {
      operation: "getAvailableSlots",
      data: {
        technicianId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };

    try {
      this.logger.info("Fetching available slots for technician", context);

      const availability = await TechnicianAvailability.find({
        technicianId: new Types.ObjectId(technicianId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: 1 });

      this.logger.debug("Availability records retrieved", {
        ...context,
        availabilityRecordsCount: availability.length,
      });

      const result = availability.map((avail) => {
        const availableSlots = (avail.timeSlots as any[])
          .filter((slot: any) => slot.status === "available")
          .map((slot: any) => {
            const plain =
              slot && typeof slot.toObject === "function"
                ? slot.toObject()
                : slot;
            return {
              ...plain,
              start:
                plain.start instanceof Date
                  ? plain.start
                  : new Date(plain.start),
              end: plain.end instanceof Date ? plain.end : new Date(plain.end),
            } as ITimeSlot;
          });

        return {
          date: avail.date,
          slots: availableSlots,
        };
      });

      const totalAvailableSlots = result.reduce(
        (total, day) => total + day.slots.length,
        0
      );

      this.logger.info("Available slots retrieved successfully", {
        ...context,
        daysWithAvailability: result.length,
        totalAvailableSlots,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error fetching available slots", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  // Update slot rules (for when technician changes availability)
  async updateTechnicianAvailability(
    technicianId: string,
    newAvailabilityConfig: any
  ): Promise<void> {
    const context = {
      operation: "updateTechnicianAvailability",
      data: { technicianId },
    };

    try {
      this.logger.info("Updating technician availability", context);

      // Deactivate old rules
      const deactivateResult = await SlotRule.updateMany(
        { technicianId: new Types.ObjectId(technicianId), isActive: true },
        { isActive: false, effectiveTo: new Date() }
      );

      this.logger.info("Old slot rules deactivated", {
        ...context,
        rulesDeactivated: deactivateResult.modifiedCount,
      });

      // Clear existing availability
      const deleteResult = await TechnicianAvailability.deleteMany({
        technicianId: new Types.ObjectId(technicianId),
        date: { $gte: new Date() },
      });

      this.logger.info("Existing availability cleared", {
        ...context,
        availabilityRecordsDeleted: deleteResult.deletedCount,
      });

      // Create new availability
      await this.createTechnicianAvailabilityFromApplication(
        technicianId,
        newAvailabilityConfig
      );

      this.logger.info("Technician availability updated successfully", context);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Error updating technician availability", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
