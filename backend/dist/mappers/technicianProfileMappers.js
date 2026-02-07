"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toStaticDataDto = exports.toTechnicianProfileDto = void 0;
const mongoose_1 = require("mongoose");
const constants_1 = require("../constants");
const toTechnicianProfileDto = (technician, user) => {
    const bankPaymentDetails = _mapBankPaymentDetails(technician);
    const mappedDocuments = _mapDocuments(technician);
    const result = {
        _id: technician._id?.toString() || '',
        userId: technician.userId?.toString() || '',
        displayName: technician.displayName || '',
        email: user.email || '',
        phone: user.phone || technician.phone || '',
        profilePictureUrl: technician.profilePictureUrl ||
            constants_1.PERSONAL_INFO_DEFAULTS.PROFILE_PICTURE_URL,
        bio: technician.bio || constants_1.PERSONAL_INFO_DEFAULTS.BIO,
        services: technician.services || constants_1.SKILLS_DEFAULTS.SERVICES,
        workAreas: technician.workAreas || [],
        serviceRadiusKm: technician.serviceRadiusKm || constants_1.AVAILABILITY_DEFAULTS.WORK_RADIUS,
        status: technician.status || '',
        averageRating: technician.averageRating,
        ratingCount: technician.ratingCount,
        totalJobs: technician.totalJobs,
        completedJobs: technician.completedJobs,
        ongoingJobs: technician.ongoingJobs,
        totalEarnings: technician.totalEarnings,
        experienceYears: technician.experienceYears || constants_1.SKILLS_DEFAULTS.EXPERIENCE_YEARS,
        createdAt: technician.createdAt || new Date(),
        updatedAt: technician.updatedAt || new Date(),
        paymentDetails: {
            bankAccount: bankPaymentDetails.bankAccount,
            upiId: bankPaymentDetails.upiId,
            withdrawalPreference: bankPaymentDetails.withdrawalPreference,
        },
        personalInfo: _mapPersonalInfo(technician, user),
        identityVerification: _mapIdentityVerification(technician),
        skillsServices: _mapSkillsServices(technician),
        availabilityPreferences: _mapAvailabilityPreferences(technician),
        documents: mappedDocuments,
    };
    return result;
};
exports.toTechnicianProfileDto = toTechnicianProfileDto;
// Map to static data DTO
const toStaticDataDto = () => {
    return {
        languages: [
            { value: 'english', label: 'English' },
            { value: 'spanish', label: 'Spanish' },
            { value: 'french', label: 'French' },
            { value: 'german', label: 'German' },
            { value: 'hindi', label: 'Hindi' },
        ],
        genders: [
            { value: 'male', label: 'Male' },
            { value: 'female', label: 'Female' },
            { value: 'other', label: 'Other' },
            { value: 'prefer-not-to-say', label: 'Prefer not to say' },
        ],
        idTypes: [
            { value: 'passport', label: 'Passport' },
            { value: 'driver_license', label: "Driver's License" },
            { value: 'national_id', label: 'National ID' },
            { value: 'aadhaar', label: 'Aadhaar Card' },
        ],
        services: [
            { value: 'ac-repair', label: 'AC Repair', basePrice: 499 },
            {
                value: 'washing-machine',
                label: 'Washing Machine Repair',
                basePrice: 399,
            },
            { value: 'refrigerator', label: 'Refrigerator Repair', basePrice: 599 },
            { value: 'fan-repair', label: 'Fan Repair', basePrice: 299 },
            { value: 'tv-repair', label: 'TV Repair', basePrice: 699 },
        ],
        serviceAreas: [
            { value: 'sector-1', label: 'Sector 1' },
            { value: 'sector-2', label: 'Sector 2' },
            { value: 'sector-3', label: 'Sector 3' },
            { value: 'sector-4', label: 'Sector 4' },
        ],
        documentTypes: [
            { value: 'id_proof', label: 'ID Proof' },
            { value: 'address_proof', label: 'Address Proof' },
            { value: 'police_verification', label: 'Police Verification' },
            { value: 'certificate', label: 'Professional Certificate' },
        ],
        verificationStatuses: [
            { value: 'pending', label: 'Pending', color: 'yellow' },
            { value: 'approved', label: 'Approved', color: 'green' },
            { value: 'rejected', label: 'Rejected', color: 'red' },
            { value: 'needs_reupload', label: 'Needs Re-upload', color: 'orange' },
        ],
        withdrawalPreferences: [
            { value: 'auto', label: 'Automatic weekly withdrawal' },
            { value: 'manual', label: 'Manual withdrawal request' },
        ],
        daysOfWeek: [
            { value: 'monday', label: 'Monday' },
            { value: 'tuesday', label: 'Tuesday' },
            { value: 'wednesday', label: 'Wednesday' },
            { value: 'thursday', label: 'Thursday' },
            { value: 'friday', label: 'Friday' },
            { value: 'saturday', label: 'Saturday' },
            { value: 'sunday', label: 'Sunday' },
        ],
    };
};
exports.toStaticDataDto = toStaticDataDto;
const _mapPersonalInfo = (technician, user) => {
    return {
        fullName: technician.personalInfo?.fullName ||
            technician.displayName ||
            constants_1.PERSONAL_INFO_DEFAULTS.FULL_NAME,
        phoneNumber: technician.personalInfo?.phoneNumber ||
            technician.phone ||
            constants_1.PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
        email: user.email || '',
        dateOfBirth: technician.personalInfo?.dateOfBirth ||
            constants_1.PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
        gender: technician.personalInfo?.gender || constants_1.PERSONAL_INFO_DEFAULTS.GENDER,
        languages: Array.isArray(technician.personalInfo?.languages)
            ? technician.personalInfo.languages
            : constants_1.PERSONAL_INFO_DEFAULTS.LANGUAGES,
        bio: technician.bio || constants_1.PERSONAL_INFO_DEFAULTS.BIO,
        profilePictureUrl: technician.profilePictureUrl ||
            constants_1.PERSONAL_INFO_DEFAULTS.PROFILE_PICTURE_URL,
        address: technician.personalInfo?.address || {
            street: 'Not specified',
            city: 'Not specified',
            state: 'Not specified',
            pincode: 'Not specified',
            landmark: 'Not specified',
        },
    };
};
const _mapIdentityVerification = (technician) => {
    return {
        verificationStatus: technician.identityVerification?.verificationStatus ||
            constants_1.VerificationStatus.PENDING,
        governmentIdType: technician.identityVerification?.idType,
        governmentIdNumber: technician.identityVerification?.idNumber,
        idDocument: technician.identityVerification?.idDocument,
    };
};
const _mapSkillsServices = (technician) => {
    return {
        services: technician.services || constants_1.SKILLS_DEFAULTS.SERVICES,
        experienceYears: technician.experienceYears || constants_1.SKILLS_DEFAULTS.EXPERIENCE_YEARS,
        basePrices: technician.basePrices || constants_1.SKILLS_DEFAULTS.BASE_PRICES,
    };
};
const _mapAvailabilityPreferences = (technician) => {
    return {
        isAvailable: technician.availability?.isAvailable ??
            constants_1.AVAILABILITY_DEFAULTS.IS_AVAILABLE,
        serviceAreas: technician.workAreas || [],
        workRadius: technician.serviceRadiusKm || constants_1.AVAILABILITY_DEFAULTS.WORK_RADIUS,
        weeklyPattern: technician.availability?.weeklyPattern,
    };
};
const _mapBankPaymentDetails = (technician) => {
    if (technician.paymentDetails) {
        return {
            bankAccount: {
                holderName: technician.paymentDetails.bankAccount?.holderName ||
                    constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
                accountNumber: technician.paymentDetails.bankAccount?.accountNumber ||
                    constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
                ifscCode: technician.paymentDetails.bankAccount?.ifscCode ||
                    constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
                bankName: technician.paymentDetails.bankAccount?.bankName ||
                    constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME,
            },
            upiId: technician.paymentDetails.upiId || constants_1.PAYMENT_DEFAULTS.UPI_ID,
            withdrawalPreference: technician.paymentDetails.withdrawalPreference ||
                constants_1.PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE,
        };
    }
    return {
        bankAccount: {
            holderName: constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.HOLDER_NAME,
            accountNumber: constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.ACCOUNT_NUMBER,
            ifscCode: constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.IFSC_CODE,
            bankName: constants_1.PAYMENT_DEFAULTS.BANK_ACCOUNT.BANK_NAME,
        },
        upiId: constants_1.PAYMENT_DEFAULTS.UPI_ID,
        withdrawalPreference: constants_1.PAYMENT_DEFAULTS.WITHDRAWAL_PREFERENCE,
    };
};
const _mapDocuments = (technician) => {
    const documents = technician.documents || [];
    if (!Array.isArray(documents)) {
        return [];
    }
    const mappedDocuments = documents.map((doc) => {
        const mappedDoc = {
            _id: doc._id?.toString() || new mongoose_1.Types.ObjectId().toString(),
            type: doc.type || '',
            fileName: doc.fileName || '',
            url: doc.url || '',
            uploadedAt: doc.uploadedAt || new Date(),
            verified: doc.verified || false,
            status: doc.status || constants_1.DocumentStatus.PENDING,
            verifiedAt: doc.verifiedAt,
        };
        return mappedDoc;
    });
    return mappedDocuments;
};
