import api from '../../../utils/axiosConfig';
import type { User } from '../pages/UserManagement';

// Interface for the new service response format
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Fetch all users - UPDATED ENDPOINT
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const res = await api.get<ApiResponse<{ users: User[] }>>('/admin/users');
    
    if (res.data.success && res.data.data && res.data.data.users) {
      return res.data.data.users;
    } else {
      throw new Error(res.data.message || 'Failed to fetch users');
    }
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    throw error;
  }
};

// Update user - FIXED ENDPOINT
export const updateUser = async (userId: string, updates: Partial<User>): Promise<User> => {
  try {
    // ✅ Now calls: PUT /api/admin/users/:userId (without /edit)
    const res = await api.put<ApiResponse<{ user: User }>>(`/admin/users/${userId}`, updates);
    
    if (res.data.success && res.data.data && res.data.data.user) {
      return res.data.data.user;
    } else {
      throw new Error(res.data.message || 'Failed to update user');
    }
  } catch (error) {
    console.error('❌ Error updating user:', error);
    throw error;
  }
};

// Delete user - FIXED METHOD AND ENDPOINT
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    // ✅ Now calls: DELETE /api/admin/users/:userId (not PATCH /delete)
    const res = await api.delete<ApiResponse<void>>(`/admin/users/${userId}`);
    
    if (!res.data.success) {
      throw new Error(res.data.message || 'Failed to delete user');
    }
  } catch (error) {
    console.error('❌ Error deleting user:', error);
    throw error;
  }
};

// Update user status only - UPDATED ENDPOINT
export const updateUserStatus = async (userId: string, status: string): Promise<User> => {
  const res = await api.patch<ApiResponse<{ user: User }>>(`/admin/users/${userId}/status`, { status });
  
  if (res.data.success && res.data.data && res.data.data.user) {
    return res.data.data.user;
  } else {
    throw new Error(res.data.message || 'Failed to update user status');
  }
};

// Define an interface for user statistics
export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  // Add other fields as needed based on your backend response
}

// Get user statistics - UPDATED ENDPOINT
export const getUserStats = async (): Promise<UserStats> => {
  const res = await api.get<ApiResponse<{ stats: UserStats }>>('/admin/users/stats');
  
  if (res.data.success && res.data.data) {
    return res.data.data.stats;
  } else {
    throw new Error(res.data.message || 'Failed to fetch user stats');
  }
};

// Get user by ID - UPDATED ENDPOINT
export const getUserById = async (userId: string): Promise<User> => {
  const res = await api.get<ApiResponse<{ user: User }>>(`/admin/users/${userId}`);
  
  if (res.data.success && res.data.data && res.data.data.user) {
    return res.data.data.user;
  } else {
    throw new Error(res.data.message || 'Failed to fetch user');
  }
};