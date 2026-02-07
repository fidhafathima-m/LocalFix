"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DocumentTypes = exports.DocumentStatus = exports.VerificationStatus = exports.TechnicianStatus = void 0;
var TechnicianStatus;
(function (TechnicianStatus) {
    TechnicianStatus["SUBMITTED"] = "submitted";
    TechnicianStatus["UNDER_REVIEW"] = "under_review";
    TechnicianStatus["APPROVED"] = "approved";
    TechnicianStatus["REJECTED"] = "rejected";
    TechnicianStatus["ACTIVE"] = "active";
    TechnicianStatus["INACTIVE"] = "inactive";
    TechnicianStatus["SUSPENDED"] = "suspended";
    TechnicianStatus["DRAFT"] = "draft";
    TechnicianStatus["PENDING"] = "pending";
    TechnicianStatus["BLOCKED"] = "blocked";
})(TechnicianStatus || (exports.TechnicianStatus = TechnicianStatus = {}));
var VerificationStatus;
(function (VerificationStatus) {
    VerificationStatus["PENDING"] = "pending";
    VerificationStatus["VERIFIED"] = "verified";
    VerificationStatus["REJECTED"] = "rejected";
    VerificationStatus["UNDER_REVIEW"] = "under_review";
})(VerificationStatus || (exports.VerificationStatus = VerificationStatus = {}));
var DocumentStatus;
(function (DocumentStatus) {
    DocumentStatus["PENDING"] = "pending";
    DocumentStatus["VERIFIED"] = "verified";
    DocumentStatus["REJECTED"] = "rejected";
    DocumentStatus["UNDER_REVIEW"] = "under_review";
})(DocumentStatus || (exports.DocumentStatus = DocumentStatus = {}));
var DocumentTypes;
(function (DocumentTypes) {
    DocumentTypes["ID_PROOF"] = "idProof";
    DocumentTypes["ADDRESS_PROOF"] = "addressProof";
    DocumentTypes["POLICE_VERIFICATION"] = "policeVerification";
    DocumentTypes["TRADE_LICENSE"] = "tradeLicense";
    DocumentTypes["PASSPORT_PHOTO"] = "passportPhoto";
    DocumentTypes["PROFILE_PHOTO"] = "profilePhoto";
    DocumentTypes["GOVERNMENT_ID"] = "governmentId";
    DocumentTypes["BANK_PROOF"] = "bankProof";
    DocumentTypes["OTHER"] = "other";
})(DocumentTypes || (exports.DocumentTypes = DocumentTypes = {}));
