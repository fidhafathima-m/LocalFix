import { Types } from "mongoose";
import { ServiceStatus } from "../../constants";

export interface ServiceResponseDto {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  avgBasePrice: number;
  iconUrl: string;
  status: ServiceStatus;
  createdAt: string;
  updatedAt: string;
  itemCount: number
}

export interface CreateServiceDto {
  categoryId: string;
  name: string;
  description: string;
  avgBasePrice: number;
  iconUrl?: string;
  status?: ServiceStatus;
}

export interface UpdateServiceDto {
  name?: string;
  description?: string;
  avgBasePrice?: number;
  iconUrl?: string;
  status?: ServiceStatus;
}

export interface ServiceListResponseDto {
  services: ServiceResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ServiceMapper {
  toServiceResponseDto(service: any): ServiceResponseDto;
  toServiceListResponseDto(services: any[], total: number, page: number, limit: number): ServiceListResponseDto;
}