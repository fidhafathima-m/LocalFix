import { ServiceResponseDto, ServiceListResponseDto, ServiceMapper as IServiceMapper } from "../interfaces/dtos/serviceDtos";
import { IService } from "../interfaces/admin/IServiceManagement";

export class ServiceMapper implements IServiceMapper {
  toServiceResponseDto(service: IService): ServiceResponseDto {
    return {
      id: service._id.toString(),
      categoryId: service.categoryId.toString(),
      slug: service.slug,
      name: service.name,
      description: service.description,
      avgBasePrice: service.avgBasePrice,
      iconUrl: service.iconUrl,
      status: service.status,
      createdAt: service.createdAt.toISOString(),
      updatedAt: service.updatedAt.toISOString(),
      itemCount: service.itemCount || 0,
    };
  }

  toServiceListResponseDto(
    services: IService[],
    total: number,
    page: number,
    limit: number
  ): ServiceListResponseDto {
    return {
      services: services.map(service => this.toServiceResponseDto(service)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}