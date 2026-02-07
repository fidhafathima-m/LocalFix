"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTechnicianProfileDto = exports.toDashboardOverviewDto = void 0;
const constants_1 = require("../constants");
const toDashboardOverviewDto = (technician) => {
    return {
        averageRating: technician.averageRating || constants_1.DASHBOARD_DEFAULTS.AVERAGE_RATING,
        upcomingBookings: constants_1.DASHBOARD_DEFAULTS.UPCOMING_BOOKINGS,
        monthlyEarnings: constants_1.DASHBOARD_DEFAULTS.MONTHLY_EARNINGS,
        totalJobs: constants_1.DASHBOARD_DEFAULTS.TOTAL_JOBS,
    };
};
exports.toDashboardOverviewDto = toDashboardOverviewDto;
// Map to technician profile DTO
const toTechnicianProfileDto = (technician, user, userAddress) => {
    const personalInfo = _mapPersonalInfo(technician, userAddress);
    return {
        _id: technician._id?.toString() || '',
        userId: technician.userId?.toString() || '',
        displayName: technician.displayName || '',
        email: user.email || '',
        phone: user.phone || technician.phone || '',
        services: technician.services || [],
        experienceYears: technician.experienceYears || constants_1.DASHBOARD_DEFAULTS.EXPERIENCE_YEARS,
        workAreas: technician.workAreas || [],
        averageRating: technician.averageRating || constants_1.DASHBOARD_DEFAULTS.AVERAGE_RATING,
        ratingCount: technician.ratingCount || constants_1.DASHBOARD_DEFAULTS.RATING_COUNT,
        profilePictureUrl: technician.profilePictureUrl || '',
        isVerified: technician.status === constants_1.TechnicianStatus.APPROVED,
        bio: technician.bio || constants_1.PERSONAL_INFO_DEFAULTS.BIO,
        status: technician.status || '',
        suspensionReason: technician.suspensionReason,
        suspendedAt: technician.suspendedAt,
        personalInfo,
        createdAt: technician.createdAt || new Date(),
        updatedAt: technician.updatedAt || new Date(),
    };
};
exports.toTechnicianProfileDto = toTechnicianProfileDto;
const _mapPersonalInfo = (technician, userAddress) => {
    const personalInfo = {
        fullName: technician.personalInfo?.fullName ||
            technician.displayName ||
            constants_1.PERSONAL_INFO_DEFAULTS.FULL_NAME,
        gender: technician.personalInfo?.gender || constants_1.PERSONAL_INFO_DEFAULTS.GENDER,
        phoneNumber: technician.personalInfo?.phoneNumber ||
            technician.phone ||
            constants_1.PERSONAL_INFO_DEFAULTS.PHONE_NUMBER,
        dateOfBirth: technician.personalInfo?.dateOfBirth ||
            constants_1.PERSONAL_INFO_DEFAULTS.DATE_OF_BIRTH,
        languages: _formatLanguages(technician.personalInfo?.languages),
        address: {
            street: constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode: constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
        },
    };
    // Handle address data
    if (userAddress) {
        personalInfo.address = _mapAddress(userAddress);
    }
    else if (technician.personalInfo?.address) {
        const address = technician.personalInfo.address;
        personalInfo.address = {
            street: address.street || constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
            city: address.city || constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
            state: address.state || constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
            pincode: address.pincode || constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
        };
    }
    return personalInfo;
};
const _mapAddress = (address) => {
    return {
        street: address.street || constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.STREET,
        city: address.city || constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.CITY,
        state: address.state || constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.STATE,
        pincode: address.pincode || constants_1.PERSONAL_INFO_DEFAULTS.ADDRESS.PINCODE,
    };
};
const _formatLanguages = (languages) => {
    if (!languages) {
        return [];
    }
    if (Array.isArray(languages)) {
        const result = languages.filter(lang => lang && String(lang).trim() !== '');
        return result.slice(0, constants_1.LANGUAGE_FORMAT_OPTIONS.MAX_LANGUAGES);
    }
    if (typeof languages === 'string') {
        if (languages.trim() === '') {
            return [];
        }
        try {
            const parsed = JSON.parse(languages);
            if (Array.isArray(parsed)) {
                const result = parsed.filter((lang) => lang && String(lang).trim() !== '');
                return result.slice(0, constants_1.LANGUAGE_FORMAT_OPTIONS.MAX_LANGUAGES);
            }
            if (parsed && typeof parsed === 'string') {
                return [parsed.trim()];
            }
        }
        catch (e) {
            if (languages.includes(constants_1.LANGUAGE_FORMAT_OPTIONS.DELIMITERS.COMMA)) {
                const result = languages
                    .split(constants_1.LANGUAGE_FORMAT_OPTIONS.DELIMITERS.COMMA)
                    .map((lang) => lang.trim())
                    .filter(lang => lang !== '');
                return result.slice(0, constants_1.LANGUAGE_FORMAT_OPTIONS.MAX_LANGUAGES);
            }
            return [languages.trim()];
        }
    }
    return [];
};
