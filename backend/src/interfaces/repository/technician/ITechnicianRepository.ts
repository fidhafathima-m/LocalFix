import { ITechnician } from "../../../interfaces/technician/ITechnician";
import { IBaseRepository } from "../IBaseRepository";

export interface ITechnicianRepository extends IBaseRepository<ITechnician> {
  findByUserId(userId: string): Promise<ITechnician | null>;
  updateByUserId(userId: string, updateData: any): Promise<ITechnician | null>;
  updateTechnicianStatus(
    id: string,
    updateData: any
  ): Promise<ITechnician | null>;
  save(technician: any): Promise<ITechnician>;
}
