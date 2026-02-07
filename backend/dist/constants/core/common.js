"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GeneralMessages = exports.OTP_CONFIG = exports.OTPPurpose = exports.ResponseStatus = exports.VALIDATION = exports.PAGINATION_DEFAULTS = void 0;
exports.PAGINATION_DEFAULTS = {
    PAGE: 1,
    LIMIT: 10,
    SINGLE_RESULT: {
        page: 1,
        limit: 1,
        total: 1,
        pages: 1,
    },
    SORT_BY: 'createdAt',
    SORT_ORDER: 'desc',
};
exports.VALIDATION = {
    MIN_FULL_NAME_LENGTH: 2,
    MAX_FULL_NAME_LENGTH: 100,
    MIN_PHONE_LENGTH: 10,
    MAX_PHONE_LENGTH: 15,
    EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    MIN_EXPERIENCE_YEARS: 0,
    MAX_EXPERIENCE_YEARS: 50,
    MIN_WORK_RADIUS: 1,
    MAX_WORK_RADIUS: 100,
    MIN_PASSWORD_LENGTH: 6,
    MAX_PASSWORD_LENGTH: 128,
};
var ResponseStatus;
(function (ResponseStatus) {
    ResponseStatus["SUCCESS"] = "success";
    ResponseStatus["ERROR"] = "error";
    ResponseStatus["FAIL"] = "fail";
})(ResponseStatus || (exports.ResponseStatus = ResponseStatus = {}));
var OTPPurpose;
(function (OTPPurpose) {
    OTPPurpose["SIGNUP"] = "signup";
    OTPPurpose["RESET"] = "reset";
    OTPPurpose["LOGIN"] = "login";
    OTPPurpose["APPLICATION"] = "application";
    OTPPurpose["VERIFICATION"] = "verification";
})(OTPPurpose || (exports.OTPPurpose = OTPPurpose = {}));
exports.OTP_CONFIG = {
    LENGTH: 6,
    EXPIRY_MINUTES: 5,
    EXPIRY_MS: 5 * 60 * 1000, // 5 minutes in milliseconds
};
var GeneralMessages;
(function (GeneralMessages) {
    GeneralMessages["SERVER_ERROR"] = "Internal server error";
    GeneralMessages["UNAUTHORIZED"] = "Unauthorized access";
    GeneralMessages["FORBIDDEN"] = "Access forbidden";
    GeneralMessages["NOT_FOUND"] = "Resource not found";
    GeneralMessages["BAD_REQUEST"] = "Bad request";
    GeneralMessages["CONFLICT"] = "Resource already exists";
})(GeneralMessages || (exports.GeneralMessages = GeneralMessages = {}));
