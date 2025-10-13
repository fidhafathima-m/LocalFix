import { ITechnician } from "@/interfaces/technician/ITechnician";
import { Technician } from "../../models/technician/TechnicianSchema";
import { Types } from "mongoose";

export class TechnicianRepository {
  async findByUserId(userId: string): Promise<ITechnician | null> {
    return await Technician.findOne({ userId: new Types.ObjectId(userId) });
  }

  async findById(id: string): Promise<ITechnician | null> {
    return await Technician.findById(id);
  }

  async create(technicianData: any): Promise<ITechnician> {
    try {
      console.log("🔍 Creating technician with data:", {
        personalInfo: technicianData.personalInfo,
        addressType: typeof technicianData.personalInfo?.address,
      });

      const technician = new Technician(technicianData);
      return await technician.save();
    } catch (error) {
      console.error("❌ Error creating technician:", error);
      throw error;
    }
  }

  async updateByUserId(
    userId: string,
    updateData: any
  ): Promise<ITechnician | null> {
    try {
      console.log("🔍 Updating technician with data:", {
        personalInfo: updateData.personalInfo,
        addressType: typeof updateData.personalInfo?.address,
      });

      return await Technician.findOneAndUpdate(
        { userId },
        { $set: updateData },
        { new: true }
      );
    } catch (error) {
      console.error("❌ Error updating technician:", error);
      throw error;
    }
  }

  // In your TechnicianRepository
async updateTechnicianStatus(id: string, updateData: any): Promise<ITechnician | null> {
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
