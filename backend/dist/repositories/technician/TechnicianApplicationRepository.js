"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianApplicationRepository = void 0;
const mongoose_1 = require("mongoose");
const BaseRepository_1 = require("../BaseRepository");
const TechnicianApplicationSchema_1 = require("../../models/technician/TechnicianApplicationSchema");
class TechnicianApplicationRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(TechnicianApplicationSchema_1.TechnicianApplication);
    }
    async findByTechnicianId(technicianId) {
        return this.find({
            technicianId: new mongoose_1.Types.ObjectId(technicianId),
        });
    }
    async findByEmailAndStatus(email, statuses) {
        return this.findOne({
            email: email.toLowerCase().trim(),
            status: { $in: statuses },
        });
    }
    async findByTechnicianIdAndStatus(technicianId, statuses) {
        return this.findOne({
            technicianId: new mongoose_1.Types.ObjectId(technicianId),
            status: { $in: statuses },
        });
    }
    async findByUserIdAndStatus(userId, statuses) {
        return this.findOne({
            technicianId: new mongoose_1.Types.ObjectId(userId),
            status: { $in: statuses },
        });
    }
    async findByPhoneAndStatus(phoneNumber, status, excludeUserId) {
        try {
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            const query = {
                $or: [
                    { 'personal.phoneNumber': cleanPhone },
                    { 'personal.phoneNumber': { $regex: cleanPhone, $options: 'i' } }
                ],
                status: { $in: status }
            };
            // Exclude specific user if provided
            if (excludeUserId) {
                query.technicianId = { $ne: new mongoose_1.Types.ObjectId(excludeUserId) };
            }
            return await TechnicianApplicationSchema_1.TechnicianApplication.findOne(query).exec();
        }
        catch (error) {
            console.error('Error finding application by phone:', error);
            return null;
        }
    }
}
exports.TechnicianApplicationRepository = TechnicianApplicationRepository;
