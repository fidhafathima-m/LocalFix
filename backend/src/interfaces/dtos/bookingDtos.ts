export interface CreateBookingRequestDto {
  technicianId: string;
  serviceName: string;
  brand: string;
  addressId: string;
  scheduledAt: string;
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

export interface TrackingDetailsDto {
  _id: string;
  bookingId: string;
  bookingCode: string;
  userId: string;
  technicianId: {
    _id: string;
    displayName: string;
    profilePictureUrl?: string;
    averageRating: number;
    ratingCount: number;
    skills: string[];
    phone: string;
  };
  serviceName: string;
  problemDescription?: string;
  scheduledAt: string;
  timeSlot: string;
  address: {
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    landmark?: string;
  };
  status:
    | "pending"
    | "accepted"
    | "assigned"
    | "on_the_way"
    | "in_progress"
    | "completed"
    | "cancelled";
  amount: number;
  estimatedDuration: string;
  statusHistory: StatusHistoryDto[];
  technicianLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
  estimatedArrival?: string;
  distance?: number;
}

export interface StatusHistoryDto {
  status: string;
  timestamp: string;
  description: string;
  updatedBy: "user" | "technician" | "system";
}

export interface TechnicianLocationDto {
  latitude: number;
  longitude: number;
  lastUpdated: string;
  estimatedArrival?: string;
  distance?: number;
  technicianId: string;
  bookingId: string;
}
