import { Types } from 'mongoose';
import { RRule } from 'rrule';
import SlotRule, {
  ISlotRule,
  ITimeSlot,
} from '../models/technician/SlotRuleSchema';
import TechnicianAvailability from '../models/technician/TechnicianAvailabilitySchema';
import { ITechnicianAvailabilityService } from '@/interfaces/services/technician/ITechnicianAvailabilityService';
import { ILogger } from '@/interfaces/utils/ILogger';
import {
  ApplicationAvailability,
  AvailabilityConfig,
  AvailabilityDayConfig,
  TimePattern,
  SlotRuleData,
  GeneratedSlot,
  DayAvailability,
  WeeklyPattern,
  WeeklyPatternDay,
  DayMap,
} from '../interfaces/technician/IAvailability';

export class TechnicianAvailabilityService
  implements ITechnicianAvailabilityService
{
  private _logger: ILogger;
  private readonly dayMap: DayMap = {
    monday: RRule.MO.weekday,
    tuesday: RRule.TU.weekday,
    wednesday: RRule.WE.weekday,
    thursday: RRule.TH.weekday,
    friday: RRule.FR.weekday,
    saturday: RRule.SA.weekday,
    sunday: RRule.SU.weekday,
  };

  constructor(logger: ILogger) {
    this._logger = logger;
  }

  async createTechnicianAvailabilityFromApplication(
    technicianId: string,
    applicationAvailability: ApplicationAvailability
  ): Promise<void> {
    const context = {
      operation: 'createTechnicianAvailabilityFromApplication',
      data: { technicianId },
    };

    try {
      this._logger.info(
        'Creating technician availability from application',
        context
      );

      // Verify database connection first
      const dbConnected = await this.verifySlotRuleDatabaseConnection();
      if (!dbConnected) {
        this._logger.error(
          'Database connection failed for SlotRule collection',
          context
        );
        throw new Error('Database connection failed for SlotRule collection');
      }

      this._logger.debug('Database connection verified successfully', context);

      // Extract availability configuration from application
      const availabilityConfig = this.extractAvailabilityConfig(
        applicationAvailability
      );

      this._logger.info('Availability configuration extracted', {
        ...context,
        config: {
          availableDays: availabilityConfig.availableDays.map(
            ad => `${ad.day}: ${ad.startTime}-${ad.endTime}`
          ),
          slotDuration: availabilityConfig.slotDuration,
        },
      });

      if (availabilityConfig.availableDays.length === 0) {
        this._logger.warn('No available days found in application', context);
        throw new Error('No available days found in application');
      }

      // Create slot rules based on availability
      await this.createSlotRulesFromAvailability(
        technicianId,
        availabilityConfig
      );

      this._logger.debug('Slot rules created, verifying creation', context);

      // Verify slot rules were created - use a small delay to ensure database write
      await new Promise(resolve => setTimeout(resolve, 100));

      const SlotRule = require('../models/technician/SlotRuleSchema').default;
      const slotRules = await SlotRule.find({
        technicianId: new Types.ObjectId(technicianId),
        isActive: true,
      });

      this._logger.debug('Slot rule verification query completed', {
        ...context,
        activeRulesFound: slotRules.length,
      });

      if (slotRules.length === 0) {
        const allRules = await SlotRule.find({
          technicianId: new Types.ObjectId(technicianId),
        });

        this._logger.warn('No active slot rules found after creation', {
          ...context,
          totalRulesFound: allRules.length,
        });

        if (allRules.length === 0) {
          throw new Error(
            'Failed to create slot rules - no rules found after creation'
          );
        } else {
          this._logger.info(
            'Found inactive rules, proceeding with generation',
            context
          );
        }
      } else {
        this._logger.info('Active slot rules verified successfully', {
          ...context,
          rulesCount: slotRules.length,
        });
      }

      // Generate actual availability slots for the next 3 months
      this._logger.info('Generating availability slots from rules', context);
      await this.generateAvailabilityFromRules(technicianId);

      this._logger.info(
        'Technician availability creation completed successfully',
        context
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('CRITICAL ERROR creating technician availability', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private async verifySlotRuleDatabaseConnection(): Promise<boolean> {
    const context = {
      operation: 'verifySlotRuleDatabaseConnection',
    };

    try {
      this._logger.debug('Verifying SlotRule database connection', context);

      const SlotRule = require('../models/technician/SlotRuleSchema').default;

      const count = await SlotRule.countDocuments();

      this._logger.debug('SlotRule database connection verified', {
        ...context,
        documentCount: count,
      });

      return true;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('SlotRule database connection failed', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return false;
    }
  }

  private extractAvailabilityConfig(
    availabilityData: ApplicationAvailability
  ): AvailabilityConfig {
    const context = {
      operation: 'extractAvailabilityConfig',
      data: {
        hasAvailabilityData: !!availabilityData,
        hasWeeklyPattern: !!(
          availabilityData?.weeklyPattern ||
          availabilityData?.availability?.weeklyPattern
        ),
      },
    };

    this._logger.debug('Extracting availability configuration', context);

    const availableDays: AvailabilityDayConfig[] = [];
    const slotDuration = 60;

    // Handle both direct weeklyPattern and nested structure
    const weeklyPattern: WeeklyPattern | undefined =
      availabilityData?.weeklyPattern ||
      availabilityData?.availability?.weeklyPattern;

    if (!weeklyPattern) {
      this._logger.error(
        'No weekly pattern found in availability data',
        context
      );
      throw new Error('No weekly pattern found in availability data');
    }

    Object.entries(weeklyPattern).forEach(([day, dayInfo]) => {
      const dayLower = day.toLowerCase();
      if (dayInfo?.available === true && dayInfo.startTime && dayInfo.endTime) {
        availableDays.push({
          day: dayLower,
          startTime: dayInfo.startTime,
          endTime: dayInfo.endTime,
        });
      }
    });

    this._logger.debug('Processed weekly pattern', {
      ...context,
      availableDays: availableDays.map(
        ad => `${ad.day}: ${ad.startTime}-${ad.endTime}`
      ),
    });

    if (availableDays.length === 0) {
      this._logger.error('No available days found in weekly pattern', {
        ...context,
        weeklyPatternKeys: Object.keys(weeklyPattern),
      });
      throw new Error('No available days found in weekly pattern');
    }

    this._logger.info('Availability configuration extracted successfully', {
      ...context,
      availableDaysCount: availableDays.length,
      daySpecificTimings: availableDays,
    });

    return {
      availableDays,
      slotDuration,
    };
  }

  private async createSlotRulesFromAvailability(
    technicianId: string,
    config: AvailabilityConfig
  ): Promise<void> {
    const context = {
      operation: 'createSlotRulesFromAvailability',
      data: {
        technicianId,
        availableDaysCount: config.availableDays.length,
      },
    };

    try {
      this._logger.info(
        'Creating slot rules from availability configuration',
        context
      );

      if (config.availableDays.length === 0) {
        this._logger.warn(
          'No available days provided for slot rule creation',
          context
        );
        return;
      }

      // Group days by their time patterns to create efficient RRules
      const timePatterns = this.groupDaysByTimePattern(config.availableDays);

      this._logger.debug('Grouped days by time patterns', {
        ...context,
        timePatternsCount: timePatterns.length,
        patterns: timePatterns.map(p => ({
          days: p.days,
          time: `${p.startTime}-${p.endTime}`,
        })),
      });

      // Create separate slot rules for each time pattern
      for (const pattern of timePatterns) {
        if (pattern.days.length > 0) {
          await this.createSlotRuleForPattern(
            technicianId,
            pattern,
            config.slotDuration
          );
        }
      }

      this._logger.info('All slot rules created successfully', {
        ...context,
        rulesCreated: timePatterns.length,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error creating slot rules', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private groupDaysByTimePattern(
    availableDays: AvailabilityDayConfig[]
  ): TimePattern[] {
    const patterns: Record<string, TimePattern> = {};

    availableDays.forEach(dayConfig => {
      const patternKey = `${dayConfig.startTime}-${dayConfig.endTime}`;

      if (!patterns[patternKey]) {
        patterns[patternKey] = {
          days: [],
          startTime: dayConfig.startTime,
          endTime: dayConfig.endTime,
        };
      }

      patterns[patternKey].days.push(dayConfig.day);
    });

    return Object.values(patterns);
  }

  private async createSlotRuleForPattern(
    technicianId: string,
    pattern: TimePattern,
    slotDuration: number
  ): Promise<void> {
    const context = {
      operation: 'createSlotRuleForPattern',
      data: {
        technicianId,
        days: pattern.days,
        timeRange: `${pattern.startTime}-${pattern.endTime}`,
      },
    };

    try {
      this._logger.debug('Creating slot rule for time pattern', context);

      const byweekday = pattern.days
        .map(day => this.dayMap[day])
        .filter((day): day is number => day !== undefined);

      if (byweekday.length === 0) {
        this._logger.warn('No valid weekdays found for pattern', context);
        return;
      }

      // Create RRule for this specific time pattern
      const rule = new RRule({
        freq: RRule.WEEKLY,
        byweekday,
        dtstart: new Date(),
        until: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 3 months ahead
      });

      const slotRuleData: SlotRuleData = {
        technicianId: new Types.ObjectId(technicianId),
        name: `Working Hours (${pattern.startTime}-${pattern.endTime})`,
        rruleString: rule.toString(),
        startTime: pattern.startTime,
        endTime: pattern.endTime,
        slotDurationMinutes: slotDuration,
        bookingBufferBeforeMinutes: 60,
        bookingBufferAfterMinutes: 30,
        maxBookingsPerSlot: 1,
        effectiveFrom: new Date(),
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      this._logger.debug('Creating slot rule for pattern', {
        ...context,
        slotRuleData: {
          ...slotRuleData,
          technicianId: slotRuleData.technicianId.toString(),
          rruleString: slotRuleData.rruleString.substring(0, 100) + '...',
        },
      });

      const SlotRule = require('../models/technician/SlotRuleSchema').default;
      const createdRule = await SlotRule.create(slotRuleData);

      // Verify the rule was saved
      const savedRule = await SlotRule.findById(createdRule._id);
      if (!savedRule) {
        this._logger.error('Slot rule was not saved to database', {
          ...context,
          createdRuleId: createdRule._id?.toString(),
        });
        throw new Error('Slot rule was not saved to database');
      }

      this._logger.info('Slot rule for pattern created successfully', {
        ...context,
        ruleId: savedRule._id?.toString(),
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error creating slot rule for pattern', {
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
      operation: 'generateAvailabilityFromRules',
      data: { technicianId },
    };

    try {
      this._logger.info('Generating availability from slot rules', context);

      const slotRules = await SlotRule.find({
        technicianId: new Types.ObjectId(technicianId),
        isActive: true,
        effectiveFrom: { $lte: new Date() },
        $or: [
          { effectiveTo: { $exists: false } },
          { effectiveTo: { $gte: new Date() } },
        ],
      });

      this._logger.debug('Found active slot rules', {
        ...context,
        activeRulesCount: slotRules.length,
      });

      if (slotRules.length === 0) {
        this._logger.warn('No active slot rules found for technician', context);
        return;
      }

      const startDate = new Date();
      const endDate = new Date(Date.now() + 90 * 24 * 60 * 60 * 1000); // 90 days ahead

      this._logger.info('Processing slot rules to generate availability', {
        ...context,
        rulesToProcess: slotRules.length,
        dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`,
      });

      let totalOccurrences = 0;
      let totalSlotsGenerated = 0;

      for (const rule of slotRules) {
        try {
          this._logger.debug('Processing rule for availability generation', {
            ...context,
            ruleId: rule._id?.toString(),
            ruleName: rule.name,
          });

          const rrule = RRule.fromString(rule.rruleString);
          const occurrences = rrule.between(startDate, endDate, true);

          this._logger.debug('Rule occurrences calculated', {
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

          this._logger.debug('Rule processing completed', {
            ...context,
            ruleId: rule._id?.toString(),
            occurrencesProcessed: occurrences.length,
          });
        } catch (error: unknown) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error occurred';
          this._logger.error(
            'Error processing rule for availability generation',
            {
              ...context,
              ruleId: rule._id?.toString(),
              error: errorMessage,
              stack: error instanceof Error ? error.stack : undefined,
            }
          );
        }
      }

      this._logger.info('Availability generation completed successfully', {
        ...context,
        totalOccurrences,
        totalSlotsGenerated,
        rulesProcessed: slotRules.length,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error generating availability from rules', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }

  private async generateSlotsForDate(
    rule: ISlotRule,
    date: Date
  ): Promise<GeneratedSlot[]> {
    const context = {
      operation: 'generateSlotsForDate',
      data: {
        ruleId: rule._id?.toString(),
        date: date.toISOString(),
      },
    };

    try {
      this._logger.debug('Generating slots for date', context);

      const slots: GeneratedSlot[] = [];

      // Parse start and end times
      const [startHour, startMinute] = rule.startTime.split(':').map(Number);
      const [endHour, endMinute] = rule.endTime.split(':').map(Number);

      const slotStart = new Date(date);
      slotStart.setHours(startHour, startMinute, 0, 0);

      const slotEnd = new Date(date);
      slotEnd.setHours(endHour, endMinute, 0, 0);

      this._logger.debug('Time range calculated for slots', {
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
          status: 'available',
          maxBookings: rule.maxBookingsPerSlot,
          currentBookings: 0,
        });

        currentSlotStart = new Date(currentSlotEnd);
        slotCount++;
      }

      this._logger.debug('Slots generated successfully', {
        ...context,
        slotsGenerated: slotCount,
      });

      return slots;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error generating slots for date', {
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
  ): Promise<DayAvailability[]> {
    const context = {
      operation: 'getAvailableSlots',
      data: {
        technicianId,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
    };

    try {
      this._logger.info('Fetching available slots for technician', context);

      const availability = await TechnicianAvailability.find({
        technicianId: new Types.ObjectId(technicianId),
        date: {
          $gte: startDate,
          $lte: endDate,
        },
      }).sort({ date: 1 });

      this._logger.debug('Availability records retrieved', {
        ...context,
        availabilityRecordsCount: availability.length,
      });

      const result: DayAvailability[] = availability.map(avail => {
        // Type guard for timeSlots
        const timeSlots = Array.isArray(avail.timeSlots) ? avail.timeSlots : [];

        const availableSlots: ITimeSlot[] = timeSlots
          .filter(
            (slot: unknown): slot is GeneratedSlot =>
              typeof slot === 'object' &&
              slot !== null &&
              'status' in slot &&
              (slot as GeneratedSlot).status === 'available'
          )
          .map((slot: GeneratedSlot) => {
            const plain = slot;
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

      this._logger.info('Available slots retrieved successfully', {
        ...context,
        daysWithAvailability: result.length,
        totalAvailableSlots,
      });

      return result;
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error fetching available slots', {
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
    newAvailabilityConfig: ApplicationAvailability
  ): Promise<void> {
    const context = {
      operation: 'updateTechnicianAvailability',
      data: { technicianId },
    };

    try {
      this._logger.info('Updating technician availability', context);

      // Deactivate old rules
      const deactivateResult = await SlotRule.updateMany(
        { technicianId: new Types.ObjectId(technicianId), isActive: true },
        { isActive: false, effectiveTo: new Date() }
      );

      this._logger.info('Old slot rules deactivated', {
        ...context,
        rulesDeactivated: deactivateResult.modifiedCount,
      });

      // Clear existing availability
      const deleteResult = await TechnicianAvailability.deleteMany({
        technicianId: new Types.ObjectId(technicianId),
        date: { $gte: new Date() },
      });

      this._logger.info('Existing availability cleared', {
        ...context,
        availabilityRecordsDeleted: deleteResult.deletedCount,
      });

      // Create new availability
      await this.createTechnicianAvailabilityFromApplication(
        technicianId,
        newAvailabilityConfig
      );

      this._logger.info(
        'Technician availability updated successfully',
        context
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Error updating technician availability', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      throw error;
    }
  }
}
