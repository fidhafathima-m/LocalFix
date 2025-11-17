export interface CreateSubscriptionDto {
  name: string;
  price: number;
  durationMonths: number;
  commissionRate: number;
  features?: string[];
  status?: 'active' | 'inactive';
}

export interface UpdateSubscriptionDto {
  name?: string;
  price?: number;
  durationMonths?: number;
  commissionRate?: number;
  features?: string[];
  status?: 'active' | 'inactive';
}

export interface SubscriptionResponseDto {
  id: string;
  name: string;
  slug: string;
  price: number;
  durationMonths: number;
  commissionRate: number;
  features: string[];
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionListResponseDto {
  subscriptions: SubscriptionResponseDto[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
