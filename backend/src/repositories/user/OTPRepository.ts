import { FilterQuery, Model } from 'mongoose';
import { BaseRepository } from '../BaseRepository';
import { IOTPRepository } from '../../interfaces/repository/user/IOTPRepository';
import OTPVerificationSchema from '../../models/OTPVerificationSchema';
import { IOtpVerification } from '../../interfaces/user/IOTP';

export class OTPRepository
  extends BaseRepository<IOtpVerification>
  implements IOTPRepository
{
  constructor() {
    super(OTPVerificationSchema as Model<IOtpVerification>);
  }

  async findLatest(
    phone?: string,
    email?: string,
    purpose?: 'signup' | 'login' | 'reset' | 'application'
  ): Promise<IOtpVerification | null> {
    const query: FilterQuery<IOtpVerification> = {};
    if (phone) query.phone = phone;
    if (email) query.email = email;
    if (purpose) query.purpose = purpose;

    return this.model.findOne(query).sort({ createdAt: -1 });
  }

  async deleteMany(
    phone?: string,
    email?: string,
    purpose?: 'signup' | 'login' | 'reset' | 'application'
  ): Promise<void> {
    const query: FilterQuery<IOtpVerification> = {};
    if (phone) query.phone = phone;
    if (email) query.email = email;
    if (purpose) query.purpose = purpose;

    await this.model.deleteMany(query);
  }

  async deleteById(id: string): Promise<void> {
    await this.delete(id);
  }
}
