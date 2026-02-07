"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRoles = exports.UserStatus = void 0;
var UserStatus;
(function (UserStatus) {
    UserStatus["ACTIVE"] = "Active";
    UserStatus["INACTIVE"] = "Inactive";
    UserStatus["BLOCKED"] = "Blocked";
    UserStatus["PENDING"] = "pending";
})(UserStatus || (exports.UserStatus = UserStatus = {}));
var UserRoles;
(function (UserRoles) {
    UserRoles["USER"] = "user";
    UserRoles["SERVICE_PROVIDER"] = "serviceProvider";
    UserRoles["TECHNICIAN"] = "technician";
    UserRoles["ADMIN"] = "admin";
})(UserRoles || (exports.UserRoles = UserRoles = {}));
