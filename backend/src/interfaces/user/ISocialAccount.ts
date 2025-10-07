// src/interfaces/user/ISocialAccount.ts
import { Document, Types } from 'mongoose';

export interface ISocialAccount extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  provider: 'google' | 'facebook';
  providerId: string;
  email: string;
  profilePictureUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISocialAccountCreate {
  userId: Types.ObjectId;
  provider: 'google' | 'facebook';
  providerId: string;
  email: string;
  profilePictureUrl?: string;
}