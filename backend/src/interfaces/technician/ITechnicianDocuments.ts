import { Types } from 'mongoose';

export interface ITechnicianDocument {
  _id: Types.ObjectId;
  technicianId?: Types.ObjectId;
  applicationId?: Types.ObjectId;
  type: 'idProof' | 'addressProof' | 'experienceCertificate' | 'policeVerification' | 'tradeLicense' | 'other';
  fileUrl: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: Date;
  verifiedAt?: Date;
  metadata: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}