import {
  TechnicianApplication,
  ITechnicianApplication,
} from "../../models/technician/TechnicianApplicationSchema";
import { ITechnicianApplicationData } from "../../interfaces/technician/ITechnicianApplication";
import { Types } from "mongoose";

export class TechnicianApplicationRepository {
  async findById(
    applicationId: string
  ): Promise<ITechnicianApplication | null> {
    return await TechnicianApplication.findById(applicationId);
  }

  async findByTechnicianId(
    technicianId: string
  ): Promise<ITechnicianApplication[]> {
    return await TechnicianApplication.find({
      technicianId: new Types.ObjectId(technicianId),
    }).sort({ createdAt: -1 });
  }

  async findByEmailAndStatus(
    email: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null> {
    return await TechnicianApplication.findOne({
      email: email.toLowerCase().trim(),
      status: { $in: statuses },
    });
  }

  async findByTechnicianIdAndStatus(
    technicianId: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null> {
    return await TechnicianApplication.findOne({
      technicianId: new Types.ObjectId(technicianId),
      status: { $in: statuses },
    }).sort({ createdAt: -1 }); // Get the most recent application
  }

  async create(
    applicationData: Partial<ITechnicianApplication>
  ): Promise<ITechnicianApplication> {
    return await TechnicianApplication.create(applicationData);
  }

  async update(
    applicationId: string,
    updateData: Partial<ITechnicianApplication>
  ): Promise<ITechnicianApplication | null> {
    return await TechnicianApplication.findByIdAndUpdate(
      applicationId,
      { $set: updateData },
      { new: true }
    );
  }

  async save(
    application: ITechnicianApplication
  ): Promise<ITechnicianApplication> {
    return await application.save();
  }
  async findByUserIdAndStatus(
    userId: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null> {
    return await TechnicianApplication.findOne({
      technicianId: new Types.ObjectId(userId),
      status: { $in: statuses },
    }).sort({ createdAt: -1 });
  }
}
