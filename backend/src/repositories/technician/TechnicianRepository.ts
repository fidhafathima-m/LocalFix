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
    const result = await this.model
      .findOne({ userId: new Types.ObjectId(userId) })
      .exec();

    return result;
  }

  async updateByUserId(
    userId: string,
    updateData: Partial<ITechnician>
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

    const result = await this.model
      .findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: processedUpdateData },
        { new: true, runValidators: true }
      )
      .exec();

    return result;
  }

  async updateTechnicianStatus(
    id: string,
    updateData: Partial<ITechnician>
  ): Promise<ITechnician | null> {
    return this.update(id, { $set: updateData });
  }
}
