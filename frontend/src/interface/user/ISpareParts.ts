export interface SparePartItem {
  itemId: string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface SparePartsRequest {
  _id: string;
  orderId: string;
  items: SparePartItem[];
  totalAmount: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  technicianNotes?: string;
  customerNotes?: string;
  requestedAt: string;
  respondedAt?: string;
}
