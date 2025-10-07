import { ITechnician } from '@/interfaces/technician/ITechnician';
import { Technician } from '../../models/technician/TechnicianSchema';
import { Types } from 'mongoose';

export class TechnicianRepository {
  async findByUserId(userId: string): Promise<ITechnician | null> {
    return await Technician.findOne({ userId: new Types.ObjectId(userId) });
  }

  async create(technicianData: Partial<ITechnician>): Promise<ITechnician> {
    return await Technician.create(technicianData);
  }

  async updateByUserId(userId: string, updateData: Partial<ITechnician>): Promise<ITechnician | null> {
    return await Technician.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: updateData },
      { new: true }
    );
  }

  // Fixed save method - only works with Mongoose documents
  async save(technician: any): Promise<ITechnician> {
    // Check if it's a Mongoose document with save method
    if (technician && typeof technician.save === 'function') {
      return await technician.save();
    } else {
      // If it's a plain object, use findOneAndUpdate instead
      const updatedTechnician = await Technician.findOneAndUpdate(
        { _id: technician._id },
        { $set: technician },
        { new: true }
      );
      if (!updatedTechnician) {
        throw new Error('Technician not found');
      }
      return updatedTechnician;
    }
  }
}