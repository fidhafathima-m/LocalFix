export interface Review {
  id: string;
  orderId: string;
  userId: string;
  technicianId: string;
  rating: number;
  comment: string;
  status: "published" | "flagged" | "pending";
  createdAt: string;
  updatedAt: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  service: string;
  technicianName: string;
}

export interface ReviewsResponse {
  reviews: Review[];
  total: number;
  page: number;
  totalPages: number;
}

export interface ReviewStatsResponse {
  totalReviews: number;
  averageRating: number;
  flaggedReviews: number;
  fiveStarReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  serviceDistribution: Record<string, number>;
}