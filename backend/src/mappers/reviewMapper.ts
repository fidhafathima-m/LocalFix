import { Types } from 'mongoose';
import { IReview } from '../models/ReviewSchema';
import {
  PopulatedUser,
  ReviewWithUserReport,
} from '../interfaces/repository/user/IReviewRepository';
import {
  ReviewResponseDto,
  CreateReviewRequestDto,
  UpdateReviewRequestDto,
} from '../interfaces/dtos/reviewDtos';

interface CreateReviewModelData extends CreateReviewRequestDto {
  userId: string;
  technicianId: string;
}

function isPopulatedUser(userId: any): userId is PopulatedUser {
  return userId && typeof userId === 'object' && 'fullName' in userId;
}

function isPopulatedOrder(orderId: any): orderId is { serviceName: string } {
  return orderId && typeof orderId === 'object' && 'serviceName' in orderId;
}

function isPopulatedTechnician(technicianId: any): technicianId is {
  displayName: string;
  profilePictureUrl?: string;
} {
  return (
    technicianId &&
    typeof technicianId === 'object' &&
    'displayName' in technicianId
  );
}

export const toReviewDto = (
  review: IReview | ReviewWithUserReport
): ReviewResponseDto => {
  let userName = 'Anonymous User';
  let userEmail = '';
  let userIdString = '';
  let serviceName = 'Service';
  let technicianName = 'Technician';
  let technicianProfilePicture = '';

  // Handle user data
  if (isPopulatedUser(review.userId)) {
    userName = review.userId.fullName || 'Anonymous User';
    userEmail = review.userId.email || '';
    userIdString = review.userId._id.toString();
  } else {
    userIdString = review.userId?.toString() || '';
  }

  // Handle service data (from populated order)
  if (isPopulatedOrder(review.orderId)) {
    serviceName = review.orderId.serviceName || 'Service';
  }

  // Handle technician data
  if (isPopulatedTechnician(review.technicianId)) {
    technicianName = review.technicianId.displayName || 'Technician';
    technicianProfilePicture = review.technicianId.profilePictureUrl || '';
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
    // Include the populated data in the response
    service: {
      name: serviceName,
    },
    technician: {
      displayName: technicianName,
      profilePictureUrl: technicianProfilePicture,
    },
  };
};

export const toReviewDtoList = (
  reviews: (IReview | ReviewWithUserReport)[]
): ReviewResponseDto[] => {
  return reviews.map(review => toReviewDto(review));
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
