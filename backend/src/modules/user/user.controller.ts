import User, { IUser } from "./user.model";
import { Request, Response } from "express";
import bcrypt from 'bcrypt' 
import { generateOTP } from "../../core/utils/generateOTP";
import OTPVerificationSchema from "../../shared/OTPVerificationSchema";
import jwt from 'jsonwebtoken'
import { sendPhoneOTP } from "../../core/utils/sendPhoneOTP";
import { sendEmailOTP } from "../../core/utils/sendEmailOTP";
import { OAuth2Client } from "google-auth-library";
import { SocialAccount } from "../../shared/SocialAccountSchema";
import axios from "axios";
import { MongoServerError } from 'mongodb';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// signup - FIXED VERSION (remove return statements)
export const signup = async(req: Request, res: Response): Promise<void> => {
    try {
        const { email, phone, fullName, password } = req.body;

        // Must provide at least email or phone
        if (!email && !phone) {
            res.status(400).json({ message: "Provide at least email or phone" });
            return; // Keep return to stop execution, but don't return the response
        }

        // Check uniqueness
        if (email && await User.findOne({ email })) {
            res.status(400).json({ message: 'Email already in use' });
            return;
        }
        if (phone && await User.findOne({ phone })) {
            res.status(400).json({ message: 'Phone already in use' });
            return;
        }

        // Generate OTP and hash
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        // Save OTP record
        const otpData: any = { otpHash, purpose: "signup", expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
        if (phone) otpData.phone = phone;
        if (email) otpData.email = email;

        await OTPVerificationSchema.create(otpData);

        // Send OTP to all provided channels
        const sentChannels: string[] = [];
        if (phone) { await sendPhoneOTP(phone, otp); sentChannels.push(`phone: ${phone}`); }
        if (email) { await sendEmailOTP(email, otp); sentChannels.push(`email: ${email}`); }

        res.json({
            message: `OTP sent to ${sentChannels.join(", ")}. Verify to complete signup.`
        });
        return; // Optional: explicit return at the end

    } catch (error: any) {
        res.status(500).json({ message: error.message });
        return;
    }
};

//verofy otp
//verofy otp
export const verifyOtp = async(req: Request, res: Response): Promise<void> => {
    try {
        const {phone, otp, fullName, password, email, userType} = req.body;

        console.log('Backend - Received userType:', userType);

        const query: any = { purpose: "signup" };
        if (phone) query.phone = phone;
        if (email) query.email = email;

        const record = await OTPVerificationSchema.findOne(query).sort({ createdAt: -1 });

        if(!record) {
            res.status(400).json({message: 'No OTP request found. Please request a new OTP.'});
            return;
        }

        // Check if OTP is expired
        if (record.expiresAt < new Date()) {
            // Auto-delete expired OTP
            await OTPVerificationSchema.deleteOne({ _id: record._id });
            res.status(400).json({ message: "OTP expired! Please request a new one." });
            return;
        }

        const isMatch = await bcrypt.compare(otp, record.otpHash);
        if(!isMatch) {
            // Increment failed attempts (optional)
            res.status(400).json({message: "Invalid OTP"});
            return;
        }

        const passwordHash = password ? await bcrypt.hash(password, 10): undefined;
        
        // Create user with appropriate role
        const userData: any = {
            fullName,
            phone, 
            email,
            passwordHash,
            isVerified: true,
            applicationStatus: 'not-applied' // Set default application status
        };
        
         if (userType) {
            if (userType === "serviceProvider" || userType === "technician") {
                userData.role = "serviceProvider";
            } else if (userType === "admin") {
                userData.role = "admin";
            } else {
                userData.role = "user"; // default
            }
        } else {
            userData.role = "user"; // default if no userType provided
        }

        console.log('Backend - Setting role to:', userData.role);

        const user = await User.create(userData);
        console.log('Created user with role:', user.role); // Verify the saved role

        // Generate JWT token for the new user
        const token = jwt.sign(
            { _id: user._id, role: user.role },
            process.env.JWT_SECRET as string,
            { expiresIn: "7d" }
        );

        // Delete used OTP
        await OTPVerificationSchema.deleteMany(query);
        
        // Create clean user response
        const userResponse = {
            _id: user._id,
            fullName: user.fullName,
            phone: user.phone,
            email: user.email,
            role: user.role,
            applicationStatus: user.applicationStatus || 'not-applied'
        };
        
        res.json({
            message: "Signup successful", 
            user: userResponse,
            token
        });
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
}

export const verifyResetOtp = async (req: Request, res: Response) => {
    try {
        const { phone, email, otp, userType } = req.body; // Add userType

        const query: any = { purpose: "reset" };
        if (phone) query.phone = phone;
        if (email) query.email = email;

        // For technicians, verify the user exists with correct role
        if (userType === 'serviceProvider') {
            const userQuery: any = phone ? { phone } : { email };
            userQuery.role = 'serviceProvider';
            const user = await User.findOne(userQuery);
            if (!user) {
                return res.status(404).json({ success: false, message: "Technician not found" });
            }
        }

        const record = await OTPVerificationSchema.findOne(query).sort({ createdAt: -1 });
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
// login
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { identifier, password, role } = req.body; 
    let user;
    if (/^\d{10}$/.test(identifier)) {
      user = await User.findOne({ phone: identifier, role });
    } else {
      user = await User.findOne({ email: identifier, role });
    }
    if (!user) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    if (user.isDeleted) {
      res.status(403).json({ message: "Your account has been deleted. Please contact support." });
      return;
    }

    if (user.status === "Blocked") {
      res.status(403).json({ message: "Your account is blocked by admin. Please contact support." });
      return;
    }

    if (user.status !== "Active") {
      res.status(403).json({ message: "Your account is not active. Please contact support." });
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

    // Create a clean user response with applicationStatus
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      applicationStatus: user.applicationStatus || 'not-applied', // Ensure this is included
      isVerified: user.isVerified,
      status: user.status
    };

    res.json({ 
      token, 
      user: userResponse // Send the formatted response instead of raw user
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
//  forget password
//  forget password
export const forgotPassword = async(req: Request, res: Response) => {
    try {
        const { phone, email, userType } = req.body; // Add userType
        if (!phone && !email) return res.status(400).json({ message: "Provide phone or email" });

        // Build query based on userType
        const query: any = phone ? { phone } : { email };
        if (userType) {
            query.role = userType === 'serviceProvider' ? 'serviceProvider' : 'user';
        }

        const user = await User.findOne(query);
        if (!user) return res.status(404).json({ message: "User not found" });

        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        const otpData: any = { otpHash, purpose: "reset", expiresAt: new Date(Date.now() + 5 * 60 * 1000) };
        if (phone) otpData.phone = phone;
        if (email) otpData.email = email;

        await OTPVerificationSchema.create(otpData);

        const sentChannels: string[] = [];
        if (phone) { await sendPhoneOTP(phone, otp); sentChannels.push(`phone: ${phone}`); }
        if (email) { await sendEmailOTP(email, otp); sentChannels.push(`email: ${email}`); }

        res.json({ message: `OTP sent to ${sentChannels.join(", ")}.` });

    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// reset password
export const resetPassword = async(req: Request, res: Response): Promise<void> => {
    try {
        const {phone, otp, newPassword, email, userType} = req.body; // Add userType

        const query: any = { purpose: "reset" };
        if (phone) query.phone = phone;
        if (email) query.email = email;

        const record = await OTPVerificationSchema.findOne(query).sort({ createdAt: -1 });

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

        // Build user query based on userType
        const userQuery: any = phone ? { phone } : { email };
        if (userType === 'serviceProvider') {
            userQuery.role = 'serviceProvider';
        }

        const passwordHash = await bcrypt.hash(newPassword, 10);
        await User.updateOne(userQuery, { $set: { passwordHash } });

        await OTPVerificationSchema.deleteMany(query);
        res.json({message: "Password reset successfully"});
    } catch (error: any) {
        res.status(500).json({message: error.message});
    }
}

// Resend OTP
export const resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
        const { phone, email, purpose, userType } = req.body;

        // Must provide at least email or phone
        if (!email && !phone) {
            res.status(400).json({ message: "Provide at least email or phone" });
            return;
        }

        // For forgot password, check if user exists
        if (purpose === "reset") {
            const user = await User.findOne(phone ? { phone } : { email });
            if (!user) {
                res.status(404).json({ message: "User not found" });
                return;
            }
        }

        // Generate new OTP and hash
        const otp = generateOTP();
        const otpHash = await bcrypt.hash(otp, 10);

        // Delete any existing OTP records for this phone/email and purpose
        const query: any = { purpose };
        if (phone) query.phone = phone;
        if (email) query.email = email;

        await OTPVerificationSchema.deleteMany(query);

        // Save new OTP record
        const otpData: any = { 
            otpHash, 
            purpose, 
            expiresAt: new Date(Date.now() + 5 * 60 * 1000) // 5 minutes
        };
        if (phone) otpData.phone = phone;
        if (email) otpData.email = email;

        await OTPVerificationSchema.create(otpData);

        // Send OTP to provided channels
        const sentChannels: string[] = [];
        if (phone) { 
            await sendPhoneOTP(phone, otp); 
            sentChannels.push(`phone: ${phone}`); 
        }
        if (email) { 
            await sendEmailOTP(email, otp); 
            sentChannels.push(`email: ${email}`); 
        }

        res.json({
            success: true,
            message: `OTP resent to ${sentChannels.join(", ")}`
        });

    } catch (error: any) {
        console.error("Resend OTP error:", error);
        res.status(500).json({ 
            success: false,
            message: error.message 
        });
    }
};


export const googleAuth = async (req: Request, res: Response) => {
  const { token, userType } = req.body; // Get userType from request body
  if (!token) return res.status(400).json({ message: "Token is required" });

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: "Invalid token" });

    const { email, name, sub: googleId, picture } = payload;

    if (!email) {
      return res.status(400).json({ message: "Google account email is required" });
    }

    // Check if a social account already exists
    let socialAccount = await SocialAccount.findOne({ providerId: googleId });
    let user;

    if (socialAccount) {
      user = await User.findById(socialAccount.userId);
    } else {
      // Also check if user exists with this email
      user = await User.findOne({ email });

      if (!user) {
        // Create new user with appropriate role
        user = new User({
          fullName: name,
          email: email,
          isVerified: true,
          role: userType === 'serviceProvider' ? 'serviceProvider' : 'user', // Set role based on userType
          applicationStatus: 'not-applied' // Set default application status
          // Don't include phone field at all
        });
        await user.save();
      } else {
        // If user exists but is logging in as technician, update role if needed
        if (userType === 'serviceProvider' && user.role === 'user') {
          user.role = 'serviceProvider';
          await user.save();
        }
      }

      // Create SocialAccount record
      socialAccount = await SocialAccount.findOne({ userId: user._id, provider: "google" });
      
      if (!socialAccount) {
        socialAccount = new SocialAccount({
          userId: user._id,
          provider: "google",
          providerId: googleId,
          email,
          profilePictureUrl: picture,
        });
        await socialAccount.save();
      }
    }

    const appToken = jwt.sign(
      { _id: user?._id, role: user?.role }, // Include role in JWT
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Create clean user response
    const userResponse = {
      _id: user?._id,
      fullName: user?.fullName,
      email: user?.email,
      role: user?.role,
      applicationStatus: user?.applicationStatus || 'not-applied',
      isVerified: user?.isVerified
    };

    res.json({ 
      token: appToken, 
      user: userResponse,
      message: "Google authentication successful" 
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    
    if (error instanceof MongoServerError && error.code === 11000) {
      return res.status(400).json({ 
        message: "User with this email already exists. Please use regular login." 
      });
    }
    
    res.status(500).json({ message: "Google authentication failed" });
  }
};

export const facebookLogin = async (req: Request, res: Response) => {
  try {
    const { accessToken, userID } = req.body;

    // Verify token with Facebook Graph API
    const fbRes = await axios.get(
      `https://graph.facebook.com/${userID}?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const { id, name, email, picture } = fbRes.data;

    // Check if social account already exists
    let account = await SocialAccount.findOne({ provider: "facebook", providerId: id });

    let user;
    if (!account) {
      // Create a new user if doesn't exist
      user = await User.findOne({ email });

      if (!user) {
        user = new User({ 
          fullName: name, 
          email, 
          role: "user",
          applicationStatus: 'not-applied' // Set default
        });
        await user.save();
      }

      account = new SocialAccount({
        userId: user._id,
        provider: "facebook",
        providerId: id,
        email,
        profilePictureUrl: picture?.data?.url,
      });
      await account.save();
    } else {
      user = await User.findById(account.userId);
    }

    if (!user) return res.status(400).json({ message: "User not found" });

    // Generate JWT
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Create clean user response
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      applicationStatus: user.applicationStatus || 'not-applied'
    };

    res.json({ token, user: userResponse });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Facebook login failed" });
  }
};