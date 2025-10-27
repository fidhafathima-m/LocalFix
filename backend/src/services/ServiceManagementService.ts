import { IServiceService } from "../interfaces/services/admin/IServiceManagementService";
import { IServiceRepository } from "../interfaces/repository/admin/IServiceRepository";
import { ServiceResponseDto, CreateServiceDto, UpdateServiceDto, ServiceListResponseDto } from "../interfaces/dtos/serviceDtos";
import { ServiceMapper } from "../mappers/serviceMapper";
import { SERVICE_MESSAGES, ServiceStatus } from "../constants";
import { Types } from "mongoose";
import { Item } from "../models/category/itemSchema";

export class ServiceService implements IServiceService {
  private serviceRepository: IServiceRepository;
  private serviceMapper: ServiceMapper;

  constructor(serviceRepository: IServiceRepository) {
    this.serviceRepository = serviceRepository;
    this.serviceMapper = new ServiceMapper();
  }

  async createService(createDto: CreateServiceDto): Promise<ServiceResponseDto> {
    try {
      // Check if service with same name already exists
      const existingService = await this.serviceRepository.findByName(createDto.name);
      if (existingService) {
        throw new Error(SERVICE_MESSAGES.SERVICE_ALREADY_EXISTS);
      }

      // Validate category ID
      if (!Types.ObjectId.isValid(createDto.categoryId)) {
        throw new Error(SERVICE_MESSAGES.INVALID_CATEGORY_ID);
      }

      const service = await this.serviceRepository.create({
        ...createDto,
        categoryId: new Types.ObjectId(createDto.categoryId),
        status: createDto.status || ServiceStatus.ACTIVE,
      });

      return this.serviceMapper.toServiceResponseDto(service);
    } catch (error) {
      console.error("Create service error:", error);
      throw error;
    }
  }

  async getServiceById(serviceId: string): Promise<ServiceResponseDto> {
    try {
      const service = await this.serviceRepository.findById(serviceId);
      if (!service) {
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      }

      const itemCount = await Item.countDocuments({ 
      serviceId: service._id,
      isActive: true 
    });

    const serviceWithCount = {
      ...service.toObject(),
      itemCount
    };
      return this.serviceMapper.toServiceResponseDto(serviceWithCount);
    } catch (error) {
      console.error("Get service by ID error:", error);
      throw error;
    }
  }

  async getServiceBySlug(slug: string): Promise<ServiceResponseDto> {
    try {
      const service = await this.serviceRepository.findBySlug(slug);
      if (!service) {
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      }
      return this.serviceMapper.toServiceResponseDto(service);
    } catch (error) {
      console.error("Get service by slug error:", error);
      throw error;
    }
  }

  async getServicesByCategoryId(
    categoryId: string,
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ServiceListResponseDto> {
    try {
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new Error(SERVICE_MESSAGES.INVALID_CATEGORY_ID);
      }

      const skip = (page - 1) * limit;
      let services: any[];
      let total: number;

      if (search) {
        services = await this.serviceRepository.searchByCategory(categoryId, search, limit);
        total = services.length;
      } else {
        services = await this.serviceRepository.findAll({ categoryId }, skip, limit);
        total = await this.serviceRepository.count({ categoryId });
      }

      const servicesWithCounts = await Promise.all(
      services.map(async (service) => {
        const itemCount = await Item.countDocuments({ 
          serviceId: service._id,
          isActive: true 
        });
        return {
          ...service.toObject(),
          itemCount
        };
      })
    );

      return this.serviceMapper.toServiceListResponseDto(servicesWithCounts, total, page, limit);
    } catch (error) {
      console.error("Get services by category error:", error);
      throw error;
    }
  }

  async getAllServices(
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ServiceListResponseDto> {
    try {
      const skip = (page - 1) * limit;
      let services: any[];
      let total: number;

      if (search) {
        services = await this.serviceRepository.search(search, limit);
        total = services.length;
      } else {
        services = await this.serviceRepository.findAll({}, skip, limit);
        total = await this.serviceRepository.count();
      }

      return this.serviceMapper.toServiceListResponseDto(services, total, page, limit);
    } catch (error) {
      console.error("Get all services error:", error);
      throw error;
    }
  }

  async updateService(serviceId: string, updateDto: UpdateServiceDto): Promise<ServiceResponseDto> {
    try {
      // Check if service exists
      const existingService = await this.serviceRepository.findById(serviceId);
      if (!existingService) {
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      }

      // If name is being updated, check for duplicates
      if (updateDto.name && updateDto.name !== existingService.name) {
        const duplicateService = await this.serviceRepository.findByName(updateDto.name);
        if (duplicateService && duplicateService._id.toString() !== serviceId) {
          throw new Error(SERVICE_MESSAGES.SERVICE_ALREADY_EXISTS);
        }
      }

      const updatedService = await this.serviceRepository.update(serviceId, updateDto);
      if (!updatedService) {
        throw new Error(SERVICE_MESSAGES.FAILED_UPDATE_SERVICE);
      }

      return this.serviceMapper.toServiceResponseDto(updatedService);
    } catch (error) {
      console.error("Update service error:", error);
      throw error;
    }
  }

  async deleteService(serviceId: string): Promise<void> {
    try {
      // Check if service exists
      const existingService = await this.serviceRepository.findById(serviceId);
      if (!existingService) {
        throw new Error(SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      }

      const deleted = await this.serviceRepository.delete(serviceId);
      if (!deleted) {
        throw new Error(SERVICE_MESSAGES.FAILED_DELETE_SERVICE);
      }
    } catch (error) {
      console.error("Delete service error:", error);
      throw error;
    }
  }

  async searchServices(query: string, limit: number = 10): Promise<ServiceResponseDto[]> {
    try {
      const services = await this.serviceRepository.search(query, limit);
      return services.map(service => this.serviceMapper.toServiceResponseDto(service));
    } catch (error) {
      console.error("Search services error:", error);
      throw error;
    }
  }
}