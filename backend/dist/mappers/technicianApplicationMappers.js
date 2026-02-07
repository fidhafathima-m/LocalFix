"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toApplicationListDto = exports.toApplicationDataDto = void 0;
const toApplicationDataDto = (application) => {
    return {
        _id: application._id.toString(),
        email: application.email || "",
        status: application.status || "draft",
        stepsCompleted: application.stepsCompleted || [],
        personal: _mapPersonalInfo(application.personal),
        identity: _mapIdentityInfo(application.identity),
        skills: _mapSkillsInfo(application.skills),
        availability: _mapAvailabilityInfo(application.availability),
        bank: _mapBankInfo(application.bank),
        documents: _mapDocumentsInfo(application.documents),
        agreement: application.agreement || false,
        submittedAt: application.submittedAt,
        reviewNotes: application.reviewNotes,
        rejectionReason: application.rejectionReason,
        rejectedAt: application.rejectedAt,
        createdAt: application.createdAt || new Date(),
        updatedAt: application.updatedAt || new Date(),
        technicianId: application.technicianId?.toString(),
    };
};
exports.toApplicationDataDto = toApplicationDataDto;
// Map to application list DTO
const toApplicationListDto = (applications) => {
    return applications.map((app) => (0, exports.toApplicationDataDto)(app));
};
exports.toApplicationListDto = toApplicationListDto;
const _mapPersonalInfo = (personal) => {
    if (!personal)
        return {};
    return {
        fullName: personal.fullName,
        phoneNumber: personal.phoneNumber,
        email: personal.email,
        gender: personal.gender,
        dateOfBirth: personal.dateOfBirth,
        languages: Array.isArray(personal.languages) ? personal.languages : [],
        address: personal.address ? _mapAddress(personal.address) : undefined,
    };
};
const _mapIdentityInfo = (identity) => {
    if (!identity)
        return {};
    // Parse address if it's a JSON string
    let parsedAddress = undefined;
    if (identity.address && typeof identity.address === "string") {
        try {
            parsedAddress = JSON.parse(identity.address);
        }
        catch (error) {
            console.error("Error parsing identity address:", error);
            // Keep as string if parsing fails
            parsedAddress = identity.address;
        }
    }
    else {
        parsedAddress = identity.address;
    }
    // Parse location if it's a JSON string
    let parsedLocation = undefined;
    if (identity.location && typeof identity.location === "string") {
        try {
            parsedLocation = JSON.parse(identity.location);
        }
        catch (error) {
            console.error("Error parsing identity location:", error);
        }
    }
    else {
        parsedLocation = identity.location;
    }
    return {
        // Map the correct field names from database
        idType: identity.idType || identity.governmentIdType,
        idNumber: identity.idNumber || identity.governmentIdNumber,
        address: parsedAddress,
        location: parsedLocation ? _mapLocation(parsedLocation) : undefined,
        verified: identity.verified || false,
        verificationStatus: identity.verificationStatus || "pending",
        verifiedAt: identity.verifiedAt,
    };
};
const _mapSkillsInfo = (skills) => {
    if (!skills)
        return {};
    return {
        services: Array.isArray(skills.services) ? skills.services : [],
        yearsOfExperience: skills.yearsOfExperience,
        languages: Array.isArray(skills.languages) ? skills.languages : [],
        bio: skills.bio,
        serviceAreas: Array.isArray(skills.serviceAreas) ? skills.serviceAreas : [],
        workRadius: skills.workRadius,
    };
};
const _mapAvailabilityInfo = (availability) => {
    if (!availability)
        return {};
    return {
        serviceAreas: Array.isArray(availability.serviceAreas)
            ? availability.serviceAreas
            : [],
        workRadius: availability.workRadius,
        availability: availability.availability || {},
    };
};
const _mapBankInfo = (bank) => {
    if (!bank)
        return {};
    return {
        accountHolderName: bank.accountHolderName,
        accountNumber: bank.accountNumber,
        ifscCode: bank.ifscCode,
        upiId: bank.upiId,
        bankName: bank.bankName,
        withdrawalPreference: bank.withdrawalPreference,
    };
};
const _mapDocumentsInfo = (documents) => {
    if (!documents)
        return {};
    const result = {};
    const documentFields = [
        "idProof",
        "addressProof",
        "policeVerification",
        "passportPhoto",
        "profilePhoto",
        "tradeLicense",
    ];
    documentFields.forEach((field) => {
        if (documents[field]) {
            result[field] = _mapDocumentData(documents[field]);
        }
    });
    return result;
};
const _mapDocumentData = (document) => {
    return {
        url: document.url || "",
        publicId: document.publicId,
        filename: document.filename || "",
        mimetype: document.mimetype || "",
        size: document.size || 0,
        uploadedAt: document.uploadedAt || new Date(),
        verified: document.verified || false,
        uploadFailed: document.uploadFailed || false,
        error: document.error,
    };
};
const _mapAddress = (address) => {
    if (typeof address === "string") {
        try {
            const parsed = JSON.parse(address);
            return _mapAddress(parsed);
        }
        catch {
            return {};
        }
    }
    return {
        street: address.street,
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        landmark: address.landmark,
    };
};
const _mapLocation = (location) => {
    return {
        type: location.type || "Point",
        coordinates: Array.isArray(location.coordinates)
            ? location.coordinates
            : [0, 0],
        formattedAddress: location.formattedAddress,
        placeId: location.placeId,
    };
};
