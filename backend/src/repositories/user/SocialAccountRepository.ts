import {
  ISocialAccount,
  ISocialAccountCreate,
} from "../../interfaces/user/ISocialAccount";
import { SocialAccount } from "../../models/SocialAccountSchema";
import { Types } from "mongoose";

export class SocialAccountRepository {
  async findByProviderId(providerId: string): Promise<ISocialAccount | null> {
    return await SocialAccount.findOne({ providerId });
  }

  async findByUserIdAndProvider(
    userId: string | Types.ObjectId,
    provider: string
  ): Promise<ISocialAccount | null> {
    return await SocialAccount.findOne({ userId, provider });
  }

  async create(socialData: ISocialAccountCreate): Promise<ISocialAccount> {
    return await SocialAccount.create(socialData);
  }
}
