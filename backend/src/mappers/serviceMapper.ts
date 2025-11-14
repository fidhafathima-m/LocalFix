import {
  ServiceResponseDto,
  ServiceListResponseDto,
  ServiceMapper as IServiceMapper,
} from "../interfaces/dtos/serviceDtos";
import { IService } from "../interfaces/admin/IServiceManagement";

export const toServiceResponseDto = (service: IService): ServiceResponseDto => {
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

export const toServiceListResponseDto = (
  services: IService[],
  total: number,
  page: number,
  limit: number
): ServiceListResponseDto => {
  return {
    services: services.map((service) => toServiceResponseDto(service)),
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
