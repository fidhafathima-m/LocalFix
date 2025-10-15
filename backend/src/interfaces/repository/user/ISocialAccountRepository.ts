import {
  ISocialAccount,
  ISocialAccountCreate,
} from "../../../interfaces/user/ISocialAccount";
import { Types } from "mongoose";

export interface ISocialAccountRepository {
  findByProviderId(providerId: string): Promise<ISocialAccount | null>;
  findByUserIdAndProvider(
    userId: string | Types.ObjectId,
    provider: string
  ): Promise<ISocialAccount | null>;
  create(socialData: ISocialAccountCreate): Promise<ISocialAccount>;
}
