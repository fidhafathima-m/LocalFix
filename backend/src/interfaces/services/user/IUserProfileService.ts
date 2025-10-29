import { IUser } from "@/interfaces/admin/IUserManagements";
import { UpdateUserProfileData } from "@/services/UserProfileService";

export interface UserProfileResponse {
  success: boolean;
  message: string;
  statusCode?: number;
  data?: {
    user: IUser;
  };
}

export interface UploadProfilePictureResponse {
  success: boolean;
  message: string;
  statusCode?: number;
  data?: {
    profilePictureUrl: string;
  };
}

export interface IUserProfileService {
  getUserProfile(userId: string): Promise<UserProfileResponse>;
  updateUserProfile(
    userId: string,
    updateData: UpdateUserProfileData
  ): Promise<UserProfileResponse>;
  uploadProfilePicture(
    userId: string,
    file: Express.Multer.File
  ): Promise<UploadProfilePictureResponse>;
}
