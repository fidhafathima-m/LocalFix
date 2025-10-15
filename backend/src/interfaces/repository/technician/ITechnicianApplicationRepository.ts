import { ITechnicianApplication } from "../../../models/technician/TechnicianApplicationSchema";

export interface ITechnicianApplicationRepository {
  findById(applicationId: string): Promise<ITechnicianApplication | null>;
  findByTechnicianId(technicianId: string): Promise<ITechnicianApplication[]>;
  findByEmailAndStatus(
    email: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null>;
  findByTechnicianIdAndStatus(
    technicianId: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null>;
  create(
    applicationData: Partial<ITechnicianApplication>
  ): Promise<ITechnicianApplication>;
  update(
    applicationId: string,
    updateData: Partial<ITechnicianApplication>
  ): Promise<ITechnicianApplication | null>;
  save(application: ITechnicianApplication): Promise<ITechnicianApplication>;
  findByUserIdAndStatus(
    userId: string,
    statuses: string[]
  ): Promise<ITechnicianApplication | null>;
}
