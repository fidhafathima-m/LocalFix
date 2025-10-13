import { IOTPCreate, IOtpVerification } from "../../interfaces/user/IOTP";
import OTPVerificationSchema from "../../models/OTPVerificationSchema";

export class OTPRepository {
  async create(otpData: IOTPCreate): Promise<IOtpVerification> {
    return await OTPVerificationSchema.create(otpData);
  }

  async findLatest(
    phone?: string,
    email?: string,
    purpose?: string
  ): Promise<IOtpVerification | null> {
    const query: any = {};
    if (phone) query.phone = phone;
    if (email) query.email = email;
    if (purpose) query.purpose = purpose;

    return await OTPVerificationSchema.findOne(query).sort({ createdAt: -1 });
  }

  async deleteMany(
    phone?: string,
    email?: string,
    purpose?: string
  ): Promise<void> {
    const query: any = {};
    if (phone) query.phone = phone;
    if (email) query.email = email;
    if (purpose) query.purpose = purpose;

    await OTPVerificationSchema.deleteMany(query);
  }

  async deleteById(id: string): Promise<void> {
    await OTPVerificationSchema.deleteOne({ _id: id });
  }
}
