import { Document, Types } from 'mongoose';

export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
  status?: 'active' | 'inactive' | undefined;
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryWithCount extends ICategory {
  serviceCount: number;
}

export interface PaginatedCategories {
  categories: CategoryWithCount[];
  total: number;
  page: number;
  limit: number;
  pages: number;
}
