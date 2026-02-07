"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ServiceRepository = void 0;
const serviceSchema_1 = require("../../models/category/serviceSchema");
const slugify_1 = __importDefault(require("slugify"));
class ServiceRepository {
    // Helper method for status filtering
    addStatusFilter(query, status) {
        if (status && status !== 'All Status' && status !== 'all') {
            // Normalize status input
            const normalizedStatus = status.trim().toLowerCase();
            // Map various status inputs to consistent values
            const statusMap = {
                active: 'active',
                inactive: 'inactive',
                activated: 'active',
                deactivated: 'inactive',
                enable: 'active',
                disable: 'inactive',
            };
            const backendStatus = statusMap[normalizedStatus] || normalizedStatus;
            // Only apply filter if we have a valid status
            if (['active', 'inactive'].includes(backendStatus)) {
                query.status = backendStatus;
            }
        }
    }
    // Helper method for search filtering
    addSearchFilter(query, search) {
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { name: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { slug: { $regex: searchRegex } },
            ];
        }
    }
    async create(serviceData) {
        const slug = (0, slugify_1.default)(serviceData.name, {
            lower: true,
            strict: true,
            trim: true,
        });
        const service = new serviceSchema_1.Service({
            ...serviceData,
            slug,
        });
        return await service.save();
    }
    async findById(serviceId) {
        return await serviceSchema_1.Service.findById(serviceId);
    }
    async findBySlug(slug) {
        return await serviceSchema_1.Service.findOne({ slug });
    }
    async findByName(name) {
        return await serviceSchema_1.Service.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
        });
    }
    async findByCategoryId(categoryId) {
        return await serviceSchema_1.Service.find({ categoryId }).sort({ createdAt: -1 });
    }
    async findAll(filter = {}, skip = 0, limit = 10, sort = { name: 1 }, search, status) {
        const query = { ...filter };
        this.addSearchFilter(query, search);
        this.addStatusFilter(query, status);
        return await serviceSchema_1.Service.find(query).sort(sort).skip(skip).limit(limit);
    }
    async update(serviceId, updateData) {
        if (updateData.name) {
            updateData.slug = (0, slugify_1.default)(updateData.name, {
                lower: true,
                strict: true,
                trim: true,
            });
        }
        return await serviceSchema_1.Service.findByIdAndUpdate(serviceId, { $set: updateData }, { new: true, runValidators: true });
    }
    async delete(serviceId) {
        const result = await serviceSchema_1.Service.findByIdAndDelete(serviceId);
        return result !== null;
    }
    async count(filter = {}, status, search) {
        const query = { ...filter };
        this.addSearchFilter(query, search);
        this.addStatusFilter(query, status);
        return await serviceSchema_1.Service.countDocuments(query);
    }
    async search(query, limit = 10, sort = { name: 1 }, status) {
        const searchFilter = {};
        // Add search criteria
        if (query && query.trim()) {
            const searchRegex = new RegExp(query.trim(), 'i');
            searchFilter.$or = [
                { name: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
            ];
        }
        this.addStatusFilter(searchFilter, status);
        return await serviceSchema_1.Service.find(searchFilter).sort(sort).limit(limit);
    }
    async searchByCategory(categoryId, query, limit = 10, sort = { name: 1 }, status) {
        const searchFilter = {
            categoryId,
        };
        // Add search criteria
        if (query && query.trim()) {
            const searchRegex = new RegExp(query.trim(), 'i');
            searchFilter.$or = [
                { name: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
            ];
        }
        this.addStatusFilter(searchFilter, status);
        return await serviceSchema_1.Service.find(searchFilter).sort(sort).limit(limit);
    }
}
exports.ServiceRepository = ServiceRepository;
