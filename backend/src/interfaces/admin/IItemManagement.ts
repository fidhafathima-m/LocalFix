import { Document, Types } from "mongoose";

export interface IItem extends Document {
  _id: Types.ObjectId;
  serviceId: Types.ObjectId;
  name: string;
  description: string;
  sku: string;
  price: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IItemCreate {
  serviceId: Types.ObjectId | string;
  name: string;
  description: string;
  price: number;
  sku?: string;
  isActive?: boolean;
}

export interface IItemUpdate {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  isActive?: boolean;
}