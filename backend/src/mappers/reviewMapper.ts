import { Types } from "mongoose";
import { IReview } from "../models/ReviewSchema";
import {
  PopulatedUser,
  ReviewWithUserReport,
} from "../interfaces/repository/user/IReviewRepository";
import {
  ReviewResponseDto,
  CreateReviewRequestDto,
  UpdateReviewRequestDto,
} from "../interfaces/dtos/reviewDtos";

interface CreateReviewModelData extends CreateReviewRequestDto {
  userId: string;
  technicianId: string;
}

function isPopulatedUser(userId: any): userId is PopulatedUser {
  return userId && typeof userId === "object" && "fullName" in userId;
}

export const toReviewDto = (
  review: IReview | ReviewWithUserReport
): ReviewResponseDto => {
  let userName = "Anonymous User";
  let userEmail = "";
  let userIdString = "";

  if (isPopulatedUser(review.userId)) {
    userName = review.userId.fullName || "Anonymous User";
    userEmail = review.userId.email || "";
    userIdString = review.userId._id.toString();
  } else {
    userIdString = review.userId?.toString() || "";
  }

  return {
    id: review._id.toString(),
    orderId: review.orderId.toString(),
    userId: userIdString,
    technicianId: review.technicianId.toString(),
    rating: review.rating,
    comment: review.comment,
    status: review.status,
    createdAt: review.createdAt.toISOString(),
    updatedAt: review.updatedAt.toISOString(),
    userReported: (review as ReviewWithUserReport).userReported || false,
    user: {
      fullName: userName,
      email: userEmail,
    },
  };
};

export const toReviewDtoList = (
  reviews: (IReview | ReviewWithUserReport)[]
): ReviewResponseDto[] => {
  return reviews.map((review) => toReviewDto(review));
};

export const toReviewCreateModel = (
  data: CreateReviewModelData
): Partial<IReview> => {
  return {
    orderId: new Types.ObjectId(data.orderId),
    userId: new Types.ObjectId(data.userId),
    technicianId: new Types.ObjectId(data.technicianId),
    rating: data.rating,
    comment: data.comment.trim(),
  };
};

export const toReviewUpdateModel = (
  data: UpdateReviewRequestDto
): Partial<IReview> => {
  const updateData: Partial<IReview> = {};

  if (data.rating !== undefined) {
    updateData.rating = data.rating;
  }

  if (data.comment !== undefined) {
    updateData.comment = data.comment.trim();
  }

  return updateData;
};
