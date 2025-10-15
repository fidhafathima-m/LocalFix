import { ITechnicianDocument } from "../../../models/technician/TechnicianDocumentSchema";

export interface ITechnicianDocumentRepository {
  create(
    documentData: Partial<ITechnicianDocument>
  ): Promise<ITechnicianDocument>;
  findByApplicationId(applicationId: string): Promise<ITechnicianDocument[]>;
  findByTechnicianId(technicianId: string): Promise<ITechnicianDocument[]>;
}
