import {
  TechnicianDocument,
  ITechnicianDocument,
} from "../../models/technician/TechnicianDocumentSchema";
import { Types } from "mongoose";

export class TechnicianDocumentRepository {
  async create(
    documentData: Partial<ITechnicianDocument>
  ): Promise<ITechnicianDocument> {
    return await TechnicianDocument.create(documentData);
  }

  async findByApplicationId(
    applicationId: string
  ): Promise<ITechnicianDocument[]> {
    return await TechnicianDocument.find({
      applicationId: new Types.ObjectId(applicationId),
    });
  }

  async findByTechnicianId(
    technicianId: string
  ): Promise<ITechnicianDocument[]> {
    return await TechnicianDocument.find({
      technicianId: new Types.ObjectId(technicianId),
    });
  }
}
