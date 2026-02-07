"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserRepository = void 0;
const BaseRepository_1 = require("../BaseRepository");
const UserSchema_1 = __importDefault(require("../../models/UserSchema"));
class UserRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(UserSchema_1.default);
    }
    async findByEmail(email, role) {
        const query = {
            email: email.toLowerCase(),
            isDeleted: false,
        };
        if (role) {
            query.roles = role;
        }
        return this.findOne(query);
    }
    async findByPhone(phone, role) {
        const query = {
            phone,
            isDeleted: false,
        };
        if (role) {
            query.roles = role;
        }
        return this.findOne(query);
    }
    async findByIdentifier(identifier, role) {
        let actualIdentifier = identifier;
        if (typeof identifier === "object" && identifier !== null) {
            const identifierObj = identifier;
            if (identifierObj.email) {
                actualIdentifier = identifierObj.email;
            }
            else if (identifierObj.phone) {
                actualIdentifier = identifierObj.phone;
            }
            else {
                return null;
            }
        }
        const query = /^\d{10}$/.test(actualIdentifier)
            ? { phone: actualIdentifier }
            : { email: { $regex: new RegExp(`^${actualIdentifier}$`, "i") } };
        if (role) {
            query.roles = role;
        }
        return this.findOne(query);
    }
    async updatePassword(identifier, passwordHash, userType) {
        let actualIdentifier = identifier;
        if (typeof identifier === "object" && identifier !== null) {
            const identifierObj = identifier;
            if (identifierObj.email) {
                actualIdentifier = identifierObj.email;
            }
            else if (identifierObj.phone) {
                actualIdentifier = identifierObj.phone;
            }
            else {
                return null;
            }
        }
        const query = /^\d{10}$/.test(actualIdentifier)
            ? { phone: actualIdentifier }
            : { email: actualIdentifier };
        if (userType === "serviceProvider") {
            query.roles = "serviceProvider";
        }
        return this.model.findOneAndUpdate(query, { $set: { passwordHash } }, { new: true });
    }
    async updateApplicationStatus(userId, applicationStatus) {
        return this.update(userId, {
            $set: { applicationStatus },
        });
    }
    async storeRefreshToken(userId, refreshToken) {
        await this.update(userId, {
            $push: {
                refreshTokens: {
                    token: refreshToken,
                    createdAt: new Date(),
                },
            },
        });
    }
    async findByRefreshToken(userId, refreshToken) {
        return this.findOne({
            _id: userId,
            "refreshTokens.token": refreshToken,
        });
    }
    async updateRefreshToken(userId, oldToken, newToken) {
        await this.model.findOneAndUpdate({
            _id: userId,
            "refreshTokens.token": oldToken,
        }, {
            $set: {
                "refreshTokens.$.token": newToken,
                "refreshTokens.$.createdAt": new Date(),
            },
        });
    }
    async removeRefreshToken(userId, refreshToken) {
        await this.update(userId, {
            $pull: {
                refreshTokens: { token: refreshToken },
            },
        });
    }
    async removeAllRefreshTokens(userId) {
        await this.update(userId, {
            $set: { refreshTokens: [] },
        });
    }
}
exports.UserRepository = UserRepository;
