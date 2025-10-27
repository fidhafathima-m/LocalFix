import { Request, Response } from "express";
import { IServiceService } from "../../interfaces/services/admin/IServiceManagementService";
import { ResponseHelper } from "../../utils/responseHelper";
import { SERVICE_MESSAGES } from "../../constants";
import { CreateServiceDto, UpdateServiceDto } from "../../interfaces/dtos/serviceDtos";

export class ServiceController {
  private serviceService: IServiceService;

  constructor(serviceService: IServiceService) {
    this.serviceService = serviceService;
  }

  createService = async (req: Request, res: Response): Promise<void> => {
    try {
      const createDto: CreateServiceDto = req.body;

      // Validation
      if (!createDto.name?.trim()) {
        const response = ResponseHelper.badRequest(SERVICE_MESSAGES.NAME_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.description?.trim()) {
        const response = ResponseHelper.badRequest(SERVICE_MESSAGES.DESCRIPTION_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      if (!createDto.categoryId?.trim()) {
        const response = ResponseHelper.badRequest(SERVICE_MESSAGES.CATEGORY_ID_REQUIRED);
        res.status(response.statusCode).json(response);
        return;
      }

      if (createDto.avgBasePrice === undefined || createDto.avgBasePrice < 0) {
        const response = ResponseHelper.badRequest(SERVICE_MESSAGES.INVALID_BASE_PRICE);
        res.status(response.statusCode).json(response);
        return;
      }

      const service = await this.serviceService.createService(createDto);
      const response = ResponseHelper.success(SERVICE_MESSAGES.SERVICE_CREATED, { service });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Create service controller error:", error);
      const response = ResponseHelper.error(error.message || SERVICE_MESSAGES.FAILED_CREATE_SERVICE);
      res.status(response.statusCode).json(response);
    }
  };

  getServiceById = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const service = await this.serviceService.getServiceById(id);
      const response = ResponseHelper.success(SERVICE_MESSAGES.SERVICE_RETRIEVED, { service });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Get service by ID controller error:", error);
      const response = ResponseHelper.error(error.message || SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      res.status(response.statusCode).json(response);
    }
  };

  getServiceBySlug = async (req: Request, res: Response): Promise<void> => {
    try {
      const { slug } = req.params;
      const service = await this.serviceService.getServiceBySlug(slug);
      const response = ResponseHelper.success(SERVICE_MESSAGES.SERVICE_RETRIEVED, { service });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Get service by slug controller error:", error);
      const response = ResponseHelper.error(error.message || SERVICE_MESSAGES.SERVICE_NOT_FOUND);
      res.status(response.statusCode).json(response);
    }
  };

  getServicesByCategoryId = async (req: Request, res: Response): Promise<void> => {
    try {
      const { categoryId } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.serviceService.getServicesByCategoryId(categoryId, page, limit, search);
      const response = ResponseHelper.success(SERVICE_MESSAGES.SERVICES_RETRIEVED, result);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Get services by category controller error:", error);
      const response = ResponseHelper.error(error.message || SERVICE_MESSAGES.FAILED_FETCH_SERVICES);
      res.status(response.statusCode).json(response);
    }
  };

  getAllServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string;

      const result = await this.serviceService.getAllServices(page, limit, search);
      const response = ResponseHelper.success(SERVICE_MESSAGES.SERVICES_RETRIEVED, result);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Get all services controller error:", error);
      const response = ResponseHelper.error(error.message || SERVICE_MESSAGES.FAILED_FETCH_SERVICES);
      res.status(response.statusCode).json(response);
    }
  };

  updateService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updateDto: UpdateServiceDto = req.body;

      const service = await this.serviceService.updateService(id, updateDto);
      const response = ResponseHelper.success(SERVICE_MESSAGES.SERVICE_UPDATED, { service });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Update service controller error:", error);
      const response = ResponseHelper.error(error.message || SERVICE_MESSAGES.FAILED_UPDATE_SERVICE);
      res.status(response.statusCode).json(response);
    }
  };

  deleteService = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      await this.serviceService.deleteService(id);
      const response = ResponseHelper.success(SERVICE_MESSAGES.SERVICE_DELETED);
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Delete service controller error:", error);
      const response = ResponseHelper.error(error.message || SERVICE_MESSAGES.FAILED_DELETE_SERVICE);
      res.status(response.statusCode).json(response);
    }
  };

  searchServices = async (req: Request, res: Response): Promise<void> => {
    try {
      const { q } = req.query;
      const limit = parseInt(req.query.limit as string) || 10;

      if (!q || typeof q !== "string") {
        const response = ResponseHelper.badRequest("Search query is required");
        res.status(response.statusCode).json(response);
        return;
      }

      const services = await this.serviceService.searchServices(q, limit);
      const response = ResponseHelper.success("Services search completed", { services });
      res.status(response.statusCode).json(response);
    } catch (error: any) {
      console.error("Search services controller error:", error);
      const response = ResponseHelper.error("Failed to search services");
      res.status(response.statusCode).json(response);
    }
  };
}