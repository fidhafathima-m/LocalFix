import { ReviewResponseDto } from "@/interfaces/services/admin/IReviewManagementService";
import { ReviewWithDetails } from "../interfaces/repository/admin/IReviewRepository";

export class ReviewMapper {
  toAdminReviewResponseDto(review: ReviewWithDetails): ReviewResponseDto {
    return {
      id: review._id.toString(),
      orderId: review.orderId.toString(),
      userId: review.userId.toString(),
      technicianId: review.technicianId.toString(),
      rating: review.rating,
      comment: review.comment,
      status: review.status as "published" | "flagged" | "pending",
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
      customerName: review.customerName,
      customerEmail: review.customerEmail,
      customerPhone: review.customerPhone,
      service: review.service,
      technicianName: review.technicianName,
    };
  }
}