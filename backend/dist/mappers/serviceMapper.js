"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toServiceListResponseDto = exports.toServiceResponseDto = void 0;
const toServiceResponseDto = (service) => {
    return {
        id: String(service._id),
        categoryId: String(service.categoryId),
        slug: service.slug,
        name: service.name,
        description: service.description,
        avgBasePrice: service.avgBasePrice,
        iconUrl: service.iconUrl,
        rating: service.rating,
        estimatedDuration: service.estimatedDuration,
        features: service.features || [],
        popular: service.popular,
        status: service.status,
        createdAt: service.createdAt.toISOString(),
        updatedAt: service.updatedAt.toISOString(),
        itemCount: service.itemCount || 0,
    };
};
exports.toServiceResponseDto = toServiceResponseDto;
const toServiceListResponseDto = (services, total, page, limit, status) => {
    return {
        services: services.map(service => (0, exports.toServiceResponseDto)(service)),
        total,
        page,
        limit,
        status,
        totalPages: Math.ceil(total / limit),
    };
};
exports.toServiceListResponseDto = toServiceListResponseDto;
