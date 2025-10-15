import { ITechnician } from "../../interfaces/technician/ITechnician";
import { Technician } from "../../models/technician/TechnicianSchema";
import { Types } from "mongoose";
import { ITechnicianRepository } from "../../interfaces/repository/technician/ITechnicianRepository";

export class TechnicianRepository implements ITechnicianRepository {
  async findByUserId(userId: string): Promise<ITechnician | null> {
    return await Technician.findOne({ userId: new Types.ObjectId(userId) });
  }

  async findById(id: string): Promise<ITechnician | null> {
    return await Technician.findById(id);
  }

  async create(technicianData: any): Promise<ITechnician> {
    try {
      // Ensure languages is properly formatted as array
      const processedData = {
        ...technicianData,
        personalInfo: {
          ...technicianData.personalInfo,
          languages: Array.isArray(technicianData.personalInfo?.languages)
            ? technicianData.personalInfo.languages
            : [],
        },
      };

      const technician = new Technician(processedData);
      const savedTechnician = await technician.save();

      return savedTechnician;
    } catch (error) {
      console.error("Error creating technician:", error);
      throw error;
    }
  }

  async updateByUserId(
    userId: string,
    updateData: any
  ): Promise<ITechnician | null> {
    try {
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

      const technician = await Technician.findOneAndUpdate(
        { userId: new Types.ObjectId(userId) },
        { $set: processedUpdateData },
        { new: true, runValidators: true }
      );

      return technician;
    } catch (error) {
      console.error("Error updating technician:", error);
      throw error;
    }
  }

  async updateTechnicianStatus(
    id: string,
    updateData: any
  ): Promise<ITechnician | null> {
    return await Technician.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true }
    );
  }

  async save(technician: any): Promise<ITechnician> {
    if (technician && typeof technician.save === "function") {
      return await technician.save();
    } else {
      const updatedTechnician = await Technician.findOneAndUpdate(
        { _id: technician._id },
        { $set: technician },
        { new: true }
      );
      if (!updatedTechnician) {
        throw new Error("Technician not found");
      }
      return updatedTechnician;
    }
  }
}
