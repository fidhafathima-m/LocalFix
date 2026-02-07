"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TechnicianDocumentRepository = void 0;
const TechnicianDocumentSchema_1 = require("../../models/technician/TechnicianDocumentSchema");
const mongoose_1 = require("mongoose");
class TechnicianDocumentRepository {
    async create(documentData) {
        return await TechnicianDocumentSchema_1.TechnicianDocument.create(documentData);
    }
    async findByApplicationId(applicationId) {
        return await TechnicianDocumentSchema_1.TechnicianDocument.find({
            applicationId: new mongoose_1.Types.ObjectId(applicationId),
        });
    }
    async findByTechnicianId(technicianId) {
        return await TechnicianDocumentSchema_1.TechnicianDocument.find({
            technicianId: new mongoose_1.Types.ObjectId(technicianId),
        });
    }
}
exports.TechnicianDocumentRepository = TechnicianDocumentRepository;
