"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toTechnicianDetailDto = exports.toTechnicianListDto = void 0;
const toTechnicianListDto = (technician, user) => {
    return {
        _id: technician._id?.toString() || "",
        userId: technician.userId?.toString() || "",
        displayName: technician.displayName || "",
        email: user?.email || "",
        phone: user?.phone || technician.phone || "",
        services: technician.services || [],
        status: technician.status || "",
        averageRating: technician.averageRating || 0,
        totalJobs: technician.totalJobs || 0,
        completedJobs: technician.completedJobs || 0,
        createdAt: technician.createdAt || new Date(),
        profilePictureUrl: technician.profilePictureUrl,
    };
};
exports.toTechnicianListDto = toTechnicianListDto;
// Map to detailed DTO
const toTechnicianDetailDto = (adminTechnician) => {
    // Convert availability to a compatible type
    const availability = adminTechnician.availability
        ? _mapAvailability(adminTechnician.availability)
        : undefined;
    return {
        // Basic info
        _id: adminTechnician._id?.toString() || "",
        userId: adminTechnician.userId?.toString() || "",
        displayName: adminTechnician.displayName || "",
        email: adminTechnician.email || "",
        phone: adminTechnician.phone || "",
        services: adminTechnician.services || [],
        status: adminTechnician.status || "",
        bio: adminTechnician.bio || "",
        profilePictureUrl: adminTechnician.profilePictureUrl || "",
        // Ratings and jobs
        averageRating: adminTechnician.averageRating || 0,
        ratingCount: adminTechnician.ratingCount || 0,
        totalJobs: adminTechnician.totalJobs || 0,
        completedJobs: adminTechnician.completedJobs || 0,
        ongoingJobs: adminTechnician.ongoingJobs || 0,
        totalEarnings: adminTechnician.totalEarnings || 0,
        // Professional info
        experienceYears: adminTechnician.experienceYears || 0,
        workAreas: adminTechnician.workAreas || [],
        serviceRadiusKm: adminTechnician.serviceRadiusKm || 0,
        // Personal info
        personalInfo: _mapPersonalInfo(adminTechnician.personalInfo),
        // Documents
        documents: _mapDocuments(adminTechnician.documents),
        // Additional fields
        availability,
        suspensionReason: adminTechnician.suspensionReason,
        suspendedAt: adminTechnician.suspendedAt,
        createdAt: adminTechnician.createdAt || new Date(),
        updatedAt: adminTechnician.updatedAt || new Date(),
    };
};
exports.toTechnicianDetailDto = toTechnicianDetailDto;
const _mapPersonalInfo = (personalInfo) => {
    return {
        fullName: personalInfo?.fullName || "",
        gender: personalInfo?.gender || "",
        phoneNumber: personalInfo?.phoneNumber || "",
        dateOfBirth: personalInfo?.dateOfBirth || "",
        languages: Array.isArray(personalInfo?.languages)
            ? personalInfo.languages
            : [],
        address: personalInfo?.address
            ? _mapAddress(personalInfo.address)
            : undefined,
    };
};
const _mapAddress = (address) => {
    return {
        street: address?.street || "",
        city: address?.city || "",
        state: address?.state || "",
        pincode: address?.pincode || "",
    };
};
const _mapDocuments = (documents) => {
    if (!documents || typeof documents !== "object") {
        return [];
    }
    return Object.entries(documents)
        .filter(([_, doc]) => doc && doc.url)
        .map(([type, doc]) => ({
        type,
        url: doc.url,
        verified: doc.verified || false,
        uploadedAt: doc.uploadedAt || new Date(),
    }));
};
const _mapAvailability = (availability) => {
    if (!availability || typeof availability !== "object") {
        return {};
    }
    // Convert availability to a plain object with string index signature
    const result = {};
    Object.entries(availability).forEach(([key, value]) => {
        result[key] = value;
    });
    return result;
};
