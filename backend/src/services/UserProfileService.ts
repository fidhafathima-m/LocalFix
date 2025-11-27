import { IUserManagementRepository } from '../interfaces/repository/admin/IUserManagementRepository';
import { ResponseHelper } from '../utils/responseHelper';
import { uploadToCloudinary } from '../utils/cloudinary';
import { IAddressRepository } from '../interfaces/repository/user/IAddressRepository';
import { ILogger } from '@/interfaces/utils/ILogger';
import { toAddressDtoList } from '../mappers/addressMapper';
import { IUserProfileService } from '../interfaces/services/user/IUserProfileService';
import { Types } from 'mongoose';

export interface UpdateUserProfileData {
  fullName?: string;
  phone?: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  profilePicture?: string;
}

export class UserProfileService implements IUserProfileService {
  private _logger: ILogger;
  private _userManagementRepository: IUserManagementRepository;
  private _addressRepository: IAddressRepository;

  constructor(
    userManagementRepository: IUserManagementRepository,
    addressRepository: IAddressRepository,
    logger: ILogger
  ) {
    this._logger = logger;
    this._userManagementRepository = userManagementRepository;
    this._addressRepository = addressRepository;
  }

  async getUserProfile(userId: string) {
    const context = {
      operation: 'getUserProfile',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching user profile', context);

      const user = await this._userManagementRepository.findById(userId);

      if (!user) {
        this._logger.warn('User not found', context);
        return ResponseHelper.notFound('User not found');
      }

      if (user.isDeleted) {
        this._logger.warn('Attempt to access deleted account', context);
        return ResponseHelper.forbidden('Account has been deleted');
      }

      this._logger.debug('User found, fetching addresses', context);

      const addresses = await this._addressRepository.findByUserId(userId);
      const addressDtos = toAddressDtoList(addresses);

      this._logger.debug(`Found ${addresses.length} addresses for user`, {
        ...context,
        addressCount: addresses.length,
      });

      const userDetailDto = {
        _id: user._id.toString(),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        status: user.status,
        roles: user.roles,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        applicationStatus: user.applicationStatus,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount,
        profilePicture: user.profilePictureUrl,
        dateOfBirth: user.dateOfBirth,
        gender: user.gender,
        wallet: user.wallet,
        defaultAddress: user.defaultAddress,
      };

      const enhancedUserDto = {
        ...userDetailDto,
        addresses: addressDtos,
      };

      this._logger.info('Successfully retrieved user profile', {
        ...context,
        userEmail: user.email,
        hasProfilePicture: !!user.profilePictureUrl,
      });

      return ResponseHelper.success('User profile retrieved successfully', {
        user: enhancedUserDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch user profile', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch user profile');
    }
  }

  async updateUserProfile(userId: string, updateData: UpdateUserProfileData) {
    const context = {
      operation: 'updateUserProfile',
      userId,
      updateFields: Object.keys(updateData),
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Updating user profile', context);

      const user = await this._userManagementRepository.findById(userId);

      if (!user) {
        this._logger.warn('User not found for profile update', context);
        return ResponseHelper.notFound('User not found');
      }

      if (user.isDeleted) {
        this._logger.warn('Attempt to update deleted account', context);
        return ResponseHelper.forbidden('Account has been deleted');
      }

      // Build update payload with proper field mapping
      const updatePayload: any = {};
      const updatedFields: string[] = [];

      if (updateData.fullName !== undefined) {
        updatePayload.fullName = updateData.fullName;
        updatedFields.push('fullName');
        this._logger.debug('Updating full name', {
          ...context,
          newFullName: updateData.fullName,
        });
      }

      if (updateData.phone !== undefined) {
        updatePayload.phone = updateData.phone;
        updatedFields.push('phone');
        this._logger.debug('Updating phone number', {
          ...context,
          newPhone: updateData.phone,
        });
      }

      if (updateData.email !== undefined && updateData.email !== user.email) {
        this._logger.debug('Checking email availability', {
          ...context,
          newEmail: updateData.email,
          currentEmail: user.email,
        });

        // Check if email already exists
        const existingUser = await this._userManagementRepository.findByEmail(
          updateData.email
        );
        if (existingUser && existingUser._id.toString() !== userId) {
          this._logger.warn('Email already exists', {
            ...context,
            existingUserId: existingUser._id.toString(),
          });
          return ResponseHelper.error('Email already exists');
        }
        updatePayload.email = updateData.email;
        updatedFields.push('email');
      }

      if (updateData.dateOfBirth !== undefined) {
        updatePayload.dateOfBirth = updateData.dateOfBirth;
        updatedFields.push('dateOfBirth');
        this._logger.debug('Updating date of birth', context);
      }

      if (updateData.gender !== undefined) {
        if (updateData.gender.trim() !== '') {
          updatePayload.gender = updateData.gender;
          updatedFields.push('gender');
          this._logger.debug('Updating gender', {
            ...context,
            newGender: updateData.gender,
          });
        } else {
          updatePayload.gender = undefined;
          this._logger.debug('Removing gender field', context);
        }
      }

      if (updatedFields.length === 0) {
        this._logger.warn('No valid fields to update', context);
        return ResponseHelper.badRequest('No valid fields to update');
      }

      this._logger.debug('Updating user in repository', {
        ...context,
        updatePayload,
        updatedFields,
      });

      const updatedUser = await this._userManagementRepository.update(
        userId,
        updatePayload
      );

      if (!updatedUser) {
        this._logger.error('Failed to update user in database', context);
        return ResponseHelper.error('Failed to update user profile');
      }

      this._logger.debug('Fetching fresh user data after update', context);
      const freshUser = await this._userManagementRepository.findById(userId);

      const publicUserDto = {
        _id: freshUser!._id.toString(),
        fullName: freshUser!.fullName,
        email: freshUser!.email,
        phone: freshUser!.phone || 'Not provided',
        profilePicture: freshUser!.profilePictureUrl,
        isVerified: freshUser!.isVerified,
        createdAt: freshUser!.createdAt,
        defaultAddress: freshUser!.defaultAddress,
        wallet: freshUser!.wallet || { balance: 0 },
        status: freshUser!.status || 'Active',
        role: freshUser!.roles?.[0] || 'user',
        dateOfBirth: freshUser!.dateOfBirth,
        gender: freshUser!.gender || '',
      };

      this._logger.info('Successfully updated user profile', {
        ...context,
        updatedFields,
        userEmail: freshUser!.email,
      });

      return ResponseHelper.success('Profile updated successfully', {
        user: publicUserDto,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to update user profile', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to update user profile');
    }
  }

  async uploadProfilePicture(userId: string, file: any) {
    const context = {
      operation: 'uploadProfilePicture',
      userId,
      fileSize: file?.size,
      fileName: file?.originalname,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Uploading profile picture', context);

      const user = await this._userManagementRepository.findById(userId);

      if (!user) {
        this._logger.warn('User not found for profile picture upload', context);
        return ResponseHelper.notFound('User not found');
      }

      this._logger.debug('Uploading file to Cloudinary', context);

      // Upload to Cloudinary
      const uploadResult = await uploadToCloudinary(file);

      if (!uploadResult || !uploadResult.secure_url) {
        this._logger.error('Cloudinary upload failed', context);
        return ResponseHelper.error('Failed to upload profile picture');
      }

      const profilePictureUrl = uploadResult.secure_url;

      this._logger.debug('Updating user profile picture URL', {
        ...context,
        cloudinaryUrl: profilePictureUrl,
      });

      // Update user profile picture
      const updatedUser = await this._userManagementRepository.update(userId, {
        profilePictureUrl,
      });

      if (!updatedUser) {
        this._logger.error(
          'Failed to update user profile picture in database',
          context
        );
        return ResponseHelper.error('Failed to update profile picture');
      }

      this._logger.info('Successfully uploaded profile picture', {
        ...context,
        profilePictureUrl,
      });

      return ResponseHelper.success('Profile picture uploaded successfully', {
        profilePictureUrl,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to upload profile picture', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to upload profile picture');
    }
  }

  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    const context = {
      operation: 'changePassword',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Changing user password', context);

      const user = await this._userManagementRepository.findById(userId);

      if (!user) {
        this._logger.warn('User not found for password change', context);
        return ResponseHelper.notFound('User not found');
      }

      if (user.isDeleted) {
        this._logger.warn(
          'Attempt to change password for deleted account',
          context
        );
        return ResponseHelper.forbidden('Account has been deleted');
      }

      // Validate that new password and confirm password match
      if (newPassword !== confirmPassword) {
        this._logger.warn('Password confirmation mismatch', context);
        return ResponseHelper.badRequest('New passwords do not match');
      }

      // Validate password strength
      if (newPassword.length < 6) {
        this._logger.warn('Password too short', {
          ...context,
          passwordLength: newPassword.length,
        });
        return ResponseHelper.badRequest(
          'Password must be at least 6 characters long'
        );
      }

      this._logger.debug('Verifying current password', context);

      // Verify current password
      const isCurrentPasswordValid =
        await this._userManagementRepository.verifyPassword(
          userId,
          currentPassword
        );

      if (!isCurrentPasswordValid) {
        this._logger.warn('Current password verification failed', context);
        return ResponseHelper.badRequest('Current password is incorrect');
      }

      this._logger.debug('Updating password in repository', context);

      // Update password
      const updatedUser = await this._userManagementRepository.updatePassword(
        userId,
        newPassword
      );

      if (!updatedUser) {
        this._logger.error('Failed to update password in repository', context);
        return ResponseHelper.error('Failed to update password');
      }

      this._logger.info('Successfully changed password', context);

      return ResponseHelper.success('Password changed successfully');
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to change password', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to change password');
    }
  }
  async getUserTransactions(
    userId: string,
    page: number = 1,
    limit: number = 10
  ) {
    const context = {
      operation: 'getUserTransactions',
      userId,
      page,
      limit,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching user transactions', context);

      const user = await this._userManagementRepository.findById(userId);

      if (!user) {
        this._logger.warn('User not found for transactions', context);
        return ResponseHelper.notFound('User not found');
      }

      if (user.isDeleted) {
        this._logger.warn(
          'Attempt to access transactions for deleted account',
          context
        );
        return ResponseHelper.forbidden('Account has been deleted');
      }

      // Import Payment and Order models
      const PaymentModel = (await import('../models/PaymentSchema')).default;
      const OrderModel = (await import('../models/OrderSchema')).default;

      const skip = (page - 1) * limit;

      // Fetch payments with order details (not booking)
      const payments = await PaymentModel.find({
        userId: new Types.ObjectId(userId),
      })
        .populate({
          path: 'bookingId',
          select: 'serviceName scheduledAt', // Get basic booking info
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await PaymentModel.countDocuments({
        userId: new Types.ObjectId(userId),
      });

      // Get order codes for each payment
      const transactions = await Promise.all(
        payments.map(async payment => {
          // Find the order that matches this booking
          const order = await OrderModel.findOne({
            bookingId: payment.bookingId,
          })
            .select('orderCode serviceName')
            .lean();

          return {
            _id: payment._id.toString(),
            bookingId: payment.bookingId?._id?.toString() || 'N/A',
            orderCode:
              order?.orderCode ||
              `PAY-${payment._id.toString().slice(-8).toUpperCase()}`,
            serviceName:
              order?.serviceName ||
              (payment.bookingId as any)?.serviceName ||
              'Service',
            amount: payment.amount,
            status: payment.status,
            type: payment.type,
            paymentProvider: payment.paymentProvider,
            createdAt: payment.createdAt,
            confirmedAt: payment.confirmedAt,
            refundedAt: payment.refundedAt,
          };
        })
      );

      this._logger.info('Successfully retrieved user transactions', {
        ...context,
        transactionCount: transactions.length,
        totalTransactions: total,
      });

      return ResponseHelper.success('Transactions retrieved successfully', {
        transactions,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch user transactions', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch transactions');
    }
  }

  async getWalletTransactions(userId: string) {
    const context = {
      operation: 'getWalletTransactions',
      userId,
      timestamp: new Date().toISOString(),
    };

    try {
      this._logger.info('Fetching wallet transactions', context);

      const user = await this._userManagementRepository.findById(userId);

      if (!user) {
        this._logger.warn('User not found for wallet transactions', context);
        return ResponseHelper.notFound('User not found');
      }

      if (user.isDeleted) {
        this._logger.warn(
          'Attempt to access wallet for deleted account',
          context
        );
        return ResponseHelper.forbidden('Account has been deleted');
      }

      // Return wallet transactions from user schema
      const walletTransactions = user.wallet?.transactions || [];

      // Sort transactions by date (newest first)
      const sortedTransactions = walletTransactions.sort(
        (a: any, b: any) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      this._logger.info('Successfully retrieved wallet transactions', {
        ...context,
        transactionCount: sortedTransactions.length,
        currentBalance: user.wallet?.balance || 0,
      });

      return ResponseHelper.success(
        'Wallet transactions retrieved successfully',
        {
          transactions: sortedTransactions,
          balance: user.wallet?.balance || 0,
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred';
      this._logger.error('Failed to fetch wallet transactions', {
        ...context,
        error: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
      });
      return ResponseHelper.error('Failed to fetch wallet transactions');
    }
  }
}
