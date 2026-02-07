"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SparePartsRequestRepository = void 0;
const mongoose_1 = require("mongoose");
const SparePartsRequestSchema_1 = require("../../models/SparePartsRequestSchema");
class SparePartsRequestRepository {
    async create(requestData) {
        const request = new SparePartsRequestSchema_1.SparePartsRequest(requestData);
        return await request.save();
    }
    async findById(requestId) {
        return await SparePartsRequestSchema_1.SparePartsRequest.findById(requestId)
            .populate('technicianId', 'displayName phone')
            .populate('orderId', 'orderCode serviceName')
            .exec();
    }
    async findByOrderId(orderId) {
        return await SparePartsRequestSchema_1.SparePartsRequest.find({ orderId })
            .populate('technicianId', 'displayName phone')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByTechnicianId(technicianId) {
        return await SparePartsRequestSchema_1.SparePartsRequest.find({ technicianId })
            .populate('orderId', 'orderCode serviceName')
            .populate('customerId', 'fullName phone')
            .sort({ createdAt: -1 })
            .exec();
    }
    async findByCustomerId(customerId) {
        return await SparePartsRequestSchema_1.SparePartsRequest.find({
            customerId: new mongoose_1.Types.ObjectId(customerId),
        })
            .populate('technicianId', 'displayName phone')
            .populate('orderId', 'orderCode serviceName')
            .sort({ createdAt: -1 })
            .exec();
    }
    async updateStatus(requestId, status, customerNotes) {
        const updateData = {
            status,
            respondedAt: new Date(),
        };
        if (customerNotes) {
            updateData.customerNotes = customerNotes;
        }
        return await SparePartsRequestSchema_1.SparePartsRequest.findByIdAndUpdate(requestId, { $set: updateData }, { new: true })
            .populate('technicianId', 'displayName phone')
            .populate('orderId', 'orderCode serviceName')
            .exec();
    }
    async addHistory(requestId, historyEntry) {
        return await SparePartsRequestSchema_1.SparePartsRequest.findByIdAndUpdate(requestId, {
            $push: {
                history: {
                    ...historyEntry,
                    timestamp: new Date(),
                },
            },
        }, { new: true }).exec();
    }
}
exports.SparePartsRequestRepository = SparePartsRequestRepository;
