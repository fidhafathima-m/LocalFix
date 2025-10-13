import api from "../../../utils/axiosConfig";
import type { User } from "../pages/UserManagement";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Fetch all users
export const fetchUsers = async (): Promise<User[]> => {
  try {
    const res = await api.get<ApiResponse<{ users: User[] }>>("/admin/users");

    if (res.data.success && res.data.data && res.data.data.users) {
      return res.data.data.users;
    } else {
      throw new Error(res.data.message || "Failed to fetch users");
    }
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Update user
export const updateUser = async (
  userId: string,
  updates: Partial<User>
): Promise<User> => {
  try {
    const res = await api.put<ApiResponse<{ user: User }>>(
      `/admin/users/${userId}`,
      updates
    );

    if (res.data.success && res.data.data && res.data.data.user) {
      return res.data.data.user;
    } else {
      throw new Error(res.data.message || "Failed to update user");
    }
  } catch (error) {
    console.error("Error updating user:", error);
    throw error;
  }
};

// Delete user
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    const res = await api.delete<ApiResponse<void>>(`/admin/users/${userId}`);

    if (!res.data.success) {
      throw new Error(res.data.message || "Failed to delete user");
    }
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Update user status only
export const updateUserStatus = async (
  userId: string,
  status: string
): Promise<User> => {
  const res = await api.patch<ApiResponse<{ user: User }>>(
    `/admin/users/${userId}/status`,
    { status }
  );

  if (res.data.success && res.data.data && res.data.data.user) {
    return res.data.data.user;
  } else {
    throw new Error(res.data.message || "Failed to update user status");
  }
};

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
}

export const getUserStats = async (): Promise<UserStats> => {
  const res = await api.get<ApiResponse<{ stats: UserStats }>>(
    "/admin/users/stats"
  );

  if (res.data.success && res.data.data) {
    return res.data.data.stats;
  } else {
    throw new Error(res.data.message || "Failed to fetch user stats");
  }
};

export const getUserById = async (userId: string): Promise<User> => {
  const res = await api.get<ApiResponse<{ user: User }>>(
    `/admin/users/${userId}`
  );

  if (res.data.success && res.data.data && res.data.data.user) {
    return res.data.data.user;
  } else {
    throw new Error(res.data.message || "Failed to fetch user");
  }
};
