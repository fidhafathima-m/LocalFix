"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionMapper = void 0;
class SubscriptionMapper {
    toSubscriptionResponseDto(subscription) {
        return {
            id: subscription._id.toString(),
            name: subscription.name,
            slug: subscription.slug,
            price: subscription.price,
            durationMonths: subscription.durationMonths,
            commissionRate: subscription.commissionRate,
            features: subscription.features || [],
            status: subscription.status,
            createdAt: subscription.createdAt.toISOString(),
            updatedAt: subscription.updatedAt.toISOString(),
        };
    }
    toSubscriptionListResponseDto(subscriptions, total, page, limit) {
        return {
            subscriptions: subscriptions.map(subscription => this.toSubscriptionResponseDto(subscription)),
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }
}
exports.SubscriptionMapper = SubscriptionMapper;
