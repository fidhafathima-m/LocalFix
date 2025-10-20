import {
  ISocialAccount,
  ISocialAccountCreate,
} from "../../../interfaces/user/ISocialAccount";
import { Types } from "mongoose";
import { IBaseRepository } from "../IBaseRepository";

export interface ISocialAccountRepository extends IBaseRepository<ISocialAccount> {
  findByProviderId(providerId: string): Promise<ISocialAccount | null>;
  findByUserIdAndProvider(
    userId: string | Types.ObjectId,
    provider: string
  ): Promise<ISocialAccount | null>;
}
