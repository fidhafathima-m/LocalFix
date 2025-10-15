import { IOTPCreate, IOtpVerification } from "../../../interfaces/user/IOTP";

export interface IOTPRepository {
  create(otpData: IOTPCreate): Promise<IOtpVerification>;
  findLatest(
    phone?: string,
    email?: string,
    purpose?: string
  ): Promise<IOtpVerification | null>;
  deleteMany(phone?: string, email?: string, purpose?: string): Promise<void>;
  deleteById(id: string): Promise<void>;
}
