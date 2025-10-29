import { ITechnician } from "../../../interfaces/technician/ITechnician";
import { IBaseRepository } from "../IBaseRepository";

export interface ITechnicianRepository extends IBaseRepository<ITechnician> {
  findByUserId(userId: string): Promise<ITechnician | null>;
  updateByUserId(
    userId: string,
    updateData: Partial<ITechnician>
  ): Promise<ITechnician | null>;
  updateTechnicianStatus(
    id: string,
    updateData: Partial<ITechnician>
  ): Promise<ITechnician | null>;
  save(technician: ITechnician): Promise<ITechnician>;
}
