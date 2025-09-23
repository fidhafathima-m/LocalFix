import User from "../../models/UserSchema";
import { Request, Response } from "express";
import bcrypt from 'bcrypt' 
import { generateOTP } from "../../utils/generateOTP";
import OTPVerificationSchema from "../../models/OTPVerificationSchema";
import { sendOTP } from "../../utils/sendOTP";
import jwt from 'jsonwebtoken'

export const technicianLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone, role: 'technician' });

    if (!user) {
      res.status(404).json({ message: "Technician not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || '');

    if (!isMatch) {
      res.status(400).json({ message: "Invalid credentials" });
      return;
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.json({ token, user });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const technicianForgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone } = req.body;

    const user = await User.findOne({ phone, role: 'technician' });

    if (!user) {
      res.status(404).json({ message: 'Technician not found' });
      return;
    }

    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);

    await OTPVerificationSchema.create({
      phone,
      otpHash,
      purpose: 'technician_reset',
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendOTP(phone, otp);

    res.json({ message: "OTP sent for technician password reset." });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

export const technicianResetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp, newPassword } = req.body;

    const record = await OTPVerificationSchema.findOne({ phone, purpose: 'technician_reset' }).sort({ createdAt: -1 });

    if (!record) {
      res.status(400).json({ message: 'No OTP request found' });
      return;
    }

    if (record.expiresAt < new Date()) {
      res.status(400).json({ message: 'OTP expired!' });
      return;
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    await User.updateOne({ phone, role: 'technician' }, { $set: { passwordHash } });

    await OTPVerificationSchema.deleteMany({ phone, purpose: 'technician_reset' });

    res.json({ message: "Technician password reset successfully" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// technician password reset otp
export const verifyTechnicianResetOtp = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, otp } = req.body;

    const record = await OTPVerificationSchema.findOne({ phone, purpose: 'technician_reset' }).sort({ createdAt: -1 });

    if (!record) {
      res.status(400).json({ message: 'No OTP request found' });
      return;
    }

    if (record.expiresAt < new Date()) {
      res.status(400).json({ message: 'OTP expired!' });
      return;
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      res.status(400).json({ message: 'Invalid OTP' });
      return;
    }

    res.json({ message: "OTP verified for technician" });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
