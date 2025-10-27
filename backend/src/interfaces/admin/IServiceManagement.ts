import { Document, Types } from "mongoose";
import { ServiceStatus } from "../../constants";

export interface IService extends Document {
  _id: Types.ObjectId;
  categoryId: Types.ObjectId;
  slug: string;
  name: string;
  description: string;
  avgBasePrice: number;
  iconUrl: string;
  status: ServiceStatus;
  createdAt: Date;
  updatedAt: Date;
  itemCount: number
}

export interface IServiceCreate {
  categoryId: Types.ObjectId | string;
  name: string;
  description: string;
  avgBasePrice: number;
  iconUrl?: string;
  status?: ServiceStatus;
}

export interface IServiceUpdate {
  slug?: string;
  name?: string;
  description?: string;
  avgBasePrice?: number;
  iconUrl?: string;
  status?: ServiceStatus;
}