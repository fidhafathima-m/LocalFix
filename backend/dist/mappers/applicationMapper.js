"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toApplicationDetailDto = exports.toApplicationListDto = void 0;
const toApplicationListDto = (application) => {
    return {
        _id: application._id?.toString() || "",
        technicianId: application.technicianId?.toString() || "",
        email: application.email || "",
        status: application.status || "",
        personal: _mapPersonalInfo(application.personal),
        skills: _mapSkills(application.skills),
        submittedAt: application.submittedAt,
        rejectionReason: application.rejectionReason,
    };
};
exports.toApplicationListDto = toApplicationListDto;
// Map to detail DTO
const toApplicationDetailDto = (application) => {
    const baseDto = (0, exports.toApplicationListDto)(application);
    return {
        ...baseDto,
        identity: _mapIdentity(application.identity),
        availability: _mapAvailability(application.availability),
        bank: _mapBankDetails(application.bank),
        documents: application.documents || {},
        stepsCompleted: application.stepsCompleted || [],
        reviewNotes: application.reviewNotes,
        rejectedAt: application.rejectedAt
            ? new Date(application.rejectedAt)
            : undefined,
        resubmittedCount: application.resubmittedCount || 0,
        lastSubmittedAt: application.lastSubmittedAt,
        agreement: application.agreement || false,
        createdAt: application.createdAt,
        updatedAt: application.updatedAt,
    };
};
exports.toApplicationDetailDto = toApplicationDetailDto;
const _mapPersonalInfo = (personal) => {
    return {
        fullName: personal?.fullName || "",
        phoneNumber: personal?.phoneNumber || "",
        email: personal?.email || "",
        gender: personal?.gender || "",
        dateOfBirth: personal?.dateOfBirth || "",
        languages: Array.isArray(personal?.languages) ? personal.languages : [],
        address: personal?.address
            ? {
                street: personal.address.street || "",
                city: personal.address.city || "",
                state: personal.address.state || "",
                pincode: personal.address.pincode || "",
                landmark: personal.address.landmark || "",
            }
            : undefined,
    };
};
const _mapSkills = (skills) => {
    return {
        services: Array.isArray(skills?.services) ? skills.services : [],
        yearsOfExperience: skills?.yearsOfExperience?.toString() || "",
        languages: Array.isArray(skills?.languages) ? skills.languages : [],
        bio: skills?.bio || "",
        serviceAreas: Array.isArray(skills?.serviceAreas)
            ? skills.serviceAreas
            : [],
        workRadius: skills?.workRadius?.toString() || "",
    };
};
const _mapIdentity = (identity) => {
    // Parse address if it's a JSON string
    let parsedAddress = undefined;
    if (identity?.address && typeof identity.address === "string") {
        try {
            parsedAddress = JSON.parse(identity.address);
        }
        catch (error) {
            console.error("Error parsing identity address:", error);
        }
    }
    else {
        parsedAddress = identity?.address;
    }
    // Parse location if it's a JSON string
    let parsedLocation = undefined;
    if (identity?.location && typeof identity.location === "string") {
        try {
            parsedLocation = JSON.parse(identity.location);
        }
        catch (error) {
            console.error("Error parsing identity location:", error);
        }
    }
    else {
        parsedLocation = identity?.location;
    }
    return {
        idType: identity?.idType || identity?.governmentIdType || "",
        idNumber: identity?.idNumber || identity?.governmentIdNumber || "",
        address: parsedAddress,
        location: parsedLocation,
        verified: identity?.verified || false,
        verificationStatus: identity?.verificationStatus || "pending",
        verifiedAt: identity?.verifiedAt,
    };
};
const _mapAvailability = (availability) => {
    // Parse availability if it's nested under availability.availability
    let availabilityData = availability?.availability || availability;
    // If availability is a string, try to parse it
    if (typeof availabilityData === "string") {
        try {
            availabilityData = JSON.parse(availabilityData);
        }
        catch (error) {
            console.error("Error parsing availability:", error);
            availabilityData = {};
        }
    }
    return {
        serviceAreas: Array.isArray(availability?.serviceAreas)
            ? availability.serviceAreas
            : [],
        workRadius: availability?.workRadius?.toString() || "",
        availability: availabilityData,
    };
};
const _mapBankDetails = (bank) => {
    return {
        accountHolderName: bank?.accountHolderName || "",
        accountNumber: bank?.accountNumber || "",
        ifscCode: bank?.ifscCode || "",
        upiId: bank?.upiId || "",
        bankName: bank?.bankName || "",
        withdrawalPreference: bank?.withdrawalPreference || "",
    };
};
