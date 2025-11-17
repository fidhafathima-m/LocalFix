export interface CreateSparePartsRequestDto {
  orderId: string;
  technicianId: string;
  items: Array<{
    itemId: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  technicianNotes?: string;
}

export interface UpdateSparePartsRequestDto {
  status: 'approved' | 'rejected';
  customerNotes?: string;
}

export interface SparePartsRequestResponseDto {
  _id: string;
  orderId: string;
  technicianId: {
    _id: string;
    displayName: string;
    phone?: string;
  };
  customerId: string;
  items: Array<{
    itemId: string;
    name: string;
    price: number;
    quantity: number;
    totalPrice: number;
  }>;
  totalAmount: number;
  status: string;
  technicianNotes?: string;
  customerNotes?: string;
  requestedAt: string;
  respondedAt?: string;
}
