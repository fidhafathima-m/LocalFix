import { ISparePartsRequest } from '../../technician/ISparePartsRequest';

export interface ISparePartsRequestRepository {
  create(requestData: Partial<ISparePartsRequest>): Promise<ISparePartsRequest>;
  findById(requestId: string): Promise<ISparePartsRequest | null>;
  findByOrderId(orderId: string): Promise<ISparePartsRequest[]>;
  findByTechnicianId(technicianId: string): Promise<ISparePartsRequest[]>;
  findByCustomerId(customerId: string): Promise<ISparePartsRequest[]>;
  updateStatus(
    requestId: string,
    status: string,
    customerNotes?: string
  ): Promise<ISparePartsRequest | null>;
  addHistory(
    requestId: string,
    historyEntry: {
      status: string;
      actionBy: 'technician' | 'customer' | 'system';
      notes?: string;
    }
  ): Promise<ISparePartsRequest | null>;
}
