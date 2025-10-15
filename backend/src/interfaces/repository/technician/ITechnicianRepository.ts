import { ITechnician } from "../../../interfaces/technician/ITechnician";

export interface ITechnicianRepository {
  findByUserId(userId: string): Promise<ITechnician | null>;
  findById(id: string): Promise<ITechnician | null>;
  create(technicianData: any): Promise<ITechnician>;
  updateByUserId(userId: string, updateData: any): Promise<ITechnician | null>;
  updateTechnicianStatus(
    id: string,
    updateData: any
  ): Promise<ITechnician | null>;
  save(technician: any): Promise<ITechnician>;
}
