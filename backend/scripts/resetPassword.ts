import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

import User from '../src/models/UserSchema';

const MONGO_URI = process.env.MONGO_URI || process.env.MONGODB_URI;

async function resetPassword(email: string, newPassword: string) {
  try {
    await mongoose.connect(MONGO_URI!);
    console.log('Connected to database');

    const hashed = await bcrypt.hash(newPassword, 10);

    const result = await User.updateOne({ email }, { password: hashed });

    console.log(result);
    console.log(`Password updated for: ${email}`);
  } catch (err) {
    console.error(err);
  } finally {
    await mongoose.disconnect();
  }
}

resetPassword('roy@yopmail.com', 'Roy@1234!');
