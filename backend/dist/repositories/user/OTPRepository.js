"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OTPRepository = void 0;
const BaseRepository_1 = require("../BaseRepository");
const OTPVerificationSchema_1 = __importDefault(require("../../models/OTPVerificationSchema"));
class OTPRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(OTPVerificationSchema_1.default);
    }
    async findLatest(phone, email, purpose) {
        const query = {};
        if (phone)
            query.phone = phone;
        if (email)
            query.email = email;
        if (purpose)
            query.purpose = purpose;
        return this.model.findOne(query).sort({ createdAt: -1 });
    }
    async deleteMany(phone, email, purpose) {
        const query = {};
        if (phone)
            query.phone = phone;
        if (email)
            query.email = email;
        if (purpose)
            query.purpose = purpose;
        await this.model.deleteMany(query);
    }
    async deleteById(id) {
        await this.delete(id);
    }
}
exports.OTPRepository = OTPRepository;
