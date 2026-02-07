"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianProfileService = void 0;
const mongoose_1 = require("mongoose");
const responseHelper_1 = require("../utils/responseHelper");
const constants_1 = require("../constants");
const cloudinary_1 = require("../utils/cloudinary");
const rrule_1 = require("rrule");
const technicianProfileMappers_1 = require("../mappers/technicianProfileMappers");
class TechnicianProfileService {
    constructor(technicianRepository, technicianProfileRepository, userRepository, userAddressRepository, orderService, emailService, notificationService, logger) {
        this._technicianRepository = technicianRepository;
        this._technicianProfileRepository = technicianProfileRepository;
        this._userRepository = userRepository;
        this._userAddressRepository = userAddressRepository;
        this._logger = logger;
        this._orderService = orderService;
        this._emailService = emailService;
        this._notificationService = notificationService;
    }
    async getTechnicianProfile(technicianId) {
        try {
            const technician = await this._technicianRepository.findByUserId(technicianId);
            const user = await this._userRepository.findById(technicianId);
            if (!technician || !user) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_PROFILE_NOT_FOUND);
            }
            let formattedLanguages = [];
            if (technician.personalInfo?.languages) {
                if (Array.isArray(technician.personalInfo.languages)) {
                    formattedLanguages = technician.personalInfo.languages;
                }
                else if (typeof technician.personalInfo.languages === 'string') {
                    try {
                        const parsed = JSON.parse(technician.personalInfo.languages);
                        formattedLanguages = Array.isArray(parsed)
                            ? parsed
                            : [technician.personalInfo.languages];
                    }
                    catch {
                        formattedLanguages = [technician.personalInfo.languages];
                    }
                }
            }
            let documents = [];
            const technicianObject = technician.toObject
                ? technician.toObject()
                : { ...technician };
            if (technician.documents && Array.isArray(technician.documents)) {
                documents = technician.documents;
            }
            else if (technician._doc?.documents &&
                Array.isArray(technician._doc.documents)) {
                documents = technician._doc.documents;
            }
            else {
                documents = technicianObject.documents || [];
            }
            const profileData = {
                ...technicianObject,
                personalInfo: {
                    ...technicianObject.personalInfo,
                    languages: formattedLanguages,
                },
                documents: technician.documents || technicianObject.documents || [],
            };
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(profileData, user);
            return responseHelper_1.ResponseHelper.success(constants_1.TECHNICIAN_PROFILE_MESSAGES.PROFILE_RETRIEVED, {
                profile: profileDto,
            });
        }
        catch (error) {
            console.error('Get technician profile error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_FETCH_PROFILE);
        }
    }
    async updatePersonalInformation(technicianId, updateData) {
        try {
            const technician = await this._technicianRepository.findByUserId(technicianId);
            const user = await this._userRepository.findById(technicianId);
            if (!technician || !user) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
            }
            const updatePayload = {
                personalInfo: {
                    ...technician.personalInfo,
                },
            };
            if (updateData.personalInfo?.fullName !== undefined) {
                updatePayload.personalInfo.fullName = updateData.personalInfo?.fullName;
            }
            if (updateData.personalInfo?.phoneNumber !== undefined) {
                updatePayload.personalInfo.phoneNumber =
                    updateData.personalInfo?.phoneNumber;
            }
            if (updateData.personalInfo?.dateOfBirth !== undefined) {
                updatePayload.personalInfo.dateOfBirth =
                    updateData.personalInfo?.dateOfBirth;
            }
            if (updateData.personalInfo?.gender !== undefined) {
                updatePayload.personalInfo.gender = updateData.personalInfo?.gender;
            }
            if (updateData.personalInfo?.languages !== undefined) {
                updatePayload.personalInfo.languages =
                    updateData.personalInfo?.languages;
            }
            if (updateData.bio !== undefined) {
                updatePayload.bio = updateData.bio;
            }
            if (updateData.profilePicture) {
                updatePayload.profilePictureUrl = updateData.profilePicture;
            }
            // Update technician personal info
            const updatedTechnician = await this._technicianProfileRepository.updateTechnician(technician._id.toString(), updatePayload);
            if (!updatedTechnician) {
                return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PERSONAL_INFO);
            }
            // Update user email if provided
            if (updateData.email && updateData.email !== user.email) {
                const existingUser = await this._userRepository.findByEmail(updateData.email);
                if (existingUser && existingUser._id.toString() !== technicianId) {
                    return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.EMAIL_ALREADY_EXISTS);
                }
                await this._technicianProfileRepository.updateUser(technicianId, {
                    email: updateData.email,
                });
            }
            const updatedUser = await this._userRepository.findById(technicianId);
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(updatedTechnician, updatedUser || user);
            return responseHelper_1.ResponseHelper.success(constants_1.TECHNICIAN_PROFILE_MESSAGES.PERSONAL_INFO_UPDATED, {
                profile: profileDto,
            });
        }
        catch (error) {
            console.error('Update personal information error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PERSONAL_INFO);
        }
    }
    async updateIdentityVerification(technicianId, updateData) {
        try {
            const technician = await this._technicianRepository.findByUserId(technicianId);
            const user = await this._userRepository.findById(technicianId);
            if (!technician || !user) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
            }
            const updatePayload = {
                identityVerification: {
                    ...technician.identityVerification,
                    idType: updateData.identityVerification?.idType ||
                        technician.identityVerification?.idType,
                    idNumber: updateData.identityVerification?.idNumber ||
                        technician.identityVerification?.idNumber,
                    verified: false,
                    verificationStatus: constants_1.VerificationStatus.PENDING,
                },
            };
            if (updateData.personalInfo) {
                updatePayload.personalInfo = {
                    ...technician.personalInfo,
                    ...updateData.personalInfo,
                    address: {
                        ...technician.personalInfo?.address,
                        ...updateData.personalInfo.address,
                    },
                };
            }
            const updatedTechnician = await this._technicianProfileRepository.updateTechnician(technician._id.toString(), updatePayload);
            if (!updatedTechnician) {
                console.error('Repository returned null/undefined');
                return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_IDENTITY_VERIFICATION);
            }
            // Map to DTO
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(updatedTechnician, user);
            return responseHelper_1.ResponseHelper.success(constants_1.TECHNICIAN_PROFILE_MESSAGES.IDENTITY_VERIFICATION_UPDATED, {
                profile: profileDto,
            });
        }
        catch (error) {
            console.error('Update identity verification error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_IDENTITY_VERIFICATION);
        }
    }
    async updateSkillsServices(technicianId, updateData) {
        try {
            const technician = await this._technicianRepository.findByUserId(technicianId);
            const user = await this._userRepository.findById(technicianId);
            if (!technician || !user) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
            }
            const updatedTechnician = await this._technicianProfileRepository.updateTechnician(technician._id.toString(), {
                services: updateData.services ||
                    technician.services ||
                    constants_1.SKILLS_DEFAULTS.SERVICES,
                experienceYears: updateData.experienceYears ??
                    technician.experienceYears ??
                    constants_1.SKILLS_DEFAULTS.EXPERIENCE_YEARS,
                basePrices: updateData.basePrices ||
                    technician.basePrices ||
                    constants_1.SKILLS_DEFAULTS.BASE_PRICES,
            });
            if (!updatedTechnician) {
                return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_SKILLS_SERVICES);
            }
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(updatedTechnician, user);
            return responseHelper_1.ResponseHelper.success(constants_1.TECHNICIAN_PROFILE_MESSAGES.SKILLS_SERVICES_UPDATED, {
                profile: profileDto,
            });
        }
        catch (error) {
            console.error('Update skills services error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_SKILLS_SERVICES);
        }
    }
    async updateAvailabilityPreferences(technicianId, updateData) {
        try {
            console.log('UPDATE AVAILABILITY - Starting update for technician:', technicianId);
            const technician = await this._technicianRepository.findByUserId(technicianId);
            const user = await this._userRepository.findById(technicianId);
            if (!technician || !user) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
            }
            // Extract work areas and service radius
            const workAreas = updateData.workAreas || updateData.serviceAreas || [];
            const serviceRadiusKm = updateData.serviceRadiusKm || updateData.workRadius || 10;
            // Build update payload
            const updateDataForRepo = {
                workAreas: workAreas,
                serviceRadiusKm: serviceRadiusKm,
            };
            // Add availability preferences if provided
            if (updateData.availability) {
                updateDataForRepo.availability = {
                    isAvailable: updateData.availability.isAvailable,
                    weeklyPattern: updateData.availability.weeklyPattern,
                };
            }
            // Update technician with the new data
            const updatedTechnician = await this._technicianProfileRepository.updateTechnician(technician._id.toString(), updateDataForRepo);
            if (!updatedTechnician) {
                console.error('UPDATE AVAILABILITY - Failed to update technician work preferences');
                return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY);
            }
            // Process slot rules and availability records if availability data is provided
            if (updateData.availability) {
                try {
                    await this.processAvailabilityData(technicianId, updateData.availability);
                }
                catch (availabilityError) {
                    console.error('UPDATE AVAILABILITY - Error processing availability data:', availabilityError);
                }
            }
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(updatedTechnician, user);
            return responseHelper_1.ResponseHelper.success(constants_1.TECHNICIAN_PROFILE_MESSAGES.AVAILABILITY_UPDATED, {
                profile: profileDto,
            });
        }
        catch (error) {
            console.error('UPDATE AVAILABILITY - Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_AVAILABILITY);
        }
    }
    async processAvailabilityData(technicianId, availabilityData) {
        try {
            const SlotRule = require('../models/technician/SlotRuleSchema').default;
            const TechnicianAvailability = require('../models/technician/TechnicianAvailabilitySchema').default;
            const technicianObjectId = new mongoose_1.Types.ObjectId(technicianId);
            if (!availabilityData.weeklyPattern) {
                return;
            }
            const weeklyPattern = availabilityData.weeklyPattern;
            const durationMonths = 3;
            const startDate = new Date();
            const endDate = new Date(startDate);
            endDate.setMonth(endDate.getMonth() + durationMonths);
            // Deactivate existing slot rules
            await SlotRule.updateMany({
                technicianId: technicianObjectId,
                isActive: true,
            }, {
                $set: { isActive: false },
            });
            const days = [
                'monday',
                'tuesday',
                'wednesday',
                'thursday',
                'friday',
                'saturday',
                'sunday',
            ];
            const dayMap = {
                monday: rrule_1.RRule.MO,
                tuesday: rrule_1.RRule.TU,
                wednesday: rrule_1.RRule.WE,
                thursday: rrule_1.RRule.TH,
                friday: rrule_1.RRule.FR,
                saturday: rrule_1.RRule.SA,
                sunday: rrule_1.RRule.SU,
            };
            let createdRulesCount = 0;
            for (const day of days) {
                const dayData = weeklyPattern[day];
                if (dayData && dayData.available) {
                    try {
                        // Create simple weekly RRule for this specific day
                        const rule = new rrule_1.RRule({
                            freq: rrule_1.RRule.WEEKLY,
                            byweekday: [dayMap[day]],
                            dtstart: startDate,
                            until: endDate,
                        });
                        const slotRule = new SlotRule({
                            technicianId: technicianObjectId,
                            name: `${day.charAt(0).toUpperCase() + day.slice(1)} Availability`,
                            rruleString: rule.toString(),
                            startTime: dayData.startTime,
                            endTime: dayData.endTime,
                            slotDurationMinutes: 60,
                            bookingBufferBeforeMinutes: 0,
                            bookingBufferAfterMinutes: 0,
                            maxBookingsPerSlot: 1,
                            effectiveFrom: startDate,
                            isActive: true,
                        });
                        await slotRule.save();
                        createdRulesCount++;
                    }
                    catch (error) {
                        console.error(`Error creating slot rule for ${day}:`, error);
                    }
                }
            }
            // Delete existing availability records
            const deleteResult = await TechnicianAvailability.deleteMany({
                technicianId: technicianObjectId,
                date: { $gte: startDate, $lte: endDate },
            });
            // Get active slot rules and generate availability records
            const activeSlotRules = await SlotRule.find({
                technicianId: technicianObjectId,
                isActive: true,
            });
            let totalRecordsCreated = 0;
            for (const slotRule of activeSlotRules) {
                try {
                    const rrule = rrule_1.RRule.fromString(slotRule.rruleString);
                    const occurrences = rrule.between(startDate, endDate, true);
                    for (const occurrence of occurrences) {
                        const timeSlots = slotRule.generateSlotsForDate(occurrence);
                        const availabilityRecord = new TechnicianAvailability({
                            technicianId: technicianObjectId,
                            date: occurrence,
                            timeSlots: timeSlots,
                            isRecurring: true,
                            slotRuleId: slotRule._id,
                        });
                        await availabilityRecord.save();
                        totalRecordsCreated++;
                    }
                }
                catch (ruleError) {
                    console.error(`Error processing slot rule ${slotRule.name}:`, ruleError);
                }
            }
        }
        catch (error) {
            console.error('Error in processAvailabilityData:', error);
            throw error;
        }
    }
    generateTimeSlotsForDate(date, startTime, endTime, slotDurationMinutes) {
        const timeSlots = [];
        // Parse start and end times
        const [startHour, startMinute] = startTime.split(':').map(Number);
        const [endHour, endMinute] = endTime.split(':').map(Number);
        const startDateTime = new Date(date);
        startDateTime.setHours(startHour, startMinute, 0, 0);
        const endDateTime = new Date(date);
        endDateTime.setHours(endHour, endMinute, 0, 0);
        let currentTime = new Date(startDateTime);
        while (currentTime < endDateTime) {
            const slotEnd = new Date(currentTime.getTime() + slotDurationMinutes * 60000);
            // Don't create slots that extend beyond the end time
            if (slotEnd > endDateTime) {
                break;
            }
            timeSlots.push({
                start: new Date(currentTime),
                end: new Date(slotEnd),
                status: 'available',
                isBooked: false,
            });
            currentTime = slotEnd;
        }
        return timeSlots;
    }
    formatTimeToString(date) {
        return date.toTimeString().slice(0, 5); // Returns "HH:MM" format
    }
    async updateBankPaymentDetails(technicianId, updateData) {
        try {
            const technician = await this._technicianRepository.findByUserId(technicianId);
            const user = await this._userRepository.findById(technicianId);
            if (!technician || !user) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
            }
            let paymentData = {};
            if (updateData.paymentDetails) {
                paymentData = {
                    accountHolderName: updateData.paymentDetails.bankAccount?.holderName,
                    accountNumber: updateData.paymentDetails.bankAccount?.accountNumber,
                    ifscCode: updateData.paymentDetails.bankAccount?.ifscCode,
                    upiId: updateData.paymentDetails.upiId,
                    withdrawalPreference: updateData.paymentDetails.withdrawalPreference,
                };
            }
            else {
                paymentData = updateData;
            }
            // Validate required fields
            if (!paymentData.accountHolderName?.trim()) {
                return responseHelper_1.ResponseHelper.badRequest('Bank account holder name is required');
            }
            if (!paymentData.accountNumber?.trim()) {
                return responseHelper_1.ResponseHelper.badRequest('Account number is required');
            }
            if (!paymentData.ifscCode?.trim()) {
                return responseHelper_1.ResponseHelper.badRequest('IFSC code is required');
            }
            const allowedWithdrawalPrefs = ['auto', 'manual'];
            const inputPref = paymentData.withdrawalPreference;
            const resolvedWithdrawalPreference = allowedWithdrawalPrefs.includes(inputPref)
                ? inputPref
                : (technician.paymentDetails?.withdrawalPreference ??
                    constants_1.PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE);
            const updatePayload = {
                paymentDetails: {
                    ...technician.paymentDetails,
                    bankAccount: {
                        holderName: paymentData.accountHolderName ||
                            technician.paymentDetails?.bankAccount?.holderName ||
                            constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
                        accountNumber: paymentData.accountNumber ||
                            technician.paymentDetails?.bankAccount?.accountNumber ||
                            constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
                        ifscCode: paymentData.ifscCode ||
                            technician.paymentDetails?.bankAccount?.ifscCode ||
                            constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
                        bankName: paymentData.bankName ||
                            technician.paymentDetails?.bankAccount?.bankName ||
                            constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME,
                    },
                    upiId: paymentData.upiId ||
                        technician.paymentDetails?.upiId ||
                        constants_1.PAYMENT_DEFAULTS.UPI_ID,
                    withdrawalPreference: resolvedWithdrawalPreference,
                },
            };
            const updatedTechnician = await this._technicianProfileRepository.updateTechnician(technician._id.toString(), updatePayload);
            if (!updatedTechnician) {
                return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_BANK_PAYMENT);
            }
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(updatedTechnician, user);
            return responseHelper_1.ResponseHelper.success(constants_1.TECHNICIAN_PROFILE_MESSAGES.BANK_PAYMENT_UPDATED, {
                profile: profileDto,
            });
        }
        catch (error) {
            console.error('UPDATE BANK PAYMENT - Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_BANK_PAYMENT);
        }
    }
    async updatePassword(technicianId, updateData) {
        try {
            const user = await this._userRepository.findById(technicianId);
            const technician = await this._technicianRepository.findByUserId(technicianId);
            if (!user || !technician) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.USER_NOT_FOUND);
            }
            // Verify current password
            if (updateData.currentPassword) {
                const isCurrentPasswordValid = await this._technicianProfileRepository.verifyPassword(technicianId, updateData.currentPassword);
                if (!isCurrentPasswordValid) {
                    return responseHelper_1.ResponseHelper.badRequest(constants_1.TECHNICIAN_PROFILE_MESSAGES.CURRENT_PASSWORD_INCORRECT);
                }
            }
            else {
                return responseHelper_1.ResponseHelper.badRequest('Current password is required');
            }
            // Update password
            if (updateData.newPassword) {
                if (updateData.newPassword !== updateData.confirmPassword) {
                    return responseHelper_1.ResponseHelper.badRequest(constants_1.TECHNICIAN_PROFILE_MESSAGES.PASSWORDS_DO_NOT_MATCH);
                }
                const updateResult = await this._technicianProfileRepository.updateUserPassword(technicianId, updateData.newPassword);
                if (!updateResult) {
                    return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PASSWORD);
                }
            }
            else {
                return responseHelper_1.ResponseHelper.badRequest('New password is required');
            }
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(technician, user);
            return responseHelper_1.ResponseHelper.success(constants_1.TECHNICIAN_PROFILE_MESSAGES.PASSWORD_UPDATED, {
                profile: profileDto,
            });
        }
        catch (error) {
            console.error('UPDATE PASSWORD - Error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPDATE_PASSWORD);
        }
    }
    async uploadDocument(technicianId, documentData, documentType) {
        try {
            const technician = await this._technicianRepository.findByUserId(technicianId);
            const user = await this._userRepository.findById(technicianId);
            if (!technician || !user) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
            }
            let fileUrl;
            let fileName;
            let finalDocumentType;
            // Handle both DocumentUploadDto and Multer file
            if (documentData instanceof Object && 'fileUrl' in documentData) {
                fileUrl = documentData.fileUrl;
                fileName = documentData.fileName;
                finalDocumentType = documentData.type;
            }
            else {
                // It's a Multer file
                const file = documentData;
                if (!documentType) {
                    return responseHelper_1.ResponseHelper.badRequest('Document type is required for file uploads');
                }
                // Upload to Cloudinary
                const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file);
                if (!uploadResult || !uploadResult.secure_url) {
                    console.error('Service - Cloudinary upload failed');
                    return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT);
                }
                fileUrl = uploadResult.secure_url;
                fileName = file.originalname;
                finalDocumentType = documentType;
            }
            if (!finalDocumentType || !fileUrl || !fileName) {
                return responseHelper_1.ResponseHelper.badRequest(constants_1.TECHNICIAN_PROFILE_MESSAGES.DOCUMENT_TYPE_REQUIRED);
            }
            const newDocument = {
                _id: new mongoose_1.Types.ObjectId().toString(),
                type: finalDocumentType,
                url: fileUrl,
                fileName: fileName,
                uploadedAt: new Date(),
                verified: false,
                status: constants_1.DocumentStatus.PENDING,
            };
            const updatedTechnician = await this._technicianProfileRepository.addDocument(technician._id.toString(), newDocument);
            if (!updatedTechnician) {
                return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT);
            }
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(updatedTechnician, user);
            return responseHelper_1.ResponseHelper.success(constants_1.TECHNICIAN_PROFILE_MESSAGES.DOCUMENT_UPLOADED, {
                profile: profileDto,
            });
        }
        catch (error) {
            console.error('Upload document error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_DOCUMENT);
        }
    }
    async getStaticData() {
        try {
            const staticDataDto = (0, technicianProfileMappers_1.toStaticDataDto)();
            return responseHelper_1.ResponseHelper.success('Static data retrieved successfully', {
                staticData: staticDataDto,
            });
        }
        catch (error) {
            console.error('Get static data error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error('Failed to fetch static data');
        }
    }
    async uploadPhoto(technicianId, file) {
        try {
            const technician = await this._technicianRepository.findByUserId(technicianId);
            const user = await this._userRepository.findById(technicianId);
            if (!technician || !user) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
            }
            // Upload to Cloudinary (same as application form)
            const uploadResult = await (0, cloudinary_1.uploadToCloudinary)(file);
            if (!uploadResult || !uploadResult.secure_url) {
                console.error('Service - Cloudinary upload failed');
                return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_PHOTO);
            }
            const profilePictureUrl = uploadResult.secure_url;
            // Update technician with the new profile picture URL
            const updatedTechnician = await this._technicianProfileRepository.updateTechnician(technician._id.toString(), {
                profilePictureUrl: profilePictureUrl,
            });
            if (!updatedTechnician) {
                console.error('Service - Failed to update technician profile');
                return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_PHOTO);
            }
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(updatedTechnician, user);
            return responseHelper_1.ResponseHelper.success(constants_1.TECHNICIAN_PROFILE_MESSAGES.PHOTO_UPLOADED, {
                profile: profileDto,
                profilePictureUrl: profilePictureUrl,
            });
        }
        catch (error) {
            console.error('Upload photo error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error(constants_1.TECHNICIAN_PROFILE_MESSAGES.FAILED_UPLOAD_PHOTO);
        }
    }
    async getSlotRules(technicianId) {
        try {
            const technician = await this._technicianRepository.findByUserId(technicianId);
            const user = await this._userRepository.findById(technicianId);
            if (!technician || !user) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
            }
            const slotRules = await this.getSlotRulesFromRepository(technicianId);
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(technician, user);
            return responseHelper_1.ResponseHelper.success('Slot rules retrieved successfully', {
                profile: profileDto,
                slotRules: slotRules,
            });
        }
        catch (error) {
            console.error('Get slot rules error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error('Failed to get slot rules');
        }
    }
    async getTechnicianAvailability(technicianId) {
        try {
            const technician = await this._technicianRepository.findByUserId(technicianId);
            const user = await this._userRepository.findById(technicianId);
            if (!technician || !user) {
                return responseHelper_1.ResponseHelper.notFound(constants_1.TECHNICIAN_PROFILE_MESSAGES.TECHNICIAN_NOT_FOUND);
            }
            // Fetch actual availability from TechnicianAvailability collection
            const availabilityData = await this.getTechnicianAvailabilityFromRepository(technicianId);
            const profileDto = (0, technicianProfileMappers_1.toTechnicianProfileDto)(technician, user);
            return responseHelper_1.ResponseHelper.success('Technician availability retrieved successfully', {
                profile: profileDto,
                availability: availabilityData,
            });
        }
        catch (error) {
            console.error('Get technician availability error:', error);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            return responseHelper_1.ResponseHelper.error('Failed to get technician availability');
        }
    }
    // Update the helper method to fetch real availability data
    async getTechnicianAvailabilityFromRepository(technicianId) {
        try {
            const TechnicianAvailability = require('../models/technician/TechnicianAvailabilitySchema').default;
            // Fetch availability records for this technician
            const availabilityRecords = await TechnicianAvailability.find({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
            }).sort({ date: 1 });
            this._logger.info('Availability Data from technciian', availabilityRecords);
            return availabilityRecords;
        }
        catch (error) {
            console.error('Error fetching technician availability from repository:', error);
            return [];
        }
    }
    async getSlotRulesFromRepository(technicianId) {
        try {
            const SlotRule = require('../models/technician/SlotRuleSchema').default;
            // Fetch actual slot rules from database
            const slotRules = await SlotRule.find({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                isActive: true,
            });
            return slotRules;
        }
        catch (error) {
            console.error('Error fetching slot rules from repository:', error);
            return [];
        }
    }
    async handleTechnicianUnavailability(technicianId, unavailableDate) {
        const context = {
            operation: 'handleTechnicianUnavailability',
            data: { technicianId, unavailableDate },
        };
        try {
            this._logger.info('Handling technician unavailability', context);
            const orders = await this._orderService.getOrdersByTechnicianAndDate(technicianId, unavailableDate);
            if (orders.length === 0) {
                this._logger.info('No orders found for the specified date', context);
                return;
            }
            this._logger.info(`Found ${orders.length} orders to process`, {
                ...context,
                orderCount: orders.length,
            });
            // Process each order
            for (const order of orders) {
                try {
                    const orderContext = {
                        ...context,
                        orderId: order._id.toString(),
                    };
                    this._logger.info('Processing order for cancellation', orderContext);
                    const updatedOrder = await this._orderService.updateOrderStatus(order._id.toString(), 'cancelled', 'system', 'Technician unavailable');
                    if (updatedOrder.success) {
                        // Get customer details from populated order
                        const customer = order.userId;
                        // Send email notification
                        if (customer?.email) {
                            await this._emailService.sendTechnicianUnavailableNotification(customer.email, customer.fullName || 'Customer', order.technicianId?.displayName || 'Technician', new Date(order.scheduledAt).toLocaleDateString(), order.serviceName, order._id.toString());
                        }
                        // Create in-app notification
                        await this._notificationService.createTechnicianUnavailableNotification(customer._id.toString(), order.technicianId?.displayName || 'Technician', order.serviceName, new Date(order.scheduledAt).toLocaleDateString(), order._id.toString());
                        this._logger.info('Order processed successfully', orderContext);
                    }
                }
                catch (orderError) {
                    this._logger.error('Error processing order', {
                        ...context,
                        orderId: order._id.toString(),
                        error: orderError instanceof Error
                            ? orderError.message
                            : 'Unknown error',
                    });
                    // Continue with other orders even if one fails
                }
            }
            // Notify technician about the impact
            if (orders.length > 0) {
                await this._notificationService.createAvailabilityChangeImpactNotification(technicianId, orders.length, unavailableDate.toLocaleDateString());
            }
            this._logger.info('Technician unavailability handled successfully', {
                ...context,
                processedOrders: orders.length,
            });
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
            this._logger.error('Error handling technician unavailability', {
                ...context,
                error: errorMessage,
                stack: error instanceof Error ? error.stack : undefined,
            });
            // Don't throw error to avoid breaking the main availability update
        }
    }
}
exports.TechnicianProfileService = TechnicianProfileService;
