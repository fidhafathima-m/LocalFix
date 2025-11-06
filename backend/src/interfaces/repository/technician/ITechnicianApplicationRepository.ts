import { ITechnicianApplication } from "../../../models/technician/TechnicianApplicationSchema";
import { IBaseRepository } from "../IBaseRepository";

export interface ITechnicianApplicationRepository
  extends IBaseRepository<ITechnicianApplication> {
  findByTechnicianId(technicianId: string): Promise<ITechnicianApplication[]>;
  findByEmailAndStatus(
    email: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null>;
  findByTechnicianIdAndStatus(
    technicianId: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null>;
  findByUserIdAndStatus(
    userId: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null>;
  findByPhoneAndStatus(
    phoneNumber: string,
    status: string[],
    excludeUserId?: string
  ): Promise<ITechnicianApplication | null>;
}
