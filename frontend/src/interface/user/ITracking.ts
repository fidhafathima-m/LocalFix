export interface ServiceTracking {
  _id: string;
  bookingId: string;
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
  status: 'pending' | 'accepted' | 'assigned' | 'on_the_way' | 'in_progress' | 'completed' | 'cancelled';
  amount: number;
  estimatedDuration: string;
  statusHistory: StatusHistory[];
  technicianLocation?: {
    latitude: number;
    longitude: number;
    lastUpdated: string;
  };
  estimatedArrival?: string;
  distance?: number;
}

export interface StatusHistory {
  status: string;
  timestamp: string;
  description: string;
  updatedBy: 'user' | 'technician' | 'system';
}