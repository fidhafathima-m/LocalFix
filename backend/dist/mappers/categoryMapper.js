"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toCategoryListResponseDto = exports.toCategoryResponseDto = void 0;
const toCategoryResponseDto = (category) => {
    return {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        iconUrl: category.iconUrl,
        status: category.status,
        serviceCount: category.serviceCount || 0,
        createdAt: category.createdAt.toISOString(),
        updatedAt: category.updatedAt.toISOString(),
    };
};
exports.toCategoryResponseDto = toCategoryResponseDto;
const toCategoryListResponseDto = (categories, total, page, limit) => {
    return {
        categories: categories.map(exports.toCategoryResponseDto),
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
    };
};
exports.toCategoryListResponseDto = toCategoryListResponseDto;
