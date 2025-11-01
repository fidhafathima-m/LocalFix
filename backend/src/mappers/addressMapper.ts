import { Types } from "mongoose";
import { IUserAddress } from "../models/UserAddressSchema";
import { AddressDto } from "../interfaces/dtos/addressDtos";

export class AddressMapper {
  // Map single address to DTO
  static toDto(address: IUserAddress): AddressDto {
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
  }

  // Map multiple addresses to DTO array
  static toDtoList(addresses: IUserAddress[]): AddressDto[] {
    return addresses.map(address => this.toDto(address));
  }

  // Map create request to database model
  static toCreateModel(
    userId: string | Types.ObjectId,
    data: any
  ): Partial<IUserAddress> {
    return {
      userId: new Types.ObjectId(userId),
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
  }

  // Map update request to database model
  static toUpdateModel(data: any): Partial<IUserAddress> {
    const updateData: Partial<IUserAddress> = {};

    if (data.label !== undefined) updateData.label = data.label;
    if (data.landmark !== undefined) updateData.landmark = data.landmark;
    if (data.street !== undefined) updateData.street = data.street;
    if (data.city !== undefined) updateData.city = data.city;
    if (data.state !== undefined) updateData.state = data.state;
    if (data.pincode !== undefined) updateData.pincode = data.pincode;
    if (data.isDefault !== undefined) updateData.isDefault = data.isDefault;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.formattedAddress !== undefined) updateData.formattedAddress = data.formattedAddress;
    if (data.placeId !== undefined) updateData.placeId = data.placeId;

    return updateData;
  }
}