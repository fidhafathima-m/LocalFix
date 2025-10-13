import { ISocialAccount } from '../interfaces/user/ISocialAccount'
import mongoose, { Schema } from 'mongoose'

const SocialAccountSchema = new Schema<ISocialAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    provider: {
      type: String,
      enum: ['google', 'facebook'],
      required: true,
    },
    providerId: { type: String, required: true, unique: true },
    email: { type: String },
    profilePictureUrl: { type: String },
  },
  { timestamps: true }
)

export const SocialAccount = mongoose.model<ISocialAccount>(
  'SocialAccount',
  SocialAccountSchema
)
