import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import {
AuthResponse,
OTPResponse,
LoginCredentials,
SignupData,
OTPVerificationData,
ResetPasswordData,
SocialAuthData,
} from "../interfaces/user/IAuthService";
import { generateOTP } from "../utils/generateOTP";
import { sendPhoneOTP } from "../utils/sendPhoneOTP";
import { sendEmailOTP } from "../utils/sendEmailOTP";
import { IAuthService } from "../interfaces/services/user/IAuthService";
import { IUserRepository } from "../interfaces/repository/user/IUserRepository";
import { IOTPRepository } from "../interfaces/repository/user/IOTPRepository";
import { ISocialAccountRepository } from "../interfaces/repository/user/ISocialAccountRepository";
import { ResponseHelper } from "../utils/responseHelper";

export class AuthService implements IAuthService {
private userRepository: IUserRepository;
private otpRepository: IOTPRepository;
private socialAccountRepository: ISocialAccountRepository;
private googleClient: OAuth2Client;

constructor(
  userRepository: IUserRepository,
  otpRepository: IOTPRepository,
  socialAccountRepository: ISocialAccountRepository,
) {
  this.userRepository = userRepository;
  this.otpRepository = otpRepository;
  this.socialAccountRepository = socialAccountRepository;
  this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
}

async signup(signupData: SignupData): Promise<AuthResponse> {
  try {
    const { email, phone } = signupData;

    // Validation
    if (!email && !phone) {
      return ResponseHelper.badRequest("Provide at least email or phone");
    }

    // Check uniqueness
    if (email && (await this.userRepository.findByEmail(email))) {
      return ResponseHelper.conflict("Email already in use");
    }
    if (phone && (await this.userRepository.findByPhone(phone))) {
      return ResponseHelper.conflict("Phone already in use");
    }

    // Generate and send OTP
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);

    const otpData: any = {
      otpHash,
      purpose: "signup",
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    };
    if (phone) otpData.phone = phone;
    if (email) otpData.email = email;

    await this.otpRepository.create(otpData);

    // Send OTP
    const sentChannels: string[] = [];
    if (phone) {
      await sendPhoneOTP(phone, otp);
      sentChannels.push(`phone: ${phone}`);
    }
    if (email) {
      await sendEmailOTP(email, otp);
      sentChannels.push(`email: ${email}`);
    }

    return ResponseHelper.success(
      `OTP sent to ${sentChannels.join(", ")}. Verify to complete signup.`
    );
  } catch (error: any) {
    return ResponseHelper.error(error.message);
  }
}

async verifyOtp(otpData: OTPVerificationData): Promise<AuthResponse> {
  try {
    const { phone, email, otp, fullName, password, userType } = otpData;

    const query: any = { purpose: "signup" };
    if (phone) query.phone = phone;
    if (email) query.email = email;

    const record = await this.otpRepository.findLatest(
      phone,
      email,
      "signup"
    );

    if (!record) {
      return ResponseHelper.badRequest("No OTP request found. Please request a new OTP.");
    }

    if (record.expiresAt < new Date()) {
      await this.otpRepository.deleteById(record._id!);
      return ResponseHelper.badRequest("OTP expired! Please request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      return ResponseHelper.badRequest("Invalid OTP");
    }

    // Create user
    const passwordHash = password
      ? await bcrypt.hash(password, 10)
      : undefined;

    const userData: any = {
      fullName,
      phone,
      email,
      passwordHash,
      isVerified: true,
      applicationStatus: "not-applied",
    };

    // Set role based on userType
    if (userType === "serviceProvider" || userType === "technician") {
      userData.role = "serviceProvider";
    } else if (userType === "admin") {
      userData.role = "admin";
    } else {
      userData.role = "user";
    }

    const user = await this.userRepository.create(userData);

    // Generate JWT token
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    // Delete used OTP
    await this.otpRepository.deleteMany(phone, email, "signup");

    // Create clean user response
    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      applicationStatus: user.applicationStatus || "not-applied",
    };

    return ResponseHelper.success(
      "Signup successful",
      {
        user: userResponse,
        token,
      }
    );
  } catch (error: any) {
    return ResponseHelper.error(error.message);
  }
}

async login(credentials: LoginCredentials): Promise<AuthResponse> {
  try {
    const { identifier, password, role } = credentials;

    let normalizedIdentifier = identifier;

    if (identifier.includes("@")) {
      normalizedIdentifier = identifier.toLowerCase();
    }

    const user = await this.userRepository.findByIdentifier(
      normalizedIdentifier,
      role
    );

    if (!user) {
      return ResponseHelper.notFound("User not found");
    }

    if (user.isDeleted) {
      return ResponseHelper.forbidden("Your account has been deleted. Please contact support.");
    }

    if (user.status === "Blocked") {
      return ResponseHelper.forbidden("Your account is blocked by admin. Please contact support.");
    }

    if (user.status !== "Active") {
      return ResponseHelper.forbidden("Your account is not active. Please contact support.");
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash || "");
    if (!isMatch) {
      return ResponseHelper.unauthorized("Invalid credentials");
    }

    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    const userResponse = {
      _id: user._id,
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      role: user.role,
      applicationStatus: user.applicationStatus || "not-applied",
      isVerified: user.isVerified,
      status: user.status,
    };

    return ResponseHelper.success("Logged in Successfully", {
      token,
      user: userResponse,
    })
  } catch (error: any) {
    return ResponseHelper.error(error.message);
  }
}

async forgotPassword(
phone?: string,
email?: string,
userType?: string
): Promise<AuthResponse> {
try {
  if (!phone && !email) {
    return ResponseHelper.badRequest("Provide phone or email");
  }

  // Find user by phone or email
  let user;
  if (phone) {
    user = await this.userRepository.findByPhone(phone);
  } else if (email) {
    user = await this.userRepository.findByEmail(email);
  }

  // Check if user exists
  if (!user) {
    return ResponseHelper.notFound("User not found");
  }

  // Check user type if provided - FIXED THIS PART
  if (userType) {
    let expectedRole: string;
    
    // Map frontend userType to backend role
    switch (userType) {
      case "serviceProvider":
        expectedRole = "serviceProvider";
        break;
      case "admin":
        expectedRole = "admin";
        break;
      case "user":
      default:
        expectedRole = "user";
        break;
    }

    if (user.role !== expectedRole) {
      return ResponseHelper.notFound(`User not found for ${userType} role`);
    }
  }

  // Check if user is active and not blocked
  if (user.isDeleted) {
    return ResponseHelper.forbidden("Your account has been deleted. Please contact support.");
  }

  if (user.status === "Blocked") {
    return ResponseHelper.forbidden("Your account is blocked by admin. Please contact support.");
  }

  if (user.status !== "Active") {
    return ResponseHelper.forbidden("Your account is not active. Please contact support.");
  }

  // Generate and send OTP only if user exists and is valid
  const otp = generateOTP();
  const otpHash = await bcrypt.hash(otp, 10);

  const otpData: any = {
    otpHash,
    purpose: "reset",
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  };
  if (phone) otpData.phone = phone;
  if (email) otpData.email = email;

  await this.otpRepository.create(otpData);

  const sentChannels: string[] = [];
  if (phone) {
    await sendPhoneOTP(phone, otp);
    sentChannels.push(`phone: ${phone}`);
  }
  if (email) {
    await sendEmailOTP(email, otp);
    sentChannels.push(`email: ${email}`);
  }

  return ResponseHelper.success(`OTP sent to ${sentChannels.join(", ")}.`);
} catch (error: any) {
  return ResponseHelper.error(error.message)
}
}

async resetPassword(resetData: ResetPasswordData): Promise<AuthResponse> {
try {
  const { phone, email, otp, token, password, userType } = resetData; // Change newPassword to password

  if (!password) {
    return ResponseHelper.badRequest("Password is required");
  }

  let record;
  
  // Handle OTP-based reset
  if (otp) {
    record = await this.otpRepository.findLatest(phone, email, "reset");
    
    if (!record) {
      return ResponseHelper.badRequest("No OTP request found");
    }

    if (record.expiresAt < new Date()) {
      return ResponseHelper.badRequest("OTP expired!");
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      return ResponseHelper.badRequest("Invalid OTP");
    }
  } 
  // Handle token-based reset
  else if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
      
      // Verify token purpose and expiration
      if (decoded.purpose !== "password_reset") {
        return ResponseHelper.badRequest("Invalid reset token");
      }
      
      // Verify identifier matches
      const tokenIdentifier = decoded.identifier;
      const providedIdentifier = phone || email;
      if (tokenIdentifier !== providedIdentifier) {
        return ResponseHelper.badRequest("Token mismatch"); 
      }
      
      // Verify user type matches
      if (decoded.userType !== userType) {
        return ResponseHelper.badRequest("User type mismatch");
      }
    } catch (error) {
      return ResponseHelper.badRequest("Invalid or expired token");
    }
  } else {
    return ResponseHelper.badRequest("Either OTP or token is required");
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const identifier = phone || email!;

  await this.userRepository.updatePassword(
    identifier,
    passwordHash,
    userType
  );
  
  // Delete OTP record if OTP was used
  if (otp) {
    await this.otpRepository.deleteMany(phone, email, "reset");
  }

  return ResponseHelper.success("Password reset successfully");
} catch (error: any) {
  console.error("Reset password error:", error);
  return ResponseHelper.error(error.message);
}
}

async verifyResetOtp(otpData: OTPVerificationData): Promise<AuthResponse> {
  try {
    const { phone, email, otp, userType } = otpData;

    // Find the OTP record with purpose "reset"
    const record = await this.otpRepository.findLatest(phone, email, "reset");

    if (!record) {
      return ResponseHelper.badRequest("No OTP request found. Please request a new OTP.");
    }

    if (record.expiresAt < new Date()) {
      await this.otpRepository.deleteById(record._id!);
      return ResponseHelper.badRequest("OTP expired! Please request a new one.");
    }

    const isMatch = await bcrypt.compare(otp, record.otpHash);
    if (!isMatch) {
      return ResponseHelper.badRequest("Invalid OTP");
    }

    // For technicians, verify the user exists with correct role
    if (userType === "serviceProvider") {
      const userQuery: any = phone ? { phone } : { email };
      userQuery.role = "serviceProvider";
      const user = await this.userRepository.findByIdentifier(userQuery);
      if (!user) {
        return ResponseHelper.notFound(`${userType} not found`);
      }
    }

    // Generate a temporary token for password reset
    const tempToken = jwt.sign(
      {
        purpose: "password_reset",
        identifier: phone || email,
        userType,
        timestamp: Date.now(),
      },
      process.env.JWT_SECRET as string,
      { expiresIn: "15m" } 
    );

    return ResponseHelper.success(
      "OTP verified successfully",
      { token: tempToken }
    );
  } catch (error: any) {
    return ResponseHelper.error(error.message);
  }
}

async resendOTP(
  phone?: string,
  email?: string,
  purpose?: string,
  userType?: string
): Promise<AuthResponse> {
  try {
    // Must provide at least email or phone
    if (!email && !phone) {
      return ResponseHelper.badRequest("Provide at least email or phone");
    }

    // For forgot password, check if user exists
    if (purpose === "reset") {
      const userQuery: any = phone ? { phone } : { email };
      const user = await this.userRepository.findByIdentifier(userQuery);
      if (!user) {
        return ResponseHelper.notFound("User not found");
      }
    }

    // Generate new OTP and hash
    const otp = generateOTP();
    const otpHash = await bcrypt.hash(otp, 10);

    // Delete any existing OTP records for this phone/email and purpose
    await this.otpRepository.deleteMany(phone, email, purpose);

    // Save new OTP record
    const otpData: any = {
      otpHash,
      purpose,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };
    if (phone) otpData.phone = phone;
    if (email) otpData.email = email;

    await this.otpRepository.create(otpData);

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

    return ResponseHelper.success(`OTP resent to ${sentChannels.join(", ")}`)
  } catch (error: any) {
    console.error("Resend OTP error:", error);
    return ResponseHelper.error(error.message);
  }
}

async facebookLogin(
  accessToken: string,
  userID: string
): Promise<AuthResponse> {
  try {
    // Verify token with Facebook Graph API
    const fbRes = await axios.get(
      `https://graph.facebook.com/${userID}?fields=id,name,email,picture&access_token=${accessToken}`
    );

    const { id, name, email, picture } = fbRes.data;

    // Check if social account already exists
    let account = await this.socialAccountRepository.findByProviderId(id);

    let user;
    if (!account) {
      // Create a new user if doesn't exist
      user = await this.userRepository.findByEmail(email!);

      if (!user) {
        user = await this.userRepository.create({
          fullName: name,
          email,
          role: "user",
          applicationStatus: "not-applied",
          isVerified: true,
        });
      }

      account = await this.socialAccountRepository.create({
        userId: user._id,
        provider: "facebook",
        providerId: id,
        email: email!,
        profilePictureUrl: picture?.data?.url,
      });
    } else {
      user = await this.userRepository.findById(account.userId.toString());
    }

    if (!user) {
      return ResponseHelper.notFound("User not found" );
    }

    // Generate JWT
    const token = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    // Create clean user response
    const userResponse = {
      _id: user._id!.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      applicationStatus: user.applicationStatus || "not-applied",
      isVerified: user.isVerified,
    };

    return ResponseHelper.success("Facebook login successful", {
      token,
      user: userResponse,
    })
  } catch (error: any) {
    console.error("Facebook login error:", error);
    return ResponseHelper.error("Facebook login failed" );
  }
}

async googleAuth(socialData: SocialAuthData): Promise<AuthResponse> {
  try {
    const { token, userType } = socialData;

    if (!token) {
      return ResponseHelper.badRequest("Token is required");
    }

    const ticket = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) {
      return ResponseHelper.badRequest("Invalid token");
    }

    const { email, name, sub: googleId, picture } = payload;

    if (!email) {
      return ResponseHelper.badRequest("Google account email is required");
    }

    // Check if social account exists
    let socialAccount = await this.socialAccountRepository.findByProviderId(
      googleId
    );
    let user;

    if (socialAccount) {
      user = await this.userRepository.findById(
        socialAccount.userId.toString()
      );
    } else {
      // Check if user exists with this email
      user = await this.userRepository.findByEmail(email);

      if (!user) {
        // Create new user
        user = await this.userRepository.create({
          fullName: name!,
          email: email,
          isVerified: true,
          role: userType === "serviceProvider" ? "serviceProvider" : "user",
          applicationStatus: "not-applied",
        });
      } else {
        // Update role if needed
        if (userType === "serviceProvider" && user.role === "user") {
          user = await this.userRepository.update(user._id!.toString(), {
            role: "serviceProvider",
          });
        }
      }

      // Create SocialAccount record
      socialAccount =
        await this.socialAccountRepository.findByUserIdAndProvider(
          user!._id!,
          "google"
        );

      if (!socialAccount) {
        socialAccount = await this.socialAccountRepository.create({
          userId: user!._id!,
          provider: "google",
          providerId: googleId,
          email,
          profilePictureUrl: picture,
        });
      }
    }

    if (!user) {
      return ResponseHelper.notFound("User not found" );
    }

    const appToken = jwt.sign(
      { _id: user._id, role: user.role },
      process.env.JWT_SECRET!,
      { expiresIn: "7d" }
    );

    const userResponse = {
      _id: user._id!.toString(),
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      applicationStatus: user.applicationStatus || "not-applied",
      isVerified: user.isVerified,
    };

    return ResponseHelper.success("Google authentication successful", {
      token: appToken,
      user: userResponse,
    })
  } catch (error: any) {
    console.error("Google auth error:", error);
    return ResponseHelper.error("Google authentication failed")
  }
}
}
