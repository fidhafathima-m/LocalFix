import { Model, Types } from "mongoose";
import { BaseRepository } from "../BaseRepository";
import { ITechnicianApplicationRepository } from "../../interfaces/repository/technician/ITechnicianApplicationRepository";
import {
  ITechnicianApplication,
  TechnicianApplication,
} from "../../models/technician/TechnicianApplicationSchema";

export class TechnicianApplicationRepository
  extends BaseRepository<ITechnicianApplication>
  implements ITechnicianApplicationRepository
{
  constructor() {
    super(TechnicianApplication as Model<ITechnicianApplication>);
  }

  async findByTechnicianId(
    technicianId: string
  ): Promise<ITechnicianApplication[]> {
    return this.find({
      technicianId: new Types.ObjectId(technicianId),
    });
  }

  async findByEmailAndStatus(
    email: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null> {
    return this.findOne({
      email: email.toLowerCase().trim(),
      status: { $in: statuses },
    });
  }

  async findByTechnicianIdAndStatus(
    technicianId: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null> {
    return this.findOne({
      technicianId: new Types.ObjectId(technicianId),
      status: { $in: statuses },
    });
  }

  async findByUserIdAndStatus(
    userId: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null> {
    return this.findOne({
      technicianId: new Types.ObjectId(userId),
      status: { $in: statuses },
    });
  }
}
