"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toAddressUpdateModel = exports.toAddressCreateModel = exports.toAddressDtoList = exports.toAddressDto = void 0;
const mongoose_1 = require("mongoose");
// Map single address to DTO
const toAddressDto = (address) => {
    return {
        id: address._id.toString(),
        label: address.label || "Home",
        landmark: address.landmark,
        street: address.street || "",
        city: address.city,
        state: address.state,
        pincode: address.pincode,
        isDefault: address.isDefault,
        location: {
            type: address.location.type,
            coordinates: address.location.coordinates,
        },
        formattedAddress: address.formattedAddress || "",
        placeId: address.placeId,
        createdAt: address.createdAt,
        updatedAt: address.updatedAt,
    };
};
exports.toAddressDto = toAddressDto;
// Map multiple addresses to DTO array
const toAddressDtoList = (addresses) => {
    return addresses.map(exports.toAddressDto); // Use the function directly
};
exports.toAddressDtoList = toAddressDtoList;
// Map create request to database model
const toAddressCreateModel = (userId, data) => {
    return {
        userId: new mongoose_1.Types.ObjectId(userId),
        label: data.label || "Home",
        landmark: data.landmark,
        street: data.street,
        city: data.city,
        state: data.state,
        pincode: data.pincode,
        isDefault: data.isDefault || false,
        location: {
            type: "Point",
            coordinates: data.location.coordinates,
        },
        formattedAddress: data.formattedAddress,
        placeId: data.placeId,
    };
};
exports.toAddressCreateModel = toAddressCreateModel;
// Map update request to database model
const toAddressUpdateModel = (data) => {
    const updateData = {};
    if (data.label !== undefined)
        updateData.label = data.label;
    if (data.landmark !== undefined)
        updateData.landmark = data.landmark;
    if (data.street !== undefined)
        updateData.street = data.street;
    if (data.city !== undefined)
        updateData.city = data.city;
    if (data.state !== undefined)
        updateData.state = data.state;
    if (data.pincode !== undefined)
        updateData.pincode = data.pincode;
    if (data.isDefault !== undefined)
        updateData.isDefault = data.isDefault;
    if (data.location !== undefined)
        updateData.location = data.location;
    if (data.formattedAddress !== undefined)
        updateData.formattedAddress = data.formattedAddress;
    if (data.placeId !== undefined)
        updateData.placeId = data.placeId;
    return updateData;
};
exports.toAddressUpdateModel = toAddressUpdateModel;
