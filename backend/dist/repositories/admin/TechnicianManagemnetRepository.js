"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianManagementRepository = void 0;
const TechnicianSchema_1 = require("../../models/technician/TechnicianSchema");
const TechnicianApplicationSchema_1 = require("../../models/technician/TechnicianApplicationSchema");
const UserSchema_1 = __importDefault(require("../../models/UserSchema"));
const UserAddressSchema_1 = __importDefault(require("../../models/UserAddressSchema"));
const mongoose_1 = require("mongoose");
const SlotRuleSchema_1 = __importDefault(require("../../models/technician/SlotRuleSchema"));
const TechnicianAvailabilitySchema_1 = __importDefault(require("../../models/technician/TechnicianAvailabilitySchema"));
// Helper function to convert model application to admin interface
const convertToAdminApplication = (app) => {
    const skillsData = app.skills || {};
    // Process availability data to use new structure
    const availabilityData = app.availability || {};
    let weeklyPattern = {};
    // Convert old structure to new structure if needed
    if (availabilityData && typeof availabilityData === 'object') {
        // Check for nested availability structure (old format)
        if ('availability' in availabilityData &&
            availabilityData.availability &&
            typeof availabilityData.availability === 'object' &&
            'weeklyPattern' in availabilityData.availability) {
            weeklyPattern = availabilityData.availability
                .weeklyPattern;
        }
        // Check for direct weeklyPattern (new format)
        else if ('weeklyPattern' in availabilityData) {
            weeklyPattern = availabilityData.weeklyPattern;
        }
        // Check for old weeklyAvailability structure and convert
        else if ('weeklyAvailability' in availabilityData) {
            const oldWeeklyAvailability = availabilityData.weeklyAvailability;
            weeklyPattern = {};
            // Convert from old structure { enabled, startTime, endTime } to new structure { available, startTime, endTime }
            Object.keys(oldWeeklyAvailability).forEach(day => {
                const dayData = oldWeeklyAvailability[day];
                if (dayData && typeof dayData === 'object') {
                    weeklyPattern[day] = {
                        available: dayData.enabled || false,
                        startTime: dayData.startTime || '09:00',
                        endTime: dayData.endTime || '18:00',
                    };
                }
            });
        }
    }
    // If no weeklyPattern was found, create default
    if (Object.keys(weeklyPattern).length === 0) {
        weeklyPattern = {
            monday: { available: false, startTime: '09:00', endTime: '18:00' },
            tuesday: { available: false, startTime: '09:00', endTime: '18:00' },
            wednesday: { available: false, startTime: '09:00', endTime: '18:00' },
            thursday: { available: false, startTime: '09:00', endTime: '18:00' },
            friday: { available: false, startTime: '09:00', endTime: '18:00' },
            saturday: { available: false, startTime: '09:00', endTime: '18:00' },
            sunday: { available: false, startTime: '09:00', endTime: '18:00' },
        };
    }
    const baseApplication = {
        _id: app._id,
        technicianId: app.technicianId,
        email: app.email || '',
        status: app.status || 'draft',
        stepsCompleted: app.stepsCompleted || [],
        personal: app.personal
            ? {
                fullName: app.personal.fullName || '',
                phoneNumber: app.personal.phoneNumber || '',
                email: app.personal.email || '',
                gender: app.personal.gender || '',
                dateOfBirth: app.personal.dateOfBirth || '',
                address: app.personal.address
                    ? {
                        street: app.personal.address.street || '',
                        city: app.personal.address.city || '',
                        state: app.personal.address.state || '',
                        pincode: app.personal.address.pincode || '',
                    }
                    : undefined,
            }
            : {
                fullName: '',
                phoneNumber: '',
                email: '',
                gender: '',
                dateOfBirth: '',
            },
        identity: app.identity || {
            governmentIdType: '',
            governmentIdNumber: '',
            idDocument: '',
            verified: false,
            verificationStatus: 'pending',
        },
        skills: {
            services: skillsData.services || [],
            yearsOfExperience: skillsData.yearsOfExperience || '',
            languages: getLanguagesFromSkills(skillsData),
            bio: skillsData.bio || '',
            serviceAreas: skillsData.serviceAreas || [],
            workRadius: skillsData.workRadius || '',
        },
        availability: {
            serviceAreas: availabilityData.serviceAreas || [],
            workRadius: availabilityData.workRadius || '',
            weeklyPattern: weeklyPattern,
        },
        bank: app.bank || {
            accountHolderName: '',
            accountNumber: '',
            ifscCode: '',
            upiId: '',
            bankName: '',
            withdrawalPreference: '',
        },
        documents: app.documents || {},
        agreement: app.agreement || false,
        submittedAt: app.submittedAt,
        reviewNotes: app.reviewNotes,
        rejectionReason: app.rejectionReason,
        rejectedAt: app.rejectedAt,
        resubmittedCount: app.resubmittedCount || 0,
        lastSubmittedAt: app.lastSubmittedAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        user: undefined,
    };
    const result = {
        ...baseApplication,
        toObject: () => baseApplication,
    };
    return result;
};
// Helper function to safely extract languages from skills
const getLanguagesFromSkills = (skillsData) => {
    if (!skillsData)
        return [];
    const languages = skillsData.languages;
    if (!languages)
        return [];
    if (Array.isArray(languages)) {
        return languages;
    }
    if (typeof languages === 'string') {
        try {
            // Try to parse as JSON array
            const parsed = JSON.parse(languages);
            return Array.isArray(parsed) ? parsed : [languages];
        }
        catch {
            // If not JSON, try comma-separated or return as single item array
            if (languages.includes(',')) {
                return languages
                    .split(',')
                    .map((lang) => lang.trim())
                    .filter(Boolean);
            }
            return [languages];
        }
    }
    return [];
};
const convertToModelApplication = (app) => {
    // Process availability data for backward compatibility
    let availabilityData = app.availability;
    // Ensure availability has the correct structure
    if (availabilityData && !availabilityData.weeklyPattern) {
        availabilityData = {
            ...availabilityData,
            weeklyPattern: {
                monday: { available: false, startTime: '09:00', endTime: '18:00' },
                tuesday: { available: false, startTime: '09:00', endTime: '18:00' },
                wednesday: { available: false, startTime: '09:00', endTime: '18:00' },
                thursday: { available: false, startTime: '09:00', endTime: '18:00' },
                friday: { available: false, startTime: '09:00', endTime: '18:00' },
                saturday: { available: false, startTime: '09:00', endTime: '18:00' },
                sunday: { available: false, startTime: '09:00', endTime: '18:00' },
            },
        };
    }
    return {
        _id: app._id,
        technicianId: app.technicianId,
        email: app.email,
        status: app.status,
        stepsCompleted: app.stepsCompleted,
        personal: app.personal,
        identity: app.identity,
        skills: app.skills,
        availability: availabilityData,
        bank: app.bank,
        documents: app.documents,
        agreement: app.agreement,
        submittedAt: app.submittedAt,
        reviewNotes: app.reviewNotes,
        rejectionReason: app.rejectionReason,
        rejectedAt: app.rejectedAt,
        resubmittedCount: app.resubmittedCount,
        lastSubmittedAt: app.lastSubmittedAt,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
    };
};
class TechnicianManagementRepository {
    async findAllTechnicians(filter, skip, limit) {
        const technicians = await TechnicianSchema_1.Technician.find(filter)
            .populate('userId', 'email phone fullName')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .lean();
        return technicians;
    }
    async countTechnicians(filter) {
        return await TechnicianSchema_1.Technician.countDocuments(filter);
    }
    async findTechnicianById(id) {
        const technician = await TechnicianSchema_1.Technician.findById(id)
            .populate('userId', 'email phone fullName createdAt')
            .lean();
        return technician;
    }
    async updateTechnicianStatus(id, status, additionalData) {
        try {
            const updateData = { status };
            if (additionalData) {
                Object.assign(updateData, additionalData);
            }
            const technician = await TechnicianSchema_1.Technician.findByIdAndUpdate(id, { $set: updateData }, { new: true });
            if (!technician) {
                return null;
            }
            return technician;
        }
        catch (error) {
            console.error('Repository: Error updating technician status:', error);
            throw error;
        }
    }
    async updateTechnicianPersonalInfo(technicianId, personalInfo) {
        const technician = await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
            $set: {
                personalInfo,
                updatedAt: new Date(),
            },
        }, { new: true });
        return technician;
    }
    async findTechnicianByUserId(userId) {
        try {
            const technician = await TechnicianSchema_1.Technician.findOne({
                userId: new mongoose_1.Types.ObjectId(userId),
            });
            return technician;
        }
        catch (error) {
            console.error('Error finding technician by userId:', error);
            return null;
        }
    }
    async getTechnicianStats() {
        const total = await TechnicianSchema_1.Technician.countDocuments();
        const active = await TechnicianSchema_1.Technician.countDocuments({ status: 'approved' });
        const pending = await TechnicianSchema_1.Technician.countDocuments({ status: 'pending' });
        const suspended = await TechnicianSchema_1.Technician.countDocuments({ status: 'suspended' });
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recent = await TechnicianSchema_1.Technician.countDocuments({
            createdAt: { $gte: oneWeekAgo },
        });
        return { total, active, pending, suspended, recent };
    }
    async findAllApplications(filter, skip, limit) {
        const applications = await TechnicianApplicationSchema_1.TechnicianApplication.find(filter)
            .sort({ submittedAt: -1, createdAt: -1 })
            .skip(skip)
            .limit(limit);
        return applications.map(app => convertToAdminApplication(app));
    }
    async countApplications(filter) {
        return await TechnicianApplicationSchema_1.TechnicianApplication.countDocuments(filter);
    }
    async findApplicationById(id) {
        const application = await TechnicianApplicationSchema_1.TechnicianApplication.findById(id);
        if (!application)
            return null;
        return convertToAdminApplication(application);
    }
    async updateApplicationStatus(applicationId, status, additionalData) {
        try {
            const updateData = {
                status,
                updatedAt: new Date(),
            };
            if (additionalData) {
                if (additionalData.rejectionReason) {
                    updateData.rejectionReason = additionalData.rejectionReason;
                }
                if (additionalData.rejectedAt) {
                    updateData.rejectedAt = additionalData.rejectedAt;
                }
                else if (status === 'rejected') {
                    updateData.rejectedAt = new Date();
                }
                if (additionalData.reviewNotes) {
                    updateData.reviewNotes = additionalData.reviewNotes;
                }
            }
            const result = await TechnicianApplicationSchema_1.TechnicianApplication.findByIdAndUpdate(applicationId, { $set: updateData }, { new: true, runValidators: true });
            if (!result)
                return null;
            return convertToAdminApplication(result);
        }
        catch (error) {
            console.error('Error in updateApplicationStatus:', error);
            throw error;
        }
    }
    async getApplicationStats() {
        const total = await TechnicianApplicationSchema_1.TechnicianApplication.countDocuments();
        const pending = await TechnicianApplicationSchema_1.TechnicianApplication.countDocuments({
            status: { $in: ['submitted', 'under_review'] },
        });
        const approved = await TechnicianApplicationSchema_1.TechnicianApplication.countDocuments({
            status: 'approved',
        });
        const rejected = await TechnicianApplicationSchema_1.TechnicianApplication.countDocuments({
            status: 'rejected',
        });
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const recent = await TechnicianApplicationSchema_1.TechnicianApplication.countDocuments({
            createdAt: { $gte: oneWeekAgo },
        });
        return { total, pending, approved, rejected, recent };
    }
    async updateUserApplicationStatus(userId, applicationStatus) {
        const user = await UserSchema_1.default.findByIdAndUpdate(userId, { $set: { applicationStatus } }, { new: true });
        return user;
    }
    async findUserAddress(userId) {
        try {
            const address = await UserAddressSchema_1.default.findOne({
                userId,
                isDefault: true,
            })
                .select('street city state pincode landmark')
                .lean();
            return address;
        }
        catch (error) {
            console.error('Error finding user address:', error);
            return null;
        }
    }
    async findOrCreateTechnician(application, availabilityData) {
        try {
            const modelApplication = convertToModelApplication(application);
            let technician = await TechnicianSchema_1.Technician.findOne({
                userId: application.technicianId,
            });
            const languages = application.skills?.languages || [];
            const languagesArray = Array.isArray(languages)
                ? languages
                : typeof languages === 'string'
                    ? [languages]
                    : [];
            // Prepare personal info
            const personalInfo = {
                fullName: application.personal?.fullName ||
                    technician?.personalInfo?.fullName ||
                    'Technician',
                email: application.personal?.email || technician?.personalInfo?.email,
                phoneNumber: application.personal?.phoneNumber ||
                    technician?.personalInfo?.phoneNumber,
                dateOfBirth: application.personal?.dateOfBirth ||
                    technician?.personalInfo?.dateOfBirth,
                gender: application.personal?.gender || technician?.personalInfo?.gender,
                languages: languagesArray,
                bio: application.skills?.bio || technician?.personalInfo?.bio,
                address: application.personal?.address || technician?.personalInfo?.address,
            };
            const serviceAreas = application.availability?.serviceAreas || [];
            const workRadius = application.availability?.workRadius
                ? parseInt(application.availability.workRadius)
                : 10;
            const availabilityInfo = availabilityData || {
                isAvailable: true,
                weeklyPattern: application.availability?.weeklyPattern || {
                    monday: { available: false, startTime: '09:00', endTime: '18:00' },
                    tuesday: { available: false, startTime: '09:00', endTime: '18:00' },
                    wednesday: { available: false, startTime: '09:00', endTime: '18:00' },
                    thursday: { available: false, startTime: '09:00', endTime: '18:00' },
                    friday: { available: false, startTime: '09:00', endTime: '18:00' },
                    saturday: { available: false, startTime: '09:00', endTime: '18:00' },
                    sunday: { available: false, startTime: '09:00', endTime: '18:00' },
                },
                availableWeeks: [1, 2, 3, 4],
            };
            if (technician) {
                // Update existing technician
                technician = await TechnicianSchema_1.Technician.findOneAndUpdate({ userId: application.technicianId }, {
                    $set: {
                        displayName: personalInfo.fullName,
                        services: application.skills?.services || technician.services,
                        experienceYears: application.skills?.yearsOfExperience
                            ? parseInt(String(application.skills.yearsOfExperience))
                            : technician.experienceYears,
                        workAreas: serviceAreas,
                        serviceRadiusKm: workRadius,
                        status: 'approved',
                        profilePictureUrl: application.documents?.passportPhoto?.url ||
                            application.documents?.profilePhoto?.url ||
                            technician.profilePictureUrl,
                        phone: personalInfo.phoneNumber || technician.phone,
                        personalInfo: personalInfo,
                        availability: availabilityInfo,
                        updatedAt: new Date(),
                    },
                }, { new: true });
            }
            else {
                // Create new technician
                technician = await TechnicianSchema_1.Technician.create({
                    userId: application.technicianId,
                    displayName: personalInfo.fullName,
                    services: application.skills?.services || [],
                    experienceYears: application.skills?.yearsOfExperience
                        ? parseInt(String(application.skills.yearsOfExperience))
                        : 0,
                    workAreas: serviceAreas,
                    serviceRadiusKm: workRadius,
                    status: 'approved',
                    profilePictureUrl: application.documents?.passportPhoto?.url ||
                        application.documents?.profilePhoto?.url,
                    phone: personalInfo.phoneNumber,
                    personalInfo: personalInfo,
                    availability: availabilityInfo,
                    averageRating: 0,
                    ratingCount: 0,
                    totalJobs: 0,
                    completedJobs: 0,
                    ongoingJobs: 0,
                    totalEarnings: 0,
                    resubmittedCount: 0,
                });
            }
            if (!technician) {
                throw new Error('Technician could not be found or created');
            }
            return technician;
        }
        catch (error) {
            console.error('Find or create technician error:', error);
            throw error;
        }
    }
    async findTechnicianByApplicationId(applicationId) {
        const application = await TechnicianApplicationSchema_1.TechnicianApplication.findById(applicationId);
        if (!application)
            return null;
        const technician = await TechnicianSchema_1.Technician.findOne({
            userId: application.technicianId,
        }).populate('userId', 'email phone fullName');
        return technician;
    }
    async findUserById(userId) {
        try {
            const user = await UserSchema_1.default.findById(userId)
                .select('email phone fullName createdAt')
                .lean();
            return user;
        }
        catch (error) {
            console.error('Error finding user by ID:', error);
            return null;
        }
    }
    async findApplicationByTechnicianId(technicianId) {
        try {
            const application = await TechnicianApplicationSchema_1.TechnicianApplication.findOne({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
            })
                .select('personal skills documents status')
                .lean();
            if (!application) {
                const technician = await TechnicianSchema_1.Technician.findById(technicianId);
                if (technician) {
                    const appByUserId = await TechnicianApplicationSchema_1.TechnicianApplication.findOne({
                        technicianId: technician.userId,
                    })
                        .select('personal skills documents status')
                        .lean();
                    return appByUserId
                        ? convertToAdminApplication(appByUserId)
                        : null;
                }
            }
            return application
                ? convertToAdminApplication(application)
                : null;
        }
        catch (error) {
            console.error('Error finding application by technician ID:', error);
            return null;
        }
    }
    async updateTechnicianPaymentDetails(technicianId, paymentDetails) {
        try {
            const result = await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
                $set: {
                    'paymentDetails.bankAccount.holderName': paymentDetails.bankAccount.holderName,
                    'paymentDetails.bankAccount.accountNumber': paymentDetails.bankAccount.accountNumber,
                    'paymentDetails.bankAccount.ifscCode': paymentDetails.bankAccount.ifscCode,
                    'paymentDetails.bankAccount.bankName': paymentDetails.bankAccount.bankName,
                    'paymentDetails.upiId': paymentDetails.upiId,
                    'paymentDetails.withdrawalPreference': paymentDetails.withdrawalPreference,
                },
            }, { new: true, runValidators: true });
            return !!result;
        }
        catch (error) {
            console.error('Repository - Error updating payment details:', error);
            return false;
        }
    }
    async updateTechnicianIdentityVerification(technicianId, identityData) {
        try {
            const result = await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
                $set: {
                    'identityVerification.idType': identityData.idType,
                    'identityVerification.idNumber': identityData.idNumber,
                    'identityVerification.idDocument': identityData.idDocument,
                    'identityVerification.verificationStatus': identityData.verificationStatus,
                    'identityVerification.verified': identityData.verified,
                    'identityVerification.verifiedAt': identityData.verifiedAt,
                },
            }, { new: true, runValidators: true });
            return !!result;
        }
        catch (error) {
            console.error('Repository - Error updating identity verification:', error);
            return false;
        }
    }
    async save(application) {
        try {
            // Convert admin application to model format
            const modelData = convertToModelApplication(application);
            const updatedApplication = await TechnicianApplicationSchema_1.TechnicianApplication.findByIdAndUpdate(application._id, { $set: modelData }, { new: true, runValidators: true });
            if (!updatedApplication) {
                throw new Error('Application not found');
            }
            return convertToAdminApplication(updatedApplication);
        }
        catch (error) {
            console.error('Error saving application:', error);
            throw error;
        }
    }
    async updateTechnicianDocuments(technicianId, documents) {
        try {
            return await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
                $set: { documents: documents },
                $currentDate: { updatedAt: true },
            }, { new: true });
        }
        catch (error) {
            console.error('Error updating technician documents:', error);
            throw error;
        }
    }
    async findTechnicians(filters, search, status, service) {
        try {
            // Build the MongoDB query
            const query = {};
            // Status filter
            if (status && status !== 'All Status' && status !== 'all') {
                query.status = status;
            }
            // Service filter
            if (service && service !== 'All Services') {
                query.services = { $in: [service] };
            }
            // Search filter (name, email, phone, work areas)
            if (search && search.trim()) {
                const searchRegex = new RegExp(search.trim(), 'i');
                query.$or = [
                    { displayName: { $regex: searchRegex } },
                    { 'userId.email': { $regex: searchRegex } },
                    { phone: { $regex: searchRegex } },
                    { workAreas: { $in: [searchRegex] } },
                ];
            }
            const technicians = await TechnicianSchema_1.Technician.find(query)
                .populate('userId', 'email phone fullName')
                .sort({ createdAt: -1 })
                .lean();
            return technicians;
        }
        catch (error) {
            console.error('Repository: Error finding technicians:', error);
            throw error;
        }
    }
    async findApplications(filters, search, service) {
        try {
            // Build the MongoDB query
            const query = {
                status: { $in: ['submitted', 'under_review'] }, // Only pending applications
            };
            // Service filter
            if (service && service !== 'All Services') {
                query['skills.services'] = { $in: [service] };
            }
            // Search filter (name, email, phone)
            if (search && search.trim()) {
                const searchRegex = new RegExp(search.trim(), 'i');
                query.$or = [
                    { 'personal.fullName': { $regex: searchRegex } },
                    { email: { $regex: searchRegex } },
                    { 'personal.phoneNumber': { $regex: searchRegex } },
                ];
            }
            const applications = await TechnicianApplicationSchema_1.TechnicianApplication.find(query).sort({
                submittedAt: -1,
                createdAt: -1,
            });
            return applications.map(app => convertToAdminApplication(app));
        }
        catch (error) {
            console.error('Repository: Error finding applications:', error);
            throw error;
        }
    }
    async findPublicTechnicians(filters, skip = 0, limit = 10, sortOptions = { createdAt: -1 }) {
        try {
            const publicFilters = {
                ...filters,
                status: 'approved',
            };
            // Remove any sensitive filter fields that shouldn't be exposed publicly
            delete publicFilters.$or;
            // Build the MongoDB query
            const query = { status: 'approved' };
            // Service filter
            if (filters.services) {
                if (typeof filters.services === 'string') {
                    query.services = { $in: [filters.services] };
                }
                else if (filters.services.$in) {
                    query.services = { $in: filters.services.$in };
                }
            }
            // Rating filter
            if (filters.averageRating) {
                query.averageRating = filters.averageRating;
            }
            // Work areas filter
            if (filters.workAreas) {
                query.workAreas = filters.workAreas;
            }
            // Search filter (name, email, etc.)
            if (filters.$or) {
                // For public access, only allow search on safe fields
                const safeSearchFields = ['displayName', 'services', 'workAreas'];
                query.$or = filters.$or.filter(condition => {
                    const field = Object.keys(condition)[0];
                    return safeSearchFields.includes(field);
                });
            }
            // Date range filter
            if (filters.createdAt) {
                query.createdAt = filters.createdAt;
            }
            const technicians = await TechnicianSchema_1.Technician.find(query)
                .populate('userId', 'email phone fullName')
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .lean();
            // Remove sensitive data before returning
            const publicTechnicians = technicians.map(tech => ({
                ...tech,
                identityVerification: undefined,
                paymentDetails: undefined,
                suspensionReason: undefined,
                rejectionReason: undefined,
                personalInfo: tech.personalInfo
                    ? {
                        ...tech.personalInfo,
                        // Keep only non-sensitive personal info
                        fullName: tech.personalInfo.fullName,
                        languages: tech.personalInfo.languages,
                        bio: tech.personalInfo.bio,
                        address: tech.personalInfo.address
                            ? {
                                city: tech.personalInfo.address.city,
                                state: tech.personalInfo.address.state,
                                pincode: tech.personalInfo.address.pincode,
                            }
                            : undefined,
                    }
                    : undefined,
            }));
            return publicTechnicians;
        }
        catch (error) {
            console.error('Repository: Error finding public technicians:', error);
            throw error;
        }
    }
    async countPublicTechnicians(filters) {
        try {
            // Build the same query as findPublicTechnicians but for counting
            const query = { status: 'approved' };
            // Service filter
            if (filters.services) {
                if (typeof filters.services === 'string') {
                    query.services = { $in: [filters.services] };
                }
                else if (filters.services.$in) {
                    query.services = { $in: filters.services.$in };
                }
            }
            // Rating filter
            if (filters.averageRating) {
                query.averageRating = filters.averageRating;
            }
            // Work areas filter
            if (filters.workAreas) {
                query.workAreas = filters.workAreas;
            }
            // Search filter
            if (filters.$or) {
                const safeSearchFields = ['displayName', 'services', 'workAreas'];
                query.$or = filters.$or.filter(condition => {
                    const field = Object.keys(condition)[0];
                    return safeSearchFields.includes(field);
                });
            }
            // Date range filter
            if (filters.createdAt) {
                query.createdAt = filters.createdAt;
            }
            const count = await TechnicianSchema_1.Technician.countDocuments(query);
            return count;
        }
        catch (error) {
            console.error('Repository: Error counting public technicians:', error);
            throw error;
        }
    }
    async findById(id) {
        try {
            const technician = await TechnicianSchema_1.Technician.findById(id)
                .populate('userId', 'email phone fullName')
                .lean();
            return technician;
        }
        catch (error) {
            console.error('Repository: Error finding technician by ID:', error);
            throw error;
        }
    }
    async updateTechnicianLocation(technicianId, coordinates) {
        try {
            return await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
                $set: {
                    'currentLocation.coordinates': coordinates,
                    'currentLocation.type': 'Point',
                },
            }, { new: true });
        }
        catch (error) {
            console.error('Error updating technician location:', error);
            return null;
        }
    }
    async getTechnicianAvailability(technicianId) {
        try {
            // Get active slot rules
            const slotRules = await SlotRuleSchema_1.default.find({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                isActive: true,
            });
            // Get upcoming availability
            const upcomingAvailability = await TechnicianAvailabilitySchema_1.default.find({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                date: { $gte: new Date() },
            })
                .sort({ date: 1 })
                .limit(7); // Get next 7 days
            return {
                slotRules,
                upcomingAvailability,
                hasAvailability: slotRules.length > 0,
            };
        }
        catch (error) {
            console.error('Error getting technician availability:', error);
            return null;
        }
    }
    async getUpcomingAvailability(technicianId, days = 7) {
        try {
            const startDate = new Date();
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + days);
            return await TechnicianAvailabilitySchema_1.default.find({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            }).sort({ date: 1 });
        }
        catch (error) {
            console.error('Error getting upcoming availability:', error);
            return [];
        }
    }
    async getActiveSlotRules(technicianId) {
        try {
            return await SlotRuleSchema_1.default.find({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                isActive: true,
                $or: [
                    { effectiveTo: { $exists: false } },
                    { effectiveTo: { $gte: new Date() } },
                ],
            }).sort({ effectiveFrom: 1 });
        }
        catch (error) {
            console.error('Error fetching active slot rules:', error);
            throw error;
        }
    }
    async getUpcomingAvailabilityProfile(technicianId, startDate, endDate) {
        try {
            return await TechnicianAvailabilitySchema_1.default.find({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            }).sort({ date: 1 });
        }
        catch (error) {
            console.error('Error fetching upcoming availability:', error);
            throw error;
        }
    }
    async findAvailabilityByTechnicianAndDate(technicianId, date) {
        try {
            return await TechnicianAvailabilitySchema_1.default.findOne({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                date: {
                    $gte: new Date(date.setHours(0, 0, 0, 0)),
                    $lte: new Date(date.setHours(23, 59, 59, 999)),
                },
            });
        }
        catch (error) {
            console.error('Error finding availability by date:', error);
            throw error;
        }
    }
    async findAvailabilityInRange(technicianId, startDate, endDate) {
        try {
            return await TechnicianAvailabilitySchema_1.default.find({
                technicianId: new mongoose_1.Types.ObjectId(technicianId),
                date: {
                    $gte: startDate,
                    $lte: endDate,
                },
            }).sort({ date: 1 });
        }
        catch (error) {
            console.error('Error finding availability in range:', error);
            throw error;
        }
    }
}
exports.TechnicianManagementRepository = TechnicianManagementRepository;
