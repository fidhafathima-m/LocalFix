import { IOTPCreate, IOtpVerification } from "../../../interfaces/user/IOTP";
import { IBaseRepository } from "../IBaseRepository";

export interface IOTPRepository extends IBaseRepository<IOtpVerification> {
  findLatest(
    phone?: string,
    email?: string,
    purpose?: string
  ): Promise<IOtpVerification | null>;
  deleteMany(phone?: string, email?: string, purpose?: string): Promise<void>;
  deleteById(id: string): Promise<void>;
}
