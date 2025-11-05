import type { Address } from "../user/IUserApi";

export interface User {
  _id: string;
  fullName: string;
  email?: string;
  phone: string;
  status: "Active" | "Inactive" | "Blocked";
  dateOfBirth?: string;
  gender?: string;
  profilePicture?: string;
  defaultAddress?: {
    city: string;
    state: string;
    pincode: string;
    landmark: string;
    location: { type: "Point"; coordinates: [number, number] };
  };
  isVerified: boolean;
  role: string;
  createdAt: string;
  wallet: { balance: number };
  addresses?: Address[];
}

export interface Technician {
  _id: string;
  userId: string;
  displayName: string;
  email?: string;
  phone?: string;
  services: string[];
  experienceYears: number;
  workAreas: string[];
  serviceRadiusKm: number;
  status: "pending" | "approved" | "rejected" | "suspended";
  averageRating: number;
  ratingCount: number;
  totalJobs?: number;
  profilePictureUrl?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    email: string;
    phone: string;
    fullName: string;
  };
}

export interface TechnicianApplication {
  _id: string;
  technicianId: string;
  email: string;
  status: "draft" | "submitted" | "under_review" | "approved" | "rejected";
  personal: {
    fullName?: string;
    phoneNumber?: string;
    email?: string;
  };
  skills: {
    services?: string[];
    yearsOfExperience?: number;
  };
  submittedAt?: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  error?: string;
}

export interface UsersResponse {
  users: User[];
}

export interface UserResponse {
  user: User;
}

export interface TechniciansResponse {
  technicians: Technician[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface TechnicianResponse {
  data: {
    technician: Technician;
  };
}

export interface ApplicationsResponse {
  applications: TechnicianApplication[];
}

export interface Category {
  serviceCount: number;
  id: string;
  name: string;
  slug: string;
  description: string;
  iconUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCategoryData {
  name: string;
  description: string;
  iconUrl?: string;
}

export interface UpdateCategoryData {
  name?: string;
  description?: string;
  iconUrl?: string;
}

export interface CategoriesResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Service {
  id: string;
  categoryId: string;
  slug: string;
  name: string;
  description: string;
  avgBasePrice: number;
  iconUrl: string;
  status: "active" | "inactive";
  createdAt: string;
  updatedAt: string;
  itemCount?: number; 
  rating?: number;
  estimatedDuration?: string;
  features?: string[];
  popular?: boolean;
}

export interface CreateServiceData {
  categoryId?: string;
  name: string;
  description: string;
  avgBasePrice: number;
  iconUrl?: string;
  status?: "active" | "inactive";
  rating?: number;
  estimatedDuration?: string;
  features?: string[];
  popular?: boolean;
}

export interface UpdateServiceData {
  name?: string;
  description?: string;
  avgBasePrice?: number;
  iconUrl?: string;
  status?: "active" | "inactive";
  rating?: number;
  estimatedDuration?: string;
  features?: string[];
  popular?: boolean;
}

export interface ServicesResponse {
  services: Service[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Item {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  sku: string;
  price: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateItemData {
  serviceId?: string;
  name: string;
  description: string;
  price: number;
  sku?: string;
  isActive?: boolean;
}

export interface UpdateItemData {
  name?: string;
  description?: string;
  price?: number;
  sku?: string;
  isActive?: boolean;
}

export interface ItemsResponse {
  items: Item[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface Order {
  _id: string;
  orderCode: string;
  userId: {
    _id: string;
    fullName: string;
    email: string;
    phone: string;
  };
  technicianId: {
    _id: string;
    displayName: string;
    profilePictureUrl?: string;
  };
  serviceName: string;
  problemDescription: string;
  scheduledAt: string;
  timeSlot: string;
  address: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  status:
    | "pending"
    | "confirmed"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "refunded";
  payment: {
    method: "online" | "cod";
    amount: number;
    status: "pending" | "paid" | "failed" | "refunded";
    transactionId?: string;
    paidAt?: string;
  };
  totalAmount: number;
  orderItems: Array<{
    _id: string;
    customName: string;
    unitPrice: number;
    quantity: number;
    totalPrice: number;
    status: string;
  }>;
  history: Array<{
    status: string;
    description: string;
    updatedBy: string;
    timestamp: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OrderStats {
  totalOrders: number;
  pendingOrders: number;
  confirmedOrders: number;
  inProgressOrders: number;
  completedOrders: number;
  cancelledOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
}

export interface OrderStatsResponse {
  stats: OrderStats;
}