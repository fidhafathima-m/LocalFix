import { ISocialAccountRepository } from "../../interfaces/repository/user/ISocialAccountRepository";
import {
  ISocialAccount,
  ISocialAccountCreate,
} from "../../interfaces/user/ISocialAccount";
import { SocialAccount } from "../../models/SocialAccountSchema";
import { Model, Types } from "mongoose";
import { BaseRepository } from "../BaseRepository";

export class SocialAccountRepository extends BaseRepository<ISocialAccount> {
  constructor() {
    super(SocialAccount as Model<ISocialAccount>);
  }
  async findByProviderId(providerId: string): Promise<ISocialAccount | null> {
    return await SocialAccount.findOne({ providerId });
  }

  async findByUserIdAndProvider(
    userId: string | Types.ObjectId,
    provider: string
  ): Promise<ISocialAccount | null> {
    return await SocialAccount.findOne({ userId, provider });
  }
}
