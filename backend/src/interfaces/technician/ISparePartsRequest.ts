// interfaces/technician/ISparePartsRequest.ts
import { Document, Types } from 'mongoose';

export interface ISparePartRequestItem {
  itemId: Types.ObjectId | string;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
}

export interface ISparePartsRequest extends Document {
  orderId: Types.ObjectId | string;
  technicianId: Types.ObjectId | string;
  customerId: Types.ObjectId | string;
  items: ISparePartRequestItem[];
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  technicianNotes?: string;
  customerNotes?: string;
  requestedAt: Date;
  respondedAt?: Date;
  history: Array<{
    status: string;
    actionBy: 'technician' | 'customer' | 'system';
    notes?: string;
    timestamp: Date;
  }>;
}
