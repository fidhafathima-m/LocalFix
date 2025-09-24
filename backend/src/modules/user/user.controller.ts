import User, { IUser } from "./user.model";
import { Request, Response } from "express";
import bcrypt from 'bcrypt' 
import { generateOTP } from "../../core/utils/generateOTP";
import OTPVerificationSchema from "../../shared/OTPVerificationSchema";
import { sendOTP } from "../../core/utils/sendOTP";
import jwt from 'jsonwebtoken'

// signup
export const signup = async(req: Request, res: Response): Promise<void> => {
    try {
        const { email, phone} = req.body;

        // Check if email or phone exists
        const existingEmail = await User.findOne({email});
        if(existingEmail) {
            res.status(400).json({message: 'Email already in use'});
            return;
        } 
        const existingPhone = await User.findOne({phone});
        if(existingPhone) {
            res.status(400).json({message: 'Phone already in use'});
            return;
        } 

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        await OTPVerificationSchema.create({
            phone,
            otpHash,
            purpose: 'signup',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        })
        await sendOTP(phone, otp);

        res.json({message: "OTP send to phone. Verify to complete signup."});

    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
}

//verofy otp
export const verifyOtp = async(req: Request, res: Response): Promise<void> => {
    try {
        const {phone, otp, fullName, password, email} = req.body;
        const record = await OTPVerificationSchema.findOne({ phone, purpose: "signup" }).sort({ createdAt: -1 });

        if(!record) {
            res.status(400).json({message: 'No OTP request found'});
            return;
        }
        const expiry = new Date(record.expiresAt).getTime();
        const now = Date.now();

        if (expiry < now) {
        res.status(400).json({ message: "OTP expired!" });
        return;
        }

        const isMatch = await bcrypt.compare(otp, record.otpHash);
        if(!isMatch) {
            res.status(400).json({message: "Invalid OTP"});
            return;
        }

        const passwordHash = password ? await bcrypt.hash(password, 10): undefined;
        const user = await User.create({
            fullName,
            phone, 
            email,
            passwordHash,
            isVerified: true
        })

        // Generate JWT token for the new user
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        // deleting otps after use
        await OTPVerificationSchema.deleteMany({phone, purpose: 'signup'});
        
        res.json({
            message: "Signup successful", 
            user: {
                _id: user._id,
                fullName: user.fullName,
                phone: user.phone,
                email: user.email,
                role: user.role
            },
            token
        });
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
}

export const verifyResetOtp = async (req: Request, res: Response) => {
    try {
        const { phone, otp } = req.body;

        const record = await OTPVerificationSchema.findOne({ phone, purpose: 'reset' }).sort({ createdAt: -1 });
        if (!record) {
            return res.status(400).json({ success: false, message: "No OTP request found" });
        }

        if (record.expiresAt < new Date()) {
            return res.status(400).json({ success: false, message: "OTP expired!" });
        }

        const isMatch = await bcrypt.compare(otp, record.otpHash);
        if (!isMatch) {
            return res.status(400).json({ success: false, message: "Invalid OTP" });
        }

        res.json({ success: true, message: "OTP verified" });
    } catch (error: any) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { phone, password, role } = req.body; 
    const user = await User.findOne({ phone, role }); 
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || "");
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

//  forget password
export const forgotPassword = async(req: Request, res: Response): Promise<void> => {
    try {
        const {phone} = req.body;

        // Check if phone exists
        
        const user = await User.findOne({phone});
        if(!user) {
            res.status(404).json({message: 'User not found'});
            return;
        } 

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        await OTPVerificationSchema.create({
            phone,
            otpHash,
            purpose: 'reset',
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        })
        await sendOTP(phone, otp);

        res.json({message: "OTP send for password reset."});

    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
}

// reset password
export const resetPassword = async(req: Request, res: Response): Promise<void> => {
    try {
        const {phone, otp, newPassword} = req.body;
        const record = await OTPVerificationSchema.findOne({phone, purpose: 'reset'}).sort({ createdAt: -1 });
        if(!record) {
            res.status(400).json({message: 'No OTP request found'});
            return;
        }
        if(record.expiresAt < new Date()) {
            res.status(400).json({message: "OTP expired!"});
            return;
        }

        const isMatch = await bcrypt.compare(otp, record.otpHash);
        if(!isMatch) {
            res.status(400).json({message: "Invalid OTP"});
            return;
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await User.updateOne({phone}, {$set: {passwordHash}});

        await OTPVerificationSchema.deleteMany({phone, purpose: 'reset'});
        await res.json({message: "Password reset successfully"});
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
}