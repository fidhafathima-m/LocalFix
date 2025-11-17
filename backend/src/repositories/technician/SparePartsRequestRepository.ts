// repositories/technician/SparePartsRequestRepository.ts
import { Types } from 'mongoose';
import { SparePartsRequest } from '../../models/SparePartsRequestSchema';
import { ISparePartsRequest } from '../../interfaces/technician/ISparePartsRequest';
import { ISparePartsRequestRepository } from '../../interfaces/repository/technician/ISparePartsRequestRepository';

// repositories/technician/SparePartsRequestRepository.ts
export class SparePartsRequestRepository
  implements ISparePartsRequestRepository
{
  async create(
    requestData: Partial<ISparePartsRequest>
  ): Promise<ISparePartsRequest> {
    // Mongoose will automatically convert valid string IDs to ObjectId
    const request = new SparePartsRequest(requestData);
    return await request.save();
  }

  async findById(requestId: string): Promise<ISparePartsRequest | null> {
    // No need to convert to ObjectId
    return await SparePartsRequest.findById(requestId)
      .populate('technicianId', 'displayName phone')
      .populate('orderId', 'orderCode serviceName')
      .exec();
  }

  async findByOrderId(orderId: string): Promise<ISparePartsRequest[]> {
    // No need to convert to ObjectId
    return await SparePartsRequest.find({ orderId })
      .populate('technicianId', 'displayName phone')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByTechnicianId(
    technicianId: string
  ): Promise<ISparePartsRequest[]> {
    // No need to convert to ObjectId
    return await SparePartsRequest.find({ technicianId })
      .populate('orderId', 'orderCode serviceName')
      .populate('customerId', 'fullName phone')
      .sort({ createdAt: -1 })
      .exec();
  }

  async findByCustomerId(customerId: string): Promise<ISparePartsRequest[]> {
    return await SparePartsRequest.find({
      customerId: new Types.ObjectId(customerId),
    })
      .populate('technicianId', 'displayName phone')
      .populate('orderId', 'orderCode serviceName')
      .sort({ createdAt: -1 })
      .exec();
  }

  async updateStatus(
    requestId: string,
    status: string,
    customerNotes?: string
  ): Promise<ISparePartsRequest | null> {
    const updateData: any = {
      status,
      respondedAt: new Date(),
    };

    if (customerNotes) {
      updateData.customerNotes = customerNotes;
    }

    // No need to convert to ObjectId
    return await SparePartsRequest.findByIdAndUpdate(
      requestId, // Use string directly
      { $set: updateData },
      { new: true }
    )
      .populate('technicianId', 'displayName phone')
      .populate('orderId', 'orderCode serviceName')
      .exec();
  }

  async addHistory(
    requestId: string,
    historyEntry: {
      status: string;
      actionBy: 'technician' | 'customer' | 'system';
      notes?: string;
    }
  ): Promise<ISparePartsRequest | null> {
    // No need to convert to ObjectId
    return await SparePartsRequest.findByIdAndUpdate(
      requestId, // Use string directly
      {
        $push: {
          history: {
            ...historyEntry,
            timestamp: new Date(),
          },
        },
      },
      { new: true }
    ).exec();
  }
}
