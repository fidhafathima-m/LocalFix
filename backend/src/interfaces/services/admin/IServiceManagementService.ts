import {
  ServiceResponseDto,
  CreateServiceDto,
  UpdateServiceDto,
  ServiceListResponseDto,
} from "../../dtos/serviceDtos";

export interface IServiceService {
  createService(createDto: CreateServiceDto): Promise<ServiceResponseDto>;
  getServiceById(serviceId: string): Promise<ServiceResponseDto>;
  getServiceBySlug(slug: string): Promise<ServiceResponseDto>;
  getServicesByCategoryId(
    categoryId: string,
    page?: number,
    limit?: number,
    search?: string
  ): Promise<ServiceListResponseDto>;
  getAllServices(
    page?: number,
    limit?: number,
    search?: string
  ): Promise<ServiceListResponseDto>;
  updateService(
    serviceId: string,
    updateDto: UpdateServiceDto
  ): Promise<ServiceResponseDto>;
  deleteService(serviceId: string): Promise<void>;
  searchServices(query: string, limit?: number): Promise<ServiceResponseDto[]>;
}
