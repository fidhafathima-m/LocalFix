// interfaces/services/user/IServiceService.ts
import {
  ServiceResponseDto,
  ServiceListResponseDto,
} from '../../dtos/serviceDtos';

export interface IUserServiceService {
  getServiceById(serviceId: string): Promise<ServiceResponseDto>;
  getServiceBySlug(slug: string): Promise<ServiceResponseDto>;
  getAllServices(
    page?: number,
    limit?: number,
    search?: string,
    sortBy?: string,
    sortOrder?: string
  ): Promise<ServiceListResponseDto>;
  getServicesByCategoryId(
    categoryId: string,
    page?: number,
    limit?: number,
    search?: string
  ): Promise<ServiceListResponseDto>;
  searchServices(query: string, limit?: number): Promise<ServiceResponseDto[]>;
}
