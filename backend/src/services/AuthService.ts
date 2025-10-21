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
import {
  AUTH_MESSAGES,
  GENERAL_MESSAGES,
  OTP_CONFIG,
  OTP_PURPOSES,
  USER_STATUS,
  USER_ROLES,
} from "../constants";

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private otpRepository: IOTPRepository;
  private socialAccountRepository: ISocialAccountRepository;
  private googleClient: OAuth2Client;

  constructor(
    userRepository: IUserRepository,
    otpRepository: IOTPRepository,
    socialAccountRepository: ISocialAccountRepository
  ) {
    this.userRepository = userRepository;
    this.otpRepository = otpRepository;
    this.socialAccountRepository = socialAccountRepository;
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  }

  async signup(signupData: SignupData): Promise<AuthResponse> {
    try {
      const { email, phone, userType } = signupData;

      // Validation
      if (!email && !phone) {
        return ResponseHelper.badRequest(AUTH_MESSAGES.EMAIL_OR_PHONE_REQUIRED);
      }

      // Check uniqueness - ONLY if same email/phone AND same role
      if (email) {
        const existingUser = await this.userRepository.findByEmail(email);
        // Only conflict if user exists AND already has this role
        if (existingUser && existingUser.roles.includes(userType)) {
          return ResponseHelper.conflict(AUTH_MESSAGES.EMAIL_IN_USE);
        }
      }

      if (phone) {
        const existingUser = await this.userRepository.findByPhone(phone);
        if (existingUser && existingUser.roles.includes(userType)) {
          return ResponseHelper.conflict(AUTH_MESSAGES.PHONE_IN_USE);
        }
      }

      // Generate and send OTP
      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);

      const otpData: any = {
        otpHash,
        purpose: OTP_PURPOSES.SIGNUP,
        expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS),
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

      // Validate required fields
      if (!userType) {
        return ResponseHelper.badRequest("User type is required");
      }

      const record = await this.otpRepository.findLatest(
        phone,
        email,
        "signup"
      );

      if (!record) {
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_NOT_FOUND);
      }

      if (record.expiresAt < new Date()) {
        await this.otpRepository.deleteById(record._id!.toString());
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_EXPIRED);
      }

      const isMatch = await bcrypt.compare(otp, record.otpHash);
      if (!isMatch) {
        return ResponseHelper.badRequest(AUTH_MESSAGES.INVALID_OTP);
      }

      // FIND EXISTING USER
      let user = null;
      if (email) {
        user = await this.userRepository.findByEmail(email);
      }
      if (!user && phone) {
        user = await this.userRepository.findByPhone(phone);
      }

      if (user) {
        // User exists, add new role if not already present
        if (!user.roles.includes(userType)) {
          const updatedRoles = [...user.roles, userType];

          // Update user with new role
          const updateResult = await this.userRepository.update(
            user._id!.toString(),
            {
              roles: updatedRoles,
            }
          );

          if (!updateResult) {
            return ResponseHelper.error("Failed to update user roles");
          }
          user = updateResult;

          // Update password
          if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            const passwordUpdateResult = await this.userRepository.update(
              user._id!.toString(),
              {
                passwordHash,
              }
            );
            if (passwordUpdateResult) {
              user = passwordUpdateResult;
            }
          }

          // Update name
          if (fullName && user.fullName !== fullName) {
            const nameUpdateResult = await this.userRepository.update(
              user._id!.toString(),
              {
                fullName,
              }
            );
            if (nameUpdateResult) {
              user = nameUpdateResult;
            }
          }
        }
        // If user already has the role, just update other fields if needed
        else {
          let updatedUser = user;

          if (password) {
            const passwordHash = await bcrypt.hash(password, 10);
            const passwordUpdateResult = await this.userRepository.update(
              user._id!.toString(),
              {
                passwordHash,
              }
            );
            if (passwordUpdateResult) {
              updatedUser = passwordUpdateResult;
            }
          }

          if (fullName && user.fullName !== fullName) {
            const nameUpdateResult = await this.userRepository.update(
              user._id!.toString(),
              {
                fullName,
              }
            );
            if (nameUpdateResult) {
              updatedUser = nameUpdateResult;
            }
          }

          user = updatedUser;
        }
      } else {
        // Create new user with initial role
        const passwordHash = password
          ? await bcrypt.hash(password, 10)
          : undefined;

        const userData: any = {
          fullName: fullName!,
          phone: phone || undefined,
          email: email || undefined,
          passwordHash,
          isVerified: true,
          applicationStatus: "not-applied",
          roles: [userType],
        };

        const newUser = await this.userRepository.create(userData);
        if (!newUser) {
          return ResponseHelper.error("Failed to create user");
        }
        user = newUser;
      }

      // Ensure user is not null at this point
      if (!user) {
        return ResponseHelper.error("User creation/update failed");
      }

      const tokens = this.generateTokens(user);

      // Store refresh token in database
      await this.userRepository.storeRefreshToken(
        user._id.toString(),
        tokens.refreshToken
      );
      // Delete used OTP
      await this.otpRepository.deleteMany(phone, email, "signup");

      // Create clean user response
      const userResponse = {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        roles: user.roles,
        applicationStatus: user.applicationStatus || "not-applied",
      };

      return ResponseHelper.success(AUTH_MESSAGES.SIGNUP_SUCCESS, {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      return ResponseHelper.error(error.message);
    }
  }

  // Refresh token endpoint
  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    try {
      if (!refreshToken) {
        return ResponseHelper.unauthorized("Refresh token required");
      }

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as any;

      if (decoded.type !== "refresh") {
        return ResponseHelper.unauthorized("Invalid token type");
      }

      // Check if refresh token exists in database
      const user = await this.userRepository.findByRefreshToken(
        decoded._id,
        refreshToken
      );

      if (!user) {
        return ResponseHelper.unauthorized("Invalid refresh token");
      }

      // Generate new tokens
      const tokens = this.generateTokens(user);

      // Update refresh token in database
      await this.userRepository.updateRefreshToken(
        user._id.toString(),
        refreshToken,
        tokens.refreshToken
      );

      return ResponseHelper.success("Token refreshed successfully", {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return ResponseHelper.unauthorized("Refresh token expired");
      }
      if (error.name === "JsonWebTokenError") {
        return ResponseHelper.unauthorized("Invalid refresh token");
      }
      return ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const { identifier, password, role } = credentials;

      let normalizedIdentifier = identifier;

      if (identifier.includes("@")) {
        normalizedIdentifier = identifier.toLowerCase();
      }

      let user;

      if (role) {
        user = await this.userRepository.findByIdentifier(
          normalizedIdentifier,
          role
        );

        if (!user) {
          user = await this.userRepository.findByIdentifier(
            normalizedIdentifier
          );

          if (user && !user.roles.includes(role)) {
            return ResponseHelper.notFound(
              `${AUTH_MESSAGES.USER_NOT_FOUND} for ${role} role`
            );
          }
        }
      } else {
        user = await this.userRepository.findByIdentifier(normalizedIdentifier);
      }

      if (!user) {
        return ResponseHelper.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      if (user.isDeleted) {
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_DELETED);
      }

      if (user.status === USER_STATUS.BLOCKED) {
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_BLOCKED);
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_INACTIVE);
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash || "");
      if (!isMatch) {
        return ResponseHelper.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
      }

      const tokens = this.generateTokens(user);

      // Store refresh token in database
      await this.userRepository.storeRefreshToken(
        user._id.toString(),
        tokens.refreshToken
      );

      const userResponse = {
        _id: user._id,
        fullName: user.fullName,
        phone: user.phone,
        email: user.email,
        roles: user.roles,
        applicationStatus: user.applicationStatus || "not-applied",
        isVerified: user.isVerified,
        status: user.status,
      };

      return ResponseHelper.success(AUTH_MESSAGES.LOGIN_SUCCESS, {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: any) {
      return ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
    }
  }

  async forgotPassword(
    phone?: string,
    email?: string,
    userType?: string
  ): Promise<AuthResponse> {
    try {
      if (!phone && !email) {
        return ResponseHelper.badRequest(AUTH_MESSAGES.EMAIL_OR_PHONE_REQUIRED);
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
        return ResponseHelper.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      // Check user type if provided
      if (userType) {
        let expectedRole: string;

        // Map frontend userType to backend role
        switch (userType) {
          case USER_ROLES.SERVICE_PROVIDER:
            expectedRole = USER_ROLES.SERVICE_PROVIDER;
            break;
          case USER_ROLES.ADMIN:
            expectedRole = USER_ROLES.ADMIN;
            break;
          case USER_ROLES.USER:
          default:
            expectedRole = USER_ROLES.USER;
            break;
        }

        if (!user.roles.includes(expectedRole)) {
          return ResponseHelper.notFound(
            `${AUTH_MESSAGES.USER_NOT_FOUND} for ${userType} role`
          );
        }
      }

      // Check if user is active and not blocked
      if (user.isDeleted) {
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_DELETED);
      }

      if (user.status === USER_STATUS.BLOCKED) {
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_BLOCKED);
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_INACTIVE);
      }

      // Generate and send OTP only if user exists and is valid
      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);

      const otpData: any = {
        otpHash,
        purpose: OTP_PURPOSES.RESET,
        expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS),
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
      return ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
    }
  }

  async resetPassword(resetData: ResetPasswordData): Promise<AuthResponse> {
    try {
      const { phone, email, otp, token, password, userType } = resetData;

      if (!password) {
        return ResponseHelper.badRequest(AUTH_MESSAGES.PASSWORD_REQUIRED);
      }

      let record;

      // Handle OTP-based reset
      if (otp) {
        record = await this.otpRepository.findLatest(phone, email, "reset");

        if (!record) {
          return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_NOT_FOUND);
        }

        if (record.expiresAt < new Date()) {
          return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_EXPIRED);
        }

        const isMatch = await bcrypt.compare(otp, record.otpHash);
        if (!isMatch) {
          return ResponseHelper.badRequest(AUTH_MESSAGES.INVALID_OTP);
        }
      }
      // Handle token-based reset
      else if (token) {
        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
          ) as any;

          // Verify token purpose and expiration
          if (decoded.purpose !== "password_reset") {
            return ResponseHelper.badRequest(AUTH_MESSAGES.INVALID_RESET_TOKEN);
          }

          // Verify identifier matches
          const tokenIdentifier = decoded.identifier;
          const providedIdentifier = phone || email;
          if (tokenIdentifier !== providedIdentifier) {
            return ResponseHelper.badRequest(AUTH_MESSAGES.TOKEN_MISMATCH);
          }

          // Verify user type matches
          if (decoded.userType !== userType) {
            return ResponseHelper.badRequest(AUTH_MESSAGES.USER_TYPE_MISMATCH);
          }
        } catch (error) {
          return ResponseHelper.badRequest(
            AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN
          );
        }
      } else {
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_OR_TOKEN_REQUIRED);
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

      return ResponseHelper.success(AUTH_MESSAGES.PASSWORD_RESET);
    } catch (error: any) {
      console.error("Reset password error:", error);
      return ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
    }
  }

  async verifyResetOtp(otpData: OTPVerificationData): Promise<AuthResponse> {
    try {
      const { phone, email, otp, userType } = otpData;

      // Find the OTP record with purpose "reset"
      const record = await this.otpRepository.findLatest(phone, email, "reset");

      if (!record) {
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_NOT_FOUND);
      }

      if (record.expiresAt < new Date()) {
        await this.otpRepository.deleteById(record._id!.toString());
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_EXPIRED);
      }

      const isMatch = await bcrypt.compare(otp, record.otpHash);
      if (!isMatch) {
        return ResponseHelper.badRequest(AUTH_MESSAGES.INVALID_OTP);
      }

      // For technicians, verify the user exists with correct role
      if (userType === USER_ROLES.SERVICE_PROVIDER) {
        const userQuery: any = phone ? { phone } : { email };
        userQuery.roles = USER_ROLES.SERVICE_PROVIDER;
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

      return ResponseHelper.success(AUTH_MESSAGES.OTP_SENT, {
        token: tempToken,
        userType: userType,
        identifier: phone || email,
      });
    } catch (error: any) {
      return ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
    }
  }
  async resendOTP(
    phone?: string,
    email?: string,
    purpose?: string,
    userType?: string
  ): Promise<AuthResponse> {
    try {
      if (!email && !phone) {
        return ResponseHelper.badRequest(AUTH_MESSAGES.EMAIL_OR_PHONE_REQUIRED);
      }

      // For forgot password, check if user exists
      if (purpose === OTP_PURPOSES.RESET) {
        const userQuery: any = phone ? { phone } : { email };
        const user = await this.userRepository.findByIdentifier(userQuery);
        if (!user) {
          return ResponseHelper.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
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
        expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MINUTES), // 5 minutes
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

      return ResponseHelper.success(`OTP resent to ${sentChannels.join(", ")}`);
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      return ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
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
            roles: ["user"],
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
        return ResponseHelper.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const tokens = this.generateTokens(user);

      // Store refresh token in database
      await this.userRepository.storeRefreshToken(
        user._id.toString(),
        tokens.refreshToken
      );

      const userResponse = {
        _id: user._id!.toString(),
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        applicationStatus: user.applicationStatus || "not-applied",
        isVerified: user.isVerified,
      };

      return ResponseHelper.success(AUTH_MESSAGES.FACEBOOK_LOGIN_SUCCESS, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: userResponse,
      });
    } catch (error: any) {
      console.error("Facebook login error:", error);
      return ResponseHelper.error(AUTH_MESSAGES.SOCIAL_AUTH_FAILED);
    }
  }

  async googleAuth(socialData: SocialAuthData): Promise<AuthResponse> {
    try {
      const { token, userType } = socialData;

      if (!token) {
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_OR_TOKEN_REQUIRED);
      }

      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        return ResponseHelper.badRequest(
          AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN
        );
      }

      const { email, name, sub: googleId, picture } = payload;

      if (!email) {
        return ResponseHelper.badRequest(AUTH_MESSAGES.EMAIL_OR_PHONE_REQUIRED);
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
            roles:
              userType === USER_ROLES.SERVICE_PROVIDER
                ? [USER_ROLES.SERVICE_PROVIDER]
                : ["user"],
            applicationStatus: "not-applied",
          });
        } else {
          // Update role if needed - add service provider role if not present
          if (
            userType === USER_ROLES.SERVICE_PROVIDER &&
            !user.roles.includes(USER_ROLES.SERVICE_PROVIDER)
          ) {
            const updatedRoles = [...user.roles, USER_ROLES.SERVICE_PROVIDER];
            user = await this.userRepository.update(user._id!.toString(), {
              roles: updatedRoles,
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
        return ResponseHelper.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const tokens = this.generateTokens(user);

      // Store refresh token in database
      await this.userRepository.storeRefreshToken(
        user._id.toString(),
        tokens.refreshToken
      );

      const userResponse = {
        _id: user._id!.toString(),
        fullName: user.fullName,
        email: user.email,
        roles: user.roles,
        applicationStatus: user.applicationStatus || "not-applied",
        isVerified: user.isVerified,
      };

      return ResponseHelper.success(AUTH_MESSAGES.GOOGLE_AUTH_SUCCESS, {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: any) {
      console.error("Google auth error:", error);
      return ResponseHelper.error(AUTH_MESSAGES.SOCIAL_AUTH_FAILED);
    }
  }

  // Logout - revoke refresh token
  async logout(userId: string, refreshToken?: string): Promise<AuthResponse> {
    try {
      if (refreshToken) {
        // Remove specific refresh token
        await this.userRepository.removeRefreshToken(userId, refreshToken);
      } else {
        // Remove all refresh tokens for user
        await this.userRepository.removeAllRefreshTokens(userId);
      }

      return ResponseHelper.success("Logged out successfully");
    } catch (error: any) {
      return ResponseHelper.error(GENERAL_MESSAGES.SERVER_ERROR);
    }
  }

  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        _id: user._id,
        roles: user.roles,
        type: "access",
      },
      process.env.JWT_SECRET as string,
      {
        expiresIn: (process.env.ACCESS_TOKEN_EXPIRY || "15m") as any,
      }
    );
  }

  private generateRefreshToken(user: any): string {
    return jwt.sign(
      {
        _id: user._id,
        type: "refresh",
      },
      process.env.REFRESH_TOKEN_SECRET as string,
      {
        expiresIn: (process.env.REFRESH_TOKEN_EXPIRY || "7d") as any,
      }
    );
  }

  // Generate both tokens
  private generateTokens(user: any): {
    accessToken: string;
    refreshToken: string;
  } {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }
}
