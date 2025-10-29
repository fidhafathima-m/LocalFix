import { Document, Types } from "mongoose";

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  createdAt: Date;
  updatedAt: Date;
  serviceCount: number;
}

export interface ICategoryCreate {
  name: string;
  description: string;
  iconUrl?: string;
}

export interface ICategoryUpdate {
  slug?: string;
  name?: string;
  description?: string;
  iconUrl?: string;
}
