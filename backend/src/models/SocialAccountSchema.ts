import mongoose, { Schema, Document } from 'mongoose'

const { ObjectId } = mongoose.Types

export interface ISocialAccount extends Document {
  _id: typeof ObjectId
  userId: typeof ObjectId
  provider: 'google' | 'facebook'
  providerId: string
  email: string
  profilePictureUrl: string
}

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
