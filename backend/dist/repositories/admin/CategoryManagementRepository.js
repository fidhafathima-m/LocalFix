"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CategoryRepository = void 0;
const categorySchema_1 = require("../../models/category/categorySchema");
const slugify_1 = __importDefault(require("slugify"));
class CategoryRepository {
    async create(categoryData) {
        const slug = (0, slugify_1.default)(categoryData.name, {
            lower: true,
            strict: true,
            trim: true,
        });
        const category = new categorySchema_1.Category({
            ...categoryData,
            slug,
        });
        return await category.save();
    }
    async findById(categoryId) {
        return await categorySchema_1.Category.findById(categoryId);
    }
    async findBySlug(slug) {
        return await categorySchema_1.Category.findOne({ slug });
    }
    async findByName(name) {
        return await categorySchema_1.Category.findOne({
            name: { $regex: new RegExp(`^${name}$`, 'i') },
        });
    }
    async findAll(filter = {}, skip = 0, limit = 10, search, status) {
        const query = { ...filter };
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { name: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { slug: { $regex: searchRegex } },
            ];
        }
        // Add status filter if provided
        if (status && status !== 'All Status' && status !== 'all') {
            query.status = status.toLowerCase(); // 'active' or 'inactive'
        }
        return await categorySchema_1.Category.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
    }
    async update(categoryId, updateData) {
        if (updateData.name) {
            updateData.slug = (0, slugify_1.default)(updateData.name, {
                lower: true,
                strict: true,
                trim: true,
            });
        }
        return await categorySchema_1.Category.findByIdAndUpdate(categoryId, { $set: updateData }, { new: true, runValidators: true });
    }
    async delete(categoryId) {
        const result = await categorySchema_1.Category.findByIdAndDelete(categoryId);
        return result !== null;
    }
    async count(filter = {}, search, status) {
        const query = { ...filter };
        if (search && search.trim()) {
            const searchRegex = new RegExp(search.trim(), 'i');
            query.$or = [
                { name: { $regex: searchRegex } },
                { description: { $regex: searchRegex } },
                { slug: { $regex: searchRegex } },
            ];
        }
        if (status && status !== 'All Status' && status !== 'all') {
            query.status = status.toLowerCase();
        }
        return await categorySchema_1.Category.countDocuments(query);
    }
    async search(query, limit = 10, status) {
        const searchFilter = {
            $or: [
                { name: { $regex: query, $options: 'i' } },
                { description: { $regex: query, $options: 'i' } },
            ],
        };
        // Add status filter to search
        if (status && status !== 'All Status' && status !== 'all') {
            searchFilter.status = status.toLowerCase();
        }
        return await categorySchema_1.Category.find(searchFilter)
            .limit(limit)
            .sort({ createdAt: -1 });
    }
}
exports.CategoryRepository = CategoryRepository;
