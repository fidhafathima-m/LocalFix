import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import axios from "axios";

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
import { IUser } from "@/interfaces/user/IUser";

import {
  SignupDataDto,
  LoginCredentialsDto,
  OTPVerificationDataDto,
  ResetPasswordDataDto,
  SocialAuthDataDto,
  AuthResponseDto,
  OtpCreationDataDto,
  JwtPayloadDto,
  FacebookGraphResponseDto,
  GoogleTokenPayloadDto,
  UserResponseDto,
  AuthTokensDto,
} from "../interfaces/dtos/authDtos";
import { LoggerService } from "./LoggerService";
import { ILogger } from "@/interfaces/utils/ILogger";

export class AuthService implements IAuthService {
  private userRepository: IUserRepository;
  private otpRepository: IOTPRepository;
  private socialAccountRepository: ISocialAccountRepository;
  private googleClient: OAuth2Client;
  private logger: ILogger;

  constructor(
    userRepository: IUserRepository,
    otpRepository: IOTPRepository,
    socialAccountRepository: ISocialAccountRepository,
    logger: ILogger
  ) {
    this.userRepository = userRepository;
    this.otpRepository = otpRepository;
    this.socialAccountRepository = socialAccountRepository;
    this.googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
    this.logger = logger;
  }

  async signup(signupData: SignupDataDto): Promise<AuthResponseDto> {
    const context = {
      operation: "signup",
      data: {
        email: signupData.email,
        phone: signupData.phone,
        userType: signupData.userType,
      },
    };
    try {
      this.logger.info("Starting user signup process", context);

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
          this.logger.warn("Email already in use for this role", {
            ...context,
            existingUser: {
              id: existingUser._id,
              roles: existingUser.roles,
            },
          });
        }
      }

      if (phone) {
        const existingUser = await this.userRepository.findByPhone(phone);
        if (existingUser && existingUser.roles.includes(userType)) {
          this.logger.warn("Phone already in use for this role", {
            ...context,
            existingUser: {
              id: existingUser._id,
              roles: existingUser.roles,
            },
          });
        }
      }

      // Generate and send OTP
      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);

      const otpData: OtpCreationDataDto = {
        otpHash,
        purpose: OTP_PURPOSES.SIGNUP,
        expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS),
      };
      if (phone) otpData.phone = phone;
      if (email) otpData.email = email;

      await this.otpRepository.create(otpData);
      this.logger.info("OTP record created successfully", {
        ...context,
        otpPurpose: OTP_PURPOSES.SIGNUP,
      });

      // Send OTP
      const sentChannels: string[] = [];
      if (phone) {
        await sendPhoneOTP(phone, otp);
        sentChannels.push(`phone: ${phone}`);
        this.logger.info("SMS OTP sent successfully", {
          ...context,
          channel: "sms",
          phone: phone,
        });
      }
      if (email) {
        await sendEmailOTP(email, otp);
        sentChannels.push(`email: ${email}`);
        this.logger.info("Email OTP sent successfully", {
          ...context,
          channel: "email",
          email: email,
        });
      }

      this.logger.info("Signup OTP process completed successfully", {
        ...context,
        channels: sentChannels,
      });

      return ResponseHelper.success(
        `OTP sent to ${sentChannels.join(", ")}. Verify to complete signup.`
      );
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Signup process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  async verifyOtp(otpData: OTPVerificationDataDto): Promise<AuthResponseDto> {
    const context = {
      operation: "verifyOtp",
      data: {
        phone: otpData.phone,
        email: otpData.email,
        userType: otpData.userType,
      },
    };

    try {
      this.logger.info("Starting OTP verification process", context);

      const { phone, email, otp, fullName, password, userType } = otpData;

      // Validate required fields
      if (!userType) {
        this.logger.warn(
          "OTP verification attempted without user type",
          context
        );
        return ResponseHelper.badRequest("User type is required");
      }

      const record = await this.otpRepository.findLatest(
        phone,
        email,
        OTP_PURPOSES.SIGNUP
      );

      if (!record) {
        this.logger.warn("OTP record not found for verification", context);
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_NOT_FOUND);
      }

      if (record.expiresAt < new Date()) {
        if (record._id) {
          await this.otpRepository.deleteById(record._id.toString());
        }
        this.logger.warn("Expired OTP attempted", {
          ...context,
          otpId: record._id,
          expiresAt: record.expiresAt,
        });
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_EXPIRED);
      }

      const isMatch = await bcrypt.compare(otp, record.otpHash);
      if (!isMatch) {
        this.logger.warn("Invalid OTP provided", {
          ...context,
          otpId: record._id,
        });
        return ResponseHelper.badRequest(AUTH_MESSAGES.INVALID_OTP);
      }

      this.logger.info("OTP validated successfully", {
        ...context,
        otpId: record._id,
      });

      // FIND EXISTING USER
      let user: IUser | null = null;
      if (email) {
        user = await this.userRepository.findByEmail(email);
      }
      if (!user && phone) {
        user = await this.userRepository.findByPhone(phone);
      }

      if (user) {
        this.logger.info("Existing user found, updating roles and profile", {
          ...context,
          userId: user._id,
          existingRoles: user.roles,
        });

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
            this.logger.error("Failed to update user roles", {
              ...context,
              userId: user._id,
              newRoles: updatedRoles,
            });
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

          this.logger.info("User roles updated successfully", {
            ...context,
            userId: user._id,
            newRoles: updatedRoles,
          });
        } else {
          this.logger.info(
            "User already has the required role, updating profile if needed",
            {
              ...context,
              userId: user._id,
            }
          );

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
        this.logger.info("Creating new user with initial role", {
          ...context,
          userType: userType,
        });

        const passwordHash = password
          ? await bcrypt.hash(password, 10)
          : undefined;

        const userData: Partial<IUser> = {
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
          this.logger.error("Failed to create new user", context);
          return ResponseHelper.error("Failed to create user");
        }
        user = newUser;

        this.logger.info("New user created successfully", {
          ...context,
          userId: user._id,
        });
      }

      // Ensure user is not null at this point
      if (!user) {
        this.logger.error(
          "User creation/update resulted in null user",
          context
        );
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

      // Create user response DTO
      const userResponse: UserResponseDto = this.mapToUserResponseDto(user);

      this.logger.info("OTP verification completed successfully", {
        ...context,
        userId: user._id,
        userRoles: user.roles,
      });

      return ResponseHelper.success(AUTH_MESSAGES.SIGNUP_SUCCESS, {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("OTP verification process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const context = {
      operation: "refreshToken",
      data: { refreshToken: refreshToken ? "***" : "missing" },
    };

    try {
      this.logger.info("Starting token refresh process", context);

      if (!refreshToken) {
        this.logger.warn("Refresh token missing", context);
        return ResponseHelper.unauthorized("Refresh token required");
      }

      // Verify refresh token
      const decoded = jwt.verify(
        refreshToken,
        process.env.REFRESH_TOKEN_SECRET as string
      ) as JwtPayloadDto;

      if (decoded.type !== "refresh") {
        this.logger.warn("Invalid token type for refresh", {
          ...context,
          tokenType: decoded.type,
        });
        return ResponseHelper.unauthorized("Invalid token type");
      }

      // Check if refresh token exists in database
      const user = await this.userRepository.findByRefreshToken(
        decoded._id,
        refreshToken
      );

      if (!user) {
        this.logger.warn("Refresh token not found in database", {
          ...context,
          userId: decoded._id,
        });
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

      this.logger.info("Token refresh completed successfully", {
        ...context,
        userId: user._id,
      });

      return ResponseHelper.success("Token refreshed successfully", {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: unknown) {
      if (error instanceof jwt.TokenExpiredError) {
        this.logger.warn("Refresh token expired", context);
        return ResponseHelper.unauthorized("Refresh token expired");
      }
      if (error instanceof jwt.JsonWebTokenError) {
        this.logger.warn("Invalid refresh token", {
          ...context,
          error: error.message,
        });
        return ResponseHelper.unauthorized("Invalid refresh token");
      }
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Token refresh process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  async login(credentials: LoginCredentialsDto): Promise<AuthResponseDto> {
    const context = {
      operation: "login",
      data: {
        identifier: credentials.identifier,
        role: credentials.role,
      },
    };

    try {
      this.logger.info("Starting user login process", context);

      const { identifier, password, role } = credentials;

      let normalizedIdentifier = identifier;

      if (identifier.includes("@")) {
        normalizedIdentifier = identifier.toLowerCase();
        this.logger.debug("Normalized email identifier to lowercase", {
          ...context,
          original: identifier,
          normalized: normalizedIdentifier,
        });
      }

      let user: IUser | null;

      if (role) {
        this.logger.info("Searching user with specific role", {
          ...context,
          role: role,
        });

        user = await this.userRepository.findByIdentifier(
          normalizedIdentifier,
          role
        );

        if (!user) {
          this.logger.info(
            "User not found with specific role, searching without role",
            {
              ...context,
              role: role,
            }
          );

          user = await this.userRepository.findByIdentifier(
            normalizedIdentifier
          );

          if (user && !user.roles.includes(role)) {
            this.logger.warn("User found but does not have required role", {
              ...context,
              userId: user._id,
              userRoles: user.roles,
              requiredRole: role,
            });
            return ResponseHelper.notFound(
              `${AUTH_MESSAGES.USER_NOT_FOUND} for ${role} role`
            );
          }
        }
      } else {
        this.logger.debug("Searching user without role filter", context);
        user = await this.userRepository.findByIdentifier(normalizedIdentifier);
      }

      if (!user) {
        this.logger.warn("User not found for login attempt", context);
        return ResponseHelper.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      this.logger.info("User found, checking account status", {
        ...context,
        userId: user._id,
        userRoles: user.roles,
        status: user.status,
      });

      if (user.isDeleted) {
        this.logger.warn("Login attempt for deleted account", {
          ...context,
          userId: user._id,
        });
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_DELETED);
      }

      if (user.status === USER_STATUS.BLOCKED) {
        this.logger.warn("Login attempt for blocked account", {
          ...context,
          userId: user._id,
        });
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_BLOCKED);
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        this.logger.warn("Login attempt for inactive account", {
          ...context,
          userId: user._id,
          currentStatus: user.status,
        });
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_INACTIVE);
      }

      this.logger.debug("Verifying password", {
        ...context,
        userId: user._id,
      });

      const isMatch = await bcrypt.compare(password, user.passwordHash || "");
      if (!isMatch) {
        this.logger.warn("Invalid password provided for login", {
          ...context,
          userId: user._id,
        });
        return ResponseHelper.unauthorized(AUTH_MESSAGES.INVALID_CREDENTIALS);
      }

      this.logger.info("Password verified successfully, generating tokens", {
        ...context,
        userId: user._id,
      });

      const tokens = this.generateTokens(user);

      // Store refresh token in database
      await this.userRepository.storeRefreshToken(
        user._id.toString(),
        tokens.refreshToken
      );

      this.logger.debug("Refresh token stored in database", {
        ...context,
        userId: user._id,
      });

      const userResponse: UserResponseDto = this.mapToUserResponseDto(user);

      this.logger.info("User login completed successfully", {
        ...context,
        userId: user._id,
        userRoles: user.roles,
      });

      return ResponseHelper.success(AUTH_MESSAGES.LOGIN_SUCCESS, {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Login process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  async forgotPassword(
    phone?: string,
    email?: string,
    userType?: string
  ): Promise<AuthResponseDto> {
    const context = {
      operation: "forgotPassword",
      data: { phone, email, userType },
    };

    try {
      this.logger.info("Starting forgot password process", context);

      if (!phone && !email) {
        this.logger.warn(
          "Forgot password attempted without email or phone",
          context
        );
        return ResponseHelper.badRequest(AUTH_MESSAGES.EMAIL_OR_PHONE_REQUIRED);
      }

      // Find user by phone or email
      let user: IUser | null;
      if (phone) {
        this.logger.debug("Searching user by phone", { ...context, phone });
        user = await this.userRepository.findByPhone(phone);
      } else {
        this.logger.debug("Searching user by email", { ...context, email });
        user = await this.userRepository.findByEmail(email!);
      }

      // Check if user exists
      if (!user) {
        this.logger.warn("User not found for forgot password request", context);
        return ResponseHelper.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      this.logger.info("User found for forgot password", {
        ...context,
        userId: user._id,
        userRoles: user.roles,
      });

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
          this.logger.warn(
            "User does not have required role for forgot password",
            {
              ...context,
              userId: user._id,
              userRoles: user.roles,
              expectedRole: expectedRole,
            }
          );
          return ResponseHelper.notFound(
            `${AUTH_MESSAGES.USER_NOT_FOUND} for ${userType} role`
          );
        }
      }

      this.logger.debug("Checking user account status", {
        ...context,
        userId: user._id,
        status: user.status,
        isDeleted: user.isDeleted,
      });

      // Check if user is active and not blocked
      if (user.isDeleted) {
        this.logger.warn("Forgot password attempt for deleted account", {
          ...context,
          userId: user._id,
        });
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_DELETED);
      }

      if (user.status === USER_STATUS.BLOCKED) {
        this.logger.warn("Forgot password attempt for blocked account", {
          ...context,
          userId: user._id,
        });
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_BLOCKED);
      }

      if (user.status !== USER_STATUS.ACTIVE) {
        this.logger.warn("Forgot password attempt for inactive account", {
          ...context,
          userId: user._id,
          currentStatus: user.status,
        });
        return ResponseHelper.forbidden(AUTH_MESSAGES.ACCOUNT_INACTIVE);
      }

      this.logger.info("Generating OTP for password reset", {
        ...context,
        userId: user._id,
      });

      // Generate and send OTP only if user exists and is valid
      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);

      const otpData: OtpCreationDataDto = {
        otpHash,
        purpose: OTP_PURPOSES.RESET,
        expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS),
      };
      if (phone) otpData.phone = phone;
      if (email) otpData.email = email;

      await this.otpRepository.create(otpData);
      this.logger.debug("OTP record created for password reset", {
        ...context,
        userId: user._id,
        purpose: OTP_PURPOSES.RESET,
      });

      const sentChannels: string[] = [];
      if (phone) {
        await sendPhoneOTP(phone, otp);
        sentChannels.push(`phone: ${phone}`);
        this.logger.info("SMS OTP sent for password reset", {
          ...context,
          channel: "sms",
          phone: phone,
        });
      }
      if (email) {
        await sendEmailOTP(email!, otp);
        sentChannels.push(`email: ${email}`);
        this.logger.info("Email OTP sent for password reset", {
          ...context,
          channel: "email",
          email: email,
        });
      }

      this.logger.info("Forgot password process completed successfully", {
        ...context,
        userId: user._id,
        channels: sentChannels,
      });

      return ResponseHelper.success(`OTP sent to ${sentChannels.join(", ")}.`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Forgot password process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  async resetPassword(
    resetData: ResetPasswordDataDto
  ): Promise<AuthResponseDto> {
    const context = {
      operation: "resetPassword",
      data: {
        phone: resetData.phone,
        email: resetData.email,
        userType: resetData.userType,
        method: resetData.otp ? "otp" : "token",
      },
    };

    try {
      this.logger.info("Starting password reset process", context);

      const { phone, email, otp, token, password, userType } = resetData;

      if (!password) {
        this.logger.warn(
          "Password reset attempted without new password",
          context
        );
        return ResponseHelper.badRequest(AUTH_MESSAGES.PASSWORD_REQUIRED);
      }

      let record;

      // Handle OTP-based reset
      if (otp) {
        this.logger.info("Processing OTP-based password reset", {
          ...context,
          identifier: phone || email,
        });

        record = await this.otpRepository.findLatest(phone, email, "reset");

        if (!record) {
          this.logger.warn("OTP record not found for password reset", context);
          return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_NOT_FOUND);
        }

        if (record.expiresAt < new Date()) {
          this.logger.warn("Expired OTP used for password reset", {
            ...context,
            otpId: record._id,
            expiresAt: record.expiresAt,
          });
          return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_EXPIRED);
        }

        const isMatch = await bcrypt.compare(otp, record.otpHash);
        if (!isMatch) {
          this.logger.warn("Invalid OTP provided for password reset", {
            ...context,
            otpId: record._id,
          });
          return ResponseHelper.badRequest(AUTH_MESSAGES.INVALID_OTP);
        }

        this.logger.debug("OTP validated successfully for password reset", {
          ...context,
          otpId: record._id,
        });
      }
      // Handle token-based reset
      else if (token) {
        this.logger.info("Processing token-based password reset", context);

        try {
          const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET as string
          ) as JwtPayloadDto;

          // Verify token purpose and expiration
          if (decoded.purpose !== "password_reset") {
            this.logger.warn("Invalid token purpose for password reset", {
              ...context,
              tokenPurpose: decoded.purpose,
            });
            return ResponseHelper.badRequest(AUTH_MESSAGES.INVALID_RESET_TOKEN);
          }

          // Verify identifier matches
          const tokenIdentifier = decoded.identifier;
          const providedIdentifier = phone || email;
          if (tokenIdentifier !== providedIdentifier) {
            this.logger.warn("Token identifier mismatch", {
              ...context,
              tokenIdentifier,
              providedIdentifier,
            });
            return ResponseHelper.badRequest(AUTH_MESSAGES.TOKEN_MISMATCH);
          }

          // Verify user type matches
          if (decoded.userType !== userType) {
            this.logger.warn("User type mismatch in reset token", {
              ...context,
              tokenUserType: decoded.userType,
              providedUserType: userType,
            });
            return ResponseHelper.badRequest(AUTH_MESSAGES.USER_TYPE_MISMATCH);
          }

          this.logger.debug("Reset token validated successfully", {
            ...context,
            tokenIdentifier,
            userType,
          });
        } catch (error) {
          this.logger.warn("Invalid or expired reset token", {
            ...context,
            error: error instanceof Error ? error.message : "Unknown error",
          });
          return ResponseHelper.badRequest(
            AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN
          );
        }
      } else {
        this.logger.warn(
          "Password reset attempted without OTP or token",
          context
        );
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_OR_TOKEN_REQUIRED);
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const identifier = phone || email!;

      this.logger.info("Updating user password", {
        ...context,
        identifier,
        userType,
      });

      await this.userRepository.updatePassword(
        identifier,
        passwordHash,
        userType
      );

      // Delete OTP record if OTP was used
      if (otp) {
        await this.otpRepository.deleteMany(phone, email, "reset");
        this.logger.debug("OTP records cleaned up after password reset", {
          ...context,
          identifier,
        });
      }

      this.logger.info("Password reset completed successfully", {
        ...context,
        identifier,
        userType,
      });

      return ResponseHelper.success(AUTH_MESSAGES.PASSWORD_RESET);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Password reset process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  async verifyResetOtp(
    otpData: OTPVerificationDataDto
  ): Promise<AuthResponseDto> {
    const context = {
      operation: "verifyResetOtp",
      data: {
        phone: otpData.phone,
        email: otpData.email,
        userType: otpData.userType,
      },
    };

    try {
      this.logger.info("Starting reset OTP verification process", context);

      const { phone, email, otp, userType } = otpData;

      // Find the OTP record with purpose "reset"
      const record = await this.otpRepository.findLatest(phone, email, "reset");

      if (!record) {
        this.logger.warn("Reset OTP record not found", context);
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_NOT_FOUND);
      }

      if (record.expiresAt < new Date()) {
        if (record._id) {
          await this.otpRepository.deleteById(record._id.toString());
        }
        this.logger.warn("Expired reset OTP attempted", {
          ...context,
          otpId: record._id,
          expiresAt: record.expiresAt,
        });
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_EXPIRED);
      }

      const isMatch = await bcrypt.compare(otp, record.otpHash);
      if (!isMatch) {
        this.logger.warn("Invalid reset OTP provided", {
          ...context,
          otpId: record._id,
        });
        return ResponseHelper.badRequest(AUTH_MESSAGES.INVALID_OTP);
      }

      this.logger.info("Reset OTP validated successfully", {
        ...context,
        otpId: record._id,
      });

      // For technicians, verify the user exists with correct role
      if (userType === USER_ROLES.SERVICE_PROVIDER) {
        this.logger.debug("Verifying service provider user exists", {
          ...context,
          userType: USER_ROLES.SERVICE_PROVIDER,
        });

        const identifier = phone || email!;
        const user = await this.userRepository.findByIdentifier(
          identifier,
          USER_ROLES.SERVICE_PROVIDER
        );
        if (!user) {
          this.logger.warn(
            "Service provider user not found for OTP verification",
            {
              ...context,
              identifier,
              userType: USER_ROLES.SERVICE_PROVIDER,
            }
          );
          return ResponseHelper.notFound(`${userType} not found`);
        }

        this.logger.debug("Service provider user verified", {
          ...context,
          userId: user._id,
        });
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

      this.logger.info(
        "Reset OTP verification completed, temporary token generated",
        {
          ...context,
          tokenExpiresIn: "15m",
        }
      );

      return ResponseHelper.success(AUTH_MESSAGES.OTP_SENT, {
        token: tempToken,
        userType: userType,
        identifier: phone || email,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Reset OTP verification process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  async resendOTP(
    phone?: string,
    email?: string,
    purpose?: string,
    userType?: string
  ): Promise<AuthResponseDto> {
    const context = {
      operation: "resendOTP",
      data: { phone, email, purpose, userType },
    };

    try {
      this.logger.info("Starting OTP resend process", context);

      if (!email && !phone) {
        this.logger.warn(
          "OTP resend attempted without email or phone",
          context
        );
        return ResponseHelper.badRequest(AUTH_MESSAGES.EMAIL_OR_PHONE_REQUIRED);
      }

      // Validate purpose parameter
      if (!purpose || !Object.values(OTP_PURPOSES).includes(purpose as any)) {
        this.logger.warn("Invalid OTP purpose provided", {
          ...context,
          providedPurpose: purpose,
        });
        return ResponseHelper.badRequest("Valid OTP purpose is required");
      }

      // For forgot password, check if user exists
      if (purpose === OTP_PURPOSES.RESET) {
        const identifier = phone || email!;
        this.logger.debug("Verifying user exists for password reset OTP", {
          ...context,
          identifier,
          purpose: OTP_PURPOSES.RESET,
        });

        const user = await this.userRepository.findByIdentifier(identifier);
        if (!user) {
          this.logger.warn("User not found for password reset OTP resend", {
            ...context,
            identifier,
          });
          return ResponseHelper.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
        }

        this.logger.debug("User verified for password reset OTP", {
          ...context,
          userId: user._id,
        });
      }

      this.logger.info("Generating new OTP for resend", {
        ...context,
        purpose,
      });

      // Generate new OTP and hash
      const otp = generateOTP();
      const otpHash = await bcrypt.hash(otp, 10);

      // Delete any existing OTP records for this phone/email and purpose
      await this.otpRepository.deleteMany(phone, email, purpose);
      this.logger.debug("Cleaned up existing OTP records", {
        ...context,
        purpose,
      });

      const otpData: OtpCreationDataDto = {
        otpHash,
        purpose: purpose as "signup" | "reset" | "login" | "application",
        expiresAt: new Date(Date.now() + OTP_CONFIG.EXPIRY_MS),
      };
      if (phone) otpData.phone = phone;
      if (email) otpData.email = email;

      await this.otpRepository.create(otpData);
      this.logger.debug("New OTP record created", {
        ...context,
        purpose,
        expiresAt: otpData.expiresAt,
      });

      // Send OTP to provided channels
      const sentChannels: string[] = [];
      if (phone) {
        await sendPhoneOTP(phone, otp);
        sentChannels.push(`phone: ${phone}`);
        this.logger.info("SMS OTP resent successfully", {
          ...context,
          channel: "sms",
          phone: phone,
          purpose: purpose,
        });
      }
      if (email) {
        await sendEmailOTP(email, otp);
        sentChannels.push(`email: ${email}`);
        this.logger.info("Email OTP resent successfully", {
          ...context,
          channel: "email",
          email: email,
          purpose: purpose,
        });
      }

      this.logger.info("OTP resend process completed successfully", {
        ...context,
        channels: sentChannels,
        purpose: purpose,
      });

      return ResponseHelper.success(`OTP resent to ${sentChannels.join(", ")}`);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("OTP resend process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  async facebookLogin(
    accessToken: string,
    userID: string
  ): Promise<AuthResponseDto> {
    const context = {
      operation: "facebookLogin",
      data: { userID },
    };

    try {
      this.logger.info("Starting Facebook login process", context);

      // Verify token with Facebook Graph API
      this.logger.debug("Verifying Facebook token with Graph API", context);
      const fbRes = await axios.get<FacebookGraphResponseDto>(
        `https://graph.facebook.com/${userID}?fields=id,name,email,picture&access_token=${accessToken}`
      );

      const { id, name, email, picture } = fbRes.data;

      this.logger.info("Facebook user data retrieved", {
        ...context,
        facebookId: id,
        email: email,
        name: name,
      });

      // Check if social account already exists
      let account = await this.socialAccountRepository.findByProviderId(id);

      let user: IUser | null;
      if (!account) {
        this.logger.info(
          "No existing Facebook account found, creating new association",
          {
            ...context,
            facebookId: id,
          }
        );

        // Create a new user if doesn't exist
        user = await this.userRepository.findByEmail(email!);

        if (!user) {
          this.logger.info("Creating new user for Facebook login", {
            ...context,
            email: email,
          });

          user = await this.userRepository.create({
            fullName: name,
            email,
            roles: ["user"],
            applicationStatus: "not-applied",
            isVerified: true,
          });

          this.logger.info("New user created for Facebook login", {
            ...context,
            userId: user._id,
          });
        } else {
          this.logger.info("Linking Facebook account to existing user", {
            ...context,
            userId: user._id,
          });
        }

        account = await this.socialAccountRepository.create({
          userId: user._id!,
          provider: "facebook",
          providerId: id,
          email: email!,
          profilePictureUrl: picture?.data?.url,
        });

        this.logger.info("Facebook social account created", {
          ...context,
          accountId: account._id,
          userId: user._id,
        });
      } else {
        this.logger.info("Existing Facebook account found", {
          ...context,
          accountId: account._id,
          userId: account.userId,
        });

        user = await this.userRepository.findById(account.userId.toString());
      }

      if (!user) {
        this.logger.error("User not found for Facebook account", {
          ...context,
          accountId: account?._id,
        });
        return ResponseHelper.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const tokens = this.generateTokens(user);

      // Store refresh token in database
      await this.userRepository.storeRefreshToken(
        user._id.toString(),
        tokens.refreshToken
      );

      this.logger.debug("Refresh token stored for Facebook user", {
        ...context,
        userId: user._id,
      });

      const userResponse: UserResponseDto = this.mapToUserResponseDto(user);

      this.logger.info("Facebook login completed successfully", {
        ...context,
        userId: user._id,
        userRoles: user.roles,
      });

      return ResponseHelper.success(AUTH_MESSAGES.FACEBOOK_LOGIN_SUCCESS, {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        user: userResponse,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Facebook login process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  async googleAuth(socialData: SocialAuthDataDto): Promise<AuthResponseDto> {
    const context = {
      operation: "googleAuth",
      data: { userType: socialData.userType },
    };

    try {
      this.logger.info("Starting Google authentication process", context);

      const { token, userType } = socialData;

      if (!token) {
        this.logger.warn("Google auth attempted without token", context);
        return ResponseHelper.badRequest(AUTH_MESSAGES.OTP_OR_TOKEN_REQUIRED);
      }

      this.logger.debug("Verifying Google ID token", context);
      const ticket = await this.googleClient.verifyIdToken({
        idToken: token,
        audience: process.env.GOOGLE_CLIENT_ID,
      });

      const payload = ticket.getPayload() as GoogleTokenPayloadDto | undefined;
      if (!payload) {
        this.logger.warn("Invalid Google token payload", context);
        return ResponseHelper.badRequest(
          AUTH_MESSAGES.INVALID_OR_EXPIRED_TOKEN
        );
      }

      const { email, name, sub: googleId, picture } = payload;

      if (!email) {
        this.logger.warn("Google token missing email", context);
        return ResponseHelper.badRequest(AUTH_MESSAGES.EMAIL_OR_PHONE_REQUIRED);
      }

      this.logger.info("Google user data retrieved", {
        ...context,
        googleId: googleId,
        email: email,
        name: name,
      });

      // Check if social account exists
      let socialAccount = await this.socialAccountRepository.findByProviderId(
        googleId
      );
      let user: IUser | null;

      if (socialAccount) {
        this.logger.info("Existing Google account found", {
          ...context,
          accountId: socialAccount._id,
          userId: socialAccount.userId,
        });

        user = await this.userRepository.findById(
          socialAccount.userId.toString()
        );
      } else {
        this.logger.info(
          "No existing Google account found, creating new association",
          {
            ...context,
            googleId: googleId,
          }
        );

        // Check if user exists with this email
        user = await this.userRepository.findByEmail(email);

        if (!user) {
          this.logger.info("Creating new user for Google auth", {
            ...context,
            email: email,
            userType: userType,
          });

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

          this.logger.info("New user created for Google auth", {
            ...context,
            userId: user._id,
            roles: user.roles,
          });
        } else {
          this.logger.info("Linking Google account to existing user", {
            ...context,
            userId: user._id,
            existingRoles: user.roles,
          });

          // Update role if needed - add service provider role if not present
          if (
            userType === USER_ROLES.SERVICE_PROVIDER &&
            !user.roles.includes(USER_ROLES.SERVICE_PROVIDER)
          ) {
            const updatedRoles = [...user.roles, USER_ROLES.SERVICE_PROVIDER];
            user = await this.userRepository.update(user._id!.toString(), {
              roles: updatedRoles,
            });

            this.logger.info("User roles updated for Google auth", {
              ...context,
              userId: user?._id,
              newRoles: updatedRoles,
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

          this.logger.info("Google social account created", {
            ...context,
            accountId: socialAccount._id,
            userId: user?._id,
          });
        }
      }

      if (!user) {
        this.logger.error("User not found for Google account", {
          ...context,
          accountId: socialAccount?._id,
        });
        return ResponseHelper.notFound(AUTH_MESSAGES.USER_NOT_FOUND);
      }

      const tokens = this.generateTokens(user);

      // Store refresh token in database
      await this.userRepository.storeRefreshToken(
        user._id.toString(),
        tokens.refreshToken
      );

      this.logger.debug("Refresh token stored for Google user", {
        ...context,
        userId: user._id,
      });

      const userResponse: UserResponseDto = this.mapToUserResponseDto(user);

      this.logger.info("Google authentication completed successfully", {
        ...context,
        userId: user._id,
        userRoles: user.roles,
      });

      return ResponseHelper.success(AUTH_MESSAGES.GOOGLE_AUTH_SUCCESS, {
        user: userResponse,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Google authentication process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  async logout(
    userId: string,
    refreshToken?: string
  ): Promise<AuthResponseDto> {
    const context = {
      operation: "logout",
      data: { userId, method: refreshToken ? "specific_token" : "all_tokens" },
    };

    try {
      this.logger.info("Starting user logout process", context);

      if (refreshToken) {
        // Remove specific refresh token
        this.logger.debug("Removing specific refresh token", {
          ...context,
          tokenPresent: true,
        });
        await this.userRepository.removeRefreshToken(userId, refreshToken);
      } else {
        // Remove all refresh tokens for user
        this.logger.debug("Removing all refresh tokens for user", context);
        await this.userRepository.removeAllRefreshTokens(userId);
      }

      this.logger.info("User logout completed successfully", context);

      return ResponseHelper.success("Logged out successfully");
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      this.logger.error("Logout process failed", {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error(errorMessage);
    }
  }

  // Helper method to map IUser to UserResponseDto
  private mapToUserResponseDto(user: IUser): UserResponseDto {
    this.logger.debug("Mapping user to response DTO", {
      operation: "mapToUserResponseDto",
      userId: user._id,
    });

    return {
      _id: user._id!.toString(),
      fullName: user.fullName,
      phone: user.phone,
      email: user.email,
      roles: user.roles,
      applicationStatus: user.applicationStatus || "not-applied",
      isVerified: user.isVerified,
      status: user.status,
    };
  }

  private generateAccessToken(user: IUser): string {
    try {
      const jwtSecret = process.env.JWT_SECRET;
      if (!jwtSecret) {
        this.logger.error("JWT_SECRET environment variable is not defined", {
          operation: "generateAccessToken",
          userId: user._id,
        });
        throw new Error("JWT_SECRET environment variable is not defined");
      }

      const payload: JwtPayloadDto = {
        _id: user._id?.toString() || "",
        roles: user.roles,
        type: "access",
      };

      return jwt.sign(payload, jwtSecret, {
        expiresIn: process.env.ACCESS_TOKEN_EXPIRY || "24h",
      } as jwt.SignOptions);
    } catch (error) {
      this.logger.error("Failed to generate access token", {
        operation: "generateAccessToken",
        userId: user._id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  private generateRefreshToken(user: IUser): string {
    try {
      const refreshTokenSecret = process.env.REFRESH_TOKEN_SECRET;
      if (!refreshTokenSecret) {
        throw new Error(
          "REFRESH_TOKEN_SECRET environment variable is not defined"
        );
      }

      const payload: JwtPayloadDto = {
        _id: user._id?.toString() || "",
        type: "refresh",
      };

      return jwt.sign(payload, refreshTokenSecret, {
        expiresIn: process.env.REFRESH_TOKEN_EXPIRY || "7d",
      } as jwt.SignOptions);
    } catch (error) {
      this.logger.error("Failed to generate refresh token", {
        operation: "generateRefreshToken",
        userId: user._id,
        error: error instanceof Error ? error.message : "Unknown error",
      });
      throw error;
    }
  }

  // Generate both tokens
  private generateTokens(user: IUser): AuthTokensDto {
    return {
      accessToken: this.generateAccessToken(user),
      refreshToken: this.generateRefreshToken(user),
    };
  }
}
