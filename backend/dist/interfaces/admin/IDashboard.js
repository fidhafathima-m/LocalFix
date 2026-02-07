"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasPaymentMethodsWithPercentages = exports.hasDetailedCustomerSatisfaction = void 0;
// Type guard for enhanced repository methods
const hasDetailedCustomerSatisfaction = (repo) => {
    return (typeof repo
        .getDetailedCustomerSatisfaction === 'function');
};
exports.hasDetailedCustomerSatisfaction = hasDetailedCustomerSatisfaction;
const hasPaymentMethodsWithPercentages = (repo) => {
    return (typeof repo
        .getPaymentMethodsWithPercentages === 'function');
};
exports.hasPaymentMethodsWithPercentages = hasPaymentMethodsWithPercentages;
