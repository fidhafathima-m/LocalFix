import { ApiResponse } from "../../../utils/responseHelper";
import { 
  IUserWithAddress, 
  UpdateUserStatusRequest, 
  EditUserRequest 
} from "../../admin/IUserManagements";

export interface IUserManagementService {
  getUsers(): Promise<ApiResponse<{
    users: IUserWithAddress[];
    total?: number;
    page?: number;
    limit?: number;
  }>>;
  
  updateUserStatus(
    userId: string, 
    statusData: UpdateUserStatusRequest
  ): Promise<ApiResponse>;
  
  editUser(
    userId: string, 
    userData: EditUserRequest
  ): Promise<ApiResponse>;
  
  deleteUser(userId: string): Promise<ApiResponse>;
  
  getUserStats(): Promise<ApiResponse>;
  
  getUserById(userId: string): Promise<ApiResponse>;
}