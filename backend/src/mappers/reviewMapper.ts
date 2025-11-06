// mappers/reviewMapper.ts
import { Types } from "mongoose";
import { IReview } from "../models/ReviewSchema";
import {
  ReviewResponseDto,
  CreateReviewRequestDto,
  UpdateReviewRequestDto,
} from "../interfaces/dtos/reviewDtos";

interface CreateReviewModelData extends CreateReviewRequestDto {
  userId: string;
  technicianId: string;
}

export class ReviewMapper {
  static toDto(review: IReview): ReviewResponseDto {
    return {
      id: review._id.toString(),
      orderId: review.orderId.toString(),
      userId: review.userId.toString(),
      technicianId: review.technicianId.toString(),
      rating: review.rating,
      comment: review.comment,
      createdAt: review.createdAt.toISOString(),
      updatedAt: review.updatedAt.toISOString(),
    };
  }

  static toDtoList(reviews: IReview[]): ReviewResponseDto[] {
    return reviews.map((review) => this.toDto(review));
  }

  static toCreateModel(data: CreateReviewModelData): Partial<IReview> {
    return {
      orderId: new Types.ObjectId(data.orderId),
      userId: new Types.ObjectId(data.userId),
      technicianId: new Types.ObjectId(data.technicianId),
      rating: data.rating,
      comment: data.comment.trim(),
    };
  }

  static toUpdateModel(data: UpdateReviewRequestDto): Partial<IReview> {
    const updateData: Partial<IReview> = {};

    if (data.rating !== undefined) {
      updateData.rating = data.rating;
    }

    if (data.comment !== undefined) {
      updateData.comment = data.comment.trim();
    }

    return updateData;
  }
}