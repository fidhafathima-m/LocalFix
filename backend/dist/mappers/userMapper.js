"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toUserStatsDto = exports.toUserDetailDto = exports.toUserListDto = void 0;
const toUserListDto = (user) => {
    return {
        _id: user._id.toString(),
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone,
        status: user.status || 'Active',
        roles: Array.isArray(user.roles) ? user.roles : ['user'],
        isEmailVerified: user.isVerified || false,
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date(),
        profilePicture: user.profilePicture,
        profilePictureUrl: user.profilePictureUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        defaultAddress: user.defaultAddress
            ? _mapAddress(user.defaultAddress)
            : undefined,
    };
};
exports.toUserListDto = toUserListDto;
// Map to detail DTO
const toUserDetailDto = (user, addresses = []) => {
    const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
    const baseDto = {
        _id: user._id.toString(),
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone,
        status: user.status || 'Active',
        roles: Array.isArray(user.roles) ? user.roles : ['user'],
        isEmailVerified: user.isVerified || false,
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date(),
        profilePicture: user.profilePicture,
        profilePictureUrl: user.profilePictureUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        defaultAddress: defaultAddress
            ? {
                city: defaultAddress.city,
                state: defaultAddress.state,
                pincode: defaultAddress.pincode,
                landmark: defaultAddress.landmark,
                location: defaultAddress.location,
                street: defaultAddress.street,
                formattedAddress: defaultAddress.formattedAddress,
            }
            : undefined,
        addresses: addresses.map(addr => ({
            id: addr._id.toString(),
            label: addr.label || 'Home',
            street: addr.street,
            city: addr.city,
            state: addr.state,
            pincode: addr.pincode,
            landmark: addr.landmark,
            isDefault: addr.isDefault,
            location: addr.location,
            formattedAddress: addr.formattedAddress,
            placeId: addr.placeId,
        })),
    };
    return {
        ...baseDto,
        applicationStatus: user.applicationStatus,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        profilePictureUrl: user.profilePictureUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        wallet: user.wallet
            ? {
                balance: user.wallet.balance || 0,
                transactions: user.wallet.transactions || [],
            }
            : { balance: 0, transactions: [] },
    };
};
exports.toUserDetailDto = toUserDetailDto;
// Map address
const _mapAddress = (address) => {
    return {
        street: address?.street,
        city: address?.city,
        state: address?.state,
        pincode: address?.pincode,
        landmark: address?.landmark,
        isDefault: address?.isDefault || false,
    };
};
// Map stats
const toUserStatsDto = (stats) => {
    return {
        totalUsers: stats.totalUsers || 0,
        activeUsers: stats.activeUsers || 0,
        inactiveUsers: stats.inactiveUsers || 0,
        blockedUsers: stats.blockedUsers || 0,
    };
};
exports.toUserStatsDto = toUserStatsDto;
