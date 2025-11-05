import api from "../../utils/axiosConfig";
import { type ServiceTracking } from "../../interface/user/ITracking";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  statusCode?: number;
  error?: string;
}


export const trackingService = {
  async getTrackingDetails(bookingId: string): Promise<ApiResponse<ServiceTracking>> {
    const response = await api.get<ApiResponse<ServiceTracking>>(`/bookings/${bookingId}/tracking`);
    return response.data;
  },

  async updateBookingStatus(
    bookingId: string, 
    status: string, 
    updatedBy: 'user' | 'technician' | 'system',
    notes?: string
  ): Promise<ApiResponse<ServiceTracking>> {
    const response = await api.patch<ApiResponse<ServiceTracking>>(
      `/bookings/${bookingId}/status`,
      { status, updatedBy, notes }
    );
    return response.data;
  },

  async getTechnicianLocation(bookingId: string): Promise<ApiResponse<{
    latitude: number;
    longitude: number;
    lastUpdated: string;
    estimatedArrival?: string;
    distance?: number;
  }>> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response = await api.get<ApiResponse<any>>(`/bookings/${bookingId}/technician-location`);
    return response.data;
  },
};