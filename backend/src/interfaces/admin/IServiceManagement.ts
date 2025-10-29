import { Document, Types } from "mongoose";
import { ServiceStatus } from "../../constants";

export interface IService extends Document {
  categoryId: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  avgBasePrice: number;
  iconUrl: string;
  rating: number;
  estimatedDuration: string;
  features: string[];
  popular: boolean;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
  itemCount?: number;
}

export interface IServiceCreate {
  categoryId: Types.ObjectId | string;
  name: string;
  description: string;
  avgBasePrice: number;
  iconUrl?: string;
  status?: ServiceStatus;
  rating: number;
  estimatedDuration: string;
  features: string[];
  popular: boolean;
}

export interface IServiceUpdate {
  slug?: string;
  name?: string;
  description?: string;
  avgBasePrice?: number;
  iconUrl?: string;
  status?: ServiceStatus;
  rating: number;
  estimatedDuration: string;
  features: string[];
  popular: boolean;
}
