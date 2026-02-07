"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toItemListResponseDto = exports.toItemResponseDto = void 0;
const toItemResponseDto = (item) => {
    return {
        id: item._id.toString(),
        serviceId: item.serviceId.toString(),
        name: item.name,
        description: item.description,
        sku: item.sku,
        price: item.price,
        isActive: item.isActive,
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString(),
    };
};
exports.toItemResponseDto = toItemResponseDto;
const toItemListResponseDto = (items, total, page, limit) => {
    return {
        items: items.map((item) => (0, exports.toItemResponseDto)(item)),
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
    };
};
exports.toItemListResponseDto = toItemListResponseDto;
