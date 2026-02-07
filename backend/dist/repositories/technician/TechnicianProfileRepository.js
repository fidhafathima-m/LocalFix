"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianProfileRepository = void 0;
const TechnicianSchema_1 = require("../../models/technician/TechnicianSchema");
const mongoose_1 = require("mongoose");
const UserSchema_1 = __importDefault(require("../../models/UserSchema"));
const bcrypt_1 = __importDefault(require("bcrypt"));
class TechnicianProfileRepository {
    async updateTechnician(technicianId, updateData) {
        try {
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
            const result = await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, { $set: processedUpdateData }, { new: true, runValidators: true });
            return result;
        }
        catch (error) {
            console.error('REPOSITORY - Error updating technician:', error);
            throw error;
        }
    }
    async addDocument(technicianId, documentData) {
        return await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
            $push: {
                documents: {
                    ...documentData,
                    _id: new mongoose_1.Types.ObjectId(),
                },
            },
        }, { new: true });
    }
    async updateDocument(technicianId, documentId, updateData) {
        return await TechnicianSchema_1.Technician.findOneAndUpdate({
            _id: new mongoose_1.Types.ObjectId(technicianId),
            'documents._id': new mongoose_1.Types.ObjectId(documentId),
        }, {
            $set: {
                'documents.$.verified': updateData.verified,
                'documents.$.status': updateData.status,
                'documents.$.verifiedAt': updateData.verifiedAt,
            },
        }, { new: true });
    }
    async removeDocument(technicianId, documentId) {
        return await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
            $pull: {
                documents: { _id: new mongoose_1.Types.ObjectId(documentId) },
            },
        }, { new: true });
    }
    async updateTechnicianPersonalInfo(technicianId, personalInfo) {
        return await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
            $set: {
                personalInfo: {
                    ...personalInfo,
                    languages: Array.isArray(personalInfo.languages)
                        ? personalInfo.languages
                        : [],
                },
            },
        }, { new: true });
    }
    async updateAvailability(technicianId, availabilityData) {
        return await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
            $set: {
                availability: availabilityData,
            },
        }, { new: true });
    }
    async updateTechnicianPaymentDetails(technicianId, paymentDetails) {
        try {
            const result = await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
                $set: {
                    'paymentDetails.bankAccount': paymentDetails.bankAccount,
                    'paymentDetails.upiId': paymentDetails.upiId,
                    'paymentDetails.withdrawalPreference': paymentDetails.withdrawalPreference,
                },
            }, { new: true });
            return !!result;
        }
        catch (error) {
            console.error('Error updating payment details:', error);
            return false;
        }
    }
    async updateIdentityVerification(technicianId, verificationData) {
        return await TechnicianSchema_1.Technician.findByIdAndUpdate(technicianId, {
            $set: {
                identityVerification: verificationData,
            },
        }, { new: true });
    }
    async findByService(service) {
        return await TechnicianSchema_1.Technician.find({
            services: service,
            status: 'approved',
        });
    }
    async findByLocation(location) {
        return await TechnicianSchema_1.Technician.find({
            workAreas: { $regex: location, $options: 'i' },
            status: 'approved',
        });
    }
    async findAvailableTechnicians() {
        return await TechnicianSchema_1.Technician.find({
            status: 'approved',
            'availability.isAvailable': true,
        });
    }
    async countTechnicians(filter = {}) {
        return await TechnicianSchema_1.Technician.countDocuments(filter);
    }
    async findAll(filter = {}, skip = 0, limit = 10) {
        return await TechnicianSchema_1.Technician.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
    }
    async updateUser(userId, updateData) {
        return await UserSchema_1.default.findByIdAndUpdate(userId, { $set: updateData }, { new: true, runValidators: true });
    }
    async updateUserPassword(userId, newPassword) {
        try {
            // Hash the new password
            const saltRounds = 12;
            const passwordHash = await bcrypt_1.default.hash(newPassword, saltRounds);
            // Update the user's password
            const result = await UserSchema_1.default.findByIdAndUpdate(userId, {
                $set: {
                    passwordHash,
                    updatedAt: new Date(),
                },
            }, { new: true });
            return result;
        }
        catch (error) {
            console.error('TECH PROFILE REPO - Error updating password:', error);
            throw error;
        }
    }
    async verifyPassword(userId, password) {
        try {
            const user = await UserSchema_1.default.findById(userId).select('+passwordHash');
            if (!user || !user.passwordHash) {
                return false;
            }
            const isValid = await bcrypt_1.default.compare(password, user.passwordHash);
            return isValid;
        }
        catch (error) {
            console.error('TECH PROFILE REPO - Error verifying password:', error);
            return false;
        }
    }
    async updateLastLogin(userId) {
        return await UserSchema_1.default.findByIdAndUpdate(userId, {
            $set: {
                lastLogin: new Date(),
                updatedAt: new Date(),
            },
        }, { new: true });
    }
    async updateLoginDevice(userId, deviceInfo) {
        return await UserSchema_1.default.findByIdAndUpdate(userId, {
            $set: {
                loginDevice: deviceInfo,
                updatedAt: new Date(),
            },
        }, { new: true });
    }
    async findByRole(role) {
        return await UserSchema_1.default.find({ role }).sort({ createdAt: -1 });
    }
    async countUsers(filter = {}) {
        return await UserSchema_1.default.countDocuments(filter);
    }
    async findAllUsers(filter = {}, skip = 0, limit = 10) {
        return await UserSchema_1.default.find(filter)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
    }
    async deleteUser(userId) {
        const result = await UserSchema_1.default.findByIdAndDelete(userId);
        return result !== null;
    }
    async updateProfile(userId, profileData) {
        return await UserSchema_1.default.findByIdAndUpdate(userId, {
            $set: {
                ...profileData,
                updatedAt: new Date(),
            },
        }, { new: true, runValidators: true });
    }
}
exports.TechnicianProfileRepository = TechnicianProfileRepository;
