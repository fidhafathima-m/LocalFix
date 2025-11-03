// interfaces/dtos/bookingDtos.ts
export interface CreateBookingRequestDto {
  technicianId: string;
  serviceName: string;
  brand: string;
  addressId: string;
  scheduledAt: string; // ISO string
  timeSlot: string;
  amount: number;
  notes?: string;
}

export interface BookingResponseDto {
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

export interface BookingListResponseDto {
  bookings: BookingResponseDto[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}