// interfaces/services/booking/IBookingService.ts
import {
  CreateBookingRequestDto,
  BookingResponseDto,
  BookingListResponseDto,
  TrackingDetailsDto,
  TechnicianLocationDto,
} from "../../dtos/bookingDtos";
import { ApiResponse } from "../../../utils/responseHelper";

export interface IBookingService {
  createBooking(
    userId: string,
    bookingData: CreateBookingRequestDto
  ): Promise<ApiResponse<BookingResponseDto>>;
  getBookingById(
    userId: string,
    bookingId: string
  ): Promise<ApiResponse<BookingResponseDto>>;
  getUserBookings(
    userId: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<BookingListResponseDto>>;
  getTechnicianBookings(
    technicianId: string,
    page?: number,
    limit?: number
  ): Promise<ApiResponse<BookingListResponseDto>>;
  updateBookingStatus(
    bookingId: string,
    status: string,
    updatedBy: string,
    reason?: string
  ): Promise<ApiResponse<BookingResponseDto>>;
  cancelBooking(
    userId: string,
    bookingId: string,
    reason: string
  ): Promise<ApiResponse<BookingResponseDto>>;
  getTrackingDetails(
    userId: string,
    bookingId: string
  ): Promise<ApiResponse<TrackingDetailsDto>>;
  getTechnicianLocation(
    bookingId: string
  ): Promise<ApiResponse<TechnicianLocationDto>>;
}
