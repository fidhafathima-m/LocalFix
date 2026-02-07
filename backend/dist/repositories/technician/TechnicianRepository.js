"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianRepository = void 0;
const mongoose_1 = require("mongoose");
const BaseRepository_1 = require("../BaseRepository");
const TechnicianSchema_1 = require("../../models/technician/TechnicianSchema");
class TechnicianRepository extends BaseRepository_1.BaseRepository {
    constructor() {
        super(TechnicianSchema_1.Technician);
    }
    async findByUserId(userId) {
        const result = await this.model
            .findOne({ userId: new mongoose_1.Types.ObjectId(userId) })
            .exec();
        return result;
    }
    async updateByUserId(userId, updateData) {
        const processedUpdateData = {
            ...updateData,
            personalInfo: updateData.personalInfo
                ? {
                    ...updateData.personalInfo,
                    languages: Array.isArray(updateData.personalInfo?.languages)
                        ? updateData.personalInfo.languages
                        : [],
                }
                : undefined,
        };
        const result = await this.model
            .findOneAndUpdate({ userId: new mongoose_1.Types.ObjectId(userId) }, { $set: processedUpdateData }, { new: true, runValidators: true })
            .exec();
        return result;
    }
    async updateTechnicianStatus(id, updateData) {
        return this.update(id, { $set: updateData });
    }
    async findByPhone(phoneNumber) {
        try {
            const cleanPhone = phoneNumber.replace(/\D/g, '');
            return await TechnicianSchema_1.Technician.findOne({
                'personalInfo.phoneNumber': { $regex: cleanPhone, $options: 'i' }
            }).exec();
        }
        catch (error) {
            console.error('Error finding technician by phone:', error);
            return null;
        }
    }
}
exports.TechnicianRepository = TechnicianRepository;
