import { Model, Types } from "mongoose";
import { BaseRepository } from "../BaseRepository";
import { ITechnicianRepository } from "../../interfaces/repository/technician/ITechnicianRepository";
import { ITechnician } from "../../interfaces/technician/ITechnician";
import { Technician } from "../../models/technician/TechnicianSchema";

export class TechnicianRepository
  extends BaseRepository<ITechnician>
  implements ITechnicianRepository
{
  constructor() {
    super(Technician as Model<ITechnician>);
  }

  async findByUserId(userId: string): Promise<ITechnician | null> {
    return this.findOne({ userId: new Types.ObjectId(userId) });
  }

  async updateByUserId(
    userId: string,
    updateData: any
  ): Promise<ITechnician | null> {
    const processedUpdateData = {
      ...updateData,
      personalInfo: updateData.personalInfo
        ? {
            ...updateData.personalInfo,
            languages: Array.isArray(updateData.personalInfo?.languages)
              ? updateData.personalInfo.languages
              : [],
          }
        : undefined,
    };

    return this.model.findOneAndUpdate(
      { userId: new Types.ObjectId(userId) },
      { $set: processedUpdateData },
      { new: true, runValidators: true }
    );
  }

  async updateTechnicianStatus(
    id: string,
    updateData: any
  ): Promise<ITechnician | null> {
    return this.update(id, { $set: updateData } as any);
  }
}
