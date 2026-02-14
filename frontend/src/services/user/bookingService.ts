/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "../../utils/axiosConfig";
import toast from "react-hot-toast";

export interface CreateBookingRequest {
  technicianId: string;
  serviceName: string;
  brand: string;
  addressId: string;
  scheduledAt: string;
  timeSlot: string;
  amount: number;
  notes?: string;
}

export interface Booking {
  _id: string;
  bookingCode: string;
  userId: string;
  technicianId: string;
  serviceName: string;
  brand: string;
  addressId: string;
  scheduledAt: string;
  timeSlot: string;
  status: string;
  amount: number;
  itemsAmount: number;
  totalAmount: number;
  notes: string;
  history: Array<{
    status: string;
    by: string;
    reason?: string;
    at: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BookingListResponse {
  success: boolean;
  message: string;
  data: {
    bookings: Booking[];
    pagination?: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  };
}

export interface BookingResponse {
  success: boolean;
  message: string;
  data: Booking;
}

export interface UpdateBookingStatusRequest {
  status: string;
  updatedBy: string;
  reason?: string;
}

class BookingService {
  // Create a new booking
  async createBooking(
    bookingData: CreateBookingRequest,
  ): Promise<BookingResponse> {
    try {
      const response = await apiClient.post<BookingResponse>(
        "/bookings",
        bookingData,
      );

      if (response.data.success) {
        toast.success("Booking created successfully!");
      }

      return response.data;
    } catch (error: any) {
      console.error("Error creating booking:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to create booking";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Get user bookings
  async getUserBookings(
    page: number = 1,
    limit: number = 10,
  ): Promise<BookingListResponse> {
    try {
      const response = await apiClient.get<BookingListResponse>(
        `/bookings/user?page=${page}&limit=${limit}`,
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching user bookings:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch bookings";
      throw new Error(errorMessage);
    }
  }

  // Get booking by ID
  async getBookingById(bookingId: string): Promise<BookingResponse> {
    try {
      const response = await apiClient.get<BookingResponse>(
        `/bookings/${bookingId}`,
      );
      return response.data;
    } catch (error: any) {
      console.error("Error fetching booking:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to fetch booking";
      throw new Error(errorMessage);
    }
  }

  // Cancel booking
  async cancelBooking(
    bookingId: string,
    reason: string,
  ): Promise<BookingResponse> {
    try {
      const response = await apiClient.post<BookingResponse>(
        `/bookings/${bookingId}/cancel`,
        { reason },
      );

      if (response.data.success) {
        toast.success("Booking cancelled successfully!");
      }

      return response.data;
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to cancel booking";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // Update booking status
  async updateBookingStatus(
    bookingId: string,
    status: string,
    updatedBy: string,
    reason?: string,
  ): Promise<BookingResponse> {
    try {
      const updateData: UpdateBookingStatusRequest = {
        status,
        updatedBy,
        reason,
      };

      const response = await apiClient.patch<BookingResponse>(
        `/bookings/${bookingId}/status`,
        updateData,
      );

      return response.data;
    } catch (error: any) {
      console.error("Error updating booking status:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update booking status";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  // bookingService.ts
  async updateBooking(
    bookingId: string,
    updateData: Partial<Booking>,
  ): Promise<BookingResponse> {
    try {
      const response = await apiClient.put<BookingResponse>(
        `/bookings/${bookingId}`,
        updateData,
      );

      if (response.data.success) {
        toast.success("Booking updated successfully!");
      }

      return response.data;
    } catch (error: any) {
      console.error("Error updating booking:", error);
      const errorMessage =
        error.response?.data?.message || "Failed to update booking";
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  }

  async getTechnicianBookingsForDate(
    technicianId: string,
    date: string,
  ): Promise<{
    success: boolean;
    data?: {
      bookings: Array<{
        _id: string;
        scheduledAt: string;
        timeSlot: string;
        status: string;
      }>;
    };
    message?: string;
  }> {
    try {
      const response = await apiClient.get(
        `/bookings/technician/${technicianId}/date/${date}`,
      );
      return response.data;
    } catch (error) {
      console.error("Error fetching technician bookings for date:", error);
      throw error;
    }
  }
}

export const bookingService = new BookingService();
